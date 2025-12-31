import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
    };
  }
}

export type UserRole = 'student' | 'institution' | 'employer' | 'admin';

interface WalletContextType {
  isConnected: boolean;
  isConnecting: boolean;
  walletAddress: string | null;
  chainId: number | null;
  userRole: UserRole | null;
  profile: {
    id: string;
    displayName: string | null;
    did: string | null;
    avatarUrl: string | null;
  } | null;
  connect: (preferredRole?: UserRole) => Promise<boolean>;
  disconnect: () => void;
  switchNetwork: (chainId: number) => Promise<boolean>;
  hasMetaMask: boolean;
}

const WalletContext = createContext<WalletContextType | null>(null);

const POLYGON_MAINNET_ID = 137;
const POLYGON_AMOY_ID = 80002;
const SUPPORTED_CHAINS = [POLYGON_MAINNET_ID, POLYGON_AMOY_ID, 1, 11155111];

export function WalletProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [profile, setProfile] = useState<WalletContextType['profile']>(null);
  const [hasMetaMask, setHasMetaMask] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkMetaMask = () => {
      setHasMetaMask(typeof window.ethereum !== 'undefined' && !!window.ethereum.isMetaMask);
    };

    checkMetaMask();

    // Check for existing connection
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' }) as string[];
          if (accounts.length > 0) {
            const address = accounts[0];
            setWalletAddress(address);
            setIsConnected(true);
            
            const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' }) as string;
            setChainId(parseInt(chainIdHex, 16));
            
            await fetchUserProfile(address);
          }
        } catch (error) {
          console.error('Error checking connection:', error);
        }
      }
    };

    checkConnection();

    // Listen for account changes
    const handleAccountsChanged = (accounts: unknown) => {
      const accs = accounts as string[];
      if (accs.length === 0) {
        disconnect();
      } else if (accs[0] !== walletAddress) {
        setWalletAddress(accs[0]);
        fetchUserProfile(accs[0]);
      }
    };

    const handleChainChanged = (chainIdHex: unknown) => {
      setChainId(parseInt(chainIdHex as string, 16));
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [walletAddress]);

  async function fetchUserProfile(address: string) {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, display_name, did, avatar_url, user_id')
        .eq('wallet_address', address.toLowerCase())
        .maybeSingle();

      if (profileData) {
        setProfile({
          id: profileData.id,
          displayName: profileData.display_name,
          did: profileData.did,
          avatarUrl: profileData.avatar_url,
        });

        const { data: rolesData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', profileData.user_id);

        if (rolesData && rolesData.length > 0) {
          setUserRole(rolesData[0].role as UserRole);
        } else {
          setUserRole('student');
        }
      } else {
        setProfile(null);
        setUserRole(null);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  }

  async function connect(preferredRole?: UserRole): Promise<boolean> {
    if (!window.ethereum) {
      toast({
        title: 'MetaMask Required',
        description: 'Please install MetaMask to connect your wallet.',
        variant: 'destructive',
      });
      window.open('https://metamask.io/download/', '_blank');
      return false;
    }

    setIsConnecting(true);

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      }) as string[];

      if (accounts.length === 0) {
        throw new Error('No accounts returned');
      }

      const address = accounts[0];
      setWalletAddress(address);
      setIsConnected(true);

      const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' }) as string;
      const currentChainId = parseInt(chainIdHex, 16);
      setChainId(currentChainId);

      // Warn if not on supported chain
      if (!SUPPORTED_CHAINS.includes(currentChainId)) {
        toast({
          title: 'Unsupported Network',
          description: 'Please switch to Polygon for the best experience.',
          variant: 'default',
        });
      }

      await fetchUserProfile(address);
      
      if (preferredRole) {
        setUserRole(preferredRole);
      }

      toast({
        title: 'Wallet Connected',
        description: `Connected to ${address.slice(0, 6)}...${address.slice(-4)}`,
      });

      return true;
    } catch (error: unknown) {
      const err = error as { code?: number; message?: string };
      console.error('Connection error:', error);
      
      if (err.code === 4001) {
        toast({
          title: 'Connection Rejected',
          description: 'You rejected the connection request.',
          variant: 'default',
        });
      } else {
        toast({
          title: 'Connection Failed',
          description: 'Unable to connect to MetaMask.',
          variant: 'destructive',
        });
      }
      return false;
    } finally {
      setIsConnecting(false);
    }
  }

  function disconnect() {
    setIsConnected(false);
    setWalletAddress(null);
    setChainId(null);
    setUserRole(null);
    setProfile(null);
    
    toast({
      title: 'Wallet Disconnected',
      description: 'Your wallet has been disconnected.',
    });
  }

  async function switchNetwork(targetChainId: number): Promise<boolean> {
    if (!window.ethereum) return false;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
      return true;
    } catch (error: unknown) {
      const err = error as { code?: number };
      if (err.code === 4902) {
        // Chain not added, add it
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${targetChainId.toString(16)}`,
              chainName: targetChainId === POLYGON_MAINNET_ID ? 'Polygon Mainnet' : 'Polygon Amoy Testnet',
              nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
              rpcUrls: targetChainId === POLYGON_MAINNET_ID 
                ? ['https://polygon-rpc.com'] 
                : ['https://rpc-amoy.polygon.technology'],
              blockExplorerUrls: targetChainId === POLYGON_MAINNET_ID
                ? ['https://polygonscan.com']
                : ['https://amoy.polygonscan.com'],
            }],
          });
          return true;
        } catch {
          return false;
        }
      }
      return false;
    }
  }

  return (
    <WalletContext.Provider value={{
      isConnected,
      isConnecting,
      walletAddress,
      chainId,
      userRole,
      profile,
      connect,
      disconnect,
      switchNetwork,
      hasMetaMask,
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

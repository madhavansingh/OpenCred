import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'text' | 'card' | 'avatar' | 'button';
}

export function LoadingSkeleton({ className, variant = 'text' }: LoadingSkeletonProps) {
  const baseClasses = "animate-pulse bg-muted rounded";
  
  const variants = {
    text: "h-4 w-full",
    card: "h-32 w-full rounded-lg",
    avatar: "h-10 w-10 rounded-full",
    button: "h-10 w-24 rounded-md",
  };

  return <div className={cn(baseClasses, variants[variant], className)} />;
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-64 bg-muted rounded" />
        <div className="h-4 w-96 bg-muted rounded" />
      </div>

      {/* Stats grid skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-muted rounded-lg" />
        ))}
      </div>

      {/* Content skeleton */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 h-80 bg-muted rounded-lg" />
        <div className="h-80 bg-muted rounded-lg" />
      </div>
    </div>
  );
}

export function CredentialCardSkeleton() {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border p-4 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-lg bg-muted" />
        <div className="space-y-2">
          <div className="h-4 w-48 bg-muted rounded" />
          <div className="h-3 w-32 bg-muted rounded" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-6 w-16 bg-muted rounded-full" />
        <div className="h-8 w-8 bg-muted rounded" />
      </div>
    </div>
  );
}

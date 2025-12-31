import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-6">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-sm mb-6">{description}</p>
      {action && (
        action.href ? (
          <Link to={action.href}>
            <Button>{action.label}</Button>
          </Link>
        ) : (
          <Button onClick={action.onClick}>{action.label}</Button>
        )
      )}
    </div>
  );
}

export function ComingSoon({ feature }: { feature: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="relative mb-6">
        <div className="absolute inset-0 animate-ping bg-accent/20 rounded-full" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-accent/10">
          <span className="text-4xl">🚀</span>
        </div>
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-2">Coming Soon</h2>
      <p className="text-muted-foreground max-w-md mb-4">
        {feature} is currently under development. We're working hard to bring you this feature.
      </p>
      <p className="text-sm text-muted-foreground">
        Check back soon for updates!
      </p>
    </div>
  );
}

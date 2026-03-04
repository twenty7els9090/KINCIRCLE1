'use client';

/**
 * FloatingActionButton Component
 * Circular button for primary actions
 */
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingActionButtonProps {
  onClick?: () => void;
  icon?: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}

export function FloatingActionButton({
  onClick,
  icon = <Plus className="w-6 h-6" />,
  className,
  ariaLabel = 'Add new item',
}: FloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'fab bottom-24 right-4 z-40',
        'flex items-center justify-center',
        'transition-all duration-200',
        'hover:shadow-lg hover:scale-105',
        'active:scale-95',
        className
      )}
      aria-label={ariaLabel}
    >
      {icon}
    </button>
  );
}

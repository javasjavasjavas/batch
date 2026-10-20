import React from 'react';
import { CircleCheckIcon, CircleDashedIcon, CircleXIcon, ImageOffIcon, LoaderCircleIcon, PauseIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export type BadgeStatus = 'queued' | 'active' | 'paused' | 'complete' | 'failed' | 'canceled' | 'unreadable';

const CONFIG: Record<BadgeStatus, {label: string;className: string;icon: React.ReactNode;}> = {
  queued: { label: 'Queued', className: 'bg-sunken text-muted', icon: <CircleDashedIcon className="h-3.5 w-3.5" /> },
  active: { label: 'Processing', className: 'bg-info-soft text-info', icon: <LoaderCircleIcon className="h-3.5 w-3.5 animate-spin" /> },
  paused: { label: 'Paused', className: 'bg-warning-soft text-warning', icon: <PauseIcon className="h-3.5 w-3.5" /> },
  complete: { label: 'Done', className: 'bg-lime-soft text-lime-ink', icon: <CircleCheckIcon className="h-3.5 w-3.5" /> },
  failed: { label: 'Failed', className: 'bg-danger-soft text-danger', icon: <CircleXIcon className="h-3.5 w-3.5" /> },
  canceled: { label: 'Canceled', className: 'bg-sunken text-muted', icon: <CircleXIcon className="h-3.5 w-3.5" /> },
  unreadable: { label: 'Preview unavailable', className: 'bg-warning-soft text-warning', icon: <ImageOffIcon className="h-3.5 w-3.5" /> }
};

export function StatusBadge({ status, className }: {status: BadgeStatus;className?: string;}) {
  const c = CONFIG[status];
  return (
    <span
      className={twMerge(
        'inline-flex h-6 shrink-0 items-center gap-1 whitespace-nowrap rounded-md px-2 text-[12px] font-medium',
        c.className,
        className
      )}>
      
      <span aria-hidden="true">{c.icon}</span>
      {c.label}
    </span>);

}

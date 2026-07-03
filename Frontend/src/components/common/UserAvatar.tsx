import React from 'react';
import { Zap } from 'lucide-react';

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return (parts[0]?.slice(0, 2) || 'FF').toUpperCase();
}

interface UserAvatarProps {
  name: string;
  src?: string;
  size?: 'sm' | 'md';
  variant?: 'organizer' | 'default';
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  src,
  size = 'md',
  variant = 'default',
}) => {
  const sizeClass = sizeClasses[size];

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizeClass} border-4 border-on-background object-cover neo-shadow-sm shrink-0`}
      />
    );
  }

  if (variant === 'organizer') {
    return (
      <div
        className={`${sizeClass} bg-[#a6f2cf] border-4 border-on-background flex items-center justify-center neo-shadow-sm shrink-0`}
        title={name}
      >
        <Zap className="w-5 h-5 text-on-background fill-on-background stroke-[2.5]" />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClass} bg-tertiary-fixed border-4 border-on-background flex items-center justify-center font-black uppercase text-on-background neo-shadow-sm shrink-0`}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
};

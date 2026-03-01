


import React from 'react';
import type { User, Egregore } from '@/types';
import { THEMES } from '@/constants';
import { UserIcon } from '@/components/icons';

interface UserAvatarProps {
  user?: User;
  egregore?: Egregore;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
};

const UserAvatar = ({ user, egregore, size = 'md' }: UserAvatarProps) => {
  const finalSize = sizeClasses[size] || sizeClasses.md;

  if (user) {
    return (
      <div className={`${finalSize} rounded-full bg-amber-800 border border-amber-400 flex items-center justify-center font-bold flex-shrink-0`} title={user.username}>
        <UserIcon className="w-2/3 h-2/3" />
      </div>
    );
  }
  if (egregore) {
    const theme = THEMES[egregore.themeKey] || THEMES.default;
    return (
      <div className={`${finalSize} rounded-full ${theme.iconBg} border ${theme.border} flex items-center justify-center font-bold flex-shrink-0`} title={egregore.name}>
        {egregore.name.charAt(0).toUpperCase()}
      </div>
    );
  }
  return <div className={`${finalSize} rounded-full bg-gray-600 flex-shrink-0`}></div>;
};

export default React.memo(UserAvatar);
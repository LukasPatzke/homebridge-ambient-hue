import { Avatar } from '@mantine/core';
import React from 'react';
import { Group } from '../../api.types';
import { ReactComponent as Other } from './icons/room-other.svg';

interface GroupIconProps {
  group: Group;
}

export const GroupIcon: React.FC<GroupIconProps> = ({ group }) => {
  return (
    <Avatar alt={group.type}>
      <Other fill="currentColor" height={20} />
    </Avatar>
  );
};

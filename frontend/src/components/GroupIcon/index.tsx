import {
  ActionIcon,
  Indicator,
  Skeleton,
  useMantineTheme,
} from '@mantine/core';
import { IconExclamationMark } from '@tabler/icons';
import React from 'react';
import { useGroup } from '../../data/group';

import { ReactComponent as Home } from './icons/home.svg';
import { ReactComponent as Attic } from './icons/room-attic.svg';
import { ReactComponent as Balcony } from './icons/room-balcony.svg';
import { ReactComponent as Bathroom } from './icons/room-bathroom.svg';
import { ReactComponent as Narbecue } from './icons/room-bbq.svg';
import { ReactComponent as Bedroom } from './icons/room-bedroom.svg';
import { ReactComponent as Carport } from './icons/room-carport.svg';
import { ReactComponent as Closet } from './icons/room-closet.svg';
import {
  ReactComponent as Computer,
  ReactComponent as Tv,
} from './icons/room-computer.svg';
import { ReactComponent as Dining } from './icons/room-dining.svg';
import { ReactComponent as Driveway } from './icons/room-driveway.svg';
import { ReactComponent as Front_door } from './icons/room-front-door.svg';
import { ReactComponent as Man_cave } from './icons/room-games.svg';
import { ReactComponent as Garage } from './icons/room-garage.svg';
import { ReactComponent as Guest_room } from './icons/room-guestroom.svg';
import { ReactComponent as Gym } from './icons/room-gym.svg';
import { ReactComponent as Hallway } from './icons/room-hallway.svg';
import { ReactComponent as Kids_bedroom } from './icons/room-kids.svg';
import { ReactComponent as Kitchen } from './icons/room-kitchen.svg';
import { ReactComponent as Laundry_room } from './icons/room-laundry.svg';
import { ReactComponent as Living_room } from './icons/room-living.svg';
import { ReactComponent as Lounge } from './icons/room-lounge.svg';
import { ReactComponent as Nursery } from './icons/room-nursery.svg';
import { ReactComponent as Office } from './icons/room-office.svg';
import { ReactComponent as Other } from './icons/room-other.svg';
import { ReactComponent as Pool } from './icons/room-pool.svg';
import { ReactComponent as Porch } from './icons/room-porch.svg';
import { ReactComponent as Recreation } from './icons/room-recreation.svg';
import {
  ReactComponent as Downstairs,
  ReactComponent as Staircase,
} from './icons/room-stairs.svg';
import { ReactComponent as Storage } from './icons/room-storage.svg';
import { ReactComponent as Studio } from './icons/room-studio.svg';
import { ReactComponent as Terrace } from './icons/room-terrace.svg';
import { ReactComponent as Toilet } from './icons/room-toilet.svg';
import { ReactComponent as Upstairs } from './icons/upstairs.svg';

interface GroupIconProps {
  groupId: number;
}

export const GroupIcon: React.FC<GroupIconProps> = ({ groupId }) => {
  const theme = useMantineTheme();
  const { group, error, isLoading } = useGroup(groupId);
  const size = 20;

  if (isLoading) {
    return (
      <ActionIcon>
        <Skeleton height={size} circle />
      </ActionIcon>
    );
  }
  if (error) {
    return (
      <ActionIcon color="red">
        <IconExclamationMark />
      </ActionIcon>
    );
  }
  if (!group) {
    return (
      <ActionIcon>
        <Other fill="currentColor" height={size} />
      </ActionIcon>
    );
  }

  const color = () => {
    if (theme.colorScheme === 'dark') {
      return group.on ? theme.colors.yellow[6] : theme.colors.gray[2];
    } else {
      return group.on ? theme.colors.yellow[7] : theme.colors.gray[6];
    }
  };
  const icon = () => {
    switch (group.archetype) {
      case 'living_room':
        return <Living_room fill={color()} height={size} />;
      case 'kitchen':
        return <Kitchen fill={color()} height={size} />;
      case 'dining':
        return <Dining fill={color()} height={size} />;
      case 'bedroom':
        return <Bedroom fill={color()} height={size} />;
      case 'kids_bedroom':
        return <Kids_bedroom fill={color()} height={size} />;
      case 'bathroom':
        return <Bathroom fill={color()} height={size} />;
      case 'nursery':
        return <Nursery fill={color()} height={size} />;
      case 'recreation':
        return <Recreation fill={color()} height={size} />;
      case 'office':
        return <Office fill={color()} height={size} />;
      case 'gym':
        return <Gym fill={color()} height={size} />;
      case 'hallway':
        return <Hallway fill={color()} height={size} />;
      case 'toilet':
        return <Toilet fill={color()} height={size} />;
      case 'front_door':
        return <Front_door fill={color()} height={size} />;
      case 'garage':
        return <Garage fill={color()} height={size} />;
      case 'terrace':
        return <Terrace fill={color()} height={size} />;
      case 'driveway':
        return <Driveway fill={color()} height={size} />;
      case 'carport':
        return <Carport fill={color()} height={size} />;
      case 'home':
        return <Home fill={color()} height={size} />;
      case 'downstairs':
        return <Downstairs fill={color()} height={size} />;
      case 'upstairs':
        return <Upstairs fill={color()} height={size} />;
      case 'attic':
        return <Attic fill={color()} height={size} />;
      case 'guest_room':
        return <Guest_room fill={color()} height={size} />;
      case 'staircase':
        return <Staircase fill={color()} height={size} />;
      case 'lounge':
        return <Lounge fill={color()} height={size} />;
      case 'man_cave':
        return <Man_cave fill={color()} height={size} />;
      case 'computer':
        return <Computer fill={color()} height={size} />;
      case 'studio':
        return <Studio fill={color()} height={size} />;
      case 'tv':
        return <Tv fill={color()} height={size} />;
      case 'closet':
        return <Closet fill={color()} height={size} />;
      case 'storage':
        return <Storage fill={color()} height={size} />;
      case 'laundry_room':
        return <Laundry_room fill={color()} height={size} />;
      case 'balcony':
        return <Balcony fill={color()} height={size} />;
      case 'porch':
        return <Porch fill={color()} height={size} />;
      case 'barbecue':
        return <Narbecue fill={color()} height={size} />;
      case 'pool':
        return <Pool fill={color()} height={size} />;
      case 'other':
        return <Other fill={color()} height={size} />;

      default:
        return <Other fill="currentColor" height={size} />;
    }
  };

  return (
    <Indicator disabled={group.smartOff === false}>
      <ActionIcon>{icon()}</ActionIcon>
    </Indicator>
  );
};

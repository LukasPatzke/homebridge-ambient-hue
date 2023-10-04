import {
  ActionIcon,
  Indicator,
  Skeleton,
  useMantineTheme,
} from '@mantine/core';
import { IconExclamationMark } from '@tabler/icons';
import React from 'react';
import { useLight } from '../../data/light';
import { ReactComponent as CandleBulb } from './icons/bulb-candle.svg';
import { ReactComponent as ClassicBulb } from './icons/bulb-classic.svg';
import { ReactComponent as FliamentAltBulb } from './icons/bulb-filament-alt.svg';
import { ReactComponent as FliamentBulb } from './icons/bulb-filament.svg';
import { ReactComponent as GolfballE14Bulb } from './icons/bulb-golfball-e14.svg';
import { ReactComponent as SpotBulb } from './icons/bulb-spot.svg';
import { ReactComponent as SultanBulb } from './icons/bulb-sultan.svg';
import { ReactComponent as CeilingRound } from './icons/ceiling-round.svg';
import { ReactComponent as CeilingSquare } from './icons/ceiling-square.svg';
import { ReactComponent as DeskLamp } from './icons/desk-lamp.svg';
import { ReactComponent as LightStrip } from './icons/lightstrip.svg';
import { ReactComponent as PendantRound } from './icons/pendant-round.svg';
import { ReactComponent as SingleSpot } from './icons/single-spot.svg';
import { ReactComponent as TableShade } from './icons/table-shade.svg';
import { ReactComponent as TableWash } from './icons/table-wash.svg';

interface LightIconProps {
  lightId: number;
}

export const LightIcon: React.FC<LightIconProps> = ({ lightId }) => {
  const theme = useMantineTheme();
  const { light, error, isLoading } = useLight(lightId);

  if (isLoading) {
    return (
      <ActionIcon>
        <Skeleton height={30} circle />
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
  if (!light) {
    return (
      <ActionIcon>
        <ClassicBulb fill="currentColor" height={30} />
      </ActionIcon>
    );
  }

  const color = () => {
    if (theme.colorScheme === 'dark') {
      return light.on ? theme.colors.yellow[6] : theme.colors.gray[2];
    } else {
      return light.on ? theme.colors.yellow[7] : theme.colors.gray[6];
    }
  };
  const icon = () => {
    switch (light.archetype) {
      case 'classic_bulb':
        return <ClassicBulb fill={color()} height={30} />;
      case 'sultan_bulb':
        return <SultanBulb fill={color()} height={30} />;
      case 'spot_bulb':
        return <SpotBulb fill={color()} height={30} />;
      case 'luster_bulb':
        return <GolfballE14Bulb fill={color()} height={24} />;
      case 'vintage_bulb':
        return <FliamentAltBulb fill={color()} height={30} />;
      case 'large_globe_bulb':
        return <FliamentBulb fill={color()} height={30} />;
      case 'candle_bulb':
        return <CandleBulb fill={color()} height={30} />;
      case 'hue_lightstrip':
        return <LightStrip fill={color()} height={30} />;
      case 'ceiling_round':
        return <CeilingRound fill={color()} height={30} />;
      case 'ceiling_square':
        return <CeilingSquare fill={color()} height={30} />;
      case 'flexible_lamp':
        return <DeskLamp fill={color()} height={30} />;
      case 'pendant_round':
        return <PendantRound fill={color()} height={30} />;
      case 'single_spot':
        return <SingleSpot fill={color()} height={30} />;
      case 'table_shade':
        return <TableShade fill={color()} height={30} />;
      case 'table_wash':
        return <TableWash fill={color()} height={30} />;
      default:
        return light.archetype.split('_').map((i) => i[0]);
    }
  };
  return (
    <Indicator disabled={light.smartOff === false}>
      <ActionIcon>{icon()}</ActionIcon>
    </Indicator>
  );
};

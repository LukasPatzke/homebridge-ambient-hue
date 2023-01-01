import { Badge, Group, MantineGradient, useMantineTheme } from '@mantine/core';
import React from 'react';
import { Accessory, curvekind } from '../../api.types';

interface CapabilitiesProps {
  accessory: Accessory;
}
export const Capbilties: React.FC<CapabilitiesProps> = ({accessory}) => (
  <Group>
    {accessory.isBrightnessCapable && (
      <CapabilityBadge kind='bri'/>
    )}
    {accessory.isColorTemperatureCapable && (
      <CapabilityBadge kind='ct'/>
    )}
  </Group>
);


interface CapabilityBadgeProps {
  kind: curvekind;
}

export const CapabilityBadge: React.FC<CapabilityBadgeProps> = ({kind: type}) => {
  const theme = useMantineTheme();

  const gradient = (): MantineGradient => {
    if (type==='bri') {
      if (theme.colorScheme === 'dark') {
        return {from: 'gray.5', to: 'gray.8' };
      } else {
        return {from: 'gray.1', to: 'gray.8' };
      }
    } else {
      if (theme.colorScheme === 'dark') {
        return {from: 'yellow.3', to: 'yellow.9' };
      } else {
        return {from: 'yellow.1', to: 'yellow.9' };
      }
    }
  };

  return (
    <Badge variant='gradient' gradient={gradient()}>
      {type==='bri'?'Brightness':'Color Temperature'}
    </Badge>
  );

};
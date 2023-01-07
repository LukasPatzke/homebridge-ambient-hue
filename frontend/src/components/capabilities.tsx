import { Badge, createStyles, Group, MantineGradient } from '@mantine/core';
import React from 'react';
import { Accessory, curvekind } from '../api.types';

interface CapabilitiesProps {
  accessory: Accessory;
}
export const Capbilties: React.FC<CapabilitiesProps> = ({ accessory }) => (
  <Group>
    {accessory.isBrightnessCapable && <CapabilityBadge kind="bri" />}
    {accessory.isColorTemperatureCapable && <CapabilityBadge kind="ct" />}
  </Group>
);

const useStyles = createStyles((theme) => ({
  badge: {
    color:
      theme.colorScheme === 'dark' ? theme.colors.white : theme.colors.gray[0],
  },
}));

interface CapabilityBadgeProps {
  kind: curvekind;
}

export const CapabilityBadge: React.FC<CapabilityBadgeProps> = ({
  kind: type,
}) => {
  const { classes, theme } = useStyles();

  const gradient = (): MantineGradient => {
    if (type === 'bri') {
      if (theme.colorScheme === 'dark') {
        return { from: 'dark.3', to: 'yellow.4' };
      } else {
        return { from: 'dark.7', to: 'yellow.4' };
      }
    } else {
      if (theme.colorScheme === 'dark') {
        return { from: 'blue.2', to: 'yellow.9' };
      } else {
        return { from: 'blue.2', to: 'yellow.9' };
      }
    }
  };

  return (
    <Badge variant="gradient" gradient={gradient()} className={classes.badge}>
      {type === 'bri' ? 'Brightness' : 'Color Temperature'}
    </Badge>
  );
};

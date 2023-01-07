import { createStyles, Skeleton, Switch, Text } from '@mantine/core';
import React, { useEffect, useState } from 'react';
import { Light } from '../../api.types';
import { Capbilties } from '../../components/capabilities';
import { Header, HeaderItem } from '../../components/Header';
import { useLight } from '../../data/light';
import { SmartOffAlert } from './smartOffAlert';

const useStyles = createStyles((theme) => ({
  label: {
    fontSize: theme.fontSizes.sm,
    width: 100,
  },
  switchTrack: {
    ['input:not(:checked)+&']: {
      backgroundImage: theme.fn.gradient({ from: 'pink', to: 'orange' }),
      color: theme.white,
    },
  },
}));

interface LightHeaderProps {
  lightId: string | number;
}
export const LightHeader: React.FC<LightHeaderProps> = ({ lightId }) => {
  const { classes, theme } = useStyles();
  const { light, mutate } = useLight(lightId);
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (light) {
      setOn(light.on);
    }
  }, [light]);

  const onChange = async (change: Partial<Light>) => {
    if (!light) {
      return;
    }
    const res = await fetch(`/api/accessories/${light.accessoryId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(change),
    });

    if (!res.ok) {
      throw res;
    }
    const data = (await res.json()) as Light;

    mutate(data, { revalidate: false });
  };

  return (
    <Header title={light?.name}>
      <HeaderItem label="Type">
        <Text tt="capitalize">
          {light?.archetype.replace('_', ' ') || (
            <Skeleton height={theme.fontSizes.md} width={100} />
          )}
        </Text>
      </HeaderItem>
      <HeaderItem label="Capabilities">
        {light ? <Capbilties accessory={light} /> : <Skeleton />}
      </HeaderItem>
      <HeaderItem label="Enabled">
        <Switch
          size="md"
          onLabel="ON"
          offLabel="OFF"
          classNames={{ track: classes.switchTrack }}
          checked={on}
          onChange={(event) => {
            setOn(event.currentTarget.checked);
            onChange({ on: event.currentTarget.checked });
          }}
        />
      </HeaderItem>
      <SmartOffAlert light={light} />
    </Header>
  );
};

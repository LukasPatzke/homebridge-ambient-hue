import { createStyles, Skeleton, Switch, Text } from '@mantine/core';
import React, { useEffect, useState } from 'react';
import { Group } from '../../api.types';
import { Capbilties } from '../../components/capabilities';
import { Header, HeaderItem } from '../../components/Header';
import { useGroup } from '../../data/group';

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

interface GroupHeaderProps {
  groupId: string | number;
}
export const GroupHeader: React.FC<GroupHeaderProps> = ({ groupId }) => {
  const { classes, theme } = useStyles();
  const { group, mutate } = useGroup(groupId);
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (group) {
      setOn(group.on);
    }
  }, [group]);

  const onChange = async (change: Partial<Group>) => {
    if (!group) {
      return;
    }
    const res = await fetch(`/api/accessories/${group.accessoryId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(change),
    });

    if (!res.ok) {
      throw res;
    }
    const data = (await res.json()) as Group;

    mutate(data, { revalidate: false });
  };

  return (
    <Header title={group?.name}>
      <HeaderItem label="Type">
        <Text tt="capitalize">
          {group?.type || <Skeleton height={theme.fontSizes.md} width={100} />}
        </Text>
      </HeaderItem>
      <HeaderItem label="Capabilities">
        {group ? <Capbilties accessory={group} /> : <Skeleton />}
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
    </Header>
  );
};

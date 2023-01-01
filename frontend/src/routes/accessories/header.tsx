import { createStyles, Switch, Text } from '@mantine/core';
import React, { useEffect, useState } from 'react';
import { Accessory, isGroup, Light } from '../../api.types';
import { Header, HeaderItem } from '../../components/Header';
import { Capbilties } from './capabilities';

const useStyles = createStyles((theme)=>({
  label: {
    fontSize: theme.fontSizes.sm,
    width: 100,
  },
  switchTrack : {
    ['input:not(:checked)+&']: {
      backgroundImage: theme.fn.gradient({from: 'pink', to: 'orange'}),
      color: theme.white,
    },

  },
}));

interface AccessoryHeaderProps {
  accessory: Accessory;
}
export const AccessoryHeader: React.FC<AccessoryHeaderProps> = ({accessory}) => {
  const {classes} = useStyles();
  const [on, setOn] = useState(false);

  useEffect(()=>{
    if (accessory) {
      setOn(accessory.on);
    }
  }, [accessory]);


  const onChange = (change: Partial<Light>) => {
    fetch(`/api/accessories/${accessory.accessoryId}`, {
      method:'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(change),
    }).then((response) => {
      if (!response.ok) {
        throw response;
      }
      return response.json();
    });
  };

  return (
    <Header title={accessory.name}>
      <HeaderItem label='Type'>
        <Text tt='capitalize'>{isGroup(accessory)?accessory.type:accessory.archetype.replace('_', ' ')}</Text>
      </HeaderItem>
      <HeaderItem label='Capabilities'>
        <Capbilties accessory={accessory}/>
      </HeaderItem>
      <HeaderItem label='Enabled'>
        <Switch
          size='md'
          onLabel='ON'
          offLabel='OFF'
          classNames={{track: classes.switchTrack}}
          checked={on}
          onChange={event=>{
            setOn(event.currentTarget.checked);
            onChange({on: event.currentTarget.checked});
          }}
        />
      </HeaderItem>
    </Header>
  );
};
import { Container, Paper, Switch, Tabs, Text, Title } from '@mantine/core';
import { Prism } from '@mantine/prism';
import { IconBulb, IconBulbOff } from '@tabler/icons';
import React from 'react';
import { useParams } from 'react-router-dom';
import { TextOutput } from '../../components/TextOutput';
import { useRootData } from '../root';
import { Settings } from './settings';
import useTabStyles from './tab.styles';

export const Lights: React.FC = () => {
  const {classes} = useTabStyles();

  const lights = useRootData();
  const { id } = useParams();

  const light = lights.find((i) => i.id === id);

  if (light) {
    return (
      <>
        <Container size='lg' p='lg'>
          <Title order={1} mb='sm'>{light?.name}</Title>
          <Text c='dimmed' tt='capitalize'>{light?.archetype.replace('_', ' ')}</Text>
          <Switch
            label='Enable AmbientHUE'
            labelPosition='left'
            size='md'
            my='xl'
            onLabel={<IconBulb size={16}/>}
            offLabel={<IconBulbOff size={16}/>}

          />
        </Container>
        <Tabs
          variant='outline'
          defaultValue='settings'
          classNames={{tab: classes.tab, tabsList: classes.tabsList, panel: classes.panel}}
        >
          <div className={classes.tabsListWrapper}>
            <Tabs.List>
              <Tabs.Tab value='settings'>Settings</Tabs.Tab>
              <Tabs.Tab value='info'>Info</Tabs.Tab>
              <Tabs.Tab value='debug'>Debug</Tabs.Tab>
            </Tabs.List>
          </div>
          <Paper shadow='xs'>
            <Tabs.Panel value='settings'>
              <Container size='lg' p='xl'>
                <Title order={3} mb='md'>Settings</Title>
                <Settings accessory={light}/>
              </Container>
            </Tabs.Panel>
            <Tabs.Panel value='info'>
              <Container size='lg' p='xl'>
                <Title order={3} mb='md'>Information</Title>
                <TextOutput label='Hue Id'>{light?.id}</TextOutput>
                <TextOutput label='Hue Device Id'>{light?.deviceId}</TextOutput>
                <TextOutput label='Legacy Id'>{light?.legacyId}</TextOutput>
                <TextOutput label='Homekit Accessory Id'>{light?.accessoryId}</TextOutput>
              </Container>
            </Tabs.Panel>
            <Tabs.Panel value='debug'>
              <Container size='lg' p='xl'>
                <Title order={3} mb='md'>Debug Output</Title>
                <Prism language='json'>{JSON.stringify(light, null, 2)}</Prism>
              </Container>
            </Tabs.Panel>
          </Paper>
        </Tabs>
      </>
    );
  }
  return null;
};

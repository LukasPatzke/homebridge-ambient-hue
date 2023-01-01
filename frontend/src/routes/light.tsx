import { Paper, Tabs } from '@mantine/core';
import { Prism } from '@mantine/prism';
import React from 'react';
import { Params, useLoaderData } from 'react-router-dom';
import { Light } from '../api.types';
import { AccessoryHeader } from './accessories/header';
import { Info } from './accessories/info';
import { Settings } from './accessories/settings';
import useTabStyles from './accessories/tab.styles';
import { TabsPanel } from './accessories/TabsPanel';

export const LightPage: React.FC = () => {
  const {classes} = useTabStyles();
  const light = useLoaderData() as Light;

  return (
    <>
      <AccessoryHeader accessory={light}/>
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
          <TabsPanel value='settings' title='Settings'>
            <Settings accessory={light}/>
          </TabsPanel>
          <TabsPanel value='info' title='Info'>
            <Info accessory={light}/>
          </TabsPanel>
          <TabsPanel value='debug' title='Debug'>
            <Prism language='json'>{JSON.stringify(light, null, 2)}</Prism>
          </TabsPanel>
        </Paper>
      </Tabs>
    </>
  );
};

export async function loader({params}: {params: Params<string>}) {
  return fetch(`/api/lights/${params.lightId}`).then(res=>{
    if (!res.ok) {
      throw res;
    }
    return res;
  });
}
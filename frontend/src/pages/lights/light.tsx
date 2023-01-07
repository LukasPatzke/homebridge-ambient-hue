import { Paper, Stack, Tabs } from '@mantine/core';
import { Prism } from '@mantine/prism';
import React from 'react';
import { useParams } from 'react-router-dom';
import useTabStyles from '../../components/tab.styles';
import { TabsPanel } from '../../components/TabsPanel';
import { ErrorPage } from '../../data/errorPage';
import { useLight } from '../../data/light';
import { LoadingPage } from '../../data/LoadingPage';
import { LightHeader } from './header';
import { Info } from './info';
import { Settings } from './settings';

export const LightPage: React.FC = () => {
  const { classes } = useTabStyles();
  const { lightId } = useParams();
  const { light, isLoading, error } = useLight(lightId);

  if (isLoading && !light) {
    return <LoadingPage />;
  }
  if (error) {
    return <ErrorPage error={error} />;
  }
  if (!lightId) {
    return <ErrorPage error={{ status: 404, message: 'No light id' }} />;
  }
  if (!light) {
    return <></>;
  }

  return (
    <Stack>
      <LightHeader lightId={lightId} />
      <Tabs
        variant="outline"
        defaultValue="settings"
        classNames={{
          tab: classes.tab,
          tabsList: classes.tabsList,
          panel: classes.panel,
        }}
      >
        <div className={classes.tabsListWrapper}>
          <Tabs.List>
            <Tabs.Tab value="settings">Settings</Tabs.Tab>
            <Tabs.Tab value="info">Info</Tabs.Tab>
            <Tabs.Tab value="debug">Debug</Tabs.Tab>
          </Tabs.List>
        </div>
        <Paper shadow="xs">
          <TabsPanel value="settings" title="Settings">
            <Settings accessory={light} />
          </TabsPanel>
          <TabsPanel value="info" title="Info">
            <Info accessory={light} />
          </TabsPanel>
          <TabsPanel value="debug" title="Debug">
            <Prism language="json">{JSON.stringify(light, null, 2)}</Prism>
          </TabsPanel>
        </Paper>
      </Tabs>
    </Stack>
  );
};

import { Paper, Stack, Tabs } from '@mantine/core';
import { Prism } from '@mantine/prism';
import React from 'react';
import { useParams } from 'react-router-dom';
import useTabStyles from '../../components/tab.styles';
import { TabsPanel } from '../../components/TabsPanel';
import { ErrorPage } from '../../data/errorPage';
import { useGroup } from '../../data/group';
import { LoadingPage } from '../../data/LoadingPage';
import { Info } from '../lights/info';
import { Settings } from '../lights/settings';
import { GroupHeader } from './header';

export const GroupPage: React.FC = () => {
  const { classes } = useTabStyles();
  const { groupId } = useParams();
  const { group, isLoading, error } = useGroup(groupId);

  if (isLoading && !group) {
    return <LoadingPage />;
  }
  if (error) {
    return <ErrorPage error={error} />;
  }
  if (!groupId) {
    return <ErrorPage error={{ status: 404, message: 'No group id' }} />;
  }
  if (!group) {
    return <></>;
  }

  return (
    <Stack>
      <GroupHeader groupId={groupId} />
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
            <Settings accessory={group} />
          </TabsPanel>
          <TabsPanel value="info" title="Info">
            <Info accessory={group} />
          </TabsPanel>
          <TabsPanel value="debug" title="Debug">
            <Prism language="json">{JSON.stringify(group, null, 2)}</Prism>
          </TabsPanel>
        </Paper>
      </Tabs>
    </Stack>
  );
};

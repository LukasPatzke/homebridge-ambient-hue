import { Container, Tabs, Title } from '@mantine/core';
import React from 'react';
import useTabStyles from './tab.styles';

interface TabsPanelProps {
  value: string;
  title?: string;
  children?: React.ReactNode;
}
export const TabsPanel: React.FC<TabsPanelProps> = ({value, title, children}) => {
  const {classes} = useTabStyles();
  return (
    <Tabs.Panel value={value}>
      <Container p='xl' className={classes.content}>
        {title&&<Title order={3} mb='md'>{title}</Title>}
        {children}
      </Container>
    </Tabs.Panel>
  );
};
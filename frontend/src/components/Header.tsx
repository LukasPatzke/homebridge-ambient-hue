import { Container, createStyles, Group, Stack, Text, Title } from '@mantine/core';
import React from 'react';
import useTabStyles from '../routes/accessories/tab.styles';

const useStyles = createStyles((theme)=>({
  label: {
    fontSize: theme.fontSizes.sm,
    width: 100,
  },
}));

interface HeaderProps {
  title: React.ReactNode;
  children?: React.ReactNode;
}
export const Header: React.FC<HeaderProps> = ({title, children}) => {
  const {classes: tabClasses} = useTabStyles();

  return (
    <Container p='lg' className={tabClasses.content}>
      <Title order={1}>{title}</Title>
      <Stack spacing='sm' my='xl'>
        {children}
      </Stack>
    </Container>
  );
};

interface HeaderItemProps {
  label: React.ReactNode;
  children?: React.ReactNode;
}

export const HeaderItem: React.FC<HeaderItemProps> = ({label, children}) => {
  const {classes} = useStyles();

  return (
    <Group>
      <Text c='dimmed' className={classes.label}>{label}</Text>
      {children}
    </Group>
  );
};
import { createStyles, Text } from '@mantine/core';
import React from 'react';

const useStyles = createStyles((theme) => ({
  label: {
    color:
      theme.colorScheme === 'dark'
        ? theme.colors.dark[2]
        : theme.colors.gray[6],
    fontWeight: 500,
    fontSize: theme.fontSizes.xs,
    padding: `calc(${theme.spacing.xs}px / 2) ${theme.spacing.sm}px`,
    cursor: 'default',
  },
}));

interface MenuLabelProps {
  children?: React.ReactNode;
}

export const MenuLabel: React.FC<MenuLabelProps> = ({ children }) => {
  const { classes } = useStyles();
  return <Text className={classes.label}>{children}</Text>;
};

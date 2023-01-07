import {
  ActionIcon,
  createStyles,
  Group,
  MediaQuery,
  Text,
} from '@mantine/core';
import { FC, ReactNode } from 'react';
import { NavLink, To } from 'react-router-dom';

const useStyles = createStyles((theme) => ({
  link: {
    textDecoration: 'none',
    color: 'inherit',
    width: '100%',
  },
  label: {},
  icon: {
    flexGrow: 0,
    marginInline: 8,
  },
  group: {
    paddingBlock: 8,
    '&:active': theme.activeStyles,
    '&:hover': {
      backgroundColor:
        theme.colorScheme === 'dark'
          ? theme.colors.dark[7]
          : theme.colors.gray[0],
    },
  },
}));

interface NavbarLinkProps {
  to: To;
  icon: ReactNode;
  children: ReactNode;
}

export const NavbarLink: FC<NavbarLinkProps> = ({ to, icon, children }) => {
  const { classes } = useStyles();
  return (
    <NavLink to={to} className={classes.link}>
      {({ isActive }) => (
        <Group className={classes.group}>
          <ActionIcon
            size="xl"
            variant={isActive ? 'light' : undefined}
            color={isActive ? 'blue' : undefined}
            className={classes.icon}
          >
            {icon}
          </ActionIcon>
          <MediaQuery largerThan="sm" styles={{ display: 'none' }}>
            <Text className={classes.label}>{children}</Text>
          </MediaQuery>
        </Group>
      )}
    </NavLink>
  );
};

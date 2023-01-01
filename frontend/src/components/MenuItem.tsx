import { Box, createStyles, MantineColor } from '@mantine/core';
import React from 'react';

interface MenuItemStylesParams {
  color?: MantineColor;
}

const useStyles = createStyles((theme, { color }: MenuItemStylesParams) => ({
  item: {
    ...theme.fn.fontStyles(),
    WebkitTapHighlightColor: 'transparent',
    fontSize: theme.fontSizes.sm,
    border: 0,
    backgroundColor: 'transparent',
    outline: 0,
    width: '100%',
    textAlign: 'left',
    textDecoration: 'none',
    boxSizing: 'border-box',
    padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
    cursor: 'pointer',
    borderRadius: theme.radius.sm,
    color: color
      ? theme.fn.variant({ variant: 'filled', primaryFallback: false, color }).background
      : theme.colorScheme === 'dark'
        ? theme.colors.dark[0]
        : theme.black,
    display: 'flex',
    alignItems: 'center',

    '&:disabled': {
      color: theme.colorScheme === 'dark' ? theme.colors.dark[3] : theme.colors.gray[5],
      pointerEvents: 'none',
      userSelect: 'none',
    },

    '&:hover': {
      backgroundColor: color
        ? theme.fn.variant({ variant: 'light', color }).background
        : theme.colorScheme === 'dark'
          ? theme.fn.rgba(theme.colors.dark[3], 0.35)
          : theme.colors.gray[1],
    },
  },

  itemLabel: {
    flex: 1,
  },

  itemIcon: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.xs,
  },

  itemRightSection: {},
}));

interface MenuItemProps {
  children?: React.ReactNode;
  color?: MantineColor;
  icon?: React.ReactNode;
  rightSection?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export const MenuItem: React.FC<MenuItemProps> = ({children, color, icon, rightSection, onClick}) => {
  const {classes, cx} = useStyles({color});
  return (
    <Box
      component="button"
      type="button"
      tabIndex={-1}
      className={cx(classes.item)}
      role="menuitem"
      data-menu-item
      onClick={onClick}
    >
      {icon && <div className={classes.itemIcon}>{icon}</div>}
      {children && <div className={classes.itemLabel}>{children}</div>}
      {rightSection && <div className={classes.itemRightSection}>{rightSection}</div>}
    </Box>
  );
};
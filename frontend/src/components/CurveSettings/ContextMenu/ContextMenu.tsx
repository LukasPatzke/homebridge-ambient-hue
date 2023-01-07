import { createStyles } from '@mantine/core';
import { useClickOutside } from '@mantine/hooks';
import React, { LegacyRef, ReactNode } from 'react';

const useStyles = createStyles((theme) => ({
  dropdown: {
    backgroundColor: theme.white,
    background:
      theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.white,
    border: `1px solid ${
      theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]
    }`,
    borderRadius: theme.radius.sm,

    '&:focus': {
      outline: 0,
    },
  },

  arrow: {
    position: 'absolute',
    left: -4,
    width: 10,
    height: 10,
    backgroundColor: 'inherit',

    '&::before': {
      content: '""',
      position: 'absolute',
      width: 10,
      height: 10,
      top: 0,
      left: 0,
      transform: 'rotate(45deg)',
      transformOrigin: 'center center',
      zIndex: 1,
      background:
        theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.white,
      border: `1px solid ${
        theme.colorScheme === 'dark'
          ? theme.colors.dark[4]
          : theme.colors.gray[2]
      }`,
      borderTop: 0,
      borderRight: 0,
    },
    zIndex: 1,
  },
}));

interface ContextMenuProps {
  children?: ReactNode;
  setElement: LegacyRef<HTMLDivElement>;
  setArrowElement: LegacyRef<HTMLDivElement>;
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
  styles: {
    [key: string]: React.CSSProperties;
  };
  attributes: {
    [key: string]:
      | {
          [key: string]: string;
        }
      | undefined;
  };
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  children,
  setElement,
  setArrowElement,
  isOpen,
  setOpen,
  styles,
  attributes,
}) => {
  const { classes } = useStyles();

  const innerRef = useClickOutside(() => setOpen(false));

  return (
    <div
      ref={setElement}
      style={{
        ...styles.popper,
        display: isOpen ? styles.popper.display : 'none',
      }}
      {...attributes.popper}
    >
      <div ref={innerRef} className={classes.dropdown}>
        {children}
        <div
          ref={setArrowElement}
          style={styles.arrow}
          className={classes.arrow}
        />
      </div>
    </div>
  );
};

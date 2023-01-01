import { createStyles } from '@mantine/core';
import React from 'react';

const useStyles = createStyles({
  // required to allow dropdown padding override with styles and classNames
  dropdown: { padding: 4, minWidth: 200 },

});

interface MenuProps {
  children?: React.ReactNode;
}

export const Menu: React.FC<MenuProps> = ({children}) => {
  const {classes} = useStyles();
  return (
    <div className={classes.dropdown}>{children}</div>
  );
};
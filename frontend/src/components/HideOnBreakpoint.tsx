import { MantineNumberSize, useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { FC, ReactNode } from 'react';

interface HideOnBreakpointProps {
  smallerThan: MantineNumberSize;
  children: ReactNode;
  disabled?: boolean;
}

export const HideOnBreakpoint: FC<HideOnBreakpointProps> = ({
  smallerThan,
  children,
  disabled,
}) => {
  const theme = useMantineTheme();
  const hide = useMediaQuery(
    `(max-width: ${theme.fn.size({
      size: smallerThan,
      sizes: theme.breakpoints,
    })}px)`,
  );

  if (disabled || !hide) {
    return <>{children}</>;
  }

  return null;
};

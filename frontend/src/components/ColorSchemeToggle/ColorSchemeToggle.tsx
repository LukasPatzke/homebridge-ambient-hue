import { ActionIcon, ColorScheme, useMantineColorScheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconMoonStars, IconSun } from '@tabler/icons';
import React, { useEffect } from 'react';
import useCookie from './useCookie';

export type ColorSchemePreference = ColorScheme | 'auto';

export const ColorSchemeToggle: React.FC = () => {
  const isSystemPreferenceDark = useMediaQuery('(prefers-color-scheme: dark)');
  const [preference, setPreference] = useCookie<ColorSchemePreference>(
    'color-preference',
    'auto',
  );
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  useEffect(() => {
    if (preference === 'auto') {
      toggleColorScheme(isSystemPreferenceDark ? 'dark' : 'light');
    } else {
      toggleColorScheme(preference);
    }
  }, [preference, isSystemPreferenceDark]);

  return (
    <ActionIcon
      onClick={() =>
        setPreference(colorScheme === 'dark' ? 'light' : 'dark', { days: 1 })
      }
      size="lg"
      sx={(theme) => ({
        backgroundColor:
          theme.colorScheme === 'dark'
            ? theme.colors.dark[6]
            : theme.colors.gray[0],
        color:
          theme.colorScheme === 'dark'
            ? theme.colors.yellow[4]
            : theme.colors.blue[6],
      })}
    >
      {colorScheme === 'dark' ? (
        <IconSun size={18} />
      ) : (
        <IconMoonStars size={18} />
      )}
    </ActionIcon>
  );
};

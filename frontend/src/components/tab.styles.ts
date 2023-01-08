import { createStyles } from '@mantine/core';

export default createStyles((theme) => ({
  tab: {
    paddingLeft: theme.spacing.lg,
    paddingRight: theme.spacing.lg,
    '&[data-active]': {
      backgroundColor:
        theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
      color: theme.colorScheme === 'dark' ? theme.white : theme.black,
    },
  },
  tabsList: {
    maxWidth: theme.breakpoints.md - theme.spacing.xl * 2,
    marginLeft: 'auto',
    marginRight: 'auto',
    borderBottom: 0,
    paddingLeft: theme.spacing.lg,
  },
  panel: {
    backgroundColor:
      theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
  },
  tabsListWrapper: {
    borderBottom: `1px solid ${
      theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]
    }`,
  },
  content: {
    width: '100%',
    maxWidth: theme.breakpoints.md,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
}));

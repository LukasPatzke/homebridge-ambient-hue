import {
  Button,
  Center,
  createStyles,
  Flex,
  Paper,
  Stack,
  Text,
  Transition,
} from '@mantine/core';
import { FC, ReactNode, useState } from 'react';
import { Group, Light } from '../api.types';
import { ReactComponent as AppIconColor } from '../assets/icon-color.svg';
import { GroupIcon } from '../components/GroupIcon';
import { LightIcon } from '../components/LightIcon';
import { NavLink } from '../components/NavLink';
import { useGroups } from '../data/groups';
import { useLights } from '../data/lights';

const useStyles = createStyles((theme) => ({
  card: {
    flexBasis: 300,
    flexGrow: 0,
    flexShrink: 0,
    [theme.fn.smallerThan('sm')]: {
      flexBasis: '100%',
    },
  },
}));

export const RootIndexPage: FC = () => {
  const { groups } = useGroups();
  const { lights } = useLights();

  return (
    <Stack p="lg">
      <Center>
        <AppIconColor height={150} width={150} style={{ paddingRight: 10 }} />
      </Center>
      <Flex gap={30} justify="center" wrap="wrap" align="flex-start">
        <Card
          title="Lights"
          data={lights?.filter((l) => l.published)}
          render={(light: Light) => (
            <NavLink
              key={light.hueId}
              label={light.name}
              to={light.resource}
              icon={<LightIcon lightId={light.id} />}
            />
          )}
        />
        <Card
          title="Rooms"
          data={groups?.filter((g) => g.published)}
          render={(group: Group) => (
            <NavLink
              key={group.hueId}
              label={group.name}
              to={group.resource}
              icon={<GroupIcon groupId={group.id} />}
            />
          )}
        />
      </Flex>
    </Stack>
  );
};

interface CardProps<T = any> {
  title: string;
  data?: T[];
  render: (item: T, index: number, array: T[]) => ReactNode;
}

const Card: FC<CardProps> = ({ title, data, render }) => {
  const [expanded, setExpanded] = useState(false);
  const { classes } = useStyles();

  return (
    <Paper shadow="sm" radius="md" className={classes.card}>
      <Text p="lg" weight={500}>
        {title}
      </Text>
      {data?.slice(0, 5).map(render)}
      <Transition mounted={expanded} transition="scale-y" duration={200}>
        {(styles) => <div style={styles}>{data?.slice(5).map(render)}</div>}
      </Transition>
      {data && data.length > 5 && !expanded && (
        <Button
          variant="subtle"
          fullWidth
          onClick={() => setExpanded(!expanded)}
        >
          See all
        </Button>
      )}
    </Paper>
  );
};

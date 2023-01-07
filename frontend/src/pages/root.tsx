import {
  Accordion,
  AppShell,
  Burger,
  Button,
  createStyles,
  Flex,
  Group,
  Header,
  MediaQuery,
  Navbar,
  ScrollArea,
} from '@mantine/core';
import { IconChevronRight } from '@tabler/icons';
import { FC, useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { ReactComponent as AppIconColor } from '../assets/icon-color.svg';
import { ColorSchemeToggle } from '../components/ColorSchemeToggle/ColorSchemeToggle';
import { LightIcon } from '../components/LightIcon';
import { NavLink } from '../components/NavLink';
import { useCurves } from '../data/curves';
import { useGroups } from '../data/groups';
import { LoadingPage } from '../data/LoadingPage';

const useStyles = createStyles((theme) => ({
  navbar: {
    backgroundColor:
      theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.white,
  },
  main: {
    backgroundColor:
      theme.colorScheme === 'dark'
        ? theme.colors.dark[8]
        : theme.colors.gray[0],
  },
  content: {
    paddingTop: 0,
    paddingLeft: 18,
  },
  link: {
    borderLeft: `1px solid ${
      theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[3]
    }`,
    borderTopRightRadius: theme.radius.sm,
    borderBottomRightRadius: theme.radius.sm,
    '&[data-active]': {
      borderLeft: `1px solid ${
        theme.colorScheme === 'dark'
          ? theme.colors.blue[7]
          : theme.colors.blue[7]
      }`,
    },
    '&:active': theme.activeStyles,
    '&:hover': {
      backgroundColor: 'inherit',
    },
  },
  mainLink: {
    backgroundColor:
      theme.colorScheme === 'dark'
        ? theme.colors.dark[7]
        : theme.colors.gray[0],
    '&:hover': {
      backgroundColor:
        theme.colorScheme === 'dark'
          ? theme.colors.dark[7]
          : theme.colors.gray[0],
    },
  },
  linkGroup: {
    marginBottom: theme.spacing.md,
  },
  accordionControl: {
    fontSize: theme.fontSizes.xs,
    color: theme.colorScheme === 'dark' ? theme.white : theme.colors.gray[9],
  },
  accordionControlLabel: {
    textTransform: 'uppercase',
    fontWeight: 700,
  },
  chevron: {
    '&[data-rotate]': {
      transform: 'rotate(90deg)',
    },
  },
}));

export const RootPage: FC = () => {
  const { classes, theme, cx } = useStyles();
  const [opened, setOpened] = useState(false);
  const location = useLocation();
  const groups = useGroups();
  const brightness = useCurves('bri');
  const colorTemperature = useCurves('ct');

  useEffect(() => {
    setOpened(false);
  }, [location]);

  return (
    <AppShell
      padding={0}
      navbarOffsetBreakpoint="sm"
      header={
        <Header height={60}>
          <Flex justify="space-between" px="md" h={60}>
            <MediaQuery largerThan="sm" styles={{ display: 'none' }}>
              <Group>
                <Burger
                  opened={opened}
                  onClick={() => setOpened((o) => !o)}
                  size="sm"
                  color={theme.colors.gray[6]}
                  mr="xl"
                />
              </Group>
            </MediaQuery>
            <Group>
              <Button
                component={Link}
                to="/"
                variant="subtle"
                leftIcon={<AppIconColor height={30} />}
              ></Button>
            </Group>
            <Group>
              <ColorSchemeToggle />
            </Group>
          </Flex>
        </Header>
      }
      navbar={
        <Navbar
          hiddenBreakpoint="sm"
          hidden={!opened || !groups.groups}
          width={{ sm: 300 }}
          className={classes.navbar}
        >
          <Navbar.Section grow component={ScrollArea}>
            <Accordion
              chevronPosition="left"
              defaultValue={'rooms'}
              chevron={<IconChevronRight size={16} />}
              classNames={{
                content: classes.content,
                control: classes.accordionControl,
                chevron: classes.chevron,
                label: classes.accordionControlLabel,
              }}
            >
              <Accordion.Item value="rooms">
                <Accordion.Control>Rooms</Accordion.Control>
                <Accordion.Panel>
                  {groups.groups
                    ?.filter((group) => group.type === 'room')
                    .map((group) => (
                      <div className={classes.linkGroup} key={group.hueId}>
                        <NavLink
                          classNames={{
                            root: cx(classes.link, classes.mainLink),
                          }}
                          label={group.name}
                          to={`groups/${group.id}`}
                          preloadKey={`/api/${group.resource}`}
                        />
                        {group.lights.map((light) => (
                          <NavLink
                            key={light.hueId}
                            classNames={{ root: classes.link }}
                            label={light.name}
                            icon={<LightIcon lightId={light.id} />}
                            to={`groups/${group.id}/${light.id}`}
                            preloadKey={`/api/${light.resource}`}
                          />
                        ))}
                      </div>
                    ))}
                </Accordion.Panel>
              </Accordion.Item>
              <Accordion.Item value="zones">
                <Accordion.Control>Zones</Accordion.Control>
                <Accordion.Panel>
                  {groups.groups
                    ?.filter((group) => group.type === 'zone')
                    .map((group) => (
                      <div className={classes.linkGroup} key={group.hueId}>
                        <NavLink
                          classNames={{
                            root: cx(classes.link, classes.mainLink),
                          }}
                          label={group.name}
                          to={`groups/${group.id}`}
                          preloadKey={`/api/${group.resource}`}
                        />
                        {group.lights.map((light) => (
                          <NavLink
                            key={light.hueId}
                            classNames={{ root: classes.link }}
                            label={light.name}
                            icon={<LightIcon lightId={light.id} />}
                            to={`groups/${group.id}/${light.id}`}
                            preloadKey={`/api/${light.resource}`}
                          />
                        ))}
                      </div>
                    ))}
                </Accordion.Panel>
              </Accordion.Item>
              <Accordion.Item value="curves">
                <Accordion.Control>Curves</Accordion.Control>
                <Accordion.Panel>
                  <div className={classes.linkGroup}>
                    <NavLink
                      classNames={{ root: cx(classes.link, classes.mainLink) }}
                      label="Brightness"
                      to="/curves/brightness"
                    />
                    {brightness.curves?.map((curve) => (
                      <NavLink
                        key={curve.resource}
                        classNames={{ root: classes.link }}
                        label={curve.name}
                        to={`curves/brightness/${curve.id}`}
                        preloadKey={`/api/${curve.resource}`}
                      />
                    ))}
                  </div>
                  <div className={classes.linkGroup}>
                    <NavLink
                      classNames={{ root: cx(classes.link, classes.mainLink) }}
                      label="Color Temperature"
                      to="/curves/colorTemperature"
                    />
                    {colorTemperature.curves?.map((curve) => (
                      <NavLink
                        key={curve.resource}
                        classNames={{ root: classes.link }}
                        label={curve.name}
                        to={`curves/colorTemperature/${curve.id}`}
                        preloadKey={`/api/${curve.resource}`}
                      />
                    ))}
                  </div>
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          </Navbar.Section>
        </Navbar>
      }
      classNames={{ main: classes.main }}
    >
      {groups.groups ? <Outlet /> : <LoadingPage />}
    </AppShell>
  );
};

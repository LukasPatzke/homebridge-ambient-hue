import {
  Accordion,
  Breadcrumbs,
  createStyles,
  Flex,
  Loader,
  MediaQuery,
  NavLink,
} from '@mantine/core';
import { FC } from 'react';
import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';
import { HideOnBreakpoint } from '../../components/HideOnBreakpoint';
import { LightIcon } from '../../components/LightIcon';
import { ErrorPage } from '../../data/errorPage';
import { useGroups } from '../../data/groups';

const useStyles = createStyles((theme) => ({
  outlet: {
    flexGrow: 1,
  },
  menu: {
    height: 'calc(100vh - var(--mantine-header-height))',
    backgroundColor:
      theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
    borderRight: `1px solid ${
      theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]
    }`,
    flexBasis: 250,
    flexShrink: 0,
  },
  content: {
    paddingInline: 0,
  },
  item: {
    borderBottom: `1px solid ${
      theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]
    }`,
    borderRadius: 0,
  },
}));

export const GroupsPage: FC = () => {
  const { classes } = useStyles();
  const { groups, error, isLoading } = useGroups();
  const { groupId, lightId } = useParams();
  const navigate = useNavigate();

  if (isLoading && groups === undefined) {
    return <Loader />;
  }
  if (error) {
    return <ErrorPage error={error} />;
  }

  return (
    <Flex>
      <HideOnBreakpoint smallerThan="sm" disabled={lightId === undefined}>
        <MediaQuery smallerThan="sm" styles={{ flexGrow: 1 }}>
          <Accordion
            value={groupId === undefined ? null : groupId}
            onChange={(value) => navigate(value === null ? '' : value)}
            className={classes.menu}
            classNames={classes}
            variant="filled"
          >
            {groups?.map((group) => (
              <Accordion.Item value={group.id.toString()} key={group.hueId}>
                <Accordion.Control>{group.name}</Accordion.Control>
                <Accordion.Panel>
                  {group.lights.map((light) => (
                    <NavLink
                      label={light.name}
                      key={light.hueId}
                      component={Link}
                      to={`${group.id}/${light.id}`}
                      icon={<LightIcon lightId={light.id} />}
                    />
                  ))}
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion>
        </MediaQuery>
      </HideOnBreakpoint>
      <HideOnBreakpoint smallerThan="sm" disabled={lightId !== undefined}>
        <div className={classes.outlet}>
          <Breadcrumbs>
            <Link to="/groups">groups</Link>
          </Breadcrumbs>
          <Outlet />
        </div>
      </HideOnBreakpoint>
    </Flex>
  );
};

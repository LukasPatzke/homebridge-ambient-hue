import {
  Accordion,
  AppShell, Avatar, Flex, Group as MantineGroup,
  Header, Navbar, ScrollArea, Stack,
  Text
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { Link, Outlet, useLoaderData, useMatch } from 'react-router-dom';
import { Group } from '../api.types';
import { ColorSchemeToggle } from '../components/ColorSchemeToggle';
import { NavLink } from '../components/NavLink';

export const RootPage: React.FC = () => {
  const groups = useLoaderData() as Group[];
  const isExactMatch = useMatch('/');
  const isLargeScreen = useMediaQuery('(min-width: 900px)');


  const showNavBar = (isExactMatch!==null) || isLargeScreen;

  // console.log(showNavBar);
  return (
    <AppShell
      padding={0}
      header={
        <Header height={60}>
          <Flex justify='space-between' px='md'>
            <MantineGroup>
              <Link to='/' style={{textDecoration: 'none', color: 'inherit'}}>
                <Text p='md'>AmbientHUE</Text>
              </Link>
            </MantineGroup>
            <MantineGroup>
              <ColorSchemeToggle/>
            </MantineGroup>
          </Flex>
        </Header>
      }
      navbar={
        showNavBar ?
          <Navbar p='xs' width={{base: isLargeScreen?300:'100%'}} >
            <Navbar.Section grow component={ScrollArea}>
              <Accordion variant='default' chevronPosition='left'>
                {groups.map((group) => (
                  <Accordion.Item value={group.id} key={group.id} >
                    <Accordion.Control >
                      <Link
                        key={group.id}
                        to={`groups/${group.id}`}
                        style={{textDecoration: 'none', color: 'inherit'}}
                      >
                        <Text >{group.name}</Text>
                      </Link>
                    </Accordion.Control>
                    <Accordion.Panel>
                      <Stack>
                        {group.lights.map(light=>(
                          <NavLink
                            key={light.id}
                            to={`groups/${group.id}/lights/${light.id}`}
                            label={light.name}
                            icon={<Avatar alt={light.archetype}>{light.archetype.split('_').map(i=>i[0])}</Avatar>}
                          />
                        ))}
                      </Stack>
                    </Accordion.Panel>
                  </Accordion.Item>
                ))}
              </Accordion>
            </Navbar.Section>
            <Navbar.Section>
              <Link
                to='curves'
                style={{textDecoration: 'none', color: 'inherit'}}
              >
                <Text >Curves</Text>
              </Link>
            </Navbar.Section>
          </Navbar>
          : undefined
      }
      styles={(theme) => ({
        main: {
          backgroundColor:
            theme.colorScheme === 'dark'
              ? theme.colors.dark[8]
              : theme.colors.gray[0],
        },
      })}
    >
      <Outlet />
    </AppShell>
  );
};

export async function loader() {
  return fetch('/api/groups').then(res=>{
    if (!res.ok) {
      throw res;
    }
    return res;
  });
}
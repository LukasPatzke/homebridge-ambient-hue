import {
  AppShell, Avatar, Flex, Group as MantineGroup,
  Header, Navbar, ScrollArea, Stack,
  Text
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { Link, Outlet, useLoaderData, useMatch } from 'react-router-dom';
import { Curve } from '../api.types';
import { ColorSchemeToggle } from '../components/ColorSchemeToggle';
import { NavLink } from '../components/NavLink';

export const CurvesPage: React.FC = () => {
  const curves = useLoaderData() as Curve[];
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
              <Stack>
                {curves.map(curve=>(
                  <NavLink
                    key={curve.id}
                    to={`${curve.id}`}
                    label={curve.name}
                    icon={<Avatar alt={curve.kind}>{curve.kind}</Avatar>}
                  />
                ))}
              </Stack>
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
  return fetch('/api/curves').then(res=>{
    if (!res.ok) {
      throw res;
    }
    return res;
  });
}
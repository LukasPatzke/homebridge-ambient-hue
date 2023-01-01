import { NavLink as MantineNavLink, NavLinkProps as MantineNavLinkProps } from '@mantine/core';
import { NavLink as RouterNavLink, To } from 'react-router-dom';

interface NavLinkProps extends Omit<MantineNavLinkProps, 'active'> {
    to: To;
    end?: boolean;
}

export const NavLink: React.FC<NavLinkProps> = ({to, end, ...props}) => (
  <RouterNavLink to={to} end={end } style={{textDecoration: 'none'}}>
    {({isActive})=>(
      <MantineNavLink active={isActive} {...props}/>)}
  </RouterNavLink>
);
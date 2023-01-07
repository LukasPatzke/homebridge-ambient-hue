import {
  NavLink as MantineNavLink,
  NavLinkProps as MantineNavLinkProps,
} from '@mantine/core';
import { Link, useMatch } from 'react-router-dom';

interface NavLinkProps extends Omit<MantineNavLinkProps, 'active'> {
  to: string;
}

export const NavLink: React.FC<NavLinkProps> = ({ to, ...props }) => {
  const match = useMatch(to);
  return (
    <MantineNavLink
      component={Link}
      active={match !== null}
      to={to}
      {...props}
    />
  );
};

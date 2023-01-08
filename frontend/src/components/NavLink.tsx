import {
  NavLink as MantineNavLink,
  NavLinkProps as MantineNavLinkProps,
} from '@mantine/core';
import { Link, useMatch } from 'react-router-dom';
import { preload } from 'swr';
import { fetcher } from '../data/fetcher';

interface NavLinkProps extends Omit<MantineNavLinkProps, 'active'> {
  to?: string;
  preloadKey?: string;
}

export const NavLink: React.FC<NavLinkProps> = ({
  to,
  preloadKey,
  ...props
}) => {
  const match = useMatch(to || '');
  if (to) {
    return (
      <MantineNavLink
        component={Link}
        active={match !== null}
        to={to}
        onMouseOver={() => {
          if (preloadKey) {
            preload(preloadKey, fetcher);
          }
        }}
        {...props}
      />
    );
  }

  return <MantineNavLink {...props} />;
};

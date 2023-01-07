import {
  Button,
  Container,
  createStyles,
  Group,
  Text,
  Title,
} from '@mantine/core';
import React from 'react';
import { Link } from 'react-router-dom';
import { ReactComponent as Illustration } from '../assets/broken_light_illustration.svg';
import { ErrorType } from './fetcher';

const useStyles = createStyles((theme) => ({
  root: {
    paddingTop: 80,
    paddingBottom: 80,
  },

  label: {
    textAlign: 'center',
    fontWeight: 900,
    fontSize: 220,
    lineHeight: 1,
    marginBottom: theme.spacing.xl * 1.5,
    color:
      theme.colorScheme === 'dark'
        ? theme.colors.dark[4]
        : theme.colors.gray[2],

    [theme.fn.smallerThan('sm')]: {
      fontSize: 120,
    },
  },

  title: {
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    textAlign: 'center',
    fontWeight: 900,
    fontSize: 38,

    [theme.fn.smallerThan('sm')]: {
      fontSize: 32,
    },
  },

  description: {
    maxWidth: 500,
    margin: 'auto',
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xl * 1.5,
  },
}));

interface ErrorPageProps {
  error?: ErrorType;
}

export const ErrorPage: React.FC<ErrorPageProps> = ({ error }) => {
  const { classes } = useStyles();

  console.error(error);

  return (
    <Container className={classes.root}>
      <div className={classes.label}>{error?.status}</div>
      <Illustration />
      <Title className={classes.title}>Oops!</Title>
      <Text
        color="dimmed"
        size="lg"
        align="center"
        className={classes.description}
      >
        <div>Sorry, an unexpected error has occurred:</div>
        <i>{error?.description || error?.message}</i>
      </Text>
      <Group position="center">
        <Button variant="subtle" size="md" component={Link} to="/">
          Take me back to home page
        </Button>
      </Group>
    </Container>
  );
};

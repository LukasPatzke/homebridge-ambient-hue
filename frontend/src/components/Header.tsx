import { Container, createStyles, Flex, Stack, Text } from '@mantine/core';
import React, { ReactNode } from 'react';
import { EditableTitle } from './EditableTitle';
import useTabStyles from './tab.styles';

const useStyles = createStyles((theme) => ({
  label: {
    fontSize: theme.fontSizes.sm,
    width: 100,
  },
}));

interface HeaderProps {
  title: string;
  editable?: boolean;
  onChange?: (value: string) => Promise<void>;
  rightElement?: ReactNode;
  children?: ReactNode;
}
export const Header: React.FC<HeaderProps> = ({
  title,
  editable,
  onChange,
  rightElement,
  children,
}) => {
  const { classes: tabClasses } = useTabStyles();

  return (
    <Container p="lg" className={tabClasses.content}>
      <EditableTitle
        value={title}
        editable={editable}
        onChange={onChange}
        rightElement={rightElement}
      />
      <Stack spacing="xs" mt="xl">
        {children}
      </Stack>
    </Container>
  );
};

interface HeaderItemProps {
  label?: React.ReactNode;
  children?: React.ReactNode;
}

export const HeaderItem: React.FC<HeaderItemProps> = ({ label, children }) => {
  const { classes } = useStyles();

  return (
    <Flex mb="sm">
      <Text c="dimmed" className={classes.label}>
        {label}
      </Text>
      <Flex>{children}</Flex>
    </Flex>
  );
};

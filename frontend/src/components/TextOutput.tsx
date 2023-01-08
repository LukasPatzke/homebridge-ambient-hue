import { Input, InputWrapperProps } from '@mantine/core';
import { Prism } from '@mantine/prism';
import React from 'react';

interface TextOutputProps extends InputWrapperProps {
  children: string;
}
export const TextOutput: React.FC<TextOutputProps> = ({
  children,
  ...props
}) => (
  <Input.Wrapper {...props}>
    <Prism fz="sm" my="xs" p={0} language="markdown">
      {children}
    </Prism>
  </Input.Wrapper>
);

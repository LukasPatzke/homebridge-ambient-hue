import { Input, InputWrapperProps, Switch, SwitchProps } from '@mantine/core';
import { forwardRef } from 'react';

interface LabeledSwitchProps extends SwitchProps {
    wrapperProps: Omit<InputWrapperProps, 'children'>;
}

export const LabeledSwitch = forwardRef<HTMLInputElement, LabeledSwitchProps>(({wrapperProps, ...props}, ref) => (
  <Input.Wrapper {...wrapperProps}>
    <Switch ref={ref} pt='sm' {...props}/>
  </Input.Wrapper>
));
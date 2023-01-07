import {
  createStyles,
  Input,
  InputWrapperProps,
  Slider,
  SliderProps,
} from '@mantine/core';
import { forwardRef } from 'react';

const useStyles = createStyles((theme) => ({
  root: {
    height: 28,
  },
  label: {
    top: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontWeight: 700,
    backgroundColor: 'transparent',
    lineHeight: '20px',
    padding: 0,
  },

  thumb: {
    backgroundColor: theme.colors[theme.primaryColor][6],
    height: 20,
    width: 40,
    border: 'none',
  },

  dragging: {
    transform: 'translate(-50%, -50%)',
  },
}));

export interface LabeledSliderProps extends SliderProps {
  wrapperProps?: Omit<InputWrapperProps, 'children'>;
}

export const LabeledSlider = forwardRef<HTMLDivElement, LabeledSliderProps>(
  ({ wrapperProps, ...props }, ref) => {
    const { classes } = useStyles();

    return (
      <Input.Wrapper {...wrapperProps}>
        <Slider
          classNames={classes}
          ref={ref}
          mt="sm"
          labelTransition="skew-down"
          labelTransitionDuration={150}
          labelTransitionTimingFunction="ease"
          labelAlwaysOn
          {...props}
        />
      </Input.Wrapper>
    );
  },
);

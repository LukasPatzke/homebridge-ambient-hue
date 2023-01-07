import { FC } from 'react';
import { LabeledSlider, LabeledSliderProps } from '../../LabeledSlider';
import { formatX } from '../CurveChart';

export const TimeSlider: FC<LabeledSliderProps> = ({
  min = 0,
  max = 1440,
  ...props
}) => (
  <LabeledSlider
    {...props}
    wrapperProps={{
      label: 'Time',
      description: 'Changes the time value of the selected point.',
    }}
    min={min}
    max={max}
    step={15}
    label={formatX}
    marks={[...Array(13).keys()]
      .map((i) => ({
        value: i * 120,
        label: formatX(i * 120),
      }))
      .filter((v) => v.value <= max && v.value >= min)}
  />
);

import { FC } from 'react';
import { LabeledSlider, LabeledSliderProps } from '../../LabeledSlider';
import { formatX } from '../CurveChart';

export const TimeSlider: FC<LabeledSliderProps> = ({
  min = 0,
  max = 1440,
  ...props
}) => {
  const markStep = 240;
  return (
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
      marks={[...Array(1440 / markStep).keys()]
        .map((i) => i * markStep)
        .map((i) => ({
          value: i,
          label: formatX(i),
        }))
        .filter((v) => v.value <= max && v.value >= min)}
    />
  );
};

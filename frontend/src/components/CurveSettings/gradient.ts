import { MantineTheme, useMantineTheme } from '@mantine/core';
import { Chart, Point } from 'chart.js';
import { useEffect, useRef, useState } from 'react';
import { curvekind } from '../../api.types';

const createGradient = (
  chart: Chart<'scatter'>,
  kind: curvekind,
  theme: MantineTheme,
) => {
  const gradient = chart.ctx.createLinearGradient(
    0,
    chart.chartArea.bottom,
    0,
    chart.chartArea.top,
  );

  if (kind === 'bri') {
    if (theme.colorScheme === 'dark') {
      gradient.addColorStop(0, theme.colors.dark[3]);
      gradient.addColorStop(1, theme.colors.yellow[4]);
    } else {
      gradient.addColorStop(0, theme.colors.dark[7]);
      gradient.addColorStop(1, theme.colors.yellow[4]);
    }
  } else if (kind === 'ct') {
    if (theme.colorScheme === 'dark') {
      gradient.addColorStop(0, theme.colors.blue[2]);
      gradient.addColorStop(1, theme.colors.yellow[9]);
    } else {
      gradient.addColorStop(0, theme.colors.blue[2]);
      gradient.addColorStop(1, theme.colors.yellow[9]);
    }
  }
  return gradient;
};

export function useGradient(kind: curvekind) {
  const theme = useMantineTheme();
  const chartRef = useRef<Chart<'scatter', Point[]>>(null);
  const [gradient, setGradient] = useState<CanvasGradient>();

  useEffect(() => {
    if (!chartRef.current) {
      return;
    }
    setGradient(createGradient(chartRef.current, kind, theme));
  }, [kind, theme]);

  const drawGradient = () => {
    if (!chartRef.current) {
      return;
    }
    setGradient(createGradient(chartRef.current, kind, theme));
  };

  return {
    chartRef,
    gradient,
    drawGradient,
  };
}

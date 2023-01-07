import React from 'react';
import { curvekind, Point } from '../../api.types';

import { useMantineTheme } from '@mantine/core';
import {
  ActiveElement,
  Chart,
  ChartEvent,
  Filler,
  LinearScale,
  LineElement,
  PointElement,
  ScriptableContext,
} from 'chart.js';
import { Scatter } from 'react-chartjs-2';
import { useGradient } from './gradient';

import ChartJSdragDataPlugin from './plugin-dragdata';

Chart.register(LinearScale, PointElement, LineElement, Filler);

interface CurveChartProps {
  points: Point[];
  kind: curvekind;
  draggable?: boolean;
  enableContextMenu?: boolean;
  selectedIndex?: number;
  onSelect?: (index?: number) => void;
  onChange: (value: Point, index: number) => void;
  onChangeEnd: (value: Point, index: number) => void;
}

export const formatX = (value: number) => {
  const date = new Date();
  date.setHours(4, value, 0, 0);
  return date.toTimeString().substring(0, 5);
};

export const CurveChart: React.FC<CurveChartProps> = ({
  points,
  kind,
  selectedIndex,
  onSelect,
  onChange,
  onChangeEnd,
}) => {
  const theme = useMantineTheme();
  const { chartRef, gradient, drawGradient } = useGradient(kind);

  const handleClick = (event: ChartEvent, elements: ActiveElement[]): void => {
    if (event.type === 'mousedown') {
      if (onSelect) {
        if (elements.length > 0) {
          if (elements[0].index !== selectedIndex) {
            onSelect(elements[0].index);
          }
        }
      }
    }
  };

  return (
    <div>
      <Scatter
        ref={chartRef}
        data={{
          datasets: [
            {
              label: 'Scatter Dataset',
              pointRadius: (ctx: ScriptableContext<'line'>) =>
                ctx.dataIndex === selectedIndex ? 15 : 10,
              pointHoverRadius: 15,
              cubicInterpolationMode: 'monotone',
              borderColor: gradient,
              pointBackgroundColor: gradient,
              pointBorderWidth: 0,
              pointHoverBackgroundColor: gradient,
              showLine: true,
              borderWidth: 3,
              clip: false,
              data: points,
            },
          ],
        }}
        plugins={[ChartJSdragDataPlugin]}
        options={{
          animation: { duration: 200 },
          events: [
            'mousedown',
            'mousemove',
            'mouseout',
            'click',
            'touchstart',
            'touchmove',
          ],
          aspectRatio: 1.5,
          onHover: handleClick,
          onResize: drawGradient,
          scales: {
            x: {
              min: 0,
              max: 1440,
              ticks: {
                stepSize: 180,
                callback: (value) => formatX(Number(value)),
                padding: 10,
              },
              grid: {
                display: false,
                borderColor:
                  theme.colorScheme === 'dark'
                    ? theme.colors.gray[8]
                    : theme.colors.gray[3],
              },
            },
            y: {
              min: kind === 'bri' ? 0 : 153,
              max: kind === 'bri' ? 100 : 500,
              display: false,
              grid: {
                display: false,
              },
            },
          },
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              enabled: false,
            },
            dragData: {
              onDrag(e, datasetIndex, index, value) {
                onChange(value, index);
              },
              onDragEnd(e, datasetIndex, index, value) {
                onChangeEnd(value, index);
              },
            },
          },
        }}
      />
    </div>
  );
};

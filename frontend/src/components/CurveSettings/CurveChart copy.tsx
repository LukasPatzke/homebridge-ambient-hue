import React, { useEffect, useState } from 'react';
import { Curve, curvekind, Point } from '../../api.types';

import { MantineTheme, useMantineTheme } from '@mantine/core';
import {
  Chart,
  Filler,
  LinearScale,
  LineElement,
  PointElement,
  PointHoverOptions,
  PointOptions,
  PointProps,
  ScriptableContext,
} from 'chart.js';
import 'chartjs-plugin-dragdata';
import { Scatter } from 'react-chartjs-2';
import { Menu } from '../Menu';
import { MenuItem } from '../MenuItem';
import { MenuLabel } from '../MenuLabel';
import { ContextMenu } from './ContextMenu/ContextMenu';
import { useContextMenu } from './ContextMenu/useContextMenu';
import { useDeleteButton } from './ContextMenu/useDeleteButton';
import { useInsertButton } from './ContextMenu/useInsertButton';

Chart.register(LinearScale, PointElement, LineElement, Filler);

// const draw = (Chart as any).controllers.line.prototype.draw;
// (Chart as any).controllers.line = (Chart as any).controllers.line.extend({
//   draw: function () {
//     // eslint-disable-next-line
//     draw.apply(this, arguments);
//     const ctx = this.chart.chart.ctx;
//     const _stroke = ctx.stroke;
//     ctx.stroke = function () {
//       ctx.save();
//       ctx.shadowColor = '#E56590';
//       ctx.shadowBlur = 10;
//       ctx.shadowOffsetX = 0;
//       ctx.shadowOffsetY = 4;
//       // eslint-disable-next-line
//       _stroke.apply(this, arguments);
//       ctx.restore();
//     };
//   },
// });

interface CurveChartProps {
  curve?: Curve;
  points: Point[];
  kind: curvekind;
  draggable?: boolean;
  enableContextMenu?: boolean;
  selectedIndex?: number;
  onSelect?: (index?: number) => void;
  onChange?: (index: number, point: Omit<Point, 'resource'>) => void;
  onInsert?: (
    point: Omit<Point, 'resource'>,
    position: 'before' | 'after',
  ) => void;
  onDelete?: (point: Omit<Point, 'resource'>) => void;
}

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
      gradient.addColorStop(0, theme.colors.blue[1]);
      gradient.addColorStop(1, theme.colors.yellow[9]);
    } else {
      gradient.addColorStop(0, theme.colors.blue[1]);
      gradient.addColorStop(1, theme.colors.yellow[9]);
    }
  }
  return gradient;
};

const magnetValue = (value: Point) => {
  const x = Math.round(value.x / 60) * 60;
  let y = Math.round(value.y);
  if (y < 0) {
    y = 0;
  }
  return { x: x, y: y };
};

export const formatX = (value: number) => {
  const date = new Date();
  date.setHours(4, value, 0, 0);
  return date.toTimeString().substring(0, 5);
};

export const CurveChart: React.FC<CurveChartProps> = ({
  curve,
  points,
  kind,
  draggable = false,
  enableContextMenu = false,
  selectedIndex,
  onSelect,
  onChange,
  onDelete,
  onInsert,
}) => {
  const theme = useMantineTheme();
  const chartRef = React.useRef<Chart<'scatter', Point[]>>(null);
  const [gradient, setGradient] = useState<CanvasGradient>();
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const {
    openContextMenu,
    closeContextMenu,
    ...registerContextMenu
  } = useContextMenu(chartRef);

  const insertPointBefore = useInsertButton('before', curve, activeIndex);
  const insertPointAfter = useInsertButton('after', curve, activeIndex);
  const deletPoint = useDeleteButton(curve, activeIndex);

  useEffect(() => {
    const chart = chartRef.current;

    if (!chart) {
      return;
    }
    chart.canvas.addEventListener('contextmenu', (event) => {
      event.preventDefault();
      event.stopPropagation();
    });
  }, []);

  useEffect(() => {
    const chart = chartRef.current;

    if (!chart) {
      return;
    }

    setGradient(createGradient(chart, kind, theme));
  }, [kind, theme]);

  const highlightColor =
    theme.colorScheme === 'dark' ? theme.colors.gray[2] : theme.white;

  const gridColor =
    theme.colorScheme === 'dark' ? theme.colors.gray[8] : theme.colors.gray[3];

  return (
    <div>
      <Scatter
        ref={chartRef}
        data={{
          datasets: [
            {
              label: 'Scatter Dataset',
              pointRadius: (ctx: ScriptableContext<'line'>) =>
                ctx.dataIndex === selectedIndex && !draggable ? 15 : 10,
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
              dragData: draggable,
            } as any,
          ],
        }}
        options={{
          animation: { duration: 200 },
          aspectRatio: 1.5,
          events: [
            'mousemove',
            'mouseout',
            'click',
            'touchstart',
            'touchmove',
            'contextmenu',
          ],
          onClick(event, elements) {
            if (enableContextMenu) {
              if (event.type === 'contextmenu') {
                if (elements.length > 0) {
                  setActiveIndex(elements[0].index);
                  console.log(elements);
                  const pointElement: PointElement<
                    PointProps,
                    PointOptions & PointHoverOptions
                  > = elements[0].element as any;
                  openContextMenu(
                    pointElement.x,
                    pointElement.y,
                    pointElement.options.hoverRadius * 2,
                    pointElement.options.hoverRadius * 2,
                  );
                }
              } else {
                closeContextMenu();
              }
            }
            if (event.type === 'click') {
              if (onSelect && !draggable) {
                if (elements.length > 0) {
                  if (elements[0].index !== selectedIndex) {
                    onSelect(elements[0].index);
                  }
                }
              }
            }
          },
          onResize: () => {
            if (!chartRef.current) {
              return;
            }
            setGradient(createGradient(chartRef.current, kind, theme));
          },
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
                borderColor: gridColor,
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
            dragData: draggable
              ? {
                  dragX: true,
                  magnet: { to: magnetValue },
                  onDragEnd: (
                    e: any,
                    datasetIndex: number,
                    index: number,
                    value: { x: number; y: number },
                  ) => {
                    // magnet function is not called if onDragEnd is undefined
                    const update: Omit<Point, 'resource'> = {
                      id: points.map((p) => p.id)[index],
                      x: value.x,
                      y: value.y,
                    };

                    if (index === 0) {
                      // The first point must stay at the beginning of the scale
                      update.x = 0;
                    }
                    if (index === points.length - 1) {
                      // The last point must stay at the end of the scale
                      update.x = 1440;
                    }
                    if (onChange && draggable) {
                      onChange(index, update);
                    }
                  },
                  onDragStart: () => {
                    closeContextMenu();
                  },
                }
              : undefined,
            legend: {
              display: false,
            },
            tooltip: {
              enabled: false,
            },
          } as any,
        }}
      />
      <ContextMenu {...registerContextMenu}>
        <Menu>
          <MenuLabel>Point Settings</MenuLabel>
          <MenuItem {...insertPointBefore}>Insert Point left</MenuItem>
          <MenuItem {...insertPointAfter}>Insert Point right</MenuItem>
          <MenuItem {...deletPoint}>Delete Point</MenuItem>
        </Menu>
      </ContextMenu>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { curvekind, Point } from '../api.types';

import { createStyles, MantineTheme, useMantineTheme } from '@mantine/core';
import { useClickOutside } from '@mantine/hooks';
import { VirtualElement } from '@popperjs/core';
import { IconColumnInsertLeft, IconColumnInsertRight, IconTrash } from '@tabler/icons';
import { Chart, Filler, LinearScale, LineElement, PointElement, PointHoverOptions, PointOptions, PointProps, ScriptableContext } from 'chart.js';
import 'chartjs-plugin-dragdata';
import { Scatter } from 'react-chartjs-2';
import { usePopper } from 'react-popper';
import { Menu } from './Menu';
import { MenuItem } from './MenuItem';
import { MenuLabel } from './MenuLabel';

Chart.register(LinearScale, PointElement, LineElement, Filler);

interface CurveChartProps {
  points: Point[];
  kind: curvekind;
  draggable?: boolean;
  enableContextMenu?: boolean;
  selectedIndex?: number;
  onSelect?: (index?: number)=>void;
  onChange?: (point: Point)=>void;
  onInsert?: (point: Point, position: 'before'|'after')=>void;
  onDelete?: (point: Point)=>void;
}

const useStyles = createStyles((theme) => ({
  dropdown: {
    backgroundColor: theme.white,
    background: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.white,
    border: `1px solid ${
      theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]
    }`,
    borderRadius: theme.radius.sm,

    '&:focus': {
      outline: 0,
    },
  },

  arrow: {
    position: 'absolute',
    left: -4,
    width: 10,
    height: 10,
    backgroundColor: 'inherit',

    '&::before': {
      content: '""',
      position: 'absolute',
      width: 10,
      height: 10,
      top: 0,
      left: 0,
      transform: 'rotate(45deg)',
      transformOrigin: 'center center',
      zIndex: 1,
      background: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.white,
      border: `1px solid ${
        theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]
      }`,
      borderTop: 0,
      borderRight: 0,
    },
    zIndex: 1,

  },
}));

const createGradient = (chart: Chart<'scatter'>, kind: curvekind, theme: MantineTheme, alpha=1) => {
  const gradient = chart.ctx.createLinearGradient(0, chart.chartArea.bottom, 0, chart.chartArea.top);

  if (kind==='bri') {
    if (theme.colorScheme==='dark') {
      gradient.addColorStop(1, `rgba(${25}, ${22}, ${2}, ${alpha})`);
      gradient.addColorStop(0, `rgba(${250}, ${219}, ${20}, ${alpha})`);
    } else {
      gradient.addColorStop(1, `rgba(${25}, ${22}, ${2}, ${alpha})`);
      gradient.addColorStop(0, `rgba(${250}, ${219}, ${20}, ${alpha})`);
    }

  } else if (kind==='ct') {
    if (theme.colorScheme==='dark') {
      gradient.addColorStop(1, `rgba(${255}, ${149}, ${43}, ${alpha})`);
      gradient.addColorStop(0, `rgba(${235}, ${238}, ${255}, ${alpha})`);
    } else {
      gradient.addColorStop(1, `rgba(${255}, ${149}, ${43}, ${alpha})`);
      gradient.addColorStop(0, `rgba(${235}, ${238}, ${255}, ${alpha})`);
    }
  }
  return gradient;
};

const magnetValue = (value: Point) => {
  const x = Math.round(value.x/60)*60;
  let y = Math.round(value.y);
  if (y < 0) {
    y = 0;
  }
  return {x: x, y: y};
};

export const CurveChart: React.FC<CurveChartProps> = ({
  points, kind, draggable=false, enableContextMenu=false, selectedIndex, onSelect, onChange, onDelete, onInsert,
}) => {
  const theme = useMantineTheme();
  const {classes} = useStyles();
  const chartRef = React.useRef<Chart<'scatter', Point[]>>(null);
  const [gradient, setGradient] = useState<CanvasGradient>();
  const [backgroundGradient, setBackgroundGradient] = useState<CanvasGradient>();
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const [isPopperOpen, setPopperOpen] = useState(false);
  const popperInnerRef = useClickOutside(()=>setPopperOpen(false));
  const [popperReferenceElement, setPoperReferenceElement] = useState<VirtualElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null);
  const [popperArrowElement, setPopperArrowElement] = useState<HTMLDivElement | null>(null);

  const { styles, attributes } = usePopper(popperReferenceElement, popperElement, {
    placement: 'right',
    modifiers: [
      { name: 'arrow', options: { element: popperArrowElement } },
      { name: 'preventOverflow', options: { altAxis: true}},
      { name: 'flip'},
      { name: 'offset', options: {offset: [0, 10]}},
    ],
  });

  useEffect(()=>{
    const chart = chartRef.current;

    if (!chart) {
      return;
    }
    chart.canvas.addEventListener('contextmenu', (event)=>{
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
    setBackgroundGradient(createGradient(chart, kind, theme, 0.7));

  }, [kind, theme]);

  const generatePopperReference = (pointElement: PointElement<PointProps, PointOptions & PointHoverOptions>, chart: Chart) => {
    const bounding = chart.canvas.getBoundingClientRect();
    const radius = pointElement.options.hoverRadius;
    const x = bounding.x + pointElement.x - radius;
    const y = bounding.y + pointElement.y - radius;

    setPoperReferenceElement({
      getBoundingClientRect() {
        return {
          top: y,
          left: x,
          bottom: y,
          right: x,
          width: radius*2,
          height: radius*2,
          x: 0,
          y: 0,
          toJSON: ()=>'',
        };
      },
    });
  };
  return (
    <div>
      <Scatter
        ref={chartRef}
        data={{
          datasets: [{
            label: 'Scatter Dataset',
            pointRadius: (ctx: ScriptableContext<'line'>)=>(
              ctx.dataIndex===selectedIndex?20:15
            ),
            pointHoverRadius: 20,
            cubicInterpolationMode: 'monotone',
            backgroundColor: backgroundGradient,
            pointBackgroundColor: (ctx: ScriptableContext<'line'>)=>(
              ctx.dataIndex===selectedIndex?gradient:'white'
            ),
            pointBorderColor:(ctx: ScriptableContext<'line'>)=>(
              ctx.dataIndex===selectedIndex?'white':gradient
            ),
            pointBorderWidth: 2,
            pointHoverBackgroundColor: gradient,
            pointHoverBorderColor: 'white',
            fill: 'origin',
            showLine: true,
            clip: false,
            data: points,
            dragData: draggable,
          } as any],
        }}
        options={{
          events: ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove', 'contextmenu'],
          onClick(event, elements, chart) {
            if (enableContextMenu) {
              if (event.type === 'contextmenu') {
                if (elements.length > 0) {
                  generatePopperReference(elements[0].element as any, chart);
                  setActiveIndex(elements[0].index);
                  setPopperOpen(true);
                }
              } else {
                setPopperOpen(false);
              }
            }
            if (event.type==='click') {
              if (onSelect) {
                if (elements.length > 0) {
                  if (elements[0].index === selectedIndex) {
                    onSelect(undefined);
                  } else {
                    onSelect(elements[0].index);
                  }
                } else {
                  onSelect(undefined);
                }
              }
            }
          },
          onResize: () => {
            if (!chartRef.current) {
              return;
            }
            setGradient(createGradient(chartRef.current, kind, theme));
            setBackgroundGradient(createGradient(chartRef.current, kind, theme, 0.7));
          },
          scales: {
            x: {
              min: 0,
              max: 1440,
              ticks: {
                stepSize: 180,
                callback: (value) => {
                  const date = new Date();
                  date.setHours(4, Number(value), 0, 0);
                  return date.toTimeString().substring(0, 5);
                },
              },
              grid: {
                color: '#666',
                borderColor: '#666',
              },
            },
            y: {
              min: kind==='bri'?0:153,
              max: kind==='bri'?100:500,
              display: false,
              grid: {
                display: false,
              },
            },
          },
          plugins: {
            dragData: {
              dragX: true,
              magnet: { to: magnetValue},
              onDragEnd: (e: any, datasetIndex: number, index: number, value: {x: number; y:number}) => {
              // magnet function is not called if onDragEnd is undefined
                const update: Point = {
                  id: points.map(p=>p.id)[index],
                  x: value.x,
                  y: value.y,
                };

                if (index === 0) {
                // The first point must stay at the beginning of the scale
                  update.x = 0;
                }
                if (index === points.length-1) {
                // The last point must stay at the end of the scale
                  update.x = 1440;
                }
                if (onChange) {
                  onChange(update);
                }
              },
              onDragStart: () => {
                setPopperOpen(false);
              },
            },
            legend: {
              display: false,
            },
            tooltip: {
              enabled: false,
            },
          } as any,
        }}
      />
      {isPopperOpen &&
      <div ref={setPopperElement} style={styles.popper} {...attributes.popper}>
        <div ref={popperInnerRef} className={classes.dropdown}>
          <Menu>
            <MenuLabel>Point Settings</MenuLabel>
            {activeIndex!==0 && onInsert &&
              <MenuItem icon={<IconColumnInsertLeft size={14}/>} onClick={()=>{
                onInsert(points[activeIndex], 'before');
                setPopperOpen(false);
              }}>
                Insert Point left
              </MenuItem>
            }
            {activeIndex!==points.length-1 && onInsert &&
            <MenuItem icon={<IconColumnInsertRight size={14}/>} onClick={()=>{
              onInsert(points[activeIndex], 'after');
              setPopperOpen(false);
            }}>
              Insert Point right
            </MenuItem>
            }
            {activeIndex!==0 && activeIndex!==points.length-1 && onDelete &&
            <MenuItem color='red' icon={<IconTrash size={14}/>} onClick={()=>{
              onDelete(points[activeIndex]);
              setPopperOpen(false);
            }}>
              Delete Point
            </MenuItem>
            }
          </Menu>
        </div>
        <div ref={setPopperArrowElement} style={styles.arrow} className={classes.arrow}/>
      </div>
      }
    </div>
  );
};
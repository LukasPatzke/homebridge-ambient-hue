import { isPlatform } from '@ionic/react';
import moment from 'moment';
import React, { useState, useRef, useEffect } from 'react';
import { Scatter } from 'react-chartjs-2';
import 'chartjs-plugin-dragdata';
import { ActionSheet } from './ActionSheet';
import { IPickerChange, Picker } from './Picker';
import useLongPress from './useLongPress';
import { IUseSwipe, useSwipe } from './useSwipe';
import { ICurve, IPoint } from 'src/types/hue';
import { Chart as ChartJS, ChartDataset, Filler, LinearScale, LineElement, PointElement, registerables } from 'chart.js';

ChartJS.register(LinearScale, PointElement, LineElement, Filler, ...registerables)

export interface IChange {
  id: number;
  x: number;
  y: number;
}

interface IGradients {
  backgroundColor: CanvasGradient | undefined;
  pointBackgroundColor: CanvasGradient | undefined;
}

interface IGradienStop {
  offset: number;
  red: number;
  green: number;
  blue: number;
}

export interface IOnChange {
  change: (change: IChange) => void; 
  insert: (index: number, position: 'before'| 'after') => void;
  delete: (id: number) => void;
}

interface IChart {
  curve: ICurve;
  onChange: IOnChange;
  expanded?: boolean;
  xScale?: {min: number, max: number};
  swipeConfig?: IUseSwipe;
}

export const formatMinutes = (minutes: number) => (
  moment().startOf('day').hours(4).minutes(minutes).format('HH:mm')
)

const createGradient = (chart: ChartJS<"scatter">|null, curve: ICurve, alpha: number) => {

  if (chart) {
    const height = chart.height || 0
    var gradient = chart.ctx.createLinearGradient(0,20,0, height - 20);

    var gradientStops:IGradienStop[] = []

    if (curve.kind==='bri') {
      gradientStops=[
        {offset: 1, red: 25, green: 22, blue: 2},
        {offset: 0, red: 250, green: 219, blue: 20}
      ]
    } else if (curve.kind==='ct') {
      gradientStops=[
        {offset: 0, red: 255, green: 149, blue: 43},
        {offset: 1, red: 235, green: 238, blue: 255}
      ]
    } else if (curve.kind==='hue') {
      if (alpha<0.8) {alpha *= 0.8}
      gradientStops=[
        {offset: 0, red: 255, green: 0, blue: 0},
        {offset: 1/6, red: 255, green: 165, blue: 0},
        {offset: 2/6, red: 255, green: 255, blue: 0},
        {offset: 3/6, red: 0, green: 128, blue: 0},
        {offset: 4/6, red: 0, green: 0, blue: 255},
        {offset: 5/6, red: 75, green: 0, blue: 135},
        {offset: 1, red: 238, green: 130, blue: 238}
      ]
    } else if (curve.kind==='sat') {
      gradientStops=[
        {offset: 0, red: 0, green: 0, blue: 0},
        {offset: 1, red: 255, green: 255, blue: 255},
      ]
    }
    
    gradientStops.forEach(stop=>{
      const {red, green, blue} = stop;
      gradient.addColorStop(stop.offset, `rgba(${red}, ${green}, ${blue}, ${alpha})`)
    })

    return gradient;
  }
}

export const Chart: React.FC<IChart> = ({curve, expanded, xScale={min:0, max:1440}, swipeConfig, onChange}) =>  {
  const chartRef = useRef<ChartJS<"scatter", IPoint[]>>(null)

  const [gradients, setGradients] = useState<IGradients>();
  const [isPickerOpen, setPickerOpen] = useState(false);
  const [isActionSheetOpen, setActionSheetOpen] = useState(false);
  const [activeElementIndex, setActiveElementIndex] = useState(0);

  const [pointIds, setPointIds] = useState(curve.points.map(point=>point.id));

  const swipeHandlers = useSwipe(swipeConfig || {})

  useEffect(() => {
    const chart = chartRef.current;

    if (!chart) { return;}

    setGradients({
      backgroundColor: createGradient(chart, curve, 0.7),
      pointBackgroundColor: createGradient(chart, curve, 0.9)
    });

    chart.canvas?.addEventListener('contextmenu', handleContextmenu, false)
    setPointIds(curve.points.map(point=>point.id));

  }, [curve])


  var yScale = {min:0, max:100};
  if (curve.kind==='bri') {
    yScale = {min:0, max:254}
  } else if (curve.kind==='ct') {
    yScale = {min:153, max: 500}
  } else if (curve.kind==='hue') {
    yScale = {min:0, max: 65280}
  } else if (curve.kind==='sat') {
    yScale = {min:25, max: 200}
  } 

  const handleContextmenu = (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation();
    // setActionSheetOpen(true)
  }

  const renderGradients = () => {
    setGradients({
      backgroundColor: createGradient(chartRef.current, curve, 0.7),
      pointBackgroundColor: createGradient(chartRef.current, curve, 0.9)
    });
  }

  const magnetValue = (value: IPoint) => {
    var x = Math.round(value.x/60)*60;
    var y = Math.round(value.y);
    if (y < 0) {
      y = 0;
    }
    return {x: x, y: y};
  }

  const longPress = useLongPress(()=>{
    setActionSheetOpen(true);
  }, 500)

  const calcOffset = (value: number) => {
    const newValue = value + (curve.offset)
    if (newValue < yScale.min) {
      return yScale.min;
    } else if (newValue > yScale.max) {
      return yScale.max;
    } else {
      return newValue;
    }
  }
  

  const datasets: ChartDataset<"scatter", IPoint[]>[] = [{
    label: 'Scatter Dataset',
    pointRadius: 15,
    pointHoverRadius: 20,
    cubicInterpolationMode: 'monotone',
    backgroundColor: gradients?.backgroundColor,
    fill: 'origin',
    showLine: true,
    data: curve.points
  },
  {
    label: 'Offset',
    showLine: curve.offset!==0,
    pointRadius: 0,
    cubicInterpolationMode: "monotone",
    backgroundColor: '#eb445a',
    borderColor: '#eb445a',
    fill: false,
    data: curve.points.map(value=>({x:value.x, y:calcOffset(value.y)} as IPoint))
  }]

  return (
    <>
      <Picker 
        isOpen={isPickerOpen} 
        scale={yScale}
        displayPercent={curve.kind==='bri'}
        defaultValue={curve.points.length>activeElementIndex?{
          time: curve.points[activeElementIndex].x,
          value: curve.points[activeElementIndex].y,
        }:undefined}
        onCancel={()=>setPickerOpen(false)}
        onSave={(value:IPickerChange)=>{
          const change: IChange = {
            id: pointIds[activeElementIndex],
            x: value.time.value,
            y: value.value.value,
          }
          onChange.change(change);
          setPickerOpen(false);
        }}
      />
      <ActionSheet
        isOpen={isActionSheetOpen}
        itemIndex={activeElementIndex}
        dataLenght={curve.points.length}
        onCancel={()=>setActionSheetOpen(false)}
        onEdit={()=>{
          setActionSheetOpen(false)
          setPickerOpen(true)
        }}
        onDelete={itemIndex=>{
            onChange.delete(pointIds[itemIndex])
            setActionSheetOpen(false);
        }}
        onInsert={(itemIndex, position)=>{
          onChange.insert(itemIndex, position)
          setActionSheetOpen(false);        
        }}
      />
      <Scatter
        ref={chartRef}
        data={{
          datasets: datasets
        }}
        options={{
          plugins: {
            dragData: {
              dragData: true,
              dragX: true,
              onDragEnd: (e: any, datasetIndex: number, index: number, value: {x: number, y:number}) => {
                // magnet function is not called if onDragEnd is undefined
                let change: IChange = {
                  id: pointIds[index],
                  x: value.x,
                  y: value.y
                }

                if (index === 0) {
                  // The first point must stay at the beginning of the scale
                  change.x = xScale.min
                }
                if (index === curve.points.length-1) {
                  // The last point must stay at the end of the scale
                  change.x = xScale.max
                }
                onChange.change(change)
              },
              magnet: { to: magnetValue }
            },
            legend: {
              display: false
            },
            tooltip: {
              enabled: false
            }
          } as any,
          events: ["mousemove", "mouseout", "mousedown", "click", "touchstart", "touchmove", "touchend", "contextmenu"],
          scales: {
            x: {
              type: 'linear',
              position: 'bottom',
              max: xScale.max,
              min: xScale.min,
              ticks: {
                // max: xScale.max,
                // min: xScale.min,
                // stepSize: expanded?180:360,
                callback: (value) => (formatMinutes(Number(value)))
              },
              grid: {
                color: '#666',
                borderColor: '#666'
              }
            },
            y: {
              max: yScale.max,
              min: yScale.min,
              display: false,
              grid: {
                display: false
              }
            }
          },
          layout: {
            padding: {
              left: 10,
              right: 10,
              top: 20,
              bottom: 0
            }
          },  
          maintainAspectRatio: !expanded,
          onResize: () => {renderGradients();},
          onHover: (event, activeElements) => {
            if (activeElements.length>0) {
              setActiveElementIndex(activeElements[0].index);
              if (event.native) {
                longPress(event.native);
              }
            } else {
              if (event.type as keyof HTMLElementEventMap==='touchstart') {
                // touchEvents?.onTouchStart(event as any)
                swipeHandlers?.onTouchStart(event as any)
              } else if (event.type as keyof HTMLElementEventMap==='touchmove') {
                // touchEvents?.onTouchMove(event as any)
                swipeHandlers?.onTouchMove(event as any)
              } else if (event.type as keyof HTMLElementEventMap==='touchend') {
                // touchEvents?.onTouchEnd(event as any)
                swipeHandlers?.onTouchEnd(event as any)
              } else if (event.type as keyof HTMLElementEventMap==='touchcancel') {
                // touchEvents?.onTouchCancel(event as any)
              } 
            }
          },
          onClick: (event, activeElements) => {
            if (activeElements) {
              if (activeElements.length>0) {
                setActiveElementIndex(activeElements[0].index);
                if (isPlatform('mobile')) {
                  setPickerOpen(true);
                } 
                if (event.type === 'contextmenu') {
                  setActionSheetOpen(true)
                }
              }
            }
          }
        }}
      />
    </>
  )
}
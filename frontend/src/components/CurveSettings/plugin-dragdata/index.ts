import { Chart, InteractionItem, Plugin } from 'chart.js';
import { drag } from 'd3-drag';
import { select } from 'd3-selection';
import { Point } from '../../../api.types';

type OnDrag = (
  e: MouseEvent,
  datasetIndex: number,
  index: number,
  value: Point,
) => void | boolean;
type OnDragEnd = (
  e: MouseEvent,
  datasetIndex: number,
  index: number,
  value: Point,
) => void;
type onDragStart = (
  e: MouseEvent,
  element: any,
  index: number,
  value: Point,
) => void | boolean;

export interface PluginOptions {
  enableTouch?: boolean;
  onDragStart?: onDragStart;
  onDrag: OnDrag;
  onDragEnd?: OnDragEnd;
}

let element: InteractionItem | null;
let yAxisID: string;
let xAxisID: string;

let curDatasetIndex: number | undefined;
let curIndex: number | undefined;

const getElement = (
  e: MouseEvent,
  chartInstance: Chart<'scatter', Point[]>,
  callback?: onDragStart,
) => {
  element = chartInstance.getElementsAtEventForMode(
    e,
    'nearest',
    { intersect: true },
    false,
  )[0];

  if (element) {
    const datasetIndex = element.datasetIndex;
    const index = element.index;

    const dataset = chartInstance.data.datasets[datasetIndex];
    const datasetMeta = chartInstance.getDatasetMeta(datasetIndex);
    const curValue = dataset.data[index];
    // get the id of the datasets scale
    if (
      datasetMeta.xAxisID === undefined ||
      datasetMeta.yAxisID === undefined
    ) {
      element = null;
      return;
    }
    xAxisID = datasetMeta.xAxisID;
    yAxisID = datasetMeta.yAxisID;

    if (callback && element) {
      if (callback(e, datasetIndex, index, curValue) === false) {
        element = null;
      }
    }
  }
};

function roundValue(value: number, step: number) {
  if (value === undefined) {
    return 0;
  }
  return Math.round(value / step) * step;
}

function isTouchEvent(event: Event): event is TouchEvent {
  return (event as TouchEvent).touches !== undefined;
}

function calcPosition(
  e: MouseEvent | TouchEvent,
  chartInstance: Chart<'scatter', Point[]>,
  datasetIndex: number,
  index: number,
) {
  let x, y;
  const dataset = chartInstance.data.datasets[datasetIndex];
  const dataPoint = dataset.data[index];

  if (isTouchEvent(e)) {
    x = chartInstance.scales[xAxisID].getValueForPixel(
      e.touches[0].clientX - chartInstance.canvas.getBoundingClientRect().left,
    );
    y = chartInstance.scales[yAxisID].getValueForPixel(
      e.touches[0].clientY - chartInstance.canvas.getBoundingClientRect().top,
    );
  } else {
    x = chartInstance.scales[xAxisID].getValueForPixel(
      e.clientX - chartInstance.canvas.getBoundingClientRect().left,
    );
    y = chartInstance.scales[yAxisID].getValueForPixel(
      e.clientY - chartInstance.canvas.getBoundingClientRect().top,
    );
  }

  if (x === undefined || y === undefined) {
    return dataPoint;
  }

  x = roundValue(x, 15);
  y = roundValue(y, 1);

  x =
    x > chartInstance.scales[xAxisID].max
      ? chartInstance.scales[xAxisID].max
      : x;
  x =
    x < chartInstance.scales[xAxisID].min
      ? chartInstance.scales[xAxisID].min
      : x;

  y =
    y > chartInstance.scales[yAxisID].max
      ? chartInstance.scales[yAxisID].max
      : y;
  y =
    y < chartInstance.scales[yAxisID].min
      ? chartInstance.scales[yAxisID].min
      : y;

  if (
    !dataPoint.first &&
    !dataPoint.last &&
    x < dataset.data[index + 1].x &&
    x > dataset.data[index - 1].x
  ) {
    dataPoint.x = x;
  }

  dataPoint.y = y;

  return dataPoint;
}

const updateData = (
  e: MouseEvent,
  chartInstance: Chart<'scatter', Point[]>,
  callback?: OnDrag,
) => {
  if (element) {
    curDatasetIndex = element.datasetIndex;
    curIndex = element.index;

    const dataPoint = calcPosition(e, chartInstance, curDatasetIndex, curIndex);
    if (
      !callback ||
      callback(e, curDatasetIndex, curIndex, dataPoint) !== false
    ) {
      chartInstance.data.datasets[curDatasetIndex].data[curIndex] = dataPoint;
      chartInstance.update('none');
    }
  }
};

const dragEndCallback = (
  e: MouseEvent,
  chartInstance: Chart<'scatter', Point[]>,
  callback?: OnDragEnd,
) => {
  curIndex = undefined;

  // chartInstance.update('none')
  if (callback && element) {
    const datasetIndex = element.datasetIndex;
    const index = element.index;
    const value = chartInstance.data.datasets[datasetIndex].data[index];
    return callback(e, datasetIndex, index, value);
  }
};

const ChartJSdragDataPlugin: Plugin<'scatter'> = {
  id: 'dragdata',
  afterInit: function (chartInstance: Chart<'scatter', Point[]>) {
    if (
      chartInstance.config.options?.plugins &&
      chartInstance.config.options.plugins.dragData
    ) {
      const pluginOptions = chartInstance.config.options.plugins.dragData;
      select(chartInstance.canvas).call(
        drag<HTMLCanvasElement, unknown>()
          .container(chartInstance.canvas)
          .touchable(() => pluginOptions.enableTouch || false)
          .on('start', (e) =>
            getElement(e.sourceEvent, chartInstance, pluginOptions.onDragStart),
          )
          .on('drag', (e) =>
            updateData(e.sourceEvent, chartInstance, pluginOptions.onDrag),
          )
          .on('end', (e) =>
            dragEndCallback(
              e.sourceEvent,
              chartInstance,
              pluginOptions.onDragEnd,
            ),
          ),
      );
    }
  },
};

export default ChartJSdragDataPlugin;

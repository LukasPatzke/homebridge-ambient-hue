import 'chart.js';

declare module 'chart.js' {
  // Extend ChartOptions for chartjs-plugin-dragdata
  export interface ChartOptions {
    dragData?: boolean;
    dragX?: boolean;
    onDragEnd?: (e: any, datasetIndex: any, index: any, value: any) => void;
    dragOptions?: object;
  }
}
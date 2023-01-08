import 'chart.js';

declare module 'chart.js' {
  // Extend ChartDataset for chartjs-plugin-dragdata
  export interface ChartDataset {
    dragData?: boolean;
  }
}

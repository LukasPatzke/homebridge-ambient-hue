import 'chart.js';
import { PluginOptions } from '.';

declare module 'chart.js' {
  interface PluginOptionsByType<TType extends ChartType> {
    dragData?: PluginOptions;
  }
}

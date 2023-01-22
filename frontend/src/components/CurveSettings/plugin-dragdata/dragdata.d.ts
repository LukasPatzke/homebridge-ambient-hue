import 'chart.js';
import { PluginOptions } from '.';

declare module 'chart.js' {
  interface PluginOptionsByType {
    dragData?: PluginOptions;
  }
}

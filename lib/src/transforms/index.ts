import FloorTransform from './floor-transform.js';
import LogTransform from './log-transform.js';
import MapTransform from './map-transform.js';
import PowerTransform from './power-transform.js';
import RoundTransform from './round-transform.js';
import ScaleTransform from './scale-transform.js';
import TemplateTransform from './template-transform.js';

export {
  FloorTransform,
  LogTransform,
  MapTransform,
  PowerTransform,
  RoundTransform,
  ScaleTransform,
  TemplateTransform,
};

export const TransformTypeClassMap = {
  floor: FloorTransform,
  log: LogTransform,
  map: MapTransform,
  power: PowerTransform,
  round: RoundTransform,
  scale: ScaleTransform,
  template: TemplateTransform,
};

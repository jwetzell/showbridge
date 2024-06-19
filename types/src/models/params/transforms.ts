export type FloorTransformParams = {
  property: string;
};

export type LogTransformParams = {
  property: string;
  base: number;
};

export type MapTransformParams = {
  property: string;
  map: {
    [k: string]: unknown;
  };
};

export type PowerTransformParams = {
  property: string;
  exponent: number;
};

export type RoundTransformParams = {
  property: string;
};

export type ScaleTransformParams = {
  property: string;
  inRange: [number, number];
  outRange: [number, number];
};

export type TemplateTransformParams = {
  property: string;
  template: string;
};

export type TransformParams =
  | FloorTransformParams
  | LogTransformParams
  | MapTransformParams
  | PowerTransformParams
  | RoundTransformParams
  | ScaleTransformParams
  | TemplateTransformParams;

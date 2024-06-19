export type RouterVars = {
  patches: {
    midi: MIDIPatch[];
    network: NetworkPatch[];
  };
  [k: string]: any;
};

export type MIDIPatch = Patch & {
  port: string;
};

export type NetworkPatch = Patch & {
  host: string;
  port: number;
};

type Patch = {
  name: string;
};

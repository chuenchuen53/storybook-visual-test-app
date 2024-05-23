export interface NodeData {
  key: string;
  label: string;
  data?: any;
  children?: NodeData[];
}

export interface NodeSlots {
  "node-content"(props: { node: NodeData }): unknown;
}

export type EmitEvent = {
  nodeClick: [node: NodeData];
};

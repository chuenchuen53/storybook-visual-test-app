export type TreeObj<T extends object> = {
  [key: string]: T | TreeObj<T>;
};

export function generateTreeFromFlatData<T extends { id: string }>(flatDataArr: T[]): TreeObj<T> {
  const result: TreeObj<T> = {};

  for (const data of flatDataArr) {
    const [multiLayer, name] = data.id.split("--");
    const layers = multiLayer.split("-");
    let currentLayer: TreeObj<T> = result;

    for (const layer of layers) {
      if (!currentLayer[layer]) {
        currentLayer[layer] = {};
      }
      currentLayer = currentLayer[layer] as TreeObj<T>;
    }

    currentLayer[name] = data;
  }

  return result;
}

interface StoryData {
  title: string;
  name: string;
}

export type TreeObj<T extends object> = {
  [key: string]: T | TreeObj<T>;
};

export function generateTreeFromFlatData<T extends StoryData>(flatDataArr: T[]): TreeObj<T> {
  const result: TreeObj<T> = {};

  for (const data of flatDataArr) {
    const layers = data.title.split("/").filter(x => x !== "");
    let currentLayer: TreeObj<T> = result;

    for (const layer of layers) {
      if (!currentLayer[layer]) {
        currentLayer[layer] = {};
      }
      currentLayer = currentLayer[layer] as TreeObj<T>;
    }

    currentLayer[data.name] = data;
  }

  return result;
}

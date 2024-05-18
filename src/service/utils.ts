import os from "os";

export async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function getLocalIPAddress(): string | undefined {
  const interfaces = os.networkInterfaces();
  const ips = Object.keys(interfaces)
    .map(
      key =>
        interfaces[key]
          ?.filter(({ family, internal }) => family === "IPv4" && !internal)
          .map(({ address }) => address) ?? [],
    )
    .reduce((acc, current) => acc.concat(current), []);
  return ips[0];
}

export function computeArrDiff(
  oriArr: string[],
  newArr: string[],
): {
  added: string[];
  removed: string[];
  same: string[];
} {
  const oriSet = new Set(oriArr);
  const newSet = new Set(newArr);

  const sameIds: string[] = [];
  const addedIds: string[] = [];
  const removedIds: string[] = [];

  oriArr.forEach(x => {
    if (newSet.has(x)) {
      sameIds.push(x);
    } else {
      removedIds.push(x);
    }
  });

  newArr.forEach(x => {
    if (!oriSet.has(x)) {
      addedIds.push(x);
    }
  });

  return {
    added: addedIds,
    removed: removedIds,
    same: sameIds,
  };
}

import os from "os";
import path from "path";
import execa from "execa";
import fs from "fs-extra";

export async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
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

export function openInExplorer(dir: string) {
  const platform = os.platform();

  if (platform === "darwin") {
    // macOS
    execa("open", [dir]);
  } else {
    // Default to Windows if OS is not detected
    execa("start", [dir]);
  }
}

export async function getAllFolders(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir);
  const folders: string[] = [];
  for (const entry of entries) {
    if (!entry.startsWith(".")) {
      // Ignore hidden folders
      const entryPath = path.join(dir, entry);
      const stat = await fs.stat(entryPath);
      if (stat.isDirectory()) {
        folders.push(entry);
      }
    }
  }
  return folders;
}

export async function getFolderSize(dir: string): Promise<number> {
  const entries = await fs.readdir(dir);
  let size = 0;
  for (const entry of entries) {
    const entryPath = path.join(dir, entry);
    const stat = await fs.stat(entryPath);
    if (stat.isDirectory()) {
      size += await getFolderSize(entryPath);
    } else {
      size += stat.size;
    }
  }
  return size;
}

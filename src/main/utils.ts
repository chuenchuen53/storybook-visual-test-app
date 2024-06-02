import os from "os";
import path from "path";
import execa from "execa";
import fs from "fs-extra";
import { logger } from "./logger";

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
  if (!fs.pathExists(dir)) return;
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
    // Ignore hidden folders
    if (!entry.startsWith(".")) {
      const entryPath = path.join(dir, entry);
      const stat = await fs.stat(entryPath);
      if (stat.isDirectory()) {
        folders.push(entry);
      }
    }
  }
  return folders;
}

/**
 * @returns A promise that resolves to the total size of all PNG files.
 */
export async function sumPngFileSize(dirPath: string): Promise<number> {
  try {
    const files = await fs.readdir(dirPath);
    let totalSize = 0;

    for (const file of files) {
      if (path.extname(file).toLowerCase() === ".png") {
        const filePath = path.join(dirPath, file);
        const stats = await fs.stat(filePath);
        totalSize += stats.size;
      }
    }

    return totalSize;
  } catch (error) {
    logger.error("Error reading directory:", error);
    throw error;
  }
}

export function filterNonNull<T>(arr: (T | null)[]): T[] {
  return arr.filter((item): item is T => item !== null);
}

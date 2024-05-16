import { execa } from "execa";

// do not change image or the version without testing
export const CHROME_IMAGE = "yukinying/chrome-headless-browser-stable:124.0.6367.201";

export async function checkDockerImage(imageName: string): Promise<boolean> {
  const { exitCode, stdout, stderr } = await execa`docker images -q --filter=reference=${imageName}`;

  if (exitCode !== 0) {
    throw new Error(`Failed querying docker, ${stderr}`);
  }
  return stdout.trim().length > 0;
}

export async function pullDockerImage(imageName: string): Promise<void> {
  const { exitCode, stderr } = await execa`docker pull ${imageName}`;

  if (exitCode !== 0) {
    throw new Error(`Failed pulling docker image, ${stderr}`);
  }
}

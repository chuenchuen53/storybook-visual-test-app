import execa from "execa";

export const CHROME_IMAGE = "yukinying/chrome-headless-browser-stable:124.0.6367.207";

export async function checkDockerImage(): Promise<boolean> {
  const { exitCode, stdout, stderr } = await execa("docker", ["images", "-q", "--filter=reference=" + CHROME_IMAGE]);

  if (exitCode !== 0) {
    throw new Error(`Failed querying docker, ${stderr}`);
  }
  return stdout.trim().length > 0;
}

export async function pullDockerImage(): Promise<void> {
  const { exitCode, stderr } = await execa("docker", ["pull", CHROME_IMAGE]);

  if (exitCode !== 0) {
    throw new Error(`Failed pulling docker image, ${stderr}`);
  }
}

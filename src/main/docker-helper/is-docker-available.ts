import shell from "shelljs";

export function isDockerAvailable(): boolean {
  return shell.which("docker") !== null;
}

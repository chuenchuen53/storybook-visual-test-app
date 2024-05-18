import shell from "shelljs";

export function isDockerAvailable() {
  return shell.which("docker") !== null;
}

import { logger } from "../logger";

export function LogError(methodName?: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const defaultMethodName = propertyKey;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    descriptor.value = async function (this: any, ...args: any[]) {
      const logMethodName = methodName || defaultMethodName;
      try {
        return await originalMethod.apply(this, args);
      } catch (e: unknown) {
        if (e instanceof Error) {
          logger.error(e, `${logMethodName} failed: ${e.message}`);
        } else {
          logger.error(`${logMethodName} failed with non-Error type. Error: ${e}`);
        }
        // rethrow the error after logging
        throw e;
      }
    };

    return descriptor;
  };
}

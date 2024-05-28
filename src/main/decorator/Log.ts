import { logger } from "../logger";

export function Log(methodName?: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const defaultMethodName = propertyKey;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    descriptor.value = async function (this: any, ...args: any[]) {
      const logMethodName = methodName || defaultMethodName;
      logger.info(`${logMethodName} started`);
      try {
        const result = await originalMethod.apply(this, args);
        logger.info(`${logMethodName} completed successfully`);
        return result;
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

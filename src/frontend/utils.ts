import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function waitUntilTrue(
  conditionFunction: () => boolean,
  interval = 10,
  timeout = 10000,
  throwOnTimeout = false
) {
  let timePassed = 0;
  return new Promise<void>(function poll(resolve, reject) {
    if (timePassed >= timeout) {
      if (throwOnTimeout) {
        return reject();
      }
      return resolve();
    }
    if (!conditionFunction()) {
      timePassed += interval;
      setTimeout(() => poll(resolve, reject), interval);
      return;
    }
    resolve();
  });
}

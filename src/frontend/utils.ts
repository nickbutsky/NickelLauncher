import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function runWhenTrue(
  conditionFunction: () => boolean,
  functionToRun: () => void,
  interval = 10,
  timeout = 10000
) {
  let timePassed = 0;
  (function wait() {
    if (timePassed >= timeout) {
      return;
    }
    if (!conditionFunction()) {
      timePassed += interval;
      setTimeout(() => wait(), interval);
      return;
    }
    functionToRun();
  })();
}

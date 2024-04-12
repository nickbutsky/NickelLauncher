import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function runWhenTrue(conditionFunction: () => boolean, functionToRun: () => void, interval = 10) {
  (function wait() {
    if (!conditionFunction()) {
      setTimeout(() => wait(), interval);
      return;
    }
    functionToRun();
  })();
}

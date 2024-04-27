import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { DeepReadonly } from "ts-essentials";

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type DeepestReadonly<T> = DeepReadonly<{
  [K in keyof T]: T[K] extends (...a: infer _) => void
    ? ModifyReturnType<T[K], DeepestReadonly<ReturnType<T[K]>>>
    : T[K];
}>;

// biome-ignore lint/style/useNamingConvention: False positive
export type ModifyReturnType<T extends (...args: Parameters<T>) => void, RT> = (...args: Parameters<T>) => RT;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function waitUntilTrue(
  conditionFunction: () => boolean,
  interval = 10,
  timeout = 10000,
  throwOnTimeout = false,
) {
  let timePassed = 0;
  return new Promise<void>(function poll(resolve, reject) {
    if (timePassed >= timeout) {
      return throwOnTimeout ? reject() : resolve();
    }
    if (conditionFunction()) {
      return resolve();
    }
    timePassed += interval;
    setTimeout(() => poll(resolve, reject), interval);
  });
}

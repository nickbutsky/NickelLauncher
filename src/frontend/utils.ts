import { type ClassValue, clsx } from "clsx";
import * as React from "react";
import { twMerge } from "tailwind-merge";

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

// biome-ignore lint/style/useNamingConvention: False positive
export type ModifyReturnType<T extends (...args: Parameters<T>) => void, RT> = T extends object
  ? (...args: Parameters<T>) => RT
  : never;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function useAPI<F extends (typeof pywebview.api)[keyof typeof pywebview.api]>(apiFunction: F) {
  type UsedAPI = Awaited<ReturnType<F>>;

  const [data, setData] = React.useState<UsedAPI>();
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      setData((await apiFunction()) as UsedAPI); // Typescript can't infer this on its own
      setReady(true);
    })();
  }, [apiFunction]);

  return [data, ready] as [UsedAPI, true] | [undefined, false];
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

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

export function useReliableAsyncFunction<T, F extends (...args: never[]) => Promise<T>>(
  asyncFunction: F,
  parameters: Parameters<F>,
) {
  const [result, setResult] = React.useState<T>();
  const [returned, setReturned] = React.useState(false);
  const [params, setParams] = React.useState(parameters);
  const [reuseTrigger, setReuseTrigger] = React.useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: False positive
  React.useEffect(() => {
    (async () => {
      setResult(await asyncFunction(...params));
      setReturned(true);
    })();
  }, [reuseTrigger]);

  return [
    result,
    returned,
    (parameters) => {
      setParams(parameters);
      setReuseTrigger(!reuseTrigger);
    },
  ] as
    | [Awaited<ReturnType<F>>, true, (parameters: Parameters<F>) => void]
    | [undefined, false, (parameters: Parameters<F>) => void];
}

export const useIsFirstRender = () => {
  const isFirstRenderRef = React.useRef(true);

  React.useEffect(() => {
    isFirstRenderRef.current = false;
  }, []);

  return isFirstRenderRef.current;
};

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

import { type ClassValue, clsx } from "clsx";
import * as React from "react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function useTrigger() {
  const [trigger, setTrigger] = React.useState(false);
  return [trigger, () => setTrigger(!trigger)] as const;
}

export function useTriggerEffect(effect: React.EffectCallback, trigger: boolean) {
  const firstRender = useIsFirstRender();
  // biome-ignore lint/correctness/useExhaustiveDependencies: False positive
  React.useEffect(() => {
    if (!firstRender) {
      effect();
    }
  }, [trigger]);
}

export function useReliableAsyncFunction<T, F extends (...args: never[]) => Promise<T>>(
  asyncFunction: F,
  parameters: Parameters<F>,
) {
  const [result, setResult] = React.useState<T>();
  const [firstUseReturned, setFirstUseReturned] = React.useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: False positive
  React.useEffect(() => {
    (async () => {
      setResult(await asyncFunction(...parameters));
      setFirstUseReturned(true);
    })();
  }, []);

  return [
    result,
    firstUseReturned,
    async (parameters) => {
      setResult(await asyncFunction(...parameters));
    },
  ] as
    | [Awaited<ReturnType<F>>, true, (parameters: Parameters<F>) => Promise<void>]
    | [undefined, false, (parameters: Parameters<F>) => Promise<void>];
}

export function useIsFirstRender() {
  const firstRender = React.useRef(true);
  React.useEffect(() => {
    firstRender.current = false;
  }, []);
  return firstRender.current;
}

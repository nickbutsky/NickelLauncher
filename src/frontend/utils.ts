import { type ClassValue, clsx } from "clsx";
import * as React from "react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function useTrigger() {
  const [trigger, setTrigger] = React.useState(false);
  const fire = React.useCallback(() => setTrigger((prev) => !prev), []);
  return [trigger, fire] as const;
}

export function useTriggerEffect(effect: React.EffectCallback, trigger: boolean, allowFirstRender = false) {
  const firstRender = useIsFirstRender();
  // biome-ignore lint/correctness/useExhaustiveDependencies: False positive
  React.useEffect(() => {
    if (!firstRender || allowFirstRender) {
      effect();
    }
  }, [trigger]);
}

export function useIsFirstRender() {
  const firstRender = React.useRef(true);
  React.useEffect(() => {
    firstRender.current = false;
  }, []);
  return firstRender.current;
}

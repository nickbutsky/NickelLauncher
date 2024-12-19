import { type ClassValue, clsx } from "clsx";
import { type EffectCallback, useCallback, useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: readonly ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function useTrigger() {
	const [trigger, setTrigger] = useState(false);
	const fire = useCallback(() => setTrigger((prev) => !prev), []);
	return [trigger, fire] as const;
}

export function useTriggerEffect(effect: EffectCallback, trigger: boolean, allowFirstRender = false) {
	const firstRender = useIsFirstRender();
	// biome-ignore lint/correctness/useExhaustiveDependencies: False positive
	useEffect(() => {
		if (!firstRender || allowFirstRender) {
			effect();
		}
	}, [trigger]);
}

export function useIsFirstRender() {
	const firstRender = useRef(true);
	useEffect(() => {
		firstRender.current = false;
	}, []);
	return firstRender.current;
}

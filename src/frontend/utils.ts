import { zodResolver } from "@hookform/resolvers/zod";
import { type ClassValue, clsx } from "clsx";
import {
	type ChangeEvent,
	type DependencyList,
	type EffectCallback,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { type DefaultValues, useForm } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import type { ZodObject, ZodType, z } from "zod";

export function cn(...inputs: readonly ClassValue[]) {
	return twMerge(clsx(inputs));
}

export class Trigger {
	#state: boolean;
	#fire: () => void;

	constructor() {
		// biome-ignore lint/correctness/useHookAtTopLevel: Custom pattern
		const [state, setState] = useState(false);
		// biome-ignore lint/correctness/useHookAtTopLevel: Custom pattern
		this.#fire = useCallback(() => setState((prev) => !prev), []);
		this.#state = state;
	}

	useEffect(
		effect: EffectCallback,
		positionalArguments?: { readonly deps?: DependencyList; readonly runOnMount?: boolean },
	) {
		const deps = positionalArguments?.deps;
		const runOnMount = positionalArguments?.runOnMount ?? false;
		// biome-ignore lint/correctness/useHookAtTopLevel: Custom pattern
		const mounted = useIsMounted();
		const useEffectDeps: unknown[] = [this.#state];
		if (deps) {
			useEffectDeps.push(...deps);
		}
		// biome-ignore lint/correctness/useHookAtTopLevel: Custom pattern
		useEffect(() => {
			if (mounted || runOnMount) {
				return effect();
			}
		}, useEffectDeps);
	}

	get fire() {
		return this.#fire;
	}
}

export function useZodForm<T extends ZodObject<Record<string, ZodType>>>(
	schema: T,
	defaultValues: DefaultValues<z.infer<T>>,
) {
	return useForm({ resolver: zodResolver(schema), reValidateMode: "onSubmit", defaultValues });
}

export function preventLeadingWhitespace(event: ChangeEvent<HTMLInputElement>) {
	const trimmedValue = event.currentTarget.value.trimStart();
	const selectionRange = [
		event.currentTarget.value === trimmedValue ? event.currentTarget.selectionStart : 0,
		event.currentTarget.value === trimmedValue ? event.currentTarget.selectionEnd : 0,
		event.currentTarget.selectionDirection === null ? undefined : event.currentTarget.selectionDirection,
	] as const;
	event.currentTarget.value = trimmedValue;
	event.currentTarget.setSelectionRange(...selectionRange);
}

export function navigateFlexbox(
	currentElement: HTMLElement,
	key: "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight",
) {
	const { parentElement } = currentElement;
	if (!parentElement) {
		throw new Error("Should never happen.");
	}
	const [rowNumber, columnNumber] = getFlexboxDimensions(parentElement);
	const getNextElement = new Map([
		[
			"ArrowUp" as const,
			() => {
				const elementIndex = Array.from(parentElement.children).findIndex((child) => child === currentElement);
				let nextElementIndex = elementIndex - columnNumber;
				if (nextElementIndex < 0) {
					nextElementIndex = columnNumber * (Math.floor(elementIndex / columnNumber) + rowNumber - 1) + elementIndex;
					if (nextElementIndex >= parentElement.children.length) {
						nextElementIndex -= columnNumber;
					}
				}
				return parentElement.children[nextElementIndex];
			},
		],
		[
			"ArrowDown" as const,
			() => {
				const elementIndex = Array.from(parentElement.children).findIndex((child) => child === currentElement);
				return (
					parentElement.children[elementIndex + columnNumber] ??
					parentElement.children[elementIndex - columnNumber * Math.floor(elementIndex / columnNumber)]
				);
			},
		],
		[
			"ArrowLeft" as const,
			() => {
				const elementIndex = Array.from(parentElement.children).findIndex((child) => child === currentElement);
				let maxNextElementIndex = columnNumber * (Math.floor(elementIndex / columnNumber) + 1) - 1;
				const minNextElementIndex = maxNextElementIndex - columnNumber + 1;
				if (maxNextElementIndex >= parentElement.children.length) {
					maxNextElementIndex = parentElement.children.length - 1;
				}
				let nextElementIndex = elementIndex - 1;
				if (nextElementIndex < minNextElementIndex) {
					nextElementIndex = maxNextElementIndex;
				}
				return parentElement.children[nextElementIndex];
			},
		],
		[
			"ArrowRight" as const,
			() => {
				const elementIndex = Array.from(parentElement.children).findIndex((child) => child === currentElement);
				let maxNextElementIndex = columnNumber * (Math.floor(elementIndex / columnNumber) + 1) - 1;
				const minNextElementIndex = maxNextElementIndex - columnNumber + 1;
				if (maxNextElementIndex >= parentElement.children.length) {
					maxNextElementIndex = parentElement.children.length - 1;
				}
				let nextElementIndex = elementIndex + 1;
				if (nextElementIndex > maxNextElementIndex) {
					nextElementIndex = minNextElementIndex;
				}
				return parentElement.children[nextElementIndex];
			},
		],
	]).get(key);
	if (!getNextElement) {
		throw new Error("Should never happen.");
	}
	const nextElement = getNextElement();
	if (!(nextElement instanceof HTMLElement)) {
		throw new Error("Should never happen.");
	}
	nextElement.focus();
}

function useIsMounted() {
	// biome-ignore lint/correctness/useHookAtTopLevel: False positive
	const mountedRef = useRef(false);
	// biome-ignore lint/correctness/useHookAtTopLevel: False positive
	useEffect(() => {
		mountedRef.current = true;
	}, []);
	return mountedRef.current;
}

function getFlexboxDimensions(element: HTMLElement) {
	const children = Array.from(element.children) as unknown as readonly HTMLElement[];
	if (children[0] === undefined) {
		return [0, 0] as const;
	}
	let { offsetTop, offsetLeft } = children[0];
	let rowNumber = 1;
	let columnNumber = 1;
	for (const child of children) {
		if (child.offsetTop > offsetTop) {
			offsetTop = child.offsetTop;
			++rowNumber;
		}
		if (child.offsetLeft > offsetLeft) {
			offsetLeft = child.offsetLeft;
			++columnNumber;
		}
	}
	return [rowNumber, columnNumber] as const;
}

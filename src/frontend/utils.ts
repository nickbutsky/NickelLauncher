import { zodResolver } from "@hookform/resolvers/zod";
import { type ClassValue, clsx } from "clsx";
import { type EffectCallback, useCallback, useEffect, useRef, useState } from "react";
import { type DefaultValues, useForm } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import type { ZodObject, ZodType, z } from "zod";

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

export function useZodForm<T extends ZodObject<Record<string, ZodType>>>(
	schema: T,
	defaultValues: DefaultValues<z.infer<T>>,
) {
	return useForm({ resolver: zodResolver(schema), reValidateMode: "onSubmit", defaultValues });
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

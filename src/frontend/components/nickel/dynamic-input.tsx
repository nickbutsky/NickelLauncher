import { cn, preventLeadingWhitespace } from "@/utils";
import type { ChangeEvent, ComponentProps, FocusEvent } from "react";

export function DynamicInput({ className, type, onFocus, onChange, ...props }: ComponentProps<"input">) {
	return (
		<input
			className={cn("bg-black px-1", className)}
			type={type}
			onFocus={(event) => {
				adjustInputWidth(event);
				onFocus?.(event);
			}}
			onChange={(event) => {
				preventLeadingWhitespace(event);
				adjustInputWidth(event);
				onChange?.(event);
			}}
			{...props}
		/>
	);
}

function adjustInputWidth(event: FocusEvent<HTMLInputElement, Element> | ChangeEvent<HTMLInputElement>) {
	event.target.style.width = "16px";
	event.target.style.width = `${event.target.scrollWidth}px`;
}

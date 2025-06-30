import { cn, preventLeadingWhitespace } from "@/utils";
import { Popover } from "radix-ui";
import {
	type ChangeEvent,
	type ComponentProps,
	type FocusEvent,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";

export function EditableLabel({
	className,
	ref,
	editing,
	value,
	maxLength,
	onNoValueChange,
	onBeforeValueChange,
	isAllowedValueChange,
	onValueChange,
	...props
}: ComponentProps<"div"> & {
	readonly editing: boolean;
	readonly value?: string;
	readonly maxLength?: number;
	readonly onNoValueChange: () => void;
	readonly onBeforeValueChange?: (value: string) => string;
	readonly isAllowedValueChange?: (value: string) => boolean;
	readonly onValueChange?: (value: string) => void;
}) {
	useImperativeHandle(ref, () => labelRef.current ?? new HTMLDivElement());
	const [height, setHeight] = useState(0);
	const labelRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	useEffect(() => {
		if (editing) {
			inputRef.current?.focus();
			inputRef.current?.select();
		} else if (labelRef.current) {
			setHeight(labelRef.current?.clientHeight);
		}
	}, [editing]);
	return (
		<>
			<div className={cn("overflow-hidden text-ellipsis whitespace-pre", className)} ref={labelRef} {...props}>
				{editing ? "" : value}
			</div>
			{editing && (
				<Popover.Root open={true} modal={true}>
					<Popover.Portal>
						<Popover.Content
							className="absolute"
							style={{
								left: (labelRef.current?.getBoundingClientRect().left as number) - 4,
								top: labelRef.current?.getBoundingClientRect().top,
							}}
							asChild={true}
						>
							<DynamicInput
								style={{
									height: height,
									font: window
										.getComputedStyle(labelRef.current as Exclude<typeof labelRef.current, null>)
										.getPropertyValue("font"),
								}}
								ref={inputRef}
								defaultValue={value}
								maxLength={maxLength}
								onBlur={onNoValueChange}
								onContextMenu={(event) => event.stopPropagation()}
								onKeyDown={(event) => {
									if (event.key === "Escape") {
										return onNoValueChange();
									}
									if (event.key !== "Enter") {
										return;
									}
									const newValue =
										onBeforeValueChange?.(event.currentTarget.value ?? "") ?? event.currentTarget.value ?? "";
									if (isAllowedValueChange && !isAllowedValueChange(newValue)) {
										return;
									}
									newValue === value ? onNoValueChange() : onValueChange?.(newValue);
								}}
							/>
						</Popover.Content>
					</Popover.Portal>
				</Popover.Root>
			)}
		</>
	);
}

function DynamicInput({ className, onFocus, onChange, ...props }: ComponentProps<"input">) {
	return (
		<input
			className={cn("bg-black px-1", className)}
			type="text"
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

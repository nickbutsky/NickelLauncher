import { cn, useTriggerEffect } from "@/utils";
// biome-ignore lint/style/noNamespaceImport: radix-ui convention
import * as Popover from "@radix-ui/react-popover";
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
	editModeTrigger,
	defaultValue,
	maxLength,
	applyOnAboutToSave,
	isAllowedToSave,
	onSave,
	...props
}: Omit<ComponentProps<"div">, "defaultValue"> & {
	readonly editModeTrigger: boolean;
	readonly defaultValue: string;
	readonly maxLength?: number;
	readonly applyOnAboutToSave?: (value: string) => string;
	readonly isAllowedToSave?: (value: string) => boolean;
	readonly onSave?: (value: string) => void;
}) {
	useImperativeHandle(ref, () => labelRef.current as Exclude<typeof labelRef.current, null>, []);

	const [value, setValue] = useState(maxLength === undefined ? defaultValue : defaultValue.slice(0, maxLength));
	const [editMode, setEditMode] = useState(false);
	const [height, setHeight] = useState(0);

	const labelRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	useTriggerEffect(() => {
		if (editMode) {
			return;
		}
		if (labelRef.current) {
			setHeight(labelRef.current?.clientHeight);
		}
		setEditMode(true);
	}, editModeTrigger);

	useEffect(() => {
		if (editMode) {
			inputRef.current?.focus();
			inputRef.current?.select();
		}
	}, [editMode]);

	return (
		<>
			<div className={cn("overflow-hidden text-ellipsis whitespace-pre", className)} ref={labelRef} {...props}>
				{editMode ? "" : value}
			</div>
			{editMode && (
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
								onBlur={() => setEditMode(false)}
								onContextMenu={(event) => event.stopPropagation()}
								onKeyDown={(event) => {
									if (event.key === "Escape") {
										return setEditMode(false);
									}
									if (!(event.key === "Enter")) {
										return;
									}
									const newValue =
										applyOnAboutToSave?.(event.currentTarget.value ?? "") ?? event.currentTarget.value ?? "";
									if (isAllowedToSave && !isAllowedToSave(newValue)) {
										return;
									}
									if (newValue === value) {
										return setEditMode(false);
									}
									onSave?.(newValue);
									setValue(newValue);
									setEditMode(false);
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
				const trimmedValue = event.currentTarget.value.trimStart();
				const selectionRange = [
					event.currentTarget.value === trimmedValue ? event.currentTarget.selectionStart : 0,
					event.currentTarget.value === trimmedValue ? event.currentTarget.selectionEnd : 0,
					event.currentTarget.selectionDirection === null ? undefined : event.currentTarget.selectionDirection,
				] as const;
				event.currentTarget.value = trimmedValue;
				event.currentTarget.setSelectionRange(...selectionRange);
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

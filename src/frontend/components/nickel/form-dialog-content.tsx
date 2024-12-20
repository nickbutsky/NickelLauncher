import {
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/shadcn-modified/dialog";
import { Button } from "@/components/shadcn/button";
import { Form } from "@/components/shadcn/form";
import { type ComponentProps, type ComponentRef, useImperativeHandle, useRef } from "react";
import type { DefaultValues, FieldValues, SubmitHandler, UseFormReturn } from "react-hook-form";

export function FormDialogContent<T extends FieldValues = FieldValues>({
	ref,
	children,
	onCloseAutoFocus,
	title,
	submitText,
	form,
	onSubmitBeforeClose,
	onSubmitAfterClose,
	...props
}: Omit<ComponentProps<typeof DialogContent>, "onSubmit"> & {
	readonly title: string;
	readonly submitText: string;
	readonly form: UseFormReturn<T>;
	readonly onSubmitBeforeClose?: SubmitHandler<T>;
	readonly onSubmitAfterClose?: SubmitHandler<T>;
}) {
	useImperativeHandle(ref, () => dialogContentRef.current as Exclude<typeof dialogContentRef.current, null>);

	const dialogContentRef = useRef<ComponentRef<typeof DialogContent>>(null);
	const hiddenCloseButtonRef = useRef<ComponentRef<typeof DialogClose>>(null);

	return (
		<DialogContent
			ref={dialogContentRef}
			onCloseAutoFocus={(event) => {
				form.reset(form.control._defaultValues as DefaultValues<T>);
				onCloseAutoFocus?.(event);
			}}
			{...props}
		>
			<DialogHeader>
				<DialogTitle>{title}</DialogTitle>
			</DialogHeader>
			<Form {...form}>
				<form
					className="space-y-4"
					onSubmit={form.handleSubmit(async (data) => {
						await onSubmitBeforeClose?.(data);
						hiddenCloseButtonRef.current?.click();
						dialogContentRef.current?.addEventListener("animationend", () => onSubmitAfterClose?.(data), {
							once: true,
						});
					})}
				>
					{children}
					<DialogFooter>
						<Button type="submit">{submitText}</Button>
						<DialogClose ref={hiddenCloseButtonRef} hidden={true} />
					</DialogFooter>
				</form>
			</Form>
		</DialogContent>
	);
}

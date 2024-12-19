import { zodResolver } from "@hookform/resolvers/zod";
import {
	Children,
	type ComponentProps,
	type ComponentRef,
	type ReactElement,
	useImperativeHandle,
	useRef,
} from "react";
import {
	type ControllerProps,
	type DefaultValues,
	type FieldPath,
	type FieldValues,
	type Path,
	type SubmitHandler,
	useForm,
} from "react-hook-form";
import type { ZodObject, ZodType, z } from "zod";

import {
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/shadcn-modified/dialog";
import { Button } from "@/components/shadcn/button";
import { Form, FormField } from "@/components/shadcn/form";

export function FormDialogContent<T extends ZodObject<Record<string, ZodType>>>({
	ref,
	children,
	onCloseAutoFocus,
	title,
	submitText,
	schema,
	defaultValues,
	onSubmitBeforeClose,
	onSubmitAfterClose,
	...props
}: Omit<ComponentProps<typeof DialogContent>, "children" | "onSubmit"> & {
	readonly children:
		| ReactElement<ControllerProps<z.infer<T>, Path<z.infer<T>>>>
		| readonly ReactElement<ControllerProps<z.infer<T>, Path<z.infer<T>>>>[];
	readonly title: string;
	readonly submitText: string;
	readonly schema: T;
	readonly defaultValues: DefaultValues<z.infer<T>>;
	readonly onSubmitBeforeClose?: SubmitHandler<z.infer<T>>;
	readonly onSubmitAfterClose?: SubmitHandler<z.infer<T>>;
}) {
	useImperativeHandle(ref, () => dialogContentRef.current as Exclude<typeof dialogContentRef.current, null>);

	const form = useForm({ resolver: zodResolver(schema), reValidateMode: "onSubmit", defaultValues });

	const dialogContentRef = useRef<ComponentRef<typeof DialogContent>>(null);
	const hiddenCloseButtonRef = useRef<ComponentRef<typeof DialogClose>>(null);

	return (
		<DialogContent
			ref={dialogContentRef}
			onCloseAutoFocus={(event) => {
				form.reset(defaultValues);
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
					{Children.map(children, (child) => (
						<FormField control={form.control} name={child.props.name} render={child.props.render} />
					))}
					<DialogFooter>
						<Button type="submit">{submitText}</Button>
						<DialogClose ref={hiddenCloseButtonRef} hidden={true} />
					</DialogFooter>
				</form>
			</Form>
		</DialogContent>
	);
}

export function DialogFormField<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: Omit<ControllerProps<TFieldValues, TName>, "control">) {
	return !props;
}

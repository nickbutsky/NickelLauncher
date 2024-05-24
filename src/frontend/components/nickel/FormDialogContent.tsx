import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import {
  type ControllerProps,
  type DefaultValues,
  type FieldPath,
  type FieldValues,
  type Path,
  type SubmitHandler,
  useForm,
} from "react-hook-form";
import type { DeepReadonly } from "ts-essentials";
import type { ZodObject, ZodType, z } from "zod";

import { Button } from "@/components/shadcn/button";
import { DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/shadcn/dialog";
import { Form, FormField } from "@/components/shadcn/form";

export function FormDialogContent<T extends ZodObject<Record<string, ZodType>>>({
  ref,
  children,
  onCloseAutoFocus,
  title,
  submitText,
  schema,
  defaultValues,
  onSubmit,
  closeThenSubmit,
  ...props
}: Omit<React.ComponentProps<typeof DialogContent>, "children" | "onSubmit"> &
  DeepReadonly<{
    title: string;
    submitText: string;
    schema: T;
    onSubmit: SubmitHandler<z.infer<T>>;
    closeThenSubmit?: boolean;
  }> &
  Readonly<{
    children:
      | React.ReactElement<ControllerProps<z.infer<T>, Path<z.infer<T>>>>
      | React.ReactElement<ControllerProps<z.infer<T>, Path<z.infer<T>>>>[];
    defaultValues: DefaultValues<z.infer<T>>;
  }>) {
  React.useImperativeHandle(
    ref as Exclude<typeof ref, string>,
    () => dialogContentRef.current as Exclude<typeof dialogContentRef.current, null>,
  );

  const form = useForm({ resolver: zodResolver(schema), reValidateMode: "onSubmit", defaultValues });

  const dialogContentRef = React.useRef<React.ElementRef<typeof DialogContent>>(null);
  const hiddenCloseButtonRef = React.useRef<React.ElementRef<typeof DialogClose>>(null);

  return (
    <DialogContent
      ref={dialogContentRef}
      onCloseAutoFocus={(event) => {
        form.reset();
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
          onSubmit={form.handleSubmit((data) => {
            if (closeThenSubmit) {
              hiddenCloseButtonRef.current?.click();
              dialogContentRef.current?.addEventListener("animationend", () => onSubmit(data));
            } else {
              onSubmit(data);
              hiddenCloseButtonRef.current?.click();
            }
          })}
        >
          {React.Children.map(children, (child) => (
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
>({ ...props }: Omit<ControllerProps<TFieldValues, TName>, "control">) {
  return undefined && props;
}

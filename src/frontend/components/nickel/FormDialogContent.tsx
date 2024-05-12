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
import type { ZodObject, ZodType, z } from "zod";

import { Button } from "@/components/shadcn/button";
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/shadcn/dialog";
import { Form, FormField } from "@/components/shadcn/form";

export function FormDialogContent<T extends ZodObject<Record<string, ZodType>>>({
  ref,
  children,
  title,
  submitText,
  schema,
  defaultValues,
  onSubmit,
  ...props
}: Omit<React.ComponentProps<typeof DialogContent>, "children" | "onSubmit"> &
  Readonly<{
    children:
      | React.ReactElement<ControllerProps<z.infer<T>, Path<z.infer<T>>>>
      | React.ReactElement<ControllerProps<z.infer<T>, Path<z.infer<T>>>>[];
    title: string;
    submitText: string;
    schema: T;
    defaultValues: DefaultValues<z.infer<T>>;
    onSubmit: SubmitHandler<z.infer<T>>;
  }>) {
  const form = useForm({ resolver: zodResolver(schema), reValidateMode: "onSubmit", defaultValues });

  return (
    <DialogContent ref={ref} {...props}>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          {React.Children.map(children, (child) => (
            <FormField control={form.control} name={child.props.name} render={child.props.render} />
          ))}
          <DialogFooter>
            <Button type="submit">{submitText}</Button>
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

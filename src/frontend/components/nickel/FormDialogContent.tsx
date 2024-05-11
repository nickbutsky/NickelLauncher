import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import {
  type ControllerRenderProps,
  type DefaultValues,
  type FieldValues,
  type SubmitHandler,
  useForm,
} from "react-hook-form";
import type { ZodObject, ZodType, z } from "zod";

import { Button } from "@/components/shadcn/button";
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/shadcn/dialog";
import { Form, FormField } from "@/components/shadcn/form";

type Schema = ZodObject<Record<string, ZodType>>;

type DialogFormFieldProps<T extends Schema = Schema> = {
  name: keyof z.infer<T>;
  render: ({ field }: { field: ControllerRenderProps<FieldValues, keyof z.infer<T>> }) => React.ReactNode;
};

export function FormDialogContent<T extends Schema>({
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
    children: React.ReactElement<DialogFormFieldProps<T>> | React.ReactElement<DialogFormFieldProps<T>>[];
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

export function DialogFormField(props: DialogFormFieldProps) {
  return <></>;
}

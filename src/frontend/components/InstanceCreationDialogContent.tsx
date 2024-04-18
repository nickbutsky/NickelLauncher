import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { VersionSelector } from "@/components/VersionSelector";

const formSchema = z.object({
  instanceName: z.string().trim().min(1, {
    message: "Instance name must be at least 1 character long."
  }),
  groupName: z.string().trim(),
  versionDisplayName: z.string()
});

export function InstanceCreationDialogContent() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      instanceName: "",
      groupName: ""
    }
  });

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create new instance</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <FormField
          control={form.control}
          name="instanceName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="None" maxLength={20} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="groupName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Group name</FormLabel>
              <FormControl>
                <Input maxLength={50} {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <VersionSelector />
      </Form>
    </DialogContent>
  );
}

import { vd } from "@/testing-data";

import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { VersionSelector } from "@/components/VersionSelector";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  instanceName: z.string().trim(),
  groupName: z.string().trim(),
  versionDisplayName: z.string()
});

export function InstanceCreationDialogContent() {
  const [currentVersionDisplayName, setCurrentVersionDisplayName] = React.useState(vd.beta[5]?.displayName);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      instanceName: "",
      groupName: "",
      versionDisplayName: "1.16.10004.0"
    }
  });

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create new instance</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit((data) => console.log(JSON.stringify(data, undefined, 2)))}
        >
          <FormField
            control={form.control}
            name="instanceName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder={currentVersionDisplayName} maxLength={20} {...field} />
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
          <FormField
            control={form.control}
            name="versionDisplayName"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <VersionSelector
                    defaultValue={field.value}
                    onValueChange={(value) => {
                      setCurrentVersionDisplayName(value);
                      field.onChange(value);
                    }}
                    {...vd}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Button className="float-right" type="submit">
            Create
          </Button>
        </form>
      </Form>
    </DialogContent>
  );
}

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { DeepReadonly } from "ts-essentials";
import { z } from "zod";

import { InputWithOptions } from "@/components/InputWithOptions";
import { VersionSelector } from "@/components/VersionSelector";
import { Button } from "@/components/ui/button";
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { InstanceGroup, VersionsByType } from "@/core-types";
import { useAPI } from "@/utils";

export function InstanceCreationDialogContent() {
  const [instanceGroups, instanceGroupsReady] = useAPI(pywebview.api.getInstanceGroups);
  const [versionsByType, versionsByTypeReady] = useAPI(pywebview.api.getVersionsByType);

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create new instance</DialogTitle>
      </DialogHeader>
      {instanceGroupsReady && versionsByTypeReady ? (
        <InstanceCreationForm instanceGroups={instanceGroups} versionsByType={versionsByType} />
      ) : (
        <></>
      )}
    </DialogContent>
  );
}

const formSchema = z.object({
  instanceName: z.string().trim().min(1, "Instance name must be at least 1 character long."),
  groupName: z.string().trim(),
  versionDisplayName: z.string(),
});

function InstanceCreationForm({
  instanceGroups,
  versionsByType,
}: DeepReadonly<{ instanceGroups: InstanceGroup[]; versionsByType: VersionsByType }>) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    reValidateMode: "onSubmit",
    defaultValues: {
      instanceName: "",
      groupName: "",
      versionDisplayName: versionsByType.release[0]?.displayName ?? "",
    },
  });

  return (
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
                <Input maxLength={20} {...field} />
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
                <InputWithOptions
                  maxLength={50}
                  options={instanceGroups.map((instanceGroup) => instanceGroup.name).filter((name) => name !== "")}
                  {...field}
                />
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
                  className="h-72"
                  versionsByType={versionsByType}
                  onRefreshRequest={() => undefined}
                  defaultDisplayName={field.value}
                  onDisplayNameChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button type="submit">Create</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

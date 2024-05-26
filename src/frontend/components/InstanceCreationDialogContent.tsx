import * as React from "react";
import { z } from "zod";

import { AppContext } from "@/App";
import { VersionSelector } from "@/components/VersionSelector";
import { DialogFormField, FormDialogContent } from "@/components/nickel/FormDialogContent";
import { InputWithOptions } from "@/components/nickel/InputWithOptions";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/shadcn/form";
import { Input } from "@/components/shadcn/input";
import { useReliableAsyncFunction } from "@/utils";

export function InstanceCreationDialogContent() {
  const [instanceGroups, instanceGroupsReady, reuseGetInstanceGroups] = useReliableAsyncFunction(
    pywebview.api.getInstanceGroups,
    [],
  );
  const [versionsByType, versionsByTypeReady] = useReliableAsyncFunction(pywebview.api.getVersionsByType, []);

  const appContext = React.useContext(AppContext);

  return (
    instanceGroupsReady &&
    versionsByTypeReady && (
      <FormDialogContent
        title="Create new instance"
        submitText="Create"
        schema={z.object({
          instanceName: z.string().trim().min(1, "Instance name must be at least 1 character long."),
          groupName: z.string().trim(),
          versionDisplayName: z.string(),
        })}
        defaultValues={{
          instanceName: "",
          groupName: "",
          versionDisplayName: versionsByType.release[0]?.displayName ?? "",
        }}
        onSubmit={(data) =>
          pywebview.api.createInstance(data.instanceName, data.groupName, data.versionDisplayName).then(() => {
            appContext.resetMainArea();
            reuseGetInstanceGroups();
          })
        }
      >
        <DialogFormField
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
        <DialogFormField
          name="groupName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Group name</FormLabel>
              <FormControl>
                <InputWithOptions
                  maxLength={50}
                  options={instanceGroups.map((group) => group.name).filter((name) => name !== "")}
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <DialogFormField
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
      </FormDialogContent>
    )
  );
}

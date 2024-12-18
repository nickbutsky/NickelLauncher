import { use } from "react";
import { z } from "zod";

import { AppContext } from "@/app";
import { DialogFormField, FormDialogContent } from "@/components/nickel/form-dialog-content";
import { InputWithOptions } from "@/components/nickel/input-with-options";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/shadcn/form";
import { Input } from "@/components/shadcn/input";
import { VersionSelector } from "@/components/version-selector";
import { useStore } from "@/store";

export function InstanceCreationDialogContent() {
  const appContext = use(AppContext);
  const versionTypeToVersions = useStore((state) => state.versionTypeToVersions);
  const reloadVersionTypeToVersions = useStore((state) => state.reloadVersionTypeToVersions);
  const instanceGroups = useStore((state) => state.instanceGroups);
  const reloadInstanceGroups = useStore((state) => state.reloadInstanceGroups);

  return (
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
        versionDisplayName: versionTypeToVersions.release[0]?.displayName ?? "",
      }}
      onSubmitBeforeClose={(data) =>
        pywebview.api.createInstance(data.instanceName, data.groupName, data.versionDisplayName).then((dirname) => {
          reloadInstanceGroups();
          appContext.scrollToInstance(dirname);
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
                className="h-60"
                versionTypeToVersions={versionTypeToVersions}
                onRefreshRequest={async () => reloadVersionTypeToVersions(true)}
                defaultDisplayName={field.value}
                onDisplayNameChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </FormDialogContent>
  );
}

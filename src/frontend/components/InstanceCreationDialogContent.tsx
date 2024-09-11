import * as React from "react";
import { z } from "zod";

import { AppContext } from "@/App";
import { VersionSelector } from "@/components/VersionSelector";
import { DialogFormField, FormDialogContent } from "@/components/nickel/FormDialogContent";
import { InputWithOptions } from "@/components/nickel/InputWithOptions";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/shadcn/form";
import { Input } from "@/components/shadcn/input";

export function InstanceCreationDialogContent() {
  const appContext = React.useContext(AppContext);

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
        versionDisplayName: appContext.versionTypeToVersions.release[0]?.displayName ?? "",
      }}
      onSubmitBeforeClose={(data) =>
        pywebview.api.createInstance(data.instanceName, data.groupName, data.versionDisplayName).then((dirname) => {
          appContext.refreshMainArea();
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
                options={appContext.instanceGroups.map((group) => group.name).filter((name) => name !== "")}
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
                versionTypeToVersions={appContext.versionTypeToVersions}
                onRefreshRequest={() => appContext.reloadVersionTypeToVersions(true)}
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

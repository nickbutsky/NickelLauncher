import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { useForm } from "react-hook-form";
import type { DeepReadonly } from "ts-essentials";
import { z } from "zod";

import defaultLogo from "@/assets/default.png";
import { VersionSelector } from "@/components/VersionSelector";
import { EditableLabel } from "@/components/nickel/EditableLabel";
import { InputWithOptions } from "@/components/nickel/InputWithOptions";
import { Button } from "@/components/shadcn/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/shadcn/context-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/shadcn/dialog";
import { Form, FormControl, FormField, FormItem } from "@/components/shadcn/form";
import type { Instance, VersionsByType } from "@/core-types";
import { cn, useAPI, waitUntilTrue } from "@/utils";

export const InstanceButton = React.forwardRef<
  React.ElementRef<typeof Button>,
  Omit<React.ComponentPropsWithoutRef<typeof Button>, "name"> & DeepReadonly<{ initialState: Instance }>
>(({ className, variant, initialState, ...props }, ref) => {
  const [dialogContentId, setDialogContentId] = React.useState<"cg" | "cv" | "ci">("cg");
  const [editableLabelTrigger, setEditableLabelTrigger] = React.useState(false);

  const renameContextMenuItemRef = React.useRef<React.ElementRef<typeof ContextMenuItem>>(null);

  return (
    <Dialog>
      <ContextMenu>
        <ContextMenuTrigger asChild={true}>
          <Button
            className={cn("grid h-16 w-48 grid-cols-[max-content_1fr] gap-3", className)}
            ref={ref}
            variant="outline"
            {...props}
          >
            <img src={defaultLogo} alt="Instance logo" width="32" height="32" />
            <div className="grid grid-rows-2 text-left">
              <EditableLabel
                editModeTrigger={editableLabelTrigger}
                defaultValue={initialState.name}
                maxLength={20}
                applyOnAboutToSave={(value) => value.trim()}
                isAllowedToSave={(value) => value.length > 0}
                onSave={(value) => pywebview.api.renameInstance(initialState.dirname, value)}
              />
              <div>{initialState.version.displayName}</div>
            </div>
          </Button>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Launch</ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuRadioGroup value={initialState.architectureChoice}>
            {initialState.version.availableArchitectures.map((architecture) => (
              <ContextMenuRadioItem key={architecture} value={architecture}>
                {architecture}
              </ContextMenuRadioItem>
            ))}
          </ContextMenuRadioGroup>
          <ContextMenuSeparator />
          <ContextMenuItem
            ref={renameContextMenuItemRef}
            onSelect={() =>
              waitUntilTrue(() => !renameContextMenuItemRef.current).then(() =>
                setEditableLabelTrigger(!editableLabelTrigger),
              )
            }
          >
            Rename
            <ContextMenuShortcut>F2</ContextMenuShortcut>
          </ContextMenuItem>
          <DialogTrigger asChild={true}>
            <ContextMenuItem onSelect={() => setDialogContentId("cg")}>Change Group</ContextMenuItem>
          </DialogTrigger>
          <DialogTrigger asChild={true}>
            <ContextMenuItem onSelect={() => setDialogContentId("cv")}>Change Version</ContextMenuItem>
          </DialogTrigger>
          <ContextMenuSeparator />
          <ContextMenuItem>Minecraft Folder</ContextMenuItem>
          <ContextMenuItem>Instance Folder</ContextMenuItem>
          <ContextMenuSeparator />
          <DialogTrigger asChild={true}>
            <ContextMenuItem onSelect={() => setDialogContentId("ci")}>Copy Instance</ContextMenuItem>
          </DialogTrigger>
        </ContextMenuContent>
        {
          {
            cg: <ChangeGroupDialogContent />,
            cv: (
              <ChangeVersionDialogContent
                dirname={initialState.dirname}
                currentVersionDisplayName={initialState.version.displayName}
              />
            ),
            ci: <CopyInstanceDialogContent />,
          }[dialogContentId]
        }
      </ContextMenu>
    </Dialog>
  );
});

function ChangeGroupDialogContent() {
  const [instanceGroups, ready] = useAPI(pywebview.api.getInstanceGroups);

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Change group</DialogTitle>
      </DialogHeader>
      {ready && (
        <InputWithOptions
          placeholder="Group name"
          options={instanceGroups.map((instanceGroup) => instanceGroup.name).filter((name) => name !== "")}
        />
      )}
      <DialogFooter>
        <Button type="submit">Change</Button>
      </DialogFooter>
    </DialogContent>
  );
}

function ChangeVersionDialogContent({
  dirname,
  currentVersionDisplayName,
}: DeepReadonly<{ dirname: string; currentVersionDisplayName: string }>) {
  const [versionsByType, ready] = useAPI(pywebview.api.getVersionsByType);

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Change version</DialogTitle>
      </DialogHeader>
      {ready && (
        <ChangeVersionForm
          dirname={dirname}
          currentVersionDisplayName={currentVersionDisplayName}
          versionsByType={versionsByType}
        />
      )}
    </DialogContent>
  );
}

const changeVersionFormSchema = z.object({ versionDisplayName: z.string() });

function ChangeVersionForm({
  dirname,
  currentVersionDisplayName,
  versionsByType,
}: DeepReadonly<{ dirname: string; currentVersionDisplayName: string; versionsByType: VersionsByType }>) {
  const form = useForm<z.infer<typeof changeVersionFormSchema>>({
    resolver: zodResolver(changeVersionFormSchema),
    reValidateMode: "onSubmit",
    defaultValues: {
      versionDisplayName: currentVersionDisplayName,
    },
  });

  return (
    <Form {...form}>
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit((data) => pywebview.api.changeVersion(dirname, data.versionDisplayName))}
      >
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
          <Button type="submit">Change</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

function CopyInstanceDialogContent() {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Do you want to copy your worlds?</DialogTitle>
      </DialogHeader>
      <DialogFooter className="gap-2">
        <Button type="submit">Yes</Button>
        <Button type="submit">No</Button>
      </DialogFooter>
    </DialogContent>
  );
}

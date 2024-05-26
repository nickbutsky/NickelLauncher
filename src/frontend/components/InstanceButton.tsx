import * as React from "react";
import type { DeepReadonly } from "ts-essentials";
import { z } from "zod";

import { AppContext } from "@/App";
import defaultLogo from "@/assets/default.png";
import { VersionSelector } from "@/components/VersionSelector";
import { EditableLabel } from "@/components/nickel/EditableLabel";
import { DialogFormField, FormDialogContent } from "@/components/nickel/FormDialogContent";
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
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/shadcn/dialog";
import { FormControl, FormItem } from "@/components/shadcn/form";
import type { Instance } from "@/core-types";
import { cn, useReliableAsyncFunction, waitUntilTrue } from "@/utils";

export const InstanceButton = React.forwardRef<
  React.ElementRef<typeof Button>,
  Omit<React.ComponentPropsWithoutRef<typeof Button>, "name"> & DeepReadonly<{ initialState: Instance }>
>(({ className, variant, initialState, ...props }, ref) => {
  const [dialogContentId, setDialogContentId] = React.useState<"cg" | "cv" | "ci">("ci");
  const [editableLabelTrigger, setEditableLabelTrigger] = React.useState(false);
  const [architectureChoice, setArchitectureChoice] = React.useState(initialState.architectureChoice);

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
          <ContextMenuRadioGroup
            value={architectureChoice}
            onValueChange={(value) =>
              pywebview.api
                .changeArchitectureChoice(initialState.dirname, value)
                .then(() => setArchitectureChoice(value))
            }
          >
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
            cg: <ChangeGroupDialogContent dirname={initialState.dirname} />,
            cv: (
              <ChangeVersionDialogContent
                dirname={initialState.dirname}
                currentVersionDisplayName={initialState.version.displayName}
              />
            ),
            ci: <CopyInstanceDialogContent dirname={initialState.dirname} />,
          }[dialogContentId]
        }
      </ContextMenu>
    </Dialog>
  );
});

function ChangeGroupDialogContent({ dirname }: DeepReadonly<{ dirname: string }>) {
  const [groups, ready] = useReliableAsyncFunction(pywebview.api.getInstanceGroups, []);

  const appContext = React.useContext(AppContext);

  return (
    ready && (
      <FormDialogContent
        title="Change group"
        submitText="Change"
        schema={z.object({ groupName: z.string() })}
        defaultValues={{
          groupName:
            groups.find((group) => group.instances.find((instance) => instance.dirname === dirname))?.name ?? "",
        }}
        onSubmit={(data) =>
          pywebview.api
            .moveInstances(Number.MAX_SAFE_INTEGER, data.groupName.trim(), [dirname])
            .then(() => appContext.resetMainArea())
        }
        closeThenSubmit={true}
      >
        <DialogFormField
          name="groupName"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <InputWithOptions
                  placeholder="Group name"
                  maxLength={50}
                  options={groups.map((group) => group.name).filter((name) => name !== "")}
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </FormDialogContent>
    )
  );
}

function ChangeVersionDialogContent({
  dirname,
  currentVersionDisplayName,
}: DeepReadonly<{ dirname: string; currentVersionDisplayName: string }>) {
  const [versionsByType, ready, reuseGetVersionsByType] = useReliableAsyncFunction(pywebview.api.getVersionsByType, []);

  return (
    ready && (
      <FormDialogContent
        title="Change Version"
        submitText="Change"
        schema={z.object({ versionDisplayName: z.string() })}
        defaultValues={{
          versionDisplayName: currentVersionDisplayName,
        }}
        onSubmit={(data) => pywebview.api.changeVersion(dirname, data.versionDisplayName)}
      >
        <DialogFormField
          name="versionDisplayName"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <VersionSelector
                  className="h-72"
                  versionsByType={versionsByType}
                  onRefreshRequest={() => reuseGetVersionsByType([true])}
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

function CopyInstanceDialogContent({ dirname }: DeepReadonly<{ dirname: string }>) {
  const dialogContentRef = React.useRef<React.ElementRef<typeof DialogContent>>(null);

  const appContext = React.useContext(AppContext);

  // biome-ignore lint/correctness/useExhaustiveDependencies: False positive
  const copyInstance = React.useCallback(
    (copyWorlds: boolean) =>
      pywebview.api
        .copyInstance(dirname, copyWorlds)
        .then(() => dialogContentRef.current?.addEventListener("animationend", appContext.resetMainArea)),
    [dirname],
  );

  return (
    <DialogContent ref={dialogContentRef}>
      <DialogHeader>
        <DialogTitle>Do you want to copy your worlds?</DialogTitle>
      </DialogHeader>
      <DialogFooter className="gap-y-1.5">
        <DialogClose onClick={() => copyInstance(true)} asChild={true}>
          <Button type="submit">Yes</Button>
        </DialogClose>
        <DialogClose onClick={() => copyInstance(false)} asChild={true}>
          <Button type="submit">No</Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
}

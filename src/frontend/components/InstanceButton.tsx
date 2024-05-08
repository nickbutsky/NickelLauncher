import * as React from "react";
import type { DeepReadonly } from "ts-essentials";

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
import type { Instance } from "@/core-types";
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
            cv: <ChangeVersionDialogContent currentVersionDisplayName={initialState.version.displayName} />,
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
  currentVersionDisplayName,
}: DeepReadonly<{ currentVersionDisplayName: string }>) {
  const [versionsByType, ready] = useAPI(pywebview.api.getVersionsByType);

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Change version</DialogTitle>
      </DialogHeader>
      {ready && (
        <VersionSelector
          className="h-72"
          versionsByType={versionsByType}
          onRefreshRequest={() => undefined}
          defaultDisplayName={currentVersionDisplayName}
        />
      )}
      <DialogFooter>
        <Button type="submit">Change</Button>
      </DialogFooter>
    </DialogContent>
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

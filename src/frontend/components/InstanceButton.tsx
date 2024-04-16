import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger
} from "@/components/ui/context-menu";
import { EditableLabel } from "@/components/EditableLabel";
import defaultLogo from "@/assets/default.png";
import { cn, waitUntilTrue } from "@/utils";

export interface InstanceProps {
  readonly name: string;
  readonly displayVersionName: string;
  readonly architectureChoice: string;
  readonly availableArchitectures: readonly string[];
}

export const InstanceButton = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentPropsWithoutRef<typeof Button> & InstanceProps
>(({ className, variant, name, displayVersionName, architectureChoice, availableArchitectures, ...props }, ref) => {
  const editableLabelRef = React.useRef<React.ElementRef<typeof EditableLabel>>(null);
  const renameContextMenuItemRef = React.useRef<React.ElementRef<typeof ContextMenuItem>>(null);

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild={true}>
        <Button
          className={cn("grid grid-cols-[max-content_1fr] gap-3 w-48 h-16", className)}
          ref={ref}
          variant="outline"
          {...props}
        >
          <img src={defaultLogo} alt="Instance logo" width="32" height="32" />
          <div className="grid grid-rows-2 text-left">
            <EditableLabel
              ref={editableLabelRef}
              initialValue={name}
              maxLength={20}
              applyOnAboutToSave={(value) => value.trim()}
              isAllowedToSave={(value) => value.length > 0}
            />
            <div>{displayVersionName}</div>
          </div>
        </Button>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>Launch</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuRadioGroup value={architectureChoice}>
          {availableArchitectures.map((architecture) => (
            <ContextMenuRadioItem key={architecture} value={architecture}>
              {architecture}
            </ContextMenuRadioItem>
          ))}
        </ContextMenuRadioGroup>
        <ContextMenuSeparator />
        <ContextMenuItem
          ref={renameContextMenuItemRef}
          onSelect={() =>
            waitUntilTrue(() => !renameContextMenuItemRef.current).then(() => editableLabelRef.current?.enterEditMode())
          }
        >
          Rename
          <ContextMenuShortcut>F2</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>Change Group</ContextMenuItem>
        <ContextMenuItem>Change Version</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>Minecraft Folder</ContextMenuItem>
        <ContextMenuItem>Instance Folder</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>Copy Instance</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
});

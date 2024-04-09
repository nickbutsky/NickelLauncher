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

interface Props {
  readonly name: string;
  readonly displayVersionName: string;
  readonly architectureChoice: string;
  readonly availableArchitectures: readonly string[];
}

export function InstanceButton({ name, displayVersionName, architectureChoice, availableArchitectures }: Props) {
  const nameEditableLabelRef = React.useRef<{ readonly enterEditMode: () => void }>(null);

  return (
    <ContextMenu>
      <ContextMenuTrigger className="inline-block">
        <Button className="grid grid-cols-[max-content_1fr] gap-3 w-48 h-16" variant="outline">
          <img src={defaultLogo} alt="Instance logo" width="32" height="32" />
          <div className="grid grid-rows-2 text-left">
            <EditableLabel
              ref={nameEditableLabelRef}
              defaultValue={name}
              validateInput={(value) => !/^\s/.test(value)}
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
            <ContextMenuRadioItem value={architecture}>{architecture}</ContextMenuRadioItem>
          ))}
        </ContextMenuRadioGroup>
        <ContextMenuSeparator />
        <ContextMenuItem onSelect={() => nameEditableLabelRef.current?.enterEditMode()}>
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
}

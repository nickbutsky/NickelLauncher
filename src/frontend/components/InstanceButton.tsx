import * as React from "react";

import { Button } from "@/components/ui/button";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";

import defaultLogo from "@/assets/default.png";

interface Props {
  readonly name: string;
  readonly displayVersionName: string;
}

export function InstanceButton({ name, displayVersionName }: Props) {
  return (
    <ContextMenu>
      <ContextMenuTrigger className="inline-block">
        <Button className="grid grid-cols-[max-content_1fr] gap-3 w-48 h-16" variant="outline">
          <img src={defaultLogo} alt="Instance logo" width="32" height="32" />
          <div className="grid grid-rows-2 text-left">
            <div>{name}</div>
            <div>{displayVersionName}</div>
          </div>
        </Button>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>Launch</ContextMenuItem>
        <ContextMenuItem>Rename</ContextMenuItem>
        <ContextMenuItem>Change Group</ContextMenuItem>
        <ContextMenuItem>Change Version</ContextMenuItem>
        <ContextMenuItem>Minecraft Folder</ContextMenuItem>
        <ContextMenuItem>Instance Folder</ContextMenuItem>
        <ContextMenuItem>Copy Instance</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

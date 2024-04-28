import { CaretDownIcon } from "@radix-ui/react-icons";
import * as React from "react";
import type { DeepReadonly } from "ts-essentials";

import { EditableLabel } from "@/components/EditableLabel";
import { InstanceButton } from "@/components/InstanceButton";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import type { InstanceGroup } from "@/core-types";
import { waitUntilTrue } from "@/utils";

export const InstanceGroupCollapsible = React.forwardRef<
  React.ElementRef<typeof Collapsible>,
  React.ComponentPropsWithoutRef<typeof Collapsible> & DeepReadonly<{ initialState: InstanceGroup }>
>(({ defaultOpen, initialState, ...props }, ref) => {
  const editableLabelRef = React.useRef<React.ElementRef<typeof EditableLabel>>(null);
  const renameContextMenuItemRef = React.useRef<React.ElementRef<typeof ContextMenuItem>>(null);

  return (
    <Collapsible ref={ref} defaultOpen={!initialState.hidden} {...props}>
      <div className="flex items-center gap-2">
        <CollapsibleTrigger asChild={true}>
          <Button className="data-[state=closed]:-rotate-90" variant="ghost" size="icon">
            <CaretDownIcon />
          </Button>
        </CollapsibleTrigger>
        {initialState.name ? (
          <ContextMenu>
            <ContextMenuTrigger asChild={true}>
              <EditableLabel
                ref={editableLabelRef}
                defaultValue={initialState.name}
                maxLength={50}
                applyOnAboutToSave={(value) => value.trim()}
                isAllowedToSave={(value) => value.length > 0}
              />
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem
                ref={renameContextMenuItemRef}
                onSelect={() =>
                  waitUntilTrue(() => !renameContextMenuItemRef.current).then(() =>
                    editableLabelRef.current?.enterEditMode(),
                  )
                }
              >
                Rename
                <ContextMenuShortcut>F2</ContextMenuShortcut>
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        ) : (
          <div>{initialState.name}</div>
        )}
      </div>
      <CollapsibleContent className="mt-1 flex flex-wrap gap-3 data-[state=closed]:hidden" forceMount={true}>
        {initialState.instances.map((instance) => (
          <InstanceButton key={instance.name} initialState={instance} />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
});

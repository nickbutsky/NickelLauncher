import * as React from "react";

import { CaretDownIcon } from "@radix-ui/react-icons";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { type InstanceProps, InstanceButton } from "@/components/InstanceButton";
import { EditableLabel } from "@/components/EditableLabel";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuShortcut,
  ContextMenuTrigger
} from "@/components/ui/context-menu";
import { waitUntilTrue } from "@/utils";

interface Props {
  readonly name: string;
  readonly initialCollapsed: boolean;
  readonly instances: readonly InstanceProps[];
}

export const InstanceGroupCollapsible = React.forwardRef<
  React.ElementRef<typeof Collapsible>,
  React.ComponentPropsWithoutRef<typeof Collapsible> & Props
>(({ defaultOpen, name, initialCollapsed, instances, ...props }, ref) => {
  const editableLabelRef = React.useRef<React.ElementRef<typeof EditableLabel>>(null);
  const renameContextMenuItemRef = React.useRef<React.ElementRef<typeof ContextMenuItem>>(null);

  return (
    <Collapsible ref={ref} defaultOpen={!initialCollapsed} {...props}>
      <div className="flex items-center gap-2">
        <CollapsibleTrigger asChild={true}>
          <Button className="data-[state=closed]:-rotate-90" variant="ghost" size="icon">
            <CaretDownIcon />
          </Button>
        </CollapsibleTrigger>
        {name ? (
          <ContextMenu>
            <ContextMenuTrigger asChild={true}>
              <EditableLabel
                ref={editableLabelRef}
                initialValue={name}
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
                    editableLabelRef.current?.enterEditMode()
                  )
                }
              >
                Rename
                <ContextMenuShortcut>F2</ContextMenuShortcut>
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        ) : (
          <div>{name}</div>
        )}
      </div>
      <CollapsibleContent className="flex flex-wrap gap-3 mt-1 data-[state=closed]:hidden" forceMount={true}>
        {instances.map((instance) => (
          <InstanceButton
            key={instance.name}
            name={instance.name}
            displayVersionName={instance.displayVersionName}
            architectureChoice={instance.architectureChoice}
            availableArchitectures={instance.availableArchitectures}
          />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
});

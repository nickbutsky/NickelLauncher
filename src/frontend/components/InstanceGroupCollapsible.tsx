import * as React from "react";

import { CaretDownIcon } from "@radix-ui/react-icons";

import { type Prettify, waitUntilTrue } from "@/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { InstanceButton } from "@/components/InstanceButton";
import { EditableLabel } from "@/components/EditableLabel";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuShortcut,
  ContextMenuTrigger
} from "@/components/ui/context-menu";

interface Props {
  readonly name: string;
  readonly hidden: boolean;
  readonly instances: readonly Prettify<React.ComponentProps<typeof InstanceButton>>[];
}

export const InstanceGroupCollapsible = React.forwardRef(
  (
    { name, hidden, instances, defaultOpen, ...props }: Props & React.ComponentProps<typeof Collapsible>,
    forwardedRef: React.ForwardedRef<HTMLDivElement>
  ) => {
    const editableLabelRef = React.useRef<React.ComponentRef<typeof EditableLabel>>(null);
    const renameContextMenuItemRef = React.useRef<React.ComponentRef<typeof ContextMenuItem>>(null);

    return (
      <Collapsible ref={forwardedRef} defaultOpen={!hidden} {...props}>
        <div className="flex items-center gap-2">
          <CollapsibleTrigger asChild={true}>
            <Button className="data-[state=closed]:-rotate-90" variant="ghost" size="icon">
              <CaretDownIcon />
            </Button>
          </CollapsibleTrigger>
          {name ? (
            <ContextMenu>
              <ContextMenuTrigger asChild={true}>
                <div>
                  <EditableLabel
                    ref={editableLabelRef}
                    defaultValue={name}
                    maxLength={50}
                    applyOnAboutToSave={(value) => value.trim()}
                    isAllowedToSave={(value) => value.length > 0}
                  />
                </div>
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
        <CollapsibleContent className="mt-1 data-[state=closed]:hidden" forceMount={true}>
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
  }
);

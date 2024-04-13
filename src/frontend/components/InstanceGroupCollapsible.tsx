import * as React from "react";

import { CaretDownIcon, CaretRightIcon } from "@radix-ui/react-icons";

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

export function InstanceGroupCollapsible({ name, hidden, instances }: Props) {
  const [state, setState] = React.useState(!hidden);

  const editableLabelRef = React.useRef<React.ComponentRef<typeof EditableLabel>>(null);
  const renameContextMenuItemRef = React.useRef<React.ComponentRef<typeof ContextMenuItem>>(null);

  return (
    <Collapsible defaultOpen={!hidden} onOpenChange={(open) => setState(open)}>
      <div className="flex items-center gap-2">
        <CollapsibleTrigger asChild={true}>
          <Button variant="ghost" size="icon">
            {state ? <CaretDownIcon /> : <CaretRightIcon />}
          </Button>
        </CollapsibleTrigger>
        <ContextMenu>
          <ContextMenuTrigger asChild={true}>
            <div>
              <EditableLabel ref={editableLabelRef} defaultValue={name} />
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
      </div>
      <CollapsibleContent className="data-[state=closed]:hidden" forceMount={true}>
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

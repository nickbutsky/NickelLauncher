import { CaretDownIcon } from "@radix-ui/react-icons";
import * as React from "react";
import type { DeepReadonly } from "ts-essentials";

import { AppContext } from "@/App";
import { InstanceButton } from "@/components/InstanceButton";
import { EditableLabel } from "@/components/nickel/EditableLabel";
import { Button } from "@/components/shadcn/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/shadcn/collapsible";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/shadcn/context-menu";
import type { InstanceGroup } from "@/core-types";
import { useTrigger } from "@/utils";

export const InstanceGroupCollapsible = React.forwardRef<
  React.ElementRef<typeof Collapsible>,
  React.ComponentPropsWithoutRef<typeof Collapsible> & DeepReadonly<{ state: InstanceGroup }>
>(({ defaultOpen, onOpenChange, state, ...props }, ref) => {
  const contextMenuContentRef = React.useRef<React.ElementRef<typeof ContextMenuContent>>(null);

  const appContext = React.useContext(AppContext);

  const [editableLabelTrigger, fireEditableLabelTrigger] = useTrigger();

  return (
    <Collapsible
      ref={ref}
      open={!state.hidden}
      onOpenChange={() => pywebview.api.toggleInstanceGroupHidden(state.name).then(appContext.refreshMainArea)}
      {...props}
    >
      <div className="flex items-center gap-2">
        <CollapsibleTrigger asChild={true}>
          <Button className="data-[state=closed]:-rotate-90" variant="ghost" size="icon">
            <CaretDownIcon />
          </Button>
        </CollapsibleTrigger>
        {state.name && (
          <ContextMenu>
            <ContextMenuTrigger asChild={true}>
              <EditableLabel
                editModeTrigger={editableLabelTrigger}
                defaultValue={state.name}
                maxLength={50}
                applyOnAboutToSave={(value) => value.trim()}
                isAllowedToSave={(value) => value.length > 0}
                onSave={(value) =>
                  pywebview.api.renameInstanceGroup(state.name, value).then(appContext.refreshMainArea)
                }
              />
            </ContextMenuTrigger>
            <ContextMenuContent ref={contextMenuContentRef}>
              <ContextMenuItem
                onSelect={() =>
                  contextMenuContentRef.current?.addEventListener("animationend", fireEditableLabelTrigger)
                }
              >
                Rename
                <ContextMenuShortcut>F2</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem
                onSelect={() => pywebview.api.deleteInstanceGroup(state.name).then(appContext.refreshMainArea)}
              >
                Delete
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        )}
      </div>
      <CollapsibleContent className="my-1 flex flex-wrap gap-3 data-[state=closed]:hidden" forceMount={true}>
        {state.instances.map((instance) => (
          <InstanceButton key={instance.name} state={instance} />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
});

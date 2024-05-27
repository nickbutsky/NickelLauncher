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

export const InstanceGroupCollapsible = React.forwardRef<
  React.ElementRef<typeof Collapsible>,
  React.ComponentPropsWithoutRef<typeof Collapsible> & DeepReadonly<{ initialState: InstanceGroup }>
>(({ defaultOpen, onOpenChange, initialState, ...props }, ref) => {
  const [name, setName] = React.useState(initialState.name);
  const [editableLabelTrigger, setEditableLabelTrigger] = React.useState(false);

  const contextMenuContentRef = React.useRef<React.ElementRef<typeof ContextMenuContent>>(null);

  const appContext = React.useContext(AppContext);

  return (
    <Collapsible
      ref={ref}
      defaultOpen={!initialState.hidden}
      onOpenChange={() => pywebview.api.toggleInstanceGroupHidden(name)}
      {...props}
    >
      <div className="flex items-center gap-2">
        <CollapsibleTrigger asChild={true}>
          <Button className="data-[state=closed]:-rotate-90" variant="ghost" size="icon">
            <CaretDownIcon />
          </Button>
        </CollapsibleTrigger>
        {initialState.name && (
          <ContextMenu>
            <ContextMenuTrigger asChild={true}>
              <EditableLabel
                editModeTrigger={editableLabelTrigger}
                defaultValue={initialState.name}
                maxLength={50}
                applyOnAboutToSave={(value) => value.trim()}
                isAllowedToSave={(value) => value.length > 0}
                onSave={(value) =>
                  pywebview.api
                    .getInstanceGroups()
                    .then((groups) =>
                      pywebview.api
                        .renameInstanceGroup(name, value)
                        .then(() =>
                          groups.find((group) => group.name === value) ? appContext.resetMainArea() : setName(value),
                        ),
                    )
                }
              />
            </ContextMenuTrigger>
            <ContextMenuContent ref={contextMenuContentRef}>
              <ContextMenuItem
                onSelect={() =>
                  contextMenuContentRef.current?.addEventListener("animationend", () =>
                    setEditableLabelTrigger(!editableLabelTrigger),
                  )
                }
              >
                Rename
                <ContextMenuShortcut>F2</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem onSelect={() => pywebview.api.deleteInstanceGroup(name).then(appContext.resetMainArea)}>
                Delete
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        )}
      </div>
      <CollapsibleContent className="my-1 flex flex-wrap gap-3 data-[state=closed]:hidden" forceMount={true}>
        {initialState.instances.map((instance) => (
          <InstanceButton key={instance.name} initialState={instance} />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
});

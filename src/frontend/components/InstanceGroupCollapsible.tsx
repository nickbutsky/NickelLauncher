import * as React from "react";

import { CaretDownIcon, CaretRightIcon } from "@radix-ui/react-icons";

import type { Prettify } from "@/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { InstanceButton } from "@/components/InstanceButton";
import { EditableLabel } from "@/components/EditableLabel";

interface Props {
  name: string;
  hidden: boolean;
  instances: Prettify<React.ComponentProps<typeof InstanceButton>>[];
}

export function InstanceGroupCollapsible({ name, hidden, instances }: Props) {
  const [state, setState] = React.useState(!hidden);

  return (
    <Collapsible defaultOpen={!hidden} onOpenChange={(open) => setState(open)}>
      <div className="flex items-center gap-2">
        <CollapsibleTrigger asChild={true}>
          <Button variant="ghost" size="icon">
            {state ? <CaretDownIcon /> : <CaretRightIcon />}
          </Button>
        </CollapsibleTrigger>
        <EditableLabel defaultValue={name} />
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

import * as React from "react";
import type { DeepReadonly } from "ts-essentials";

import { AppContext } from "@/app";
import { InstanceGroupCollapsible } from "@/components/instance-group-collapsible";
import { ScrollArea } from "@/components/shadcn/scroll-area";
import { useTriggerEffect } from "@/utils";

export function MainArea({ refreshTrigger }: DeepReadonly<{ refreshTrigger: boolean }>) {
  const appContext = React.useContext(AppContext);

  useTriggerEffect(() => {
    appContext.reloadInstanceGroups();
  }, refreshTrigger);

  return (
    <ScrollArea className="h-screen" type="always">
      {appContext.instanceGroups.map((group) => (
        <InstanceGroupCollapsible key={group.name} state={group} />
      ))}
    </ScrollArea>
  );
}

import * as React from "react";
import type { DeepReadonly } from "ts-essentials";

import { AppContext } from "@/App";
import { InstanceGroupCollapsible } from "@/components/InstanceGroupCollapsible";
import { ScrollArea } from "@/components/shadcn/scroll-area";
import { useIsFirstRender } from "@/utils";

export function MainArea({ reloadTrigger }: DeepReadonly<{ reloadTrigger: boolean }>) {
  const appContext = React.useContext(AppContext);

  const firstRender = useIsFirstRender();
  // biome-ignore lint/correctness/useExhaustiveDependencies: False positive
  React.useEffect(() => {
    if (!firstRender) {
      appContext.reloadInstanceGroups();
    }
  }, [reloadTrigger]);

  return (
    <ScrollArea className="h-screen" type="always">
      {appContext.instanceGroups.map((group) => (
        <InstanceGroupCollapsible key={group.name} initialState={group} />
      ))}
    </ScrollArea>
  );
}

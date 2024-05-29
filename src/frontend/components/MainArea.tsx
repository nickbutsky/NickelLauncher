import * as React from "react";
import type { DeepReadonly } from "ts-essentials";

import { InstanceGroupCollapsible } from "@/components/InstanceGroupCollapsible";
import { ScrollArea } from "@/components/shadcn/scroll-area";
import { useIsFirstRender, useReliableAsyncFunction } from "@/utils";

export function MainArea({ reloadTrigger }: DeepReadonly<{ reloadTrigger: boolean }>) {
  const [groups, ready, reuseGetInstanceGroups] = useReliableAsyncFunction(pywebview.api.getInstanceGroups, []);

  const firstRender = useIsFirstRender();

  // biome-ignore lint/correctness/useExhaustiveDependencies: False positive
  React.useEffect(() => {
    if (!firstRender) {
      reuseGetInstanceGroups([]);
    }
  }, [reloadTrigger]);

  return (
    <ScrollArea className="h-screen" type="always">
      {ready && groups.map((group) => <InstanceGroupCollapsible key={group.name} initialState={group} />)}
    </ScrollArea>
  );
}

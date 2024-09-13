import type { DeepReadonly } from "ts-essentials";

import { InstanceGroupCollapsible } from "@/components/instance-group-collapsible";
import { ScrollArea } from "@/components/shadcn/scroll-area";
import { useStore } from "@/store";
import { useTriggerEffect } from "@/utils";

export function MainArea({ refreshTrigger }: DeepReadonly<{ refreshTrigger: boolean }>) {
  const instanceGroups = useStore((state) => state.instanceGroups);
  const reloadInstanceGroups = useStore((state) => state.reloadInstanceGroups);

  useTriggerEffect(() => {
    reloadInstanceGroups();
  }, refreshTrigger);

  return (
    <ScrollArea className="h-screen" type="always">
      {instanceGroups.map((group) => (
        <InstanceGroupCollapsible key={group.name} state={group} />
      ))}
    </ScrollArea>
  );
}

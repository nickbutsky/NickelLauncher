import { InstanceGroupCollapsible } from "@/components/InstanceGroupCollapsible";
import { ScrollArea } from "@/components/shadcn/scroll-area";
import { useReliableAsyncFunction } from "@/utils";

export function MainArea() {
  const [instanceGroups, ready] = useReliableAsyncFunction(pywebview.api.getInstanceGroups, []);

  return (
    <ScrollArea className="h-screen" type="always">
      {ready &&
        instanceGroups.map((instanceGroup) => (
          <InstanceGroupCollapsible key={instanceGroup.name} initialState={instanceGroup} />
        ))}
    </ScrollArea>
  );
}

import { InstanceGroupCollapsible } from "@/components/InstanceGroupCollapsible";
import { ScrollArea } from "@/components/shadcn/scroll-area";
import { useReliableAsyncFunction } from "@/utils";

export function MainArea() {
  const [groups, ready] = useReliableAsyncFunction(pywebview.api.getInstanceGroups, []);

  return (
    <ScrollArea className="h-screen" type="always">
      {ready && groups.map((group) => <InstanceGroupCollapsible key={group.name} initialState={group} />)}
    </ScrollArea>
  );
}

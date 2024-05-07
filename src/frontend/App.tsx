import { PlusIcon } from "@radix-ui/react-icons";

import { InstanceCreationDialogContent } from "@/components/InstanceCreationDialogContent";
import { InstanceGroupCollapsible } from "@/components/InstanceGroupCollapsible";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { useAPI } from "@/utils";

export function App() {
  const [instanceGroups, ready] = useAPI(pywebview.api.getInstanceGroups);

  return (
    <ThemeProvider defaultTheme="dark">
      <ScrollArea className="h-screen" type="always">
        {ready &&
          instanceGroups.map((instanceGroup) => (
            <InstanceGroupCollapsible key={instanceGroup.name} initialState={instanceGroup} />
          ))}
        <Dialog>
          <DialogTrigger asChild={true}>
            <Button className="fixed right-0 bottom-0 z-10 mr-1 mb-1 rounded-full" size="icon">
              <PlusIcon />
            </Button>
          </DialogTrigger>
          <InstanceCreationDialogContent />
        </Dialog>
      </ScrollArea>
    </ThemeProvider>
  );
}

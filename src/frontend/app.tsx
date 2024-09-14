import { PlusIcon } from "@radix-ui/react-icons";
import * as React from "react";
import type { DeepReadonly } from "ts-essentials";

import { exposeStaticFunction } from "@/bridge";
import { InstanceCreationDialogContent } from "@/components/instance-creation-dialog-content";
import { InstanceGroupCollapsible } from "@/components/instance-group-collapsible";
import { ErrorDialog } from "@/components/nickel/error-dialog";
import { Button } from "@/components/shadcn/button";
import { Dialog, DialogTrigger } from "@/components/shadcn/dialog";
import { ScrollArea } from "@/components/shadcn/scroll-area";
import { useStore } from "@/store";
import { useTrigger } from "@/utils";

export const AppContext = React.createContext<
  DeepReadonly<{
    scrollToInstance: (dirname: string) => void;
    instanceDirnameToScrollTo: string | null;
    scrollTrigger: boolean;

    showErrorDialog: (msg: string) => void;
  }>
>({
  scrollToInstance: () => undefined,
  instanceDirnameToScrollTo: null,
  scrollTrigger: false,

  showErrorDialog: () => undefined,
});

export function App() {
  const [ready, setReady] = React.useState(false);
  const [instanceDirnameToScrollTo, setInstanceDirnameToScrollTo] = React.useState<string | null>(null);

  const errorMsg = React.useRef("");

  const [scrollTrigger, fireScrollTrigger] = useTrigger();
  const [errorDialogTrigger, fireErrorDialogTrigger] = useTrigger();

  const instanceGroups = useStore((state) => state.instanceGroups);
  const reloadInstanceGroups = useStore((state) => state.reloadInstanceGroups);

  // biome-ignore lint/correctness/useExhaustiveDependencies: False positive
  React.useEffect(() => {
    if (import.meta.env.PROD) {
      exposeStaticFunction("onSuddenChange", reloadInstanceGroups);
    }
    pywebview.api.getLastInstanceDirname().then((dirname) => {
      if (dirname !== null) {
        scrollToInstance(dirname);
      }
      setReady(true);
    });
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: False positive
  const scrollToInstance = React.useCallback<React.ContextType<typeof AppContext>["scrollToInstance"]>((dirname) => {
    setInstanceDirnameToScrollTo(dirname);
    fireScrollTrigger();
  }, []);

  return (
    ready && (
      <AppContext.Provider
        value={{
          scrollToInstance,
          instanceDirnameToScrollTo,
          scrollTrigger,

          showErrorDialog: (msg) => {
            errorMsg.current = msg;
            fireErrorDialogTrigger();
          },
        }}
      >
        <ScrollArea className="h-screen" type="always">
          {instanceGroups.map((group) => (
            <InstanceGroupCollapsible key={group.name} state={group} />
          ))}
        </ScrollArea>
        <Dialog>
          <DialogTrigger asChild={true}>
            <Button className="fixed right-0 bottom-0 mr-1 mb-1 rounded-full" size="icon">
              <PlusIcon />
            </Button>
          </DialogTrigger>
          <InstanceCreationDialogContent />
        </Dialog>
        <ErrorDialog msg={errorMsg.current} trigger={errorDialogTrigger} />
      </AppContext.Provider>
    )
  );
}

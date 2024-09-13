import { PlusIcon } from "@radix-ui/react-icons";
import * as React from "react";
import type { DeepReadonly } from "ts-essentials";

import { type API, exposeStaticFunction } from "@/bridge";
import { InstanceCreationDialogContent } from "@/components/instance-creation-dialog-content";
import { MainArea } from "@/components/main-area";
import { ErrorDialog } from "@/components/nickel/error-dialog";
import { Button } from "@/components/shadcn/button";
import { Dialog, DialogTrigger } from "@/components/shadcn/dialog";
import { useReliableAsyncFunction, useTrigger } from "@/utils";

export const AppContext = React.createContext<
  DeepReadonly<{ refreshMainArea: API["static"]["reloadMainArea"] }> &
    DeepReadonly<{
      scrollToInstance: (dirname: string) => void;
      instanceDirnameToScrollTo: string | null;
      scrollTrigger: boolean;

      showErrorDialog: (msg: string) => void;
    }>
>({
  refreshMainArea: () => undefined,

  scrollToInstance: () => undefined,
  instanceDirnameToScrollTo: null,
  scrollTrigger: false,

  showErrorDialog: () => undefined,
});

export function App() {
  const [instanceDirnameToScrollTo, setInstanceDirnameToScrollTo] = React.useState<string | null>(null);

  const errorMsg = React.useRef("");

  const [mainAreaRefreshTrigger, fireMainAreaRefreshTrigger] = useTrigger();
  const [scrollTrigger, fireScrollTrigger] = useTrigger();
  const [errorDialogTrigger, fireErrorDialogTrigger] = useTrigger();

  const [lastInstanceDirname, lastInstanceDirnameReady] = useReliableAsyncFunction(
    pywebview.api.getLastInstanceDirname,
    [],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: False positive
  React.useEffect(() => {
    if (import.meta.env.PROD) {
      exposeStaticFunction("reloadMainArea", fireMainAreaRefreshTrigger);
    }
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: False positive
  React.useEffect(() => {
    if (lastInstanceDirnameReady && lastInstanceDirname !== null) {
      scrollToInstance(lastInstanceDirname);
    }
  }, [lastInstanceDirnameReady]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: False positive
  const scrollToInstance = React.useCallback<React.ContextType<typeof AppContext>["scrollToInstance"]>((dirname) => {
    setInstanceDirnameToScrollTo(dirname);
    fireScrollTrigger();
  }, []);

  if (!lastInstanceDirnameReady) {
    return;
  }

  return (
    <AppContext.Provider
      value={{
        refreshMainArea: fireMainAreaRefreshTrigger,

        scrollToInstance,
        instanceDirnameToScrollTo,
        scrollTrigger,

        showErrorDialog: (msg) => {
          errorMsg.current = msg;
          fireErrorDialogTrigger();
        },
      }}
    >
      <MainArea refreshTrigger={mainAreaRefreshTrigger} />
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
  );
}

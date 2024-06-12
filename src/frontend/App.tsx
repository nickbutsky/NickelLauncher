import { PlusIcon } from "@radix-ui/react-icons";
import * as React from "react";
import type { DeepReadonly } from "ts-essentials";

import { type API, exposeStaticFunction } from "@/bridge";
import { InstanceCreationDialogContent } from "@/components/InstanceCreationDialogContent";
import { MainArea } from "@/components/MainArea";
import { ErrorDialog } from "@/components/nickel/ErrorDialog";
import { Button } from "@/components/shadcn/button";
import { Dialog, DialogTrigger } from "@/components/shadcn/dialog";
import { ThemeProvider } from "@/components/shadcn/theme-provider";
import { useReliableAsyncFunction, useTrigger } from "@/utils";

export const AppContext = React.createContext<
  DeepReadonly<{ refreshMainArea: API["static"]["reloadMainArea"] }> &
    DeepReadonly<{
      instanceGroups: Awaited<ReturnType<typeof pywebview.api.getInstanceGroups>>;
      reloadInstanceGroups: () => Promise<void>;
      versionsByType: Awaited<ReturnType<typeof pywebview.api.getVersionsByType>>;
      reloadVersionsByType: (remotely: boolean) => Promise<void>;

      scrollToInstance: (dirname: string) => void;
      instanceDirnameToScrollTo: string | null;
      scrollTrigger: boolean;

      showErrorDialog: (msg: string) => void;
    }>
>({
  refreshMainArea: () => undefined,

  instanceGroups: [],
  reloadInstanceGroups: () => Promise.resolve(),
  versionsByType: { release: [], beta: [], preview: [] },
  reloadVersionsByType: () => Promise.resolve(),

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

  const [instanceGroups, groupsReady, reuseGetInstanceGroups] = useReliableAsyncFunction(
    pywebview.api.getInstanceGroups,
    [],
  );
  const [versionsByType, versionsByTypeReady, reuseGetVersionsByType] = useReliableAsyncFunction(
    pywebview.api.getVersionsByType,
    [],
  );
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

  if (!(groupsReady && versionsByTypeReady && lastInstanceDirnameReady)) {
    return;
  }

  const appContext: React.ContextType<typeof AppContext> = {
    refreshMainArea: fireMainAreaRefreshTrigger,
    instanceGroups,
    reloadInstanceGroups: () => reuseGetInstanceGroups([]),
    versionsByType,
    reloadVersionsByType: (remotely?: boolean) => reuseGetVersionsByType([remotely]),

    scrollToInstance,
    instanceDirnameToScrollTo,
    scrollTrigger,

    showErrorDialog: (msg) => {
      errorMsg.current = msg;
      fireErrorDialogTrigger();
    },
  };

  return (
    <ThemeProvider defaultTheme="dark">
      <AppContext.Provider value={appContext}>
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
    </ThemeProvider>
  );
}

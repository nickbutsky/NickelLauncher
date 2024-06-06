import { PlusIcon } from "@radix-ui/react-icons";
import * as React from "react";
import type { DeepReadonly } from "ts-essentials";

import { type API, exposeStaticFunction } from "@/bridge";
import { InstanceCreationDialogContent } from "@/components/InstanceCreationDialogContent";
import { MainArea } from "@/components/MainArea";
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
    }>
>({
  refreshMainArea: () => undefined,
  instanceGroups: [],
  reloadInstanceGroups: () => Promise.resolve(),
  versionsByType: { release: [], beta: [], preview: [] },
  reloadVersionsByType: () => Promise.resolve(),
});

export function App() {
  const [mainAreaRefreshTrigger, fireMainAreaRefreshTrigger] = useTrigger();

  const [instanceGroups, groupsReady, reuseGetInstanceGroups] = useReliableAsyncFunction(
    pywebview.api.getInstanceGroups,
    [],
  );
  const [versionsByType, versionsByTypeReady, reuseGetVersionsByType] = useReliableAsyncFunction(
    pywebview.api.getVersionsByType,
    [],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: False positive
  React.useEffect(() => {
    if (import.meta.env.PROD) {
      exposeStaticFunction("reloadMainArea", fireMainAreaRefreshTrigger);
    }
  }, []);

  if (!(groupsReady && versionsByTypeReady)) {
    return;
  }

  const appContext = {
    refreshMainArea: fireMainAreaRefreshTrigger,
    instanceGroups,
    reloadInstanceGroups: () => reuseGetInstanceGroups([]),
    versionsByType,
    reloadVersionsByType: (remotely?: boolean) => reuseGetVersionsByType([remotely]),
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
      </AppContext.Provider>
    </ThemeProvider>
  );
}

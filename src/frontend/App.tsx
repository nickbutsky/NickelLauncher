import { PlusIcon } from "@radix-ui/react-icons";
import * as React from "react";
import type { DeepReadonly } from "ts-essentials";

import { InstanceCreationDialogContent } from "@/components/InstanceCreationDialogContent";
import { MainArea } from "@/components/MainArea";
import { Button } from "@/components/shadcn/button";
import { Dialog, DialogTrigger } from "@/components/shadcn/dialog";
import { ThemeProvider } from "@/components/shadcn/theme-provider";
import { useReliableAsyncFunction } from "@/utils";

export const AppContext = React.createContext<
  Pick<typeof webview, "reloadMainArea"> &
    DeepReadonly<{
      instanceGroups: Awaited<ReturnType<typeof pywebview.api.getInstanceGroups>>;
      reloadInstanceGroups: () => Promise<void>;
      versionsByType: Awaited<ReturnType<typeof pywebview.api.getVersionsByType>>;
      reloadVersionsByType: (remotely: boolean) => Promise<void>;
    }>
>({
  reloadMainArea: () => undefined,
  instanceGroups: [],
  reloadInstanceGroups: () => Promise.resolve(),
  versionsByType: { release: [], beta: [], preview: [] },
  reloadVersionsByType: () => Promise.resolve(),
});

export function App() {
  const [mainAreaReloadTrigger, setMainAreaReloadTrigger] = React.useState(false);

  const [instanceGroups, groupsReady, reuseGetInstanceGroups] = useReliableAsyncFunction(
    pywebview.api.getInstanceGroups,
    [],
  );
  const [versionsByType, versionsByTypeReady, reuseGetVersionsByType] = useReliableAsyncFunction(
    pywebview.api.getVersionsByType,
    [],
  );

  if (!(groupsReady && versionsByTypeReady)) {
    return;
  }

  const appContext = {
    reloadMainArea: () => setMainAreaReloadTrigger(!mainAreaReloadTrigger),
    instanceGroups,
    reloadInstanceGroups: () => reuseGetInstanceGroups([]),
    versionsByType,
    reloadVersionsByType: (remotely?: boolean) => reuseGetVersionsByType([remotely]),
  };

  if (import.meta.env.PROD) {
    webview.reloadMainArea = appContext.reloadMainArea;
  }

  return (
    <ThemeProvider defaultTheme="dark">
      <AppContext.Provider value={appContext}>
        <MainArea reloadTrigger={mainAreaReloadTrigger} />
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

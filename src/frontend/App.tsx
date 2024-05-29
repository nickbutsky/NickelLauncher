import { PlusIcon } from "@radix-ui/react-icons";
import * as React from "react";
import type { MarkWritable } from "ts-essentials";

import { InstanceCreationDialogContent } from "@/components/InstanceCreationDialogContent";
import { MainArea } from "@/components/MainArea";
import { Button } from "@/components/shadcn/button";
import { Dialog, DialogTrigger } from "@/components/shadcn/dialog";
import { ThemeProvider } from "@/components/shadcn/theme-provider";

export const AppContext = React.createContext<typeof webview>({ resetMainArea: () => undefined });

export function App() {
  const [mainAreaReloadTrigger, setMainAreaReloadTrigger] = React.useState(false);

  const appContext = { resetMainArea: () => setMainAreaReloadTrigger(!mainAreaReloadTrigger) };

  if (!import.meta.env.DEV) {
    (window as MarkWritable<typeof window, "webview">).webview = appContext;
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

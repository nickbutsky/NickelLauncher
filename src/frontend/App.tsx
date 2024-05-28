import { PlusIcon } from "@radix-ui/react-icons";
import * as React from "react";
import type { DeepReadonly, MarkWritable } from "ts-essentials";

import { InstanceCreationDialogContent } from "@/components/InstanceCreationDialogContent";
import { MainArea } from "@/components/MainArea";
import { Button } from "@/components/shadcn/button";
import { Dialog, DialogTrigger } from "@/components/shadcn/dialog";
import { ThemeProvider } from "@/components/shadcn/theme-provider";

export const AppContext = React.createContext<typeof webview>({
  resetMainArea: () => undefined,
});

declare global {
  interface Window extends DeepReadonly<{ webview: typeof webview }> {}

  const webview: DeepReadonly<{ resetMainArea: () => void }>;
}

export function App() {
  const [mainAreaKey, setMainAreaKey] = React.useState(crypto.randomUUID());

  const appContext = { resetMainArea: () => setMainAreaKey(crypto.randomUUID()) };

  if (!import.meta.env.DEV) {
    (window as MarkWritable<typeof window, "webview">).webview = appContext;
  }

  return (
    <ThemeProvider defaultTheme="dark">
      <AppContext.Provider value={appContext}>
        <MainArea key={mainAreaKey} />
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

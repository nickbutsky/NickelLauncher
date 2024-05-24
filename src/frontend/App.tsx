import { PlusIcon } from "@radix-ui/react-icons";
import * as React from "react";
import type { DeepReadonly } from "ts-essentials";

import { InstanceCreationDialogContent } from "@/components/InstanceCreationDialogContent";
import { MainArea } from "@/components/MainArea";
import { Button } from "@/components/shadcn/button";
import { Dialog, DialogTrigger } from "@/components/shadcn/dialog";
import { ThemeProvider } from "@/components/shadcn/theme-provider";

export const AppContext = React.createContext<DeepReadonly<{ resetMainArea: () => void }>>({
  resetMainArea: () => undefined,
});

export function App() {
  const [mainAreaKey, setMainAreaKey] = React.useState(crypto.randomUUID());

  return (
    <ThemeProvider defaultTheme="dark">
      <AppContext.Provider value={{ resetMainArea: () => setMainAreaKey(crypto.randomUUID()) }}>
        <MainArea key={mainAreaKey} />
      </AppContext.Provider>
      <Dialog>
        <DialogTrigger asChild={true}>
          <Button className="fixed right-0 bottom-0 mr-1 mb-1 rounded-full" size="icon">
            <PlusIcon />
          </Button>
        </DialogTrigger>
        <InstanceCreationDialogContent />
      </Dialog>
    </ThemeProvider>
  );
}

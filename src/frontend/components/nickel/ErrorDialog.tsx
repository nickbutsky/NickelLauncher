import * as React from "react";
import type { DeepReadonly } from "ts-essentials";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/shadcn/alert-dialog";
import { useTriggerEffect } from "@/utils";

export function ErrorDialog({ msg, trigger }: DeepReadonly<{ msg: string; trigger: boolean }>) {
  const [open, setOpen] = React.useState(false);

  useTriggerEffect(() => setOpen(true), trigger);

  return (
    <AlertDialog open={open} onOpenChange={() => setOpen(!open)}>
      <AlertDialogContent className="grid-cols-1">
        <AlertDialogHeader>
          <AlertDialogTitle>Error</AlertDialogTitle>
          <AlertDialogDescription className="break-words">{msg}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction>OK</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

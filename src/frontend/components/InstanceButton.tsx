import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as React from "react";
import type { DeepReadonly } from "ts-essentials";
import { z } from "zod";

import { AppContext } from "@/App";
import defaultLogo from "@/assets/default.png";
import { type API, exposeTemporaryFunction } from "@/bridge";
import { VersionSelector } from "@/components/VersionSelector";
import { EditableLabel } from "@/components/nickel/EditableLabel";
import { DialogFormField, FormDialogContent } from "@/components/nickel/FormDialogContent";
import { InputWithOptions } from "@/components/nickel/InputWithOptions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/shadcn/alert-dialog";
import { Button } from "@/components/shadcn/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/shadcn/context-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/shadcn/dialog";
import { FormControl, FormItem } from "@/components/shadcn/form";
import { Progress } from "@/components/shadcn/progress";
import type { Instance } from "@/core-types";
import { cn, useTrigger, useTriggerEffect } from "@/utils";

export const InstanceButton = React.forwardRef<
  React.ElementRef<typeof Button>,
  Omit<React.ComponentPropsWithoutRef<typeof Button>, "name"> & DeepReadonly<{ state: Instance }>
>(({ className, variant, state, ...props }, ref) => {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogContentId, setDialogContentId] = React.useState<"cg" | "cv" | "ci" | "li">("ci");
  const [errorMsg, setErrorMsg] = React.useState<string>("");

  const contextMenuContentRef = React.useRef<React.ElementRef<typeof ContextMenuContent>>(null);

  const appContext = React.useContext(AppContext);

  const [editableLabelTrigger, fireEditableLabelTrigger] = useTrigger();
  const [launchTrigger, fireLaunchTrigger] = useTrigger();
  const [errorDialogTrigger, fireErrorDialogTrigger] = useTrigger();

  const openDialog = React.useCallback((dialogContentId: "cg" | "cv" | "ci" | "li") => {
    setDialogContentId(dialogContentId);
    setDialogOpen(true);
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: False positive
  const launchInstance = React.useCallback(() => {
    openDialog("li");
    fireLaunchTrigger();
  }, []);

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild={true}>
          <Button
            className={cn("grid h-16 w-48 grid-cols-[max-content_1fr] gap-3", className)}
            ref={ref}
            variant="outline"
            onDoubleClick={launchInstance}
            onKeyUp={(event) => {
              if (event.key === "Enter") {
                launchInstance();
              } else if (event.key === "F2") {
                fireEditableLabelTrigger();
              }
            }}
            {...props}
          >
            <img src={defaultLogo} alt="Instance logo" width="32" height="32" />
            <div className="grid grid-rows-2 text-left">
              <EditableLabel
                editModeTrigger={editableLabelTrigger}
                defaultValue={state.name}
                maxLength={20}
                applyOnAboutToSave={(value) => value.trim()}
                isAllowedToSave={(value) => value.length > 0}
                onSave={(value) => pywebview.api.renameInstance(state.dirname, value)}
              />
              <div>{state.version.displayName}</div>
            </div>
          </Button>
        </ContextMenuTrigger>
        <ContextMenuContent ref={contextMenuContentRef}>
          <ContextMenuItem onSelect={launchInstance}>Launch</ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuRadioGroup
            value={state.architectureChoice}
            onValueChange={(value) =>
              pywebview.api.changeArchitectureChoice(state.dirname, value).then(appContext.refreshMainArea)
            }
          >
            {state.version.availableArchitectures.map((architecture) => (
              <ContextMenuRadioItem key={architecture} value={architecture}>
                {architecture}
              </ContextMenuRadioItem>
            ))}
          </ContextMenuRadioGroup>
          <ContextMenuSeparator />
          <ContextMenuItem
            onSelect={() =>
              contextMenuContentRef.current?.addEventListener("animationend", () =>
                setTimeout(fireEditableLabelTrigger),
              )
            }
          >
            Rename
            <ContextMenuShortcut>F2</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem onSelect={() => openDialog("cg")}>Change Group</ContextMenuItem>
          <ContextMenuItem onSelect={() => openDialog("cv")}>Change Version</ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onSelect={() => pywebview.api.openGameDirectory(state.dirname)}>
            Minecraft Folder
          </ContextMenuItem>
          <ContextMenuItem onSelect={() => pywebview.api.openInstanceDirectory(state.dirname)}>
            Instance Folder
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onSelect={() => openDialog("ci")}>Copy Instance</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <Dialog open={dialogOpen} onOpenChange={() => setDialogOpen(!dialogOpen)}>
        {
          {
            cg: <ChangeGroupDialogContent dirname={state.dirname} />,
            cv: (
              <ChangeVersionDialogContent
                dirname={state.dirname}
                currentVersionDisplayName={state.version.displayName}
              />
            ),
            ci: <CopyInstanceDialogContent dirname={state.dirname} />,
            li: (
              <LaunchDialogContent
                dirname={state.dirname}
                trigger={launchTrigger}
                onFail={(errorMsg) => {
                  setErrorMsg(errorMsg);
                  fireErrorDialogTrigger();
                }}
              />
            ),
          }[dialogContentId]
        }
      </Dialog>
      <ErrorDialog msg={errorMsg} trigger={errorDialogTrigger} />
    </>
  );
});

function ChangeGroupDialogContent({ dirname }: DeepReadonly<{ dirname: string }>) {
  const appContext = React.useContext(AppContext);

  return (
    <FormDialogContent
      title="Change group"
      submitText="Change"
      schema={z.object({ groupName: z.string() })}
      defaultValues={{
        groupName:
          appContext.instanceGroups.find((group) => group.instances.find((instance) => instance.dirname === dirname))
            ?.name ?? "",
      }}
      onSubmitBeforeClose={(data) =>
        pywebview.api.moveInstances(Number.MAX_SAFE_INTEGER, data.groupName.trim(), [dirname])
      }
      onSubmitAfterClose={appContext.refreshMainArea}
    >
      <DialogFormField
        name="groupName"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <InputWithOptions
                placeholder="Group name"
                maxLength={50}
                options={appContext.instanceGroups.map((group) => group.name).filter((name) => name !== "")}
                {...field}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </FormDialogContent>
  );
}

function ChangeVersionDialogContent({
  dirname,
  currentVersionDisplayName,
}: DeepReadonly<{
  dirname: string;
  currentVersionDisplayName: string;
}>) {
  const appContext = React.useContext(AppContext);

  return (
    <FormDialogContent
      title="Change Version"
      submitText="Change"
      schema={z.object({ versionDisplayName: z.string() })}
      defaultValues={{
        versionDisplayName: currentVersionDisplayName,
      }}
      onSubmitBeforeClose={(data) =>
        pywebview.api.changeVersion(dirname, data.versionDisplayName).then(appContext.refreshMainArea)
      }
    >
      <DialogFormField
        name="versionDisplayName"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <VersionSelector
                className="h-72"
                versionsByType={appContext.versionsByType}
                onRefreshRequest={() => appContext.reloadVersionsByType(true)}
                defaultDisplayName={field.value}
                onDisplayNameChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </FormDialogContent>
  );
}

function CopyInstanceDialogContent({ dirname }: DeepReadonly<{ dirname: string }>) {
  const dialogContentRef = React.useRef<React.ElementRef<typeof DialogContent>>(null);

  const appContext = React.useContext(AppContext);

  // biome-ignore lint/correctness/useExhaustiveDependencies: False positive
  const copyInstance = React.useCallback(
    (copyWorlds: boolean) =>
      pywebview.api
        .copyInstance(dirname, copyWorlds)
        .then(() => dialogContentRef.current?.addEventListener("animationend", appContext.refreshMainArea)),
    [dirname],
  );

  return (
    <DialogContent ref={dialogContentRef}>
      <DialogHeader>
        <DialogTitle>Do you want to copy your worlds?</DialogTitle>
      </DialogHeader>
      <DialogFooter className="gap-y-1.5">
        <DialogClose onClick={() => copyInstance(true)} asChild={true}>
          <Button type="submit">Yes</Button>
        </DialogClose>
        <DialogClose onClick={() => copyInstance(false)} asChild={true}>
          <Button type="submit">No</Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
}

function LaunchDialogContent({
  dirname,
  trigger,
  onFail,
}: DeepReadonly<{ dirname: string; trigger: boolean; onFail: (errorMsg: string) => void }>) {
  const [report, setReport] = React.useState<Parameters<API["temporary"]["propelLaunchReport"]>[0]>(null);
  const [cancelling, setCancelling] = React.useState(false);

  const launchID = React.useRef(crypto.randomUUID());

  const hiddenCloseButtonRef = React.useRef<React.ElementRef<typeof DialogClose>>(null);

  useTriggerEffect(
    () => {
      if (import.meta.env.DEV) {
        return;
      }
      exposeTemporaryFunction(
        "propelLaunchReport",
        (report) => setReport(report),
        () =>
          pywebview.api
            .launchInstance(dirname, launchID.current)
            .catch((reason: Error) => onFail(reason.message))
            .finally(() => {
              hiddenCloseButtonRef.current?.click();
              launchID.current = crypto.randomUUID();
              setCancelling(false);
            }),
      );
    },
    trigger,
    true,
  );

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        className={cn(
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] fixed top-[50%] left-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=closed]:animate-out data-[state=open]:animate-in sm:rounded-lg",
        )}
        onPointerDownOutside={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
      >
        <div className="flex">
          <div>{report?.text}</div>
          <div className="flex-1" />
          {report?.details && (
            <div>{`${report?.details?.processed.toFixed(1)}/${report?.details?.totalsize.toFixed(1)} ${
              report?.details?.unit
            }`}</div>
          )}
        </div>
        <Progress value={report?.details?.processed} max={report?.details?.totalsize} />
        <DialogClose ref={hiddenCloseButtonRef} hidden={true} />
        <Button
          variant="secondary"
          disabled={cancelling}
          onClick={() => {
            setCancelling(true);
            pywebview.api.cancelInstanceLaunch(launchID.current);
          }}
        >
          Abort
        </Button>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function ErrorDialog({ msg, trigger }: DeepReadonly<{ msg: string; trigger: boolean }>) {
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

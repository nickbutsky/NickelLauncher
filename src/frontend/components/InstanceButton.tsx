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
  React.useImperativeHandle(ref, () => buttonRef.current as Exclude<typeof buttonRef.current, null>);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogContentId, setDialogContentId] = React.useState<"cg" | "cv" | "ci" | "li">("ci");
  const [errorMsg, setErrorMsg] = React.useState<string>("");

  const buttonRef = React.useRef<React.ElementRef<typeof Button>>(null);
  const contextMenuContentRef = React.useRef<React.ElementRef<typeof ContextMenuContent>>(null);

  const appContext = React.useContext(AppContext);

  const [editableLabelTrigger, fireEditableLabelTrigger] = useTrigger();
  const [launchTrigger, fireLaunchTrigger] = useTrigger();
  const [errorDialogTrigger, fireErrorDialogTrigger] = useTrigger();

  useTriggerEffect(
    () => {
      if (appContext.instanceDirnameToScrollTo !== state.dirname || !buttonRef.current) {
        return;
      }
      const scrollMarginTop = buttonRef.current.style.scrollMarginTop;
      const scrollMarginBottom = buttonRef.current.style.scrollMarginBottom;
      buttonRef.current.style.scrollMarginTop = "40px";
      buttonRef.current.style.scrollMarginBottom = "25px";
      buttonRef.current.scrollIntoView({ block: "nearest" });
      buttonRef.current.style.scrollMarginTop = scrollMarginTop;
      buttonRef.current.style.scrollMarginBottom = scrollMarginBottom;
    },
    appContext.scrollTrigger,
    true,
  );

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
            ref={buttonRef}
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
              contextMenuContentRef.current?.addEventListener(
                "animationend",
                () => setTimeout(fireEditableLabelTrigger),
                { once: true },
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
  const [copying, setCopying] = React.useState(false);

  const dialogContentRef = React.useRef<React.ElementRef<typeof DialogContent>>(null);
  const hiddenCloseButtonRef = React.useRef<React.ElementRef<typeof DialogClose>>(null);

  const appContext = React.useContext(AppContext);

  // biome-ignore lint/correctness/useExhaustiveDependencies: False positive
  const copyInstance = React.useCallback(
    (copyWorlds: boolean) => {
      setCopying(true);
      pywebview.api.copyInstance(dirname, copyWorlds).then(() => {
        dialogContentRef.current?.addEventListener(
          "animationend",
          () => {
            appContext.refreshMainArea();
            setCopying(false);
          },
          { once: true },
        );
        hiddenCloseButtonRef.current?.click();
      });
    },
    [dirname],
  );

  return (
    <DialogContent ref={dialogContentRef} closeable={!copying}>
      <DialogHeader>
        <DialogTitle>Do you want to copy your worlds?</DialogTitle>
      </DialogHeader>
      <DialogClose ref={hiddenCloseButtonRef} hidden={true} />
      <DialogFooter className="gap-y-1.5">
        <Button type="submit" onClick={() => copyInstance(true)} disabled={copying}>
          Yes
        </Button>
        <Button type="submit" onClick={() => copyInstance(false)} disabled={copying}>
          No
        </Button>
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
    <DialogContent closeable={false}>
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
    </DialogContent>
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

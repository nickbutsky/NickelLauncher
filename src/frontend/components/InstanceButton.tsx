import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as React from "react";
import type { DeepReadonly } from "ts-essentials";
import { z } from "zod";

import { AppContext } from "@/App";
import defaultLogo from "@/assets/default.png";
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
  DialogTrigger,
} from "@/components/shadcn/dialog";
import { FormControl, FormItem } from "@/components/shadcn/form";
import { Progress } from "@/components/shadcn/progress";
import type { Instance } from "@/core-types";
import { cn, useIsFirstRender, useTrigger } from "@/utils";

export const InstanceButton = React.forwardRef<
  React.ElementRef<typeof Button>,
  Omit<React.ComponentPropsWithoutRef<typeof Button>, "name"> & DeepReadonly<{ initialState: Instance }>
>(({ className, variant, initialState, ...props }, ref) => {
  const [dialogContentId, setDialogContentId] = React.useState<"cg" | "cv" | "ci" | "li">("ci");
  const [architectureChoice, setArchitectureChoice] = React.useState(initialState.architectureChoice);
  const [versionDisplayName, setVersionDisplayName] = React.useState(initialState.version.displayName);
  const [errorMsg, setErrorMsg] = React.useState<string>("");

  const contextMenuContentRef = React.useRef<React.ElementRef<typeof ContextMenuContent>>(null);

  const [editableLabelTrigger, fireEditableLabelTrigger] = useTrigger();
  const [launchTrigger, fireLaunchTrigger] = useTrigger();
  const [errorDialogTrigger, fireErrorDialogTrigger] = useTrigger();

  return (
    <>
      <Dialog>
        <ContextMenu>
          <ContextMenuTrigger asChild={true}>
            <Button
              className={cn("grid h-16 w-48 grid-cols-[max-content_1fr] gap-3", className)}
              ref={ref}
              variant="outline"
              {...props}
            >
              <img src={defaultLogo} alt="Instance logo" width="32" height="32" />
              <div className="grid grid-rows-2 text-left">
                <EditableLabel
                  editModeTrigger={editableLabelTrigger}
                  defaultValue={initialState.name}
                  maxLength={20}
                  applyOnAboutToSave={(value) => value.trim()}
                  isAllowedToSave={(value) => value.length > 0}
                  onSave={(value) => pywebview.api.renameInstance(initialState.dirname, value)}
                />
                <div>{versionDisplayName}</div>
              </div>
            </Button>
          </ContextMenuTrigger>
          <ContextMenuContent ref={contextMenuContentRef}>
            <DialogTrigger
              onSelect={() => {
                setDialogContentId("li");
                fireLaunchTrigger();
              }}
              asChild={true}
            >
              <ContextMenuItem>Launch</ContextMenuItem>
            </DialogTrigger>
            <ContextMenuSeparator />
            <ContextMenuRadioGroup
              value={architectureChoice}
              onValueChange={(value) =>
                pywebview.api
                  .changeArchitectureChoice(initialState.dirname, value)
                  .then(() => setArchitectureChoice(value))
              }
            >
              {initialState.version.availableArchitectures.map((architecture) => (
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
            <DialogTrigger onSelect={() => setDialogContentId("cg")} asChild={true}>
              <ContextMenuItem>Change Group</ContextMenuItem>
            </DialogTrigger>
            <DialogTrigger onSelect={() => setDialogContentId("cv")} asChild={true}>
              <ContextMenuItem>Change Version</ContextMenuItem>
            </DialogTrigger>
            <ContextMenuSeparator />
            <ContextMenuItem onSelect={() => pywebview.api.openGameDirectory(initialState.dirname)}>
              Minecraft Folder
            </ContextMenuItem>
            <ContextMenuItem onSelect={() => pywebview.api.openInstanceDirectory(initialState.dirname)}>
              Instance Folder
            </ContextMenuItem>
            <ContextMenuSeparator />
            <DialogTrigger onSelect={() => setDialogContentId("ci")} asChild={true}>
              <ContextMenuItem>Copy Instance</ContextMenuItem>
            </DialogTrigger>
          </ContextMenuContent>
          {
            {
              cg: <ChangeGroupDialogContent dirname={initialState.dirname} />,
              cv: (
                <ChangeVersionDialogContent
                  dirname={initialState.dirname}
                  currentVersionDisplayName={initialState.version.displayName}
                  onSubmit={setVersionDisplayName}
                />
              ),
              ci: <CopyInstanceDialogContent dirname={initialState.dirname} />,
              li: (
                <LaunchDialogContent
                  dirname={initialState.dirname}
                  trigger={launchTrigger}
                  onFail={(errorMsg) => {
                    setErrorMsg(errorMsg);
                    fireErrorDialogTrigger();
                  }}
                />
              ),
            }[dialogContentId]
          }
        </ContextMenu>
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
      onSubmitAfterClose={() => appContext.reloadMainArea()}
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
  onSubmit,
}: DeepReadonly<{
  dirname: string;
  currentVersionDisplayName: string;
  onSubmit: (versionDisplayName: string) => void;
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
        pywebview.api.changeVersion(dirname, data.versionDisplayName).then(() => onSubmit(data.versionDisplayName))
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
        .then(() => dialogContentRef.current?.addEventListener("animationend", appContext.reloadMainArea)),
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
  const [report, setReport] = React.useState<Parameters<typeof webview.propelLaunchReport>[0]>(null);

  const buttonRef = React.useRef<React.ElementRef<typeof Button>>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: False positive
  React.useEffect(() => {
    if (import.meta.env.DEV) {
      return;
    }
    webview.propelLaunchReport = (report) => setReport(report);
    pywebview.api
      .launchInstance(dirname)
      .catch((reason: Error) => onFail(reason.message))
      .finally(() => {
        webview.propelLaunchReport = () => undefined;
        buttonRef.current?.click();
      });
  }, [trigger]);

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
        <DialogClose asChild={true}>
          <Button ref={buttonRef} variant="secondary">
            Abort
          </Button>
        </DialogClose>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function ErrorDialog({ msg, trigger }: DeepReadonly<{ msg: string; trigger: boolean }>) {
  const [open, setOpen] = React.useState(false);

  const firstRender = useIsFirstRender();
  // biome-ignore lint/correctness/useExhaustiveDependencies: False positive
  React.useEffect(() => {
    if (!firstRender) {
      setOpen(true);
    }
  }, [trigger]);

  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="grid-cols-1">
        <AlertDialogHeader>
          <AlertDialogTitle>Error</AlertDialogTitle>
          <AlertDialogDescription className="break-words">{msg}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => setOpen(false)}>OK</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

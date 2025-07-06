import { AppContext } from "@/app-context";
import defaultLogo from "@/assets/default.png";
import { type Api, exposeTemporaryFunction } from "@/bridge";
import { EditableLabel } from "@/components/nickel/editable-label";
import { InputWithOptions } from "@/components/nickel/input-with-options";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/shadcn-modified/dialog";
import { Progress } from "@/components/shadcn-modified/progress";
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
import { Form, FormControl, FormField, FormItem } from "@/components/shadcn/form";
import { VersionSelector } from "@/components/version-selector";
import type { Instance } from "@/core-types";
import { useStore } from "@/store";
import { cn, useArkTypeForm } from "@/utils";
import { type } from "arktype";
import { RotateCw } from "lucide-react";
import {
	type ComponentProps,
	type ComponentRef,
	use,
	useCallback,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";

export function InstanceButton({
	className,
	ref,
	state,
	variant,
	onDoubleClick,
	onKeyUp,
	...props
}: Omit<ComponentProps<typeof Button>, "name"> & { readonly state: Instance }) {
	useImperativeHandle(ref, () => buttonRef.current ?? new HTMLButtonElement());

	const { reloadInstanceGroups, instanceDirnameToScrollTo } = useStore(
		"reloadInstanceGroups",
		"instanceDirnameToScrollTo",
	);

	const [dialogContentId, setDialogContentId] = useState<"cg" | "cv" | "ci" | "li">();
	const [editableLabelEditing, setEditableLabelEditing] = useState(false);

	const buttonRef = useRef<ComponentRef<typeof Button>>(null);
	const contextMenuContentRef = useRef<ComponentRef<typeof ContextMenuContent>>(null);

	useEffect(() => {
		if (instanceDirnameToScrollTo !== state.dirname || !buttonRef.current) {
			return;
		}
		const scrollMarginTop = buttonRef.current.style.scrollMarginTop;
		const scrollMarginBottom = buttonRef.current.style.scrollMarginBottom;
		buttonRef.current.style.scrollMarginTop = "40px";
		buttonRef.current.style.scrollMarginBottom = "25px";
		buttonRef.current.scrollIntoView({ block: "nearest" });
		buttonRef.current.style.scrollMarginTop = scrollMarginTop;
		buttonRef.current.style.scrollMarginBottom = scrollMarginBottom;
	}, [instanceDirnameToScrollTo, state.dirname]);

	return (
		<>
			<ContextMenu>
				<ContextMenuTrigger asChild={true}>
					<Button
						className={cn("grid h-16 w-48 grid-cols-[max-content_1fr] gap-3", className)}
						ref={buttonRef}
						variant="outline"
						onDoubleClick={() => setDialogContentId("li")}
						onKeyUp={(event) => {
							if (editableLabelEditing) {
								return;
							}
							if (event.key === "Enter") {
								setDialogContentId("li");
							} else if (event.key === "F2") {
								setEditableLabelEditing(true);
							}
						}}
						{...props}
					>
						<picture>
							<img src={defaultLogo} alt="Instance logo" width="32" height="32" />
						</picture>
						<div className="grid grid-rows-2 text-left">
							<EditableLabel
								editing={editableLabelEditing}
								value={state.name}
								maxLength={20}
								onNoValueChange={() => setEditableLabelEditing(false)}
								onBeforeValueChange={(value) => value.trim()}
								isAllowedValueChange={(value) => value.length > 0}
								onValueChange={async (value) => {
									await pywebview.api.renameInstance(state.dirname, value);
									await reloadInstanceGroups();
									setEditableLabelEditing(false);
								}}
							/>
							<div>
								{state.version.displayName}
								{state.architectureChoice === "x64" ? "" : ` ${state.architectureChoice}`}
							</div>
						</div>
					</Button>
				</ContextMenuTrigger>
				<ContextMenuContent ref={contextMenuContentRef}>
					<ContextMenuItem onSelect={() => setDialogContentId("li")}>Launch</ContextMenuItem>
					<ContextMenuSeparator />
					<ContextMenuRadioGroup
						value={state.architectureChoice}
						onValueChange={async (value) => {
							await pywebview.api.changeArchitectureChoice(state.dirname, value);
							reloadInstanceGroups();
						}}
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
								() => setTimeout(() => setEditableLabelEditing(true)),
								{ once: true },
							)
						}
					>
						Rename
						<ContextMenuShortcut>F2</ContextMenuShortcut>
					</ContextMenuItem>
					<ContextMenuItem onSelect={() => setDialogContentId("cg")}>Change Group</ContextMenuItem>
					<ContextMenuItem onSelect={() => setDialogContentId("cv")}>Change Version</ContextMenuItem>
					<ContextMenuSeparator />
					<ContextMenuItem onSelect={() => pywebview.api.openGameDirectory(state.dirname)}>
						Minecraft Folder
					</ContextMenuItem>
					<ContextMenuItem onSelect={() => pywebview.api.openInstanceDirectory(state.dirname)}>
						Instance Folder
					</ContextMenuItem>
					<ContextMenuSeparator />
					<ContextMenuItem onSelect={() => setDialogContentId("ci")}>Copy Instance</ContextMenuItem>
				</ContextMenuContent>
			</ContextMenu>
			<ChangeGroupDialog
				open={dialogContentId === "cg"}
				onOpenChange={(open) => open || setDialogContentId(undefined)}
				dirname={state.dirname}
			/>
			<ChangeVersionDialog
				open={dialogContentId === "cv"}
				onOpenChange={(open) => open || setDialogContentId(undefined)}
				dirname={state.dirname}
				currentVersionDisplayName={state.version.displayName}
			/>
			<CopyInstanceDialog
				open={dialogContentId === "ci"}
				onOpenChange={(open) => open || setDialogContentId(undefined)}
				dirname={state.dirname}
			/>
			<LaunchDialog
				open={dialogContentId === "li"}
				onOpenChange={(open) => open || setDialogContentId(undefined)}
				dirname={state.dirname}
			/>
		</>
	);
}

function ChangeGroupDialog({
	onOpenChange,
	dirname,
	...props
}: ComponentProps<typeof Dialog> & { readonly dirname: string }) {
	const { instanceGroups, reloadInstanceGroups } = useStore("instanceGroups", "reloadInstanceGroups");
	const dialogContentRef = useRef<ComponentRef<typeof DialogContent>>(null);
	const arkTypeForm = useArkTypeForm(type({ groupName: "string" }), {
		groupName:
			instanceGroups.find((group) => group.instances.find((instance) => instance.dirname === dirname))?.name ?? "",
	});
	return (
		<Dialog
			onOpenChange={(open) => {
				if (!open) {
					arkTypeForm.reset(arkTypeForm.control._defaultValues);
				}
				onOpenChange?.(open);
			}}
			{...props}
		>
			<DialogContent ref={dialogContentRef}>
				<DialogHeader>
					<DialogTitle>Change group</DialogTitle>
					<DialogDescription className="hidden" />
				</DialogHeader>
				<Form {...arkTypeForm}>
					<form
						className="space-y-4"
						onSubmit={arkTypeForm.handleSubmit(async (data) => {
							await pywebview.api.moveInstances(Number.MAX_SAFE_INTEGER, data.groupName.trim(), [dirname]);
							dialogContentRef.current?.addEventListener("animationend", reloadInstanceGroups, { once: true });
							onOpenChange?.(false);
						})}
					>
						<FormField
							control={arkTypeForm.control}
							name="groupName"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<InputWithOptions
											placeholder="Group name"
											maxLength={50}
											options={instanceGroups.map((group) => group.name).filter((name) => name !== "")}
											{...field}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
						<DialogFooter>
							<Button>Change</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

function ChangeVersionDialog({
	onOpenChange,
	dirname,
	currentVersionDisplayName,
	...props
}: ComponentProps<typeof Dialog> & { readonly dirname: string; readonly currentVersionDisplayName: string }) {
	const { versionTypeToVersions, reloadVersionTypeToVersions, reloadInstanceGroups } = useStore(
		"versionTypeToVersions",
		"reloadVersionTypeToVersions",
		"reloadInstanceGroups",
	);
	const arkTypeForm = useArkTypeForm(type({ versionDisplayName: "string" }), {
		versionDisplayName: currentVersionDisplayName,
	});
	return (
		<Dialog
			onOpenChange={(open) => {
				if (!open) {
					arkTypeForm.reset(arkTypeForm.control._defaultValues);
				}
				onOpenChange?.(open);
			}}
			{...props}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Change Version</DialogTitle>
					<DialogDescription className="hidden" />
				</DialogHeader>
				<Form {...arkTypeForm}>
					<form
						className="space-y-4"
						onSubmit={arkTypeForm.handleSubmit(async (data) => {
							await pywebview.api.changeVersion(dirname, data.versionDisplayName);
							reloadInstanceGroups();
							onOpenChange?.(false);
						})}
					>
						<FormField
							control={arkTypeForm.control}
							name="versionDisplayName"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<VersionSelector
											className="h-72"
											versionTypeToVersions={versionTypeToVersions}
											onRefreshRequest={async () => reloadVersionTypeToVersions(true)}
											defaultDisplayName={field.value}
											onDisplayNameChange={field.onChange}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
						<DialogFooter>
							<Button>Change</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

function CopyInstanceDialog({
	onOpenChange,
	dirname,
	...props
}: ComponentProps<typeof Dialog> & { readonly dirname: string }) {
	const { reloadInstanceGroups } = useStore("reloadInstanceGroups");

	const [copying, setCopying] = useState<"w" | "nw">();

	const dialogContentRef = useRef<ComponentRef<typeof DialogContent>>(null);

	const copyInstance = useCallback(
		async (copyWorlds: boolean) => {
			setCopying(copyWorlds ? "w" : "nw");
			await pywebview.api.copyInstance(dirname, copyWorlds);
			reloadInstanceGroups();
			setCopying(undefined);
			onOpenChange?.(false);
		},
		[onOpenChange, dirname, reloadInstanceGroups],
	);

	return (
		<Dialog onOpenChange={onOpenChange} {...props}>
			<DialogContent ref={dialogContentRef} closeable={!copying}>
				<DialogHeader>
					<DialogTitle>Do you want to copy your worlds?</DialogTitle>
					<DialogDescription className="hidden" />
				</DialogHeader>
				<DialogFooter className="gap-y-1.5">
					<Button type="submit" onClick={() => copyInstance(true)} disabled={!!copying}>
						{copying === "w" ? <RotateCw className="animate-spin" /> : "Yes"}
					</Button>
					<Button type="submit" onClick={() => copyInstance(false)} disabled={!!copying}>
						{copying === "nw" ? <RotateCw className="animate-spin" /> : "No"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function LaunchDialog({
	open,
	onOpenChange,
	dirname,
	...props
}: ComponentProps<typeof Dialog> & { readonly dirname: string }) {
	const { showErrorDialog } = use(AppContext);

	const [report, setReport] = useState<Parameters<Api["temporary"]["propelLaunchReport"]>[0]>(null);
	const [cancelling, setCancelling] = useState(false);

	useEffect(() => {
		if (import.meta.env.DEV || !open) {
			return;
		}
		exposeTemporaryFunction(
			"propelLaunchReport",
			(report) => setReport(report),
			async () => {
				try {
					await pywebview.api.launchInstance(dirname);
				} catch (error) {
					if (error instanceof Error) {
						showErrorDialog(error.message);
					} else {
						throw error;
					}
				} finally {
					onOpenChange?.(false);
					setCancelling(false);
				}
			},
		);
	}, [open, onOpenChange, dirname, showErrorDialog]);

	return (
		<>
			<Dialog open={open} onOpenChange={onOpenChange} {...props}>
				<DialogContent closeable={false}>
					<DialogHeader className="hidden">
						<DialogTitle />
						<DialogDescription />
					</DialogHeader>
					<div className="flex">
						<div>{report?.text}</div>
						<div className="flex-1" />
						{report?.progress && (
							<div>{`${report.progress.processed.toFixed(1)}/${report.progress.totalsize.toFixed(1)} ${
								report.progress.unit
							}`}</div>
						)}
					</div>
					{report?.progress ? (
						<Progress value={report.progress.processed} max={report.progress.totalsize} />
					) : (
						<div className="h-2 w-full overflow-hidden rounded-full bg-primary/20">
							<div className="progress h-full w-full bg-primary" />
						</div>
					)}
					<Button
						variant="secondary"
						disabled={cancelling}
						onClick={() => {
							setCancelling(true);
							pywebview.api.cancelInstanceLaunch();
						}}
					>
						Abort
					</Button>
				</DialogContent>
			</Dialog>
			<style>
				{`
					.progress {
						animation: progress 1s infinite linear;
						transform-origin: 0% 50%;
					}

					@keyframes progress {
						0% {
							transform: translateX(0) scaleX(0);
						}
						40% {
							transform: translateX(0) scaleX(0.4);
						}
						100% {
							transform: translateX(100%) scaleX(0.5);
						}
					}
				`}
			</style>
		</>
	);
}

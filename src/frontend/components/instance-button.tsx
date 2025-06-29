import { AppContext } from "@/app-context";
import defaultLogo from "@/assets/default.png";
import { type API, exposeTemporaryFunction } from "@/bridge";
import { EditableLabel } from "@/components/nickel/editable-label";
import { FormDialogContent } from "@/components/nickel/form-dialog-content";
import { InputWithOptions } from "@/components/nickel/input-with-options";
import {
	Dialog,
	DialogClose,
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
import { FormControl, FormField, FormItem } from "@/components/shadcn/form";
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

	const [dialogOpen, setDialogOpen] = useState(false);
	const [dialogContentId, setDialogContentId] = useState<"cg" | "cv" | "ci" | "li">();
	const [editableLabelEditing, setEditableLabelEditing] = useState(false);

	const buttonRef = useRef<ComponentRef<typeof Button>>(null);
	const contextMenuContentRef = useRef<ComponentRef<typeof ContextMenuContent>>(null);

	const { instanceDirnameToScrollTo } = use(AppContext);

	const { reloadInstanceGroups } = useStore("reloadInstanceGroups");

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

	const openDialog = useCallback((dialogContentId: "cg" | "cv" | "ci" | "li") => {
		setDialogContentId(dialogContentId);
		setDialogOpen(true);
	}, []);

	const launchInstance = useCallback(() => {
		openDialog("li");
	}, [openDialog]);

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
								onEditingChange={setEditableLabelEditing}
								value={state.name}
								maxLength={20}
								onBeforeValueChange={(value) => value.trim()}
								isAllowedValueChange={(value) => value.length > 0}
								onValueChange={(value) => pywebview.api.renameInstance(state.dirname, value)}
							/>
							<div>
								{state.version.displayName}
								{state.architectureChoice === "x64" ? "" : ` ${state.architectureChoice}`}
							</div>
						</div>
					</Button>
				</ContextMenuTrigger>
				<ContextMenuContent ref={contextMenuContentRef}>
					<ContextMenuItem onSelect={launchInstance}>Launch</ContextMenuItem>
					<ContextMenuSeparator />
					<ContextMenuRadioGroup
						value={state.architectureChoice}
						onValueChange={(value) =>
							pywebview.api.changeArchitectureChoice(state.dirname, value).then(reloadInstanceGroups)
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
								() => setTimeout(() => setEditableLabelEditing(true)),
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
			<Dialog
				open={dialogOpen}
				onOpenChange={(open) => {
					setDialogOpen(open);
					if (!open) {
						setDialogContentId(undefined);
					}
				}}
			>
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
						li: <LaunchDialogContent dirname={state.dirname} />,
					}[String(dialogContentId)]
				}
			</Dialog>
		</>
	);
}

function ChangeGroupDialogContent({ dirname }: { readonly dirname: string }) {
	const { instanceGroups, reloadInstanceGroups } = useStore("instanceGroups", "reloadInstanceGroups");

	const arkTypeForm = useArkTypeForm(type({ groupName: "string" }), {
		groupName:
			instanceGroups.find((group) => group.instances.find((instance) => instance.dirname === dirname))?.name ?? "",
	});

	return (
		<FormDialogContent
			title="Change group"
			submitText="Change"
			form={arkTypeForm}
			onSubmitBeforeClose={(data) =>
				pywebview.api.moveInstances(Number.MAX_SAFE_INTEGER, data.groupName.trim(), [dirname])
			}
			onSubmitAfterClose={reloadInstanceGroups}
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
		</FormDialogContent>
	);
}

function ChangeVersionDialogContent({
	dirname,
	currentVersionDisplayName,
}: { readonly dirname: string; readonly currentVersionDisplayName: string }) {
	const { versionTypeToVersions, reloadVersionTypeToVersions, reloadInstanceGroups } = useStore(
		"versionTypeToVersions",
		"reloadVersionTypeToVersions",
		"reloadInstanceGroups",
	);

	const arkTypeForm = useArkTypeForm(type({ versionDisplayName: "string" }), {
		versionDisplayName: currentVersionDisplayName,
	});

	return (
		<FormDialogContent
			title="Change Version"
			submitText="Change"
			form={arkTypeForm}
			onSubmitBeforeClose={(data) =>
				pywebview.api.changeVersion(dirname, data.versionDisplayName).then(reloadInstanceGroups)
			}
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
		</FormDialogContent>
	);
}

function CopyInstanceDialogContent({ dirname }: { readonly dirname: string }) {
	const [copying, setCopying] = useState<"w" | "nw" | undefined>(undefined);

	const dialogContentRef = useRef<ComponentRef<typeof DialogContent>>(null);
	const hiddenCloseButtonRef = useRef<ComponentRef<typeof DialogClose>>(null);

	const { reloadInstanceGroups } = useStore("reloadInstanceGroups");

	const copyInstance = useCallback(
		(copyWorlds: boolean) => {
			setCopying(copyWorlds ? "w" : "nw");
			pywebview.api.copyInstance(dirname, copyWorlds).then(() => {
				dialogContentRef.current?.addEventListener(
					"animationend",
					() => {
						reloadInstanceGroups();
						setCopying(undefined);
					},
					{ once: true },
				);
				hiddenCloseButtonRef.current?.click();
			});
		},
		[dirname, reloadInstanceGroups],
	);

	return (
		<DialogContent ref={dialogContentRef} closeable={!copying}>
			<DialogHeader>
				<DialogTitle>Do you want to copy your worlds?</DialogTitle>
				<DialogDescription className="hidden" />
			</DialogHeader>
			<DialogClose ref={hiddenCloseButtonRef} hidden={true} />
			<DialogFooter className="gap-y-1.5">
				<Button type="submit" onClick={() => copyInstance(true)} disabled={!!copying}>
					{copying === "w" ? <RotateCw className="animate-spin" /> : "Yes"}
				</Button>
				<Button type="submit" onClick={() => copyInstance(false)} disabled={!!copying}>
					{copying === "nw" ? <RotateCw className="animate-spin" /> : "No"}
				</Button>
			</DialogFooter>
		</DialogContent>
	);
}

function LaunchDialogContent({ dirname }: { readonly dirname: string }) {
	const [report, setReport] = useState<Parameters<API["temporary"]["propelLaunchReport"]>[0]>(null);
	const [cancelling, setCancelling] = useState(false);

	const hiddenCloseButtonRef = useRef<ComponentRef<typeof DialogClose>>(null);

	const { showErrorDialog } = use(AppContext);

	useEffect(() => {
		if (import.meta.env.DEV) {
			return;
		}
		exposeTemporaryFunction(
			"propelLaunchReport",
			(report) => setReport(report),
			() =>
				pywebview.api
					.launchInstance(dirname)
					.catch((reason: Error) => showErrorDialog(reason.message))
					.finally(() => {
						hiddenCloseButtonRef.current?.click();
						setCancelling(false);
					}),
		);
	}, [dirname, showErrorDialog]);

	return (
		<>
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
				<DialogClose ref={hiddenCloseButtonRef} hidden={true} />
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

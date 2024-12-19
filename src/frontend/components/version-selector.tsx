import { UpdateIcon } from "@radix-ui/react-icons";
import { type ComponentProps, type ComponentRef, useEffect, useRef, useState } from "react";

import { ScrollArea } from "@/components/shadcn-modified/scroll-area";
import { Button } from "@/components/shadcn/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shadcn/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/shadcn/toggle-group";
import { type Version, type VersionTypeToVersions, versionTypes } from "@/core-types";
import { cn } from "@/utils";

export function VersionSelector({
	className,
	versionTypeToVersions,
	onRefreshRequest,
	defaultDisplayName,
	onDisplayNameChange,
	defaultValue,
	...props
}: ComponentProps<typeof Tabs> & {
	readonly versionTypeToVersions: VersionTypeToVersions;
	readonly onRefreshRequest: () => Promise<void>;
	readonly defaultDisplayName?: string;
	readonly onDisplayNameChange?: (displayName: string) => void;
}) {
	return (
		<Tabs
			className={cn("flex flex-col", className)}
			defaultValue={
				versionTypes.find((versionType) =>
					versionTypeToVersions[versionType].find((version) => version.displayName === defaultDisplayName),
				) ?? versionTypes[0]
			}
			{...props}
		>
			<TopBar onRefreshRequest={onRefreshRequest} />
			{versionTypes.map((versionType) => (
				<TabsContent
					className="flex-1 data-[state=inactive]:hidden"
					tabIndex={-1}
					key={versionType}
					value={versionType}
					forceMount={true}
					asChild={true}
				>
					<InnerVersionSelector
						versions={versionTypeToVersions[versionType]}
						defaultDisplayName={defaultDisplayName}
						onDisplayNameChange={onDisplayNameChange}
					/>
				</TabsContent>
			))}
		</Tabs>
	);
}

function TopBar({
	variant = "cl",
	onRefreshRequest,
}: { readonly variant?: "lr" | "rl" | "cr" | "cl" } & Pick<
	ComponentProps<typeof VersionSelector>,
	"onRefreshRequest"
>) {
	const [refreshing, setRefreshing] = useState(false);

	const versionTypeSelector = (
		<TabsList className="grid grid-cols-3 bg-transparent">
			{versionTypes.map((versionType) => (
				<TabsTrigger key={versionType} value={versionType}>
					{versionType.charAt(0).toUpperCase() + versionType.slice(1)}
				</TabsTrigger>
			))}
		</TabsList>
	);

	const refreshButton = (
		<Button
			className={{ lr: "", rl: "", cr: "ml-auto", cl: "mr-auto" }[variant]}
			type="button"
			size="icon"
			variant="link"
			disabled={refreshing}
			onClick={async () => {
				setRefreshing(true);
				await onRefreshRequest();
				setRefreshing(false);
			}}
		>
			<UpdateIcon className={cn(refreshing && "animate-spin")} />
		</Button>
	);

	return (
		<div
			className={
				{
					lr: "flex justify-between",
					rl: "flex justify-between",
					cr: "grid grid-cols-[minmax(0,1fr),auto,minmax(0,1fr)] items-center",
					cl: "grid grid-cols-[minmax(0,1fr),auto,minmax(0,1fr)] items-center",
				}[variant]
			}
		>
			{
				{
					lr: (
						<>
							{versionTypeSelector}
							{refreshButton}
						</>
					),
					rl: (
						<>
							{refreshButton}
							{versionTypeSelector}
						</>
					),
					cr: (
						<>
							<div />
							{versionTypeSelector}
							{refreshButton}
						</>
					),
					cl: (
						<>
							{refreshButton}
							{versionTypeSelector}
						</>
					),
				}[variant]
			}
		</div>
	);
}

function InnerVersionSelector({
	className,
	versions,
	defaultDisplayName,
	onDisplayNameChange,
	viewportClassName,
	type,
	...props
}: ComponentProps<typeof ScrollArea> & {
	readonly versions: readonly Version[];
	readonly defaultDisplayName?: string;
	readonly onDisplayNameChange?: (displayName: string) => void;
}) {
	const [currentDisplayName, setCurrentDisplayName] = useState(
		versions.find((version) => version.displayName === defaultDisplayName)?.displayName ?? versions[0]?.displayName,
	);

	const selectedItemRef = useRef<ComponentRef<typeof ToggleGroupItem>>(null);

	useEffect(() => {
		selectedItemRef.current?.scrollIntoView({ block: "center" });
	}, []);

	return (
		<ScrollArea className={cn("pr-3", className)} viewportClassName="border" type="always" {...props}>
			<ToggleGroup
				className="flex-col gap-0"
				type="single"
				orientation="vertical"
				value={currentDisplayName}
				onValueChange={(value) => {
					if (value) {
						setCurrentDisplayName(value);
						onDisplayNameChange?.(value);
					}
				}}
			>
				{versions.map(({ displayName, availableArchitectures }) => (
					<ToggleGroupItem
						className="w-full justify-between rounded-none"
						ref={displayName === currentDisplayName ? selectedItemRef : undefined}
						key={displayName}
						value={displayName}
					>
						<div>{displayName}</div>
						<div>{availableArchitectures.join(" | ")}</div>
					</ToggleGroupItem>
				))}
			</ToggleGroup>
		</ScrollArea>
	);
}

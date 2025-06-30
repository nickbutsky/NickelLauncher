import { AppContext } from "@/app-context";
import { ScrollArea } from "@/components/shadcn-modified/scroll-area";
import { Button } from "@/components/shadcn/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shadcn/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/shadcn/toggle-group";
import { type Version, type VersionTypeToVersions, versionTypes } from "@/core-types";
import { cn } from "@/utils";
import { RefreshCw } from "lucide-react";
import { type ComponentProps, type ComponentRef, use, useEffect, useRef, useState } from "react";

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
	const { showErrorDialog } = use(AppContext);
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
			<TopBar onRefreshRequest={() => onRefreshRequest().catch((reason: Error) => showErrorDialog(reason.message))} />
			{versionTypes.map((versionType) => (
				<TabsContent
					className="h-48 data-[state=inactive]:hidden"
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

function TopBar({ onRefreshRequest }: Pick<ComponentProps<typeof VersionSelector>, "onRefreshRequest">) {
	const [refreshing, setRefreshing] = useState(false);
	return (
		<div className="flex justify-between">
			<Button
				className="mr-auto"
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
				<RefreshCw className={cn(refreshing && "animate-spin")} />
			</Button>
			<TabsList
				className="grid bg-transparent"
				style={{ gridTemplateColumns: `repeat(${versionTypes.length}, minmax(0, 1fr))` }}
			>
				{versionTypes.map((versionType) => (
					<TabsTrigger key={versionType} value={versionType}>
						{versionType.charAt(0).toUpperCase() + versionType.slice(1)}
					</TabsTrigger>
				))}
			</TabsList>
			<div className="ml-auto w-9" />
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
				className="w-full flex-col"
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
						className="w-full justify-between py-1.5 first:rounded-none last:rounded-none"
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

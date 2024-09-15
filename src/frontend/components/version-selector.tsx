import { UpdateIcon } from "@radix-ui/react-icons";
import * as React from "react";

import { Button } from "@/components/shadcn/button";
import { ScrollArea } from "@/components/shadcn/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shadcn/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/shadcn/toggle-group";
import { type Version, type VersionTypeToVersions, versionTypes } from "@/core-types";
import { cn } from "@/utils";

interface Props {
  readonly versionTypeToVersions: VersionTypeToVersions;
  readonly onRefreshRequest: () => Promise<void>;
  readonly defaultDisplayName?: string;
  readonly onDisplayNameChange?: (displayName: string) => void;
}

export const VersionSelector = React.forwardRef<
  React.ElementRef<typeof Tabs>,
  React.ComponentPropsWithoutRef<typeof Tabs> & Props
>(({ className, versionTypeToVersions, onRefreshRequest, defaultDisplayName, onDisplayNameChange, ...props }, ref) => {
  return (
    <Tabs
      className={cn("flex flex-col", className)}
      ref={ref}
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
});

function TopBar({
  variant = "cl",
  onRefreshRequest,
}: { readonly variant?: "lr" | "rl" | "cr" | "cl" } & Pick<Props, "onRefreshRequest">) {
  const [refreshing, setRefreshing] = React.useState(false);

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

const InnerVersionSelector = React.forwardRef<
  React.ElementRef<typeof ScrollArea>,
  React.ComponentPropsWithoutRef<typeof ScrollArea> & {
    readonly versions: readonly Version[];
    readonly defaultDisplayName?: string;
    readonly onDisplayNameChange?: (displayName: string) => void;
  }
>(({ className, versions, defaultDisplayName, onDisplayNameChange, ...props }, ref) => {
  const [currentDisplayName, setCurrentDisplayName] = React.useState(
    versions.find((version) => version.displayName === defaultDisplayName)?.displayName ?? versions[0]?.displayName,
  );

  const selectedItemRef = React.useRef<React.ElementRef<typeof ToggleGroupItem>>(null);

  React.useEffect(() => {
    selectedItemRef.current?.scrollIntoView({ block: "center" });
  }, []);

  return (
    <ScrollArea className={cn("pr-3", className)} viewportClassName="border" ref={ref} type="always" {...props}>
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
});

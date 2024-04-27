import { UpdateIcon } from "@radix-ui/react-icons";
import * as React from "react";
import type { DeepReadonly } from "ts-essentials";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { type Version, type VersionsByType, versionTypes } from "@/core-types";

interface Props
  extends DeepReadonly<{
    versionsByType: VersionsByType;
    onRefreshRequest: () => void;
    defaultDisplayName?: string;
    onDisplayNameChange?: (displayName: string) => void;
  }> {}

export const VersionSelector = React.forwardRef<
  React.ElementRef<typeof Tabs>,
  React.ComponentPropsWithoutRef<typeof Tabs> & Props
>(({ defaultValue, versionsByType, onRefreshRequest, defaultDisplayName, onDisplayNameChange, ...props }, ref) => {
  return (
    <Tabs
      ref={ref}
      defaultValue={
        versionTypes.find((versionType) =>
          versionsByType[versionType].find((version) => version.displayName === defaultDisplayName),
        ) ?? versionTypes[0]
      }
      {...props}
    >
      <TopBar onRefreshRequest={onRefreshRequest} />
      {versionTypes.map((versionType) => (
        <TabsContent
          className="data-[state=inactive]:hidden"
          tabIndex={-1}
          key={versionType}
          value={versionType}
          forceMount={true}
        >
          <InnerVersionSelector
            versions={versionsByType[versionType]}
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
}: DeepReadonly<{ variant?: "lr" | "rl" | "cr" | "cl" }> & Pick<Props, "onRefreshRequest">) {
  const versionTypeSelector = (
    <TabsList className="grid grid-cols-3">
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
      variant="secondary"
      onClick={() => onRefreshRequest()}
    >
      <UpdateIcon />
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
  versions,
  defaultDisplayName,
  onDisplayNameChange,
}: DeepReadonly<{
  versions: Version[];
  defaultDisplayName?: string;
  onDisplayNameChange?: (displayName: string) => void;
}>) {
  const [currentDisplayName, setCurrentDisplayName] = React.useState(
    versions.find((version) => version.displayName === defaultDisplayName)?.displayName ?? versions[0]?.displayName,
  );

  const selectedItemRef = React.useRef<React.ElementRef<typeof ToggleGroupItem>>(null);

  React.useEffect(() => {
    selectedItemRef.current?.scrollIntoView({ block: "center" });
  }, []);

  return (
    <ScrollArea className="h-[300px] pr-3" type="always">
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

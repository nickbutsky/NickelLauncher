import * as React from "react";

import { UpdateIcon } from "@radix-ui/react-icons";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";

const versionTypes = ["release", "beta", "preview"] as const;

interface Props {
  readonly versions: Versions;
  readonly onRefreshRequest: () => void;
}

interface Versions {
  readonly release: readonly Version[];
  readonly beta: readonly Version[];
  readonly preview: readonly Version[];
}

interface Version {
  readonly displayName: string;
  readonly availableArchitectures: readonly string[];
}

export const VersionSelector = React.forwardRef<
  React.ElementRef<typeof Tabs>,
  React.ComponentPropsWithoutRef<typeof Tabs> & Props
>(({ defaultValue, onValueChange, versions, onRefreshRequest, ...props }, ref) => {
  return (
    <Tabs
      ref={ref}
      defaultValue={
        versionTypes.find((versionType) =>
          versions[versionType].find((version) => version.displayName === defaultValue)
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
            defaultValue={defaultValue}
            onValueChange={onValueChange}
            versions={versions[versionType]}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
});

function TopBar({
  variant = "cl",
  onRefreshRequest
}: { readonly variant?: "lr" | "rl" | "cr" | "cl" } & Pick<Props, "onRefreshRequest">) {
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
          cl: "grid grid-cols-[minmax(0,1fr),auto,minmax(0,1fr)] items-center"
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
          )
        }[variant]
      }
    </div>
  );
}

function InnerVersionSelector({
  defaultValue,
  onValueChange,
  versions
}: {
  readonly defaultValue?: string;
  readonly onValueChange?: (value: string) => void;
  readonly versions: readonly Version[];
}) {
  const [currentDisplayName, setCurrentDisplayName] = React.useState(
    versions.find((version) => version.displayName === defaultValue)?.displayName ?? versions[0]?.displayName
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
            onValueChange?.(value);
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

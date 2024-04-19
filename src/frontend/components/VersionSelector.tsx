import * as React from "react";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { UpdateIcon } from "@radix-ui/react-icons";

const versionTypes = ["release", "beta", "preview"] as const;

interface VersionsProps {
  readonly release: readonly VersionProps[];
  readonly beta: readonly VersionProps[];
  readonly preview: readonly VersionProps[];
}

interface VersionProps {
  readonly displayName: string;
  readonly availableArchitectures: readonly string[];
}

export const VersionSelector = React.forwardRef<
  React.ElementRef<typeof Tabs>,
  React.ComponentPropsWithoutRef<typeof Tabs> & VersionsProps
>(({ defaultValue, release, beta, preview, ...props }, ref) => {
  return (
    <Tabs ref={ref} defaultValue={defaultValue || versionTypes[0]} {...props}>
      <TopBar />
      {versionTypes.map((versionType) => (
        <TabsContent
          className="data-[state=inactive]:hidden"
          tabIndex={-1}
          key={versionType}
          value={versionType}
          forceMount={true}
        >
          <InnerVersionSelector
            versions={
              {
                release: release,
                beta: beta,
                preview: preview
              }[versionType]
            }
          />
        </TabsContent>
      ))}
    </Tabs>
  );
});

function TopBar({ variant = "cl" }: { readonly variant?: "lr" | "rl" | "cr" | "cl" }) {
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
              <VersionTypeSelector />
              <RefreshButton />
            </>
          ),
          rl: (
            <>
              <RefreshButton />
              <VersionTypeSelector />
            </>
          ),
          cr: (
            <>
              <div />
              <VersionTypeSelector />
              <RefreshButton classname="ml-auto" />
            </>
          ),
          cl: (
            <>
              <RefreshButton classname="mr-auto" />
              <VersionTypeSelector />
            </>
          )
        }[variant]
      }
    </div>
  );
}

function VersionTypeSelector() {
  return (
    <TabsList className="grid grid-cols-3">
      {versionTypes.map((versionType) => (
        <TabsTrigger key={versionType} value={versionType}>
          {versionType.charAt(0).toUpperCase() + versionType.slice(1)}
        </TabsTrigger>
      ))}
    </TabsList>
  );
}

function RefreshButton({ classname }: { readonly classname?: string }) {
  return (
    <Button className={classname} size="icon" variant="secondary">
      <UpdateIcon />
    </Button>
  );
}

function InnerVersionSelector({ versions }: { readonly versions: VersionsProps[keyof VersionsProps] }) {
  const [displayName, setDisplayName] = React.useState(versions[0]?.displayName);

  return (
    <ScrollArea className="h-[300px] pr-3" type="always">
      <ToggleGroup
        className="flex-col gap-0"
        type="single"
        orientation="vertical"
        value={displayName}
        onValueChange={(value) => {
          if (value) {
            setDisplayName(value);
          }
        }}
      >
        {versions.map(({ displayName, availableArchitectures }) => (
          <ToggleGroupItem className="w-full justify-between rounded-none" key={displayName} value={displayName}>
            <div>{displayName}</div>
            <div>{availableArchitectures.join(" | ")}</div>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </ScrollArea>
  );
}

import * as React from "react";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ScrollArea } from "@/components/ui/scroll-area";

const versionTypes = ["release", "beta", "preview"] as const;

interface Props {
  readonly release: readonly Version[];
  readonly beta: readonly Version[];
  readonly preview: readonly Version[];
}

interface Version {
  readonly displayName: string;
  readonly availableArchitectures: readonly string[];
}

export function VersionSelector(props: Props) {
  return (
    <Tabs className="w-[400px]" defaultValue={versionTypes[0]}>
      <TabsList className="grid w-full grid-cols-3">
        {versionTypes.map((versionType) => (
          <TabsTrigger key={versionType} value={versionType}>
            {versionType.charAt(0).toUpperCase() + versionType.slice(1)}
          </TabsTrigger>
        ))}
      </TabsList>
      {versionTypes.map((versionType) => (
        <TabsContent className="data-[state=inactive]:hidden" key={versionType} value={versionType} forceMount={true}>
          <InnerVersionSelector versions={props[versionType]} />
        </TabsContent>
      ))}
    </Tabs>
  );
}

function InnerVersionSelector({ versions }: { readonly versions: Props[keyof Props] }) {
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

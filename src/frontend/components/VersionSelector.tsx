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
  readonly name: string;
  readonly availableArchitectures: readonly string[];
}

export function VersionSelector(props: Props) {
  const [currentVersionType, setCurrentVersionType] = React.useState<(typeof versionTypes)[number]>(versionTypes[0]);

  return (
    <Tabs
      className="w-[400px]"
      defaultValue={currentVersionType}
      onValueChange={(value) => setCurrentVersionType(value as (typeof versionTypes)[number])}
    >
      <TabsList className="grid w-full grid-cols-3">
        {versionTypes.map((versionType) => (
          <TabsTrigger value={versionType}>{versionType.charAt(0).toUpperCase() + versionType.slice(1)}</TabsTrigger>
        ))}
      </TabsList>
      {versionTypes.map((versionType) => (
        <TabsContent value={versionType} forceMount={true} hidden={currentVersionType !== versionType}>
          <InnerVersionSelector versions={props[versionType]} />
        </TabsContent>
      ))}
    </Tabs>
  );
}

function InnerVersionSelector({ versions }: { readonly versions: Props[keyof Props] }) {
  const [selectedVersionName, setSelectedVersionName] = React.useState(versions[0]?.name);

  return (
    <ScrollArea className="h-[300px] pr-3" type="always">
      <ToggleGroup
        className="flex-col gap-0"
        type="single"
        orientation="vertical"
        value={selectedVersionName}
        onValueChange={(value) => {
          if (value) {
            setSelectedVersionName(value);
          }
        }}
      >
        {versions.map(({ name: versionName, availableArchitectures }) => (
          <ToggleGroupItem className="w-full justify-between rounded-none" value={versionName}>
            <div>{versionName}</div>
            <div>{availableArchitectures.join(" | ")}</div>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </ScrollArea>
  );
}

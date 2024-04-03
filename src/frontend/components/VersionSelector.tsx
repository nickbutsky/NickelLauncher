import { useState } from "react";

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
  return (
    <Tabs defaultValue={versionTypes[0]} className="w-[400px]">
      <TabsList className="grid w-full grid-cols-3">
        {versionTypes.map((versionType) => (
          <TabsTrigger value={versionType}>{versionType.charAt(0).toUpperCase() + versionType.slice(1)}</TabsTrigger>
        ))}
      </TabsList>
      {versionTypes.map((versionType) => (
        <TabsContent value={versionType}>
          <InnerVersionSelector versions={props[versionType]} />
        </TabsContent>
      ))}
    </Tabs>
  );
}

function InnerVersionSelector({ versions }: { readonly versions: Props[keyof Props] }) {
  const [value, setValue] = useState(versions[0].name);

  return (
    <ScrollArea className="h-[300px] pr-3">
      <ToggleGroup
        className="flex-col"
        type="single"
        orientation="vertical"
        value={value}
        onValueChange={(value) => {
          if (value) {
            setValue(value);
          }
        }}
      >
        {versions.map(({ name: versionName, availableArchitectures }) => (
          <ToggleGroupItem className="w-full justify-between" value={versionName}>
            <div>{versionName}</div> {availableArchitectures.join(" | ")}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </ScrollArea>
  );
}

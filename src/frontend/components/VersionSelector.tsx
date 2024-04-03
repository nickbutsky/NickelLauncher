import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useState } from "react";

interface Props {
  readonly versionsData: {
    readonly [versionType: string]: readonly {
      readonly name: string;
      readonly availableArchitectures: readonly string[];
    }[];
  };
}

export function VersionSelector({ versionsData }: Props) {
  return (
    <Tabs defaultValue={Object.keys(versionsData)[0]} className="w-[400px]">
      <TabsList className="grid w-full grid-cols-3">
        {Object.keys(versionsData).map((versionType) => (
          <TabsTrigger value={versionType}>{versionType.charAt(0).toUpperCase() + versionType.slice(1)}</TabsTrigger>
        ))}
      </TabsList>
      {Object.keys(versionsData).map((versionType) => (
        <TabsContent value={versionType}>
          <InnerVersionSelector versions={versionsData[versionType]} />
        </TabsContent>
      ))}
    </Tabs>
  );
}

function InnerVersionSelector({ versions }: Props["versionsData"]) {
  const [value, setValue] = useState(versions[0].name);

  return (
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
  );
}

import { createContext, useContext, useState } from "react";

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
  const [selectedReleaseVersionName, setSelectedReleaseVersionName] = useState(props.release[0]?.name);
  const [selectedBetaVersionName, setSelectedBetaVersionName] = useState(props.beta[0]?.name);
  const [selectedPreviewVersionName, setSelectedPreviewVersionName] = useState(props.preview[0]?.name);

  const selectedVersionNameHandlers = {
    release: { selectedVersionName: selectedReleaseVersionName, setSelectedVersionName: setSelectedReleaseVersionName },
    beta: { selectedVersionName: selectedBetaVersionName, setSelectedVersionName: setSelectedBetaVersionName },
    preview: { selectedVersionName: selectedPreviewVersionName, setSelectedVersionName: setSelectedPreviewVersionName }
  };

  return (
    <Tabs defaultValue={versionTypes[0]} className="w-[400px]">
      <TabsList className="grid w-full grid-cols-3">
        {versionTypes.map((versionType) => (
          <TabsTrigger value={versionType}>{versionType.charAt(0).toUpperCase() + versionType.slice(1)}</TabsTrigger>
        ))}
      </TabsList>
      {versionTypes.map((versionType) => (
        <TabsContent value={versionType}>
          <SelectedVersionNameContext.Provider value={selectedVersionNameHandlers[versionType]}>
            <InnerVersionSelector versions={props[versionType]} />
          </SelectedVersionNameContext.Provider>
        </TabsContent>
      ))}
    </Tabs>
  );
}

const SelectedVersionNameContext = createContext<{
  readonly selectedVersionName: string | undefined;
  readonly setSelectedVersionName: (selectedVersionName: string) => void;
}>({
  selectedVersionName: undefined,
  setSelectedVersionName: () => undefined
});

function InnerVersionSelector({ versions }: { readonly versions: Props[keyof Props] }) {
  const { selectedVersionName, setSelectedVersionName } = useContext(SelectedVersionNameContext);

  return (
    <ScrollArea className="h-[300px] pr-3">
      <ToggleGroup
        className="flex-col"
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
          <ToggleGroupItem className="w-full justify-between" value={versionName}>
            <div>{versionName}</div> {availableArchitectures.join(" | ")}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </ScrollArea>
  );
}
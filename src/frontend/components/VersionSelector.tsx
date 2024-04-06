import { createContext, useContext, useEffect, useRef, useState } from "react";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ScrollArea, ScrollAreaViewport } from "@/components/ui/scroll-area";

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

  const [releaseScrollPosition, setReleaseScrollPosition] = useState(0);
  const [betaScrollPosition, setBetaScrollPosition] = useState(0);
  const [previewScrollPosition, setPreviewScrollPosition] = useState(0);

  return (
    <Tabs defaultValue={versionTypes[0]} className="w-[400px]">
      <TabsList className="grid w-full grid-cols-3">
        {versionTypes.map((versionType) => (
          <TabsTrigger value={versionType}>{versionType.charAt(0).toUpperCase() + versionType.slice(1)}</TabsTrigger>
        ))}
      </TabsList>
      {versionTypes.map((versionType) => (
        <TabsContent value={versionType}>
          <SelectedVersionNameContext.Provider
            value={
              {
                release: {
                  selectedVersionName: selectedReleaseVersionName,
                  setSelectedVersionName: setSelectedReleaseVersionName
                },
                beta: {
                  selectedVersionName: selectedBetaVersionName,
                  setSelectedVersionName: setSelectedBetaVersionName
                },
                preview: {
                  selectedVersionName: selectedPreviewVersionName,
                  setSelectedVersionName: setSelectedPreviewVersionName
                }
              }[versionType]
            }
          >
            <ScrollPositionContext.Provider
              value={
                {
                  release: { scrollPosition: releaseScrollPosition, setScrollPosition: setReleaseScrollPosition },
                  beta: { scrollPosition: betaScrollPosition, setScrollPosition: setBetaScrollPosition },
                  preview: { scrollPosition: previewScrollPosition, setScrollPosition: setPreviewScrollPosition }
                }[versionType]
              }
            >
              <InnerVersionSelector versions={props[versionType]} />
            </ScrollPositionContext.Provider>
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

const ScrollPositionContext = createContext<{
  readonly scrollPosition: number;
  readonly setScrollPosition: (scrollPosition: number) => void;
}>({
  scrollPosition: 0,
  setScrollPosition: () => undefined
});

function InnerVersionSelector({ versions }: { readonly versions: Props[keyof Props] }) {
  const { selectedVersionName, setSelectedVersionName } = useContext(SelectedVersionNameContext);
  const { scrollPosition, setScrollPosition } = useContext(ScrollPositionContext);

  const viewportRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: False positive
  useEffect(() => {
    viewportRef.current?.scrollTo(0, scrollPosition);
  }, []);

  return (
    <ScrollArea className="h-[300px] pr-3">
      <ScrollAreaViewport ref={viewportRef} onScroll={(event) => setScrollPosition(event.currentTarget.scrollTop)}>
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
              <div>{versionName}</div>
              <div>{availableArchitectures.join(" | ")}</div>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </ScrollAreaViewport>
    </ScrollArea>
  );
}

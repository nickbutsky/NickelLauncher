import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

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
      <TabsList>
        {Object.keys(versionsData).map((versionType) => (
          <TabsTrigger value={versionType}>
            {versionType.charAt(0).toUpperCase() + versionType.slice(1)}
          </TabsTrigger>
        ))}
      </TabsList>
      {Object.keys(versionsData).map((versionType) => (
        <TabsContent value={versionType}>
          <InnerVersionSelector versions={versionsData[versionType]}/>
        </TabsContent>
      ))}
    </Tabs>
  );
}

function InnerVersionSelector({ versions }: Props["versionsData"]) {
  return (
    <>
      {versions.map(({ name: versionName, availableArchitectures }) => (
        <>
          <b>
            {versionName} {JSON.stringify(availableArchitectures)}
          </b>
          <br />
        </>
      ))}
    </>
  );
}

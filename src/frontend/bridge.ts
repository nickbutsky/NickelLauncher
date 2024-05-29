import type { DeepReadonly } from "ts-essentials";

import type { InstanceGroup, VersionsByType } from "@/core-types";

declare global {
  const pywebview: DeepReadonly<{
    api: {
      getInstanceGroups: () => Promise<DeepReadonly<InstanceGroup[]>>;
      getVersionsByType: (remotely?: boolean) => Promise<DeepReadonly<VersionsByType>>;
      renameInstanceGroup: (oldName: string, newName: string) => Promise<void>;
      toggleInstanceGroupHidden: (name: string) => Promise<void>;
      deleteInstanceGroup: (name: string) => Promise<void>;
      moveInstances: (position: number, groupName: string, dirnames: DeepReadonly<string[]>) => Promise<void>;
      renameInstance: (dirname: string, newName: string) => Promise<void>;
      changeVersion: (dirname: string, versionDisplayName: string) => Promise<void>;
      changeArchitectureChoice: (dirname: string, architectureChoice: string) => Promise<void>;
      copyInstance: (dirname: string, copyWorlds: boolean) => Promise<void>;
      createInstance: (name: string, groupName: string, versionDisplayName: string) => Promise<void>;
      launchInstance: (dirname: string) => Promise<void>;
    };
  }>;
}

// biome-ignore lint/style/useNamingConvention: False positive
export interface API extends DeepReadonly<{ reloadMainArea: () => void }> {}

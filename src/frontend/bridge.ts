import type { DeepReadonly } from "ts-essentials";

import type { InstanceGroup, VersionsByType } from "@/core-types";

declare global {
  interface Window extends DeepReadonly<{ pywebview: typeof pywebview; webview: typeof webview }> {}

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
    };
  }>;

  const webview: DeepReadonly<{ reloadMainArea: () => void }>;
}

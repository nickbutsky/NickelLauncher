import type { DeepReadonly } from "ts-essentials";

import type { InstanceGroup, VersionsByType } from "@/core-types";

declare global {
  interface Window extends DeepReadonly<{ pywebview: { api: API } }> {}

  const pywebview: DeepReadonly<{ api: API }>;
}

// biome-ignore lint/style/useNamingConvention: False positive
interface API {
  getInstanceGroups: () => Promise<DeepReadonly<InstanceGroup[]>>;
  getVersionsByType: () => Promise<DeepReadonly<VersionsByType>>;
  toggleGroupHidden: (name: string) => Promise<void>;
  renameInstance: (dirname: string, newName: string) => Promise<void>;
  changeVersion: (dirname: string, versionDisplayName: string) => Promise<void>;
  changeArchitectureChoice: (dirname: string, architectureChoice: string) => Promise<void>;
  changeGroup: (dirname: string, groupName: string) => Promise<void>;
}

import type { DeepestReadonly } from "@/utils";

export interface Instance
  extends DeepestReadonly<{
    name: string;
    dirname: string;
    version: Version;
    architectureChoice: string;
  }> {}

export interface Version extends DeepestReadonly<{ displayName: string; availableArchitectures: string[] }> {}

export const versionTypes = ["release", "beta", "preview"] as const;

export type VersionsByType = DeepestReadonly<{ [K in (typeof versionTypes)[number]]: Version[] }>;

export interface InstanceGroup
  extends DeepestReadonly<{
    name: string;
    hidden: boolean;
    instances: Instance[];
  }> {}

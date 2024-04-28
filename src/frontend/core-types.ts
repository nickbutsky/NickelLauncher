import type { DeepReadonly } from "ts-essentials";

export interface Instance
  extends DeepReadonly<{
    name: string;
    dirname: string;
    version: Version;
    architectureChoice: string;
  }> {}

export interface Version extends DeepReadonly<{ displayName: string; availableArchitectures: string[] }> {}

export const versionTypes = ["release", "beta", "preview"] as const;

export type VersionsByType = DeepReadonly<{ [K in (typeof versionTypes)[number]]: Version[] }>;

export interface InstanceGroup
  extends DeepReadonly<{
    name: string;
    hidden: boolean;
    instances: Instance[];
  }> {}

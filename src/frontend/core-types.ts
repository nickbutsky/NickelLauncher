import type { DeepestReadonly } from "@/utils";

export interface Instance
  extends DeepestReadonly<{
    name: string;
    dirname: string;
    version: Version;
    architectureChoice: string;
  }> {}

export interface Version extends DeepestReadonly<{ displayName: string; availableArchitectures: string[] }> {}

export interface InstanceGroup
  extends DeepestReadonly<{
    name: string;
    hidden: boolean;
    instances: Instance[];
  }> {}

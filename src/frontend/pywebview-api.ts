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
}

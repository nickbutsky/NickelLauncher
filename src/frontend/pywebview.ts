import type { InstanceGroup, VersionsByType } from "@/core-types";
import type { DeepestReadonly } from "@/utils";

declare global {
  interface Window extends DeepestReadonly<{ pywebview: { api: API } }> {}

  const pywebview: DeepestReadonly<{ api: API }>;
}

// biome-ignore lint/style/useNamingConvention: False positive
interface API {
  // biome-ignore lint/style/useNamingConvention: Python function call
  get_instance_groups: () => InstanceGroup[];
  // biome-ignore lint/style/useNamingConvention: Python function call
  get_versions_by_type: () => VersionsByType;
}

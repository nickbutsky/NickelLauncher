import type { InstanceGroup } from "@/core-interfaces";
import type { DeepestReadonly } from "@/utils";

declare global {
  interface Window extends DeepestReadonly<{ pywebview: { api: API } }> {}

  const pywebview: DeepestReadonly<{ api: API }>;
}

// biome-ignore lint/style/useNamingConvention: False positive
interface API {
  getGroups: () => InstanceGroup[];
}

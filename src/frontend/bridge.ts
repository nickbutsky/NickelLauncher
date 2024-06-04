import type { DeepReadonly, MarkWritable } from "ts-essentials";

import type { InstanceGroup, VersionsByType } from "@/core-types";

export function exposeStaticFunction<N extends keyof API["static"]>(name: N, func: API["static"][N]) {
  if (exposedStaticFunctionNames.has(name)) {
    throw new Error("A function with this name has already been exposed.");
  }
  const staticApi = getApi().static;
  (staticApi as MarkWritable<typeof staticApi, typeof name>)[name] = func;
  exposedStaticFunctionNames.add(name);
}

export function exposeTemporaryFunction<N extends keyof API["temporary"]>(
  name: N,
  func: API["temporary"][N],
  functionWithBackendCall: () => Promise<void>,
) {
  getApi().temporary[name] = func;
  functionWithBackendCall().finally(() => {
    getApi().temporary[name] = notExposedTemporaryFunction;
  });
}

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
      openGameDirectory: (dirname: string) => Promise<void>;
      openInstanceDirectory: (dirname: string) => Promise<void>;
      launchInstance: (dirname: string) => Promise<void>;
      cancelInstanceLaunch: (id: string) => Promise<void>;
    };
  }>;
}

// biome-ignore lint/style/useNamingConvention: False positive
export interface API {
  readonly static: DeepReadonly<{ reloadMainArea: () => void }>;
  readonly temporary: {
    propelLaunchReport: (
      report: DeepReadonly<{
        type: 0 | 1;
        details: { processed: number; totalsize: number; unit: string } | null;
        text: string;
      }> | null,
    ) => void;
  };
}

function getApi() {
  return (window as unknown as { webview: API }).webview;
}

function notExposedStaticFunction() {
  throw new ReferenceError("This function has not been exposed yet.");
}

function notExposedTemporaryFunction() {
  throw new ReferenceError("This function is not exposed.");
}

const exposedStaticFunctionNames: Set<keyof API["static"]> = new Set();

(window as unknown as { webview: API }).webview = {
  static: { reloadMainArea: notExposedStaticFunction },
  temporary: { propelLaunchReport: notExposedTemporaryFunction },
};

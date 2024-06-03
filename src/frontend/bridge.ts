import type { DeepReadonly, MarkWritable } from "ts-essentials";

import type { InstanceGroup, VersionsByType } from "@/core-types";

export function initialiseStaticFunction<N extends keyof API["static"]>(name: N, func: API["static"][N]) {
  if (initialisedStaticFunctionNames.has(name)) {
    throw new Error("A function with this name has already been initialised.");
  }
  const staticApi = getApi().static;
  (staticApi as MarkWritable<typeof staticApi, typeof name>)[name] = func;
  initialisedStaticFunctionNames.add(name);
}

export function exposeTemporaryFunction<
  N extends keyof API["temporary"],
  FwBC extends (...args: never[]) => Promise<void>,
>(name: N, func: API["temporary"][N], functionWithBackendCall: FwBC, parameters: Parameters<FwBC>) {
  getApi().temporary[name] = func;
  functionWithBackendCall(...parameters).finally(() => {
    getApi().temporary[name] = notExposedDynamicFunction;
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

function notInitialisedStaticFunction() {
  throw new ReferenceError("This function has not been initialised yet.");
}

function notExposedDynamicFunction() {
  throw new ReferenceError("This function is not exposed.");
}

const initialisedStaticFunctionNames: Set<keyof API["static"]> = new Set();

(window as unknown as { webview: API }).webview = {
  static: { reloadMainArea: notInitialisedStaticFunction },
  temporary: { propelLaunchReport: notExposedDynamicFunction },
};

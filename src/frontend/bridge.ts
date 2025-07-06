import type { InstanceGroup, VersionTypeToVersions } from "@/core-types";
import type { Writable } from "ts-essentials";

export function exposeStaticFunction<N extends keyof Api["static"]>(name: N, func: Api["static"][N]) {
	if (exposedStaticFunctionNames.has(name)) {
		throw new Error("Function with this name has already been exposed");
	}
	const staticApi = getApi().static;
	(staticApi as Writable<typeof staticApi>)[name] = func;
	exposedStaticFunctionNames.add(name);
}

export function exposeTemporaryFunction<N extends keyof Api["temporary"]>(
	name: N,
	func: Api["temporary"][N],
	functionWithBackendCall: () => Promise<void>,
) {
	getApi().temporary[name] = func;
	functionWithBackendCall().finally(() => {
		getApi().temporary[name] = notExposedTemporaryFunction;
	});
}

declare global {
	const pywebview: {
		readonly api: {
			readonly getInstanceGroups: () => Promise<readonly InstanceGroup[]>;
			readonly getLastInstanceDirname: () => Promise<string | null>;
			readonly getVersionTypeToVersions: (remotely?: boolean) => Promise<VersionTypeToVersions>;
			readonly toggleInstanceGroupHidden: (name: string) => Promise<void>;
			readonly moveInstanceGroup: (position: number, groupName: string) => Promise<void>;
			readonly moveInstances: (position: number, groupName: string, dirnames: readonly string[]) => Promise<void>;
			readonly renameInstance: (dirname: string, newName: string) => Promise<void>;
			readonly changeVersion: (dirname: string, versionDisplayName: string) => Promise<void>;
			readonly changeArchitectureChoice: (dirname: string, architectureChoice: string) => Promise<void>;
			readonly copyInstance: (dirname: string, copyWorlds: boolean) => Promise<void>;
			readonly createInstance: (name: string, groupName: string, versionDisplayName: string) => Promise<string>;
			readonly openGameDirectory: (dirname: string) => Promise<void>;
			readonly openInstanceDirectory: (dirname: string) => Promise<void>;
			readonly launchInstance: (dirname: string) => Promise<void>;
			readonly cancelInstanceLaunch: () => Promise<void>;
		};
	};
}

export type Api = {
	readonly static: { readonly onSuddenChange: () => void };
	readonly temporary: {
		readonly propelLaunchReport: (
			report: {
				readonly type: 0 | 1;
				readonly text: string;
				readonly progress: { readonly processed: number; readonly totalsize: number; readonly unit: string } | null;
			} | null,
		) => void;
	};
};

function getApi() {
	return (window as unknown as { webview: Api }).webview;
}

function notExposedStaticFunction() {
	throw new ReferenceError("Function has not been exposed yet");
}

function notExposedTemporaryFunction() {
	throw new ReferenceError("Function is not exposed");
}

const exposedStaticFunctionNames: Set<keyof Api["static"]> = new Set();

(window as unknown as { webview: Api }).webview = {
	static: { onSuddenChange: notExposedStaticFunction },
	temporary: { propelLaunchReport: notExposedTemporaryFunction },
};

import type { InstanceGroup, VersionTypeToVersions } from "@/core-types";
import type { MarkWritable } from "ts-essentials";

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

// biome-ignore lint/style/useNamingConvention: False positive
export interface API {
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
	static: { onSuddenChange: notExposedStaticFunction },
	temporary: { propelLaunchReport: notExposedTemporaryFunction },
};

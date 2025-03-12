export type Instance = {
	readonly name: string;
	readonly dirname: string;
	readonly version: Version;
	readonly architectureChoice: string;
};

export type Version = {
	readonly displayName: string;
	readonly availableArchitectures: readonly string[];
};

export const versionTypes = ["release", "beta", "preview"] as const;

export type VersionTypeToVersions = { readonly [K in (typeof versionTypes)[number]]: readonly Version[] };

export type InstanceGroup = {
	readonly name: string;
	readonly hidden: boolean;
	readonly instances: Instance[];
};

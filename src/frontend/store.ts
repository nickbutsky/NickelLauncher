import type { VersionTypeToVersions } from "@/core-types";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

type State = {
	readonly ready: boolean;
	readonly instanceGroups: Awaited<ReturnType<typeof pywebview.api.getInstanceGroups>>;
	readonly reloadInstanceGroups: () => Promise<void>;
	readonly versionTypeToVersions: VersionTypeToVersions;
	readonly reloadVersionTypeToVersions: (remotely: boolean) => void;
	readonly instanceDirnameToScrollTo: string | undefined;
	readonly scrollToInstance: (dirname: string) => void;
};

export function useStore<K extends keyof State>(...keys: readonly K[]) {
	return useRegularStore(
		useShallow((state) =>
			keys.reduce(
				(acc, key) => {
					acc[key] = state[key];
					return acc;
				},
				{} as Pick<State, K>,
			),
		),
	);
}

const useRegularStore = create<State>((set) => ({
	ready: false,
	instanceGroups: [],
	reloadInstanceGroups: async () => set({ instanceGroups: await pywebview.api.getInstanceGroups() }),
	versionTypeToVersions: { release: [], beta: [], preview: [] },
	reloadVersionTypeToVersions: async (remotely) =>
		set({ versionTypeToVersions: await pywebview.api.getVersionTypeToVersions(remotely) }),
	instanceDirnameToScrollTo: undefined,
	scrollToInstance: (dirname) => set({ instanceDirnameToScrollTo: dirname }),
}));

async function prepareStore() {
	useRegularStore.setState({
		ready: true,
		instanceGroups: await pywebview.api.getInstanceGroups(),
		versionTypeToVersions: await pywebview.api.getVersionTypeToVersions(),
	});
}

if (import.meta.env.DEV) {
	prepareStore();
} else {
	window.addEventListener("pywebviewready", prepareStore, { once: true });
}

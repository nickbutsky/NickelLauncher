import { create } from "zustand";

import type { VersionTypeToVersions } from "@/core-types";

interface State {
	readonly ready: boolean;
	readonly instanceGroups: Awaited<ReturnType<typeof pywebview.api.getInstanceGroups>>;
	readonly reloadInstanceGroups: () => void;
	readonly versionTypeToVersions: VersionTypeToVersions;
	readonly reloadVersionTypeToVersions: (remotely: boolean) => void;
}

export const useStore = create<State>((set) => ({
	ready: false,
	instanceGroups: [],
	reloadInstanceGroups: async () => set({ instanceGroups: await pywebview.api.getInstanceGroups() }),
	versionTypeToVersions: { release: [], beta: [], preview: [] },
	reloadVersionTypeToVersions: async (remotely) =>
		set({ versionTypeToVersions: await pywebview.api.getVersionTypeToVersions(remotely) }),
}));

async function prepareStore() {
	useStore.setState({
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

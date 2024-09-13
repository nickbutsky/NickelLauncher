import { create } from "zustand";

import type { VersionTypeToVersions } from "@/core-types";

interface State {
  instanceGroups: Awaited<ReturnType<typeof pywebview.api.getInstanceGroups>>;
  reloadInstanceGroups: () => void;
  versionTypeToVersions: VersionTypeToVersions;
  reloadVersionTypeToVersions: (remotely: boolean) => void;
}

export const useStore = create<State>((set) => ({
  instanceGroups: [],
  reloadInstanceGroups: async () => set({ instanceGroups: await pywebview.api.getInstanceGroups() }),
  versionTypeToVersions: { release: [], beta: [], preview: [] },
  reloadVersionTypeToVersions: async (remotely) =>
    set({ versionTypeToVersions: await pywebview.api.getVersionTypeToVersions(remotely) }),
}));

window.addEventListener(
  "pywebviewready",
  async () =>
    useStore.setState({
      instanceGroups: await pywebview.api.getInstanceGroups(),
      versionTypeToVersions: await pywebview.api.getVersionTypeToVersions(),
    }),
  { once: true },
);

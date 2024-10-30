import type { InstanceGroup, VersionTypeToVersions } from "@/core-types";

if (import.meta.env.DEV) {
  (window as unknown as { pywebview: typeof pywebview }).pywebview = {
    api: {
      getInstanceGroups: () => Promise.resolve(instanceGroups),
      getLastInstanceDirname: () => Promise.resolve(null),
      getVersionTypeToVersions: () => Promise.resolve(versionTypeToVersions),
      toggleInstanceGroupHidden: () => Promise.resolve(),
      moveInstances: () => Promise.resolve(),
      renameInstance: () => Promise.resolve(),
      changeVersion: () => Promise.resolve(),
      changeArchitectureChoice: () => Promise.resolve(),
      copyInstance: () => Promise.resolve(),
      createInstance: () => Promise.resolve(""),
      openGameDirectory: () => Promise.resolve(),
      openInstanceDirectory: () => Promise.resolve(),
      launchInstance: () => Promise.resolve(),
      cancelInstanceLaunch: () => Promise.resolve(),
    },
  };

  const versionTypeToVersions = {
    release: [
      { displayName: "1.20.81", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.20.80", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.20.73", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.20.72", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.20.71", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.20.70", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.20.62", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.20.60", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.20.51", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.20.50", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.20.41", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.20.40", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.20.32", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.20.31", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.20.30", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.20.15", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.20.12", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.20.10", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.20.1", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.20.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.19.83", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.19.81", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.19.80", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.19.73", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.19.71", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.19.70", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.19.63", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.19.62", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.19.60", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.19.51", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.19.50", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.19.41", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.19.40", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.19.31", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.19.30", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.19.22", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.19.21", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.19.20", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.19.11", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.19.10", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.19.2", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.19.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.18.31", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.18.30", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.18.12", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.18.10", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.18.2", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.18.1", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.18.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.17.41", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.17.40", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.17.34", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.17.32", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.17.30", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.17.11", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.17.10", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.17.2", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.17.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.16.221", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.16.220", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.16.210", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.16.201", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.16.200", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.16.100", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.16.40", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.16.20", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.16.10", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.16.1", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.16.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.14.60", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.14.30", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.14.20", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.14.1", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.14.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.13.1", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.13.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.12.1", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.12.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.11.4", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.11.3", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.11.1", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.11.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.10.1", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.10.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.9.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.8.1", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.8.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.7.1", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.7.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.6.1", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.6.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.5.3", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.5.2", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.5.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.4.2", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.2.10", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.2.8", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.2.3", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.2.2", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.1.5", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.0.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "0.16.1", availableArchitectures: ["x64", "x86"] },
      { displayName: "0.16.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "0.15.10", availableArchitectures: ["x64", "x86"] },
      { displayName: "0.15.9", availableArchitectures: ["x64", "x86"] },
      { displayName: "0.15.8", availableArchitectures: ["x64", "x86"] },
      { displayName: "0.15.7", availableArchitectures: ["x64", "x86"] },
      { displayName: "0.15.6", availableArchitectures: ["x64", "x86"] },
      { displayName: "0.15.4", availableArchitectures: ["x64", "x86"] },
      { displayName: "0.15.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "0.14.2", availableArchitectures: ["x64", "x86"] },
      { displayName: "0.14.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "0.13.2", availableArchitectures: ["x64", "x86"] },
      { displayName: "0.13.1", availableArchitectures: ["x64", "x86"] },
      { displayName: "0.13.0", availableArchitectures: ["x64", "x86"] },
    ],
    beta: [
      { displayName: "1.19.34.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.19.32.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.19.30.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.19.28.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.19.26.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.19.24.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.19.20.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.18.3030.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.18.3028.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.18.3026.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.18.3022.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.18.3020.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.18.2029.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.18.2027.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.18.2025.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.18.2023.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.18.2021.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.18.1028.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.18.1027.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.18.1026.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.18.1021.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.18.1020.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.18.27.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.18.25.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.18.24.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.18.22.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.18.21.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.18.20.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.17.4023.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.17.4021.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.17.4020.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.17.3025.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.17.3024.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.17.3023.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.17.3022.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.17.3021.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.17.3020.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.17.2023.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.17.2022.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.17.2021.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.17.2020.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.17.1023.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.17.1022.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.17.1021.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.17.1020.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.17.56.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.17.54.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.17.52.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.17.50.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.16.23056.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.16.23054.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.16.23052.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.16.23050.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.16.22052.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.16.22051.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.16.22050.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.16.21060.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.16.21059.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.16.21058.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.16.21057.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.16.21056.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.16.21055.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.16.21054.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.16.21053.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.16.21050.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.16.20057.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.16.20056.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.16.20055.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.16.20051.0", availableArchitectures: ["x64"] },
      { displayName: "1.16.10060.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.16.10059.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.16.10057.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.16.10056.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.16.10055.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.16.10054.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.16.10053.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.16.10052.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.16.10051.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.16.10050.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.16.2054.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.16.2053.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.16.2052.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.16.2050.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.16.68.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.16.60.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.16.59.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.16.58.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.16.57.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.16.55.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.16.53.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.16.51.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.15.54.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.15.53.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.15.51.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.14.3051.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.14.2501.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.14.251.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.14.250.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.14.103.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.14.52.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.14.51.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.14.4.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.14.3.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.14.2.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.14.1.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.13.15.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.13.13.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.13.9.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.13.6.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.13.5.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.13.4.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.13.2.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.13.1.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.12.14.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.12.13.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.12.12.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.12.11.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.12.10.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.12.9.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.12.6.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.12.4.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.12.3.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.12.2.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.11.10.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.11.9.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.11.8.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.11.7.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.11.5.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.11.4.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.11.3.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.11.1.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.10.4.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.5.0.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.2.513.0", availableArchitectures: ["x64"] },
      { displayName: "1.2.303.0", availableArchitectures: ["x64", "x86"] },
    ],
    preview: [
      { displayName: "1.21.1020.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.21.26.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.21.25.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.21.24.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.21.23.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.21.22.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.21.21.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.21.20.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.20.8024.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.20.8023.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.20.8022.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.20.8021.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.20.8020.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.20.7025.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.20.7024.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.20.7022.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.20.7021.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.20.7020.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.20.6026.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.20.6025.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.20.6024.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.20.6023.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.20.6022.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.20.6021.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.20.6020.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.20.5024.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.20.5023.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.20.5022.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.20.5021.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.20.5020.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.20.4024.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.20.4023.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.20.4022.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.20.4021.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.20.4020.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.20.3025.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.20.3024.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.20.3022.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.20.3021.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.20.3020.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.20.2023.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.20.2022.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.20.2021.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.20.2020.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.20.1024.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.20.1023.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.20.1021.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.20.1020.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.20.25.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.20.24.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.20.23.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.20.22.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.20.21.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.20.20.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.19.8024.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.19.8023.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.19.8022.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.19.8021.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.19.8020.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.19.7024.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.19.7023.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.19.7022.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.19.7021.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.19.7020.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.19.6027.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.19.6026.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.19.6025.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.19.6024.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.19.6023.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.19.6022.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.19.6020.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.19.5023.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.19.5022.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.19.5021.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.19.5020.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.19.4024.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.19.4023.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.19.4022.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.19.4021.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.19.3025.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.19.3023.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.19.3022.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.19.3020.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.19.2024.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.19.2023.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.19.2022.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.19.2020.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.19.1024.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.19.1022.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.19.1021.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.19.1020.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.19.35.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.19.33.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.19.31.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.19.29.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.19.27.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.19.25.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.19.21.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.18.3031.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.18.3029.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.18.3027.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.18.3023.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.18.3021.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.18.2030.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.18.2028.0", availableArchitectures: ["x64", "x86"] },
      { displayName: "1.18.2026.0", availableArchitectures: ["x64", "x86"] },
    ],
  } as const satisfies VersionTypeToVersions;

  const instanceGroups: readonly InstanceGroup[] = [
    {
      name: "",
      hidden: false,
      instances: [
        {
          name: "main",
          dirname: "main",
          version: versionTypeToVersions.release[41],
          architectureChoice: "x86",
        },
        {
          name: "latest release",
          dirname: "latest_release",
          version: versionTypeToVersions.release[0],
          architectureChoice: "x64",
        },
        {
          name: "latest preview",
          dirname: "latest_preview",
          version: versionTypeToVersions.preview[0],
          architectureChoice: "x64",
        },
        {
          name: "client testing",
          dirname: "client_testing",
          version: versionTypeToVersions.release[41],
          architectureChoice: "x86",
        },
        {
          name: "pack testing",
          dirname: "pack_testing",
          version: versionTypeToVersions.preview[41],
          architectureChoice: "x86",
        },
      ],
    },
    {
      name: "collapsed",
      hidden: true,
      instances: [
        {
          name: "guest",
          dirname: "guest",
          version: versionTypeToVersions.preview[34],
          architectureChoice: "x64",
        },
        {
          name: "survival",
          dirname: "survival",
          version: versionTypeToVersions.release[1],
          architectureChoice: "x86",
        },
        {
          name: "creative",
          dirname: "creative",
          version: versionTypeToVersions.beta[78],
          architectureChoice: "x64",
        },
        {
          name: "maps",
          dirname: "maps",
          version: versionTypeToVersions.preview[1],
          architectureChoice: "x86",
        },
      ],
    },
    {
      name: "last",
      hidden: false,
      instances: [
        {
          name: "main modpack",
          dirname: "main_modpack",
          version: versionTypeToVersions.preview[12],
          architectureChoice: "x86",
        },
        {
          name: "development",
          dirname: "development",
          version: versionTypeToVersions.release[4],
          architectureChoice: "x64",
        },
        {
          name: "mod testing",
          dirname: "mod_testing",
          version: versionTypeToVersions.preview[5],
          architectureChoice: "x86",
        },
        {
          name: "testing",
          dirname: "testing",
          version: versionTypeToVersions.beta[2],
          architectureChoice: "x64",
        },
        {
          name: "server testing",
          dirname: "server_testing",
          version: versionTypeToVersions.preview[4],
          architectureChoice: "x86",
        },
      ],
    },
  ];
}

import { createContext } from "react";

export const AppContext = createContext<{
	readonly scrollToInstance: (dirname: string) => void;
	readonly instanceDirnameToScrollTo: string | null;
	readonly scrollTrigger: boolean;

	readonly showErrorDialog: (msg: string) => void;
}>({
	scrollToInstance: () => undefined,
	instanceDirnameToScrollTo: null,
	scrollTrigger: false,

	showErrorDialog: () => undefined,
});

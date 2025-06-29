import { createContext } from "react";

export const AppContext = createContext<{
	readonly instanceDirnameToScrollTo: string | null;
	readonly scrollToInstance: (dirname: string) => void;
	readonly showErrorDialog: (msg: string) => void;
}>({
	instanceDirnameToScrollTo: null,
	scrollToInstance: () => undefined,
	showErrorDialog: () => undefined,
});

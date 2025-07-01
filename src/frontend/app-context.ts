import { createContext } from "react";

export const AppContext = createContext<{
	readonly showErrorDialog: (msg: string) => void;
}>({ showErrorDialog: () => undefined });

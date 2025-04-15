import type { Trigger } from "@/utils";
import type { DependencyList, EffectCallback } from "react";
import { createContext } from "react";

class TriggerDummy {
	#errorMsg = "You are not allowed to call methods of the trigger dummy";
	useEffect(
		_effect: EffectCallback,
		_positionalArguments?: { readonly deps?: DependencyList; readonly allowFirstRender?: boolean },
	) {
		throw new Error(this.#errorMsg);
	}
	get fire() {
		throw new Error(this.#errorMsg);
	}
}

export const AppContext = createContext<{
	readonly scrollToInstance: (dirname: string) => void;
	readonly instanceDirnameToScrollTo: string | null;
	readonly scrollTrigger: Trigger | TriggerDummy;

	readonly showErrorDialog: (msg: string) => void;
}>({
	scrollToInstance: () => undefined,
	instanceDirnameToScrollTo: null,
	scrollTrigger: new TriggerDummy(),

	showErrorDialog: () => undefined,
});

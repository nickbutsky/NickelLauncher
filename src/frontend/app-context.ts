import type { Trigger } from "@/utils";
import type { DependencyList, EffectCallback } from "react";
import { createContext } from "react";

class TriggerDummy {
	#dummyState: boolean;

	constructor() {
		this.#dummyState = false;
		this.#dummyState;
	}

	use(
		_effect: EffectCallback,
		_positionalArguments?: { readonly deps?: DependencyList; readonly allowFirstRender?: boolean },
	) {
		throw new Error("You are not allowed to call the trigger dummy.");
	}

	get fire() {
		throw new Error("You are not allowed to call the trigger dummy.");
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

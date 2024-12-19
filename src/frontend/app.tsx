import { PlusIcon } from "@radix-ui/react-icons";
import { type ContextType, useCallback, useEffect, useRef, useState } from "react";

import { AppContext } from "@/app-context";
import { exposeStaticFunction } from "@/bridge";
import { InstanceCreationDialogContent } from "@/components/instance-creation-dialog-content";
import { InstanceGroupCollapsible } from "@/components/instance-group-collapsible";
import { ErrorDialog } from "@/components/nickel/error-dialog";
import { Button } from "@/components/shadcn/button";
import { Dialog, DialogTrigger } from "@/components/shadcn/dialog";
import { ScrollArea } from "@/components/shadcn/scroll-area";
import { useStore } from "@/store";
import { useTrigger } from "@/utils";

export function App() {
	const [ready, setReady] = useState(false);
	const [instanceDirnameToScrollTo, setInstanceDirnameToScrollTo] = useState<string | null>(null);

	const errorMsg = useRef("");

	const [scrollTrigger, fireScrollTrigger] = useTrigger();
	const [errorDialogTrigger, fireErrorDialogTrigger] = useTrigger();

	const storeReady = useStore((state) => state.ready);
	const instanceGroups = useStore((state) => state.instanceGroups);
	const reloadInstanceGroups = useStore((state) => state.reloadInstanceGroups);

	// biome-ignore lint/correctness/useExhaustiveDependencies: False positive
	useEffect(() => {
		if (import.meta.env.PROD) {
			exposeStaticFunction("onSuddenChange", reloadInstanceGroups);
		}
		pywebview.api.getLastInstanceDirname().then((dirname) => {
			if (dirname !== null) {
				scrollToInstance(dirname);
			}
			setReady(true);
		});
	}, []);

	// biome-ignore lint/correctness/useExhaustiveDependencies: False positive
	const scrollToInstance = useCallback<ContextType<typeof AppContext>["scrollToInstance"]>((dirname) => {
		setInstanceDirnameToScrollTo(dirname);
		fireScrollTrigger();
	}, []);

	return (
		storeReady &&
		ready && (
			<AppContext
				value={{
					scrollToInstance,
					instanceDirnameToScrollTo,
					scrollTrigger,

					showErrorDialog: (msg) => {
						errorMsg.current = msg;
						fireErrorDialogTrigger();
					},
				}}
			>
				<ScrollArea className="h-screen" type="always">
					{instanceGroups.map((group) => (
						<InstanceGroupCollapsible key={group.name} state={group} />
					))}
				</ScrollArea>
				<Dialog>
					<DialogTrigger asChild={true}>
						<Button className="fixed right-0 bottom-0 mr-1 mb-1 rounded-full" size="icon">
							<PlusIcon />
						</Button>
					</DialogTrigger>
					<InstanceCreationDialogContent />
				</Dialog>
				<ErrorDialog msg={errorMsg.current} trigger={errorDialogTrigger} />
			</AppContext>
		)
	);
}

import { AppContext } from "@/app-context";
import { exposeStaticFunction } from "@/bridge";
import { InstanceCreationDialogContent } from "@/components/instance-creation-dialog-content";
import { InstanceGroupCollapsible } from "@/components/instance-group-collapsible";
import { ErrorDialog } from "@/components/nickel/error-dialog";
import { Dialog, DialogTrigger } from "@/components/shadcn-modified/dialog";
import { ScrollArea } from "@/components/shadcn-modified/scroll-area";
import { Button } from "@/components/shadcn/button";
import { useStore } from "@/store";
import { Plus } from "lucide-react";
import { type ContextType, useCallback, useEffect, useRef, useState } from "react";

export function App() {
	const [ready, setReady] = useState(false);
	const [instanceDirnameToScrollTo, setInstanceDirnameToScrollTo] = useState<string | null>(null);

	const [errorDialogOpen, setErrorDialogOpen] = useState(false);
	const errorMsg = useRef("");

	const {
		ready: storeReady,
		instanceGroups,
		reloadInstanceGroups,
	} = useStore("ready", "instanceGroups", "reloadInstanceGroups");

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
	}, [reloadInstanceGroups]);

	const scrollToInstance = useCallback<ContextType<typeof AppContext>["scrollToInstance"]>((dirname) => {
		setInstanceDirnameToScrollTo(dirname);
	}, []);

	return (
		storeReady &&
		ready && (
			<AppContext
				value={{
					scrollToInstance,
					instanceDirnameToScrollTo,

					showErrorDialog: (msg) => {
						errorMsg.current = msg;
						setErrorDialogOpen(true);
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
							<Plus />
						</Button>
					</DialogTrigger>
					<InstanceCreationDialogContent />
				</Dialog>
				<ErrorDialog msg={errorMsg.current} open={errorDialogOpen} onOpenChange={(open) => setErrorDialogOpen(open)} />
			</AppContext>
		)
	);
}

import { AppContext } from "@/app-context";
import { exposeStaticFunction } from "@/bridge";
import { InstanceCreationDialog } from "@/components/instance-creation-dialog";
import { InstanceGroupCollapsible } from "@/components/instance-group-collapsible";
import { ErrorDialog } from "@/components/nickel/error-dialog";
import { DialogTrigger } from "@/components/shadcn-modified/dialog";
import { ScrollArea } from "@/components/shadcn-modified/scroll-area";
import { Button } from "@/components/shadcn/button";
import { useStore } from "@/store";
import { Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function App() {
	const {
		ready: storeReady,
		instanceGroups,
		reloadInstanceGroups,
		scrollToInstance,
	} = useStore("ready", "instanceGroups", "reloadInstanceGroups", "scrollToInstance");

	const [ready, setReady] = useState(false);
	const [instanceCreationDialogOpen, setInstanceCreationDialogOpen] = useState(false);
	const [errorDialogOpen, setErrorDialogOpen] = useState(false);

	const errorMsg = useRef("");

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
	}, [reloadInstanceGroups, scrollToInstance]);

	return (
		storeReady &&
		ready && (
			<AppContext
				value={{
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
				<InstanceCreationDialog open={instanceCreationDialogOpen} onOpenChange={setInstanceCreationDialogOpen}>
					<DialogTrigger asChild={true}>
						<Button className="fixed right-0 bottom-0 mr-1 mb-1 rounded-full" size="icon">
							<Plus />
						</Button>
					</DialogTrigger>
				</InstanceCreationDialog>
				<ErrorDialog open={errorDialogOpen} onOpenChange={(open) => setErrorDialogOpen(open)} msg={errorMsg.current} />
			</AppContext>
		)
	);
}

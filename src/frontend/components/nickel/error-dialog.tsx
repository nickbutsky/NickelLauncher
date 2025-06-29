import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/shadcn/alert-dialog";

export function ErrorDialog({
	msg,
	open,
	onOpenChange,
}: { readonly msg: string; readonly open: boolean; readonly onOpenChange: (open: boolean) => void }) {
	return (
		<AlertDialog open={open} onOpenChange={() => onOpenChange(!open)}>
			<AlertDialogContent className="grid-cols-1">
				<AlertDialogHeader>
					<AlertDialogTitle>Error</AlertDialogTitle>
					<AlertDialogDescription className="break-words">{msg}</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogAction>OK</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

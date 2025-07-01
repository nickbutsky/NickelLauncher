import { InputWithOptions } from "@/components/nickel/input-with-options";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/shadcn-modified/dialog";
import { Input } from "@/components/shadcn-modified/input";
import { Button } from "@/components/shadcn/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/shadcn/form";
import { VersionSelector } from "@/components/version-selector";
import { useStore } from "@/store";
import { useArkTypeForm } from "@/utils";
import { type } from "arktype";
import type { ComponentProps } from "react";

export function InstanceCreationDialog({ children, onOpenChange, ...props }: ComponentProps<typeof Dialog>) {
	const { versionTypeToVersions, reloadVersionTypeToVersions, instanceGroups, reloadInstanceGroups, scrollToInstance } =
		useStore(
			"versionTypeToVersions",
			"reloadVersionTypeToVersions",
			"instanceGroups",
			"reloadInstanceGroups",
			"scrollToInstance",
		);
	const arkTypeForm = useArkTypeForm(
		type({
			instanceName: type("string.trim.preformatted").atLeastLength({
				rule: 1,
				"meta.message": "Instance name must be at least 1 character long.",
			}),
			groupName: "string.trim.preformatted",
			versionDisplayName: "string",
		}),
		{
			instanceName: "",
			groupName: "",
			versionDisplayName: versionTypeToVersions.release[0]?.displayName ?? "",
		},
	);
	return (
		<Dialog
			onOpenChange={(open) => {
				if (!open) {
					arkTypeForm.reset(arkTypeForm.control._defaultValues);
				}
				onOpenChange?.(open);
			}}
			{...props}
		>
			{children}
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create new instance</DialogTitle>
					<DialogDescription className="hidden" />
				</DialogHeader>
				<Form {...arkTypeForm}>
					<form
						className="space-y-4"
						onSubmit={arkTypeForm.handleSubmit(async (data) => {
							const dirname = await pywebview.api.createInstance(
								data.instanceName,
								data.groupName,
								data.versionDisplayName,
							);
							reloadInstanceGroups();
							scrollToInstance(dirname);
							onOpenChange?.(false);
						})}
					>
						<FormField
							control={arkTypeForm.control}
							name="instanceName"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input maxLength={20} {...field} onBlur={undefined} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={arkTypeForm.control}
							name="groupName"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Group name</FormLabel>
									<FormControl>
										<InputWithOptions
											maxLength={50}
											options={instanceGroups.map((group) => group.name).filter((name) => name !== "")}
											{...field}
											onBlur={undefined}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
						<FormField
							control={arkTypeForm.control}
							name="versionDisplayName"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<VersionSelector
											className="h-60"
											versionTypeToVersions={versionTypeToVersions}
											onRefreshRequest={async () => reloadVersionTypeToVersions(true)}
											defaultDisplayName={field.value}
											onDisplayNameChange={field.onChange}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
						<DialogFooter>
							<Button>Create</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

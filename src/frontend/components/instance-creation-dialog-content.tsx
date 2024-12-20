import { AppContext } from "@/app-context";
import { FormDialogContent } from "@/components/nickel/form-dialog-content";
import { InputWithOptions } from "@/components/nickel/input-with-options";
import { Input } from "@/components/shadcn-modified/input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/shadcn/form";
import { VersionSelector } from "@/components/version-selector";
import { useStore } from "@/store";
import { useZodForm } from "@/utils";
import { use } from "react";
import { z } from "zod";

export function InstanceCreationDialogContent() {
	const appContext = use(AppContext);
	const versionTypeToVersions = useStore((state) => state.versionTypeToVersions);
	const reloadVersionTypeToVersions = useStore((state) => state.reloadVersionTypeToVersions);
	const instanceGroups = useStore((state) => state.instanceGroups);
	const reloadInstanceGroups = useStore((state) => state.reloadInstanceGroups);

	const zodForm = useZodForm(
		z.object({
			instanceName: z.string().trim().min(1, "Instance name must be at least 1 character long."),
			groupName: z.string().trim(),
			versionDisplayName: z.string(),
		}),
		{
			instanceName: "",
			groupName: "",
			versionDisplayName: versionTypeToVersions.release[0]?.displayName ?? "",
		},
	);

	return (
		<FormDialogContent
			title="Create new instance"
			submitText="Create"
			form={zodForm}
			onSubmitBeforeClose={(data) =>
				pywebview.api.createInstance(data.instanceName, data.groupName, data.versionDisplayName).then((dirname) => {
					reloadInstanceGroups();
					appContext.scrollToInstance(dirname);
				})
			}
		>
			<FormField
				control={zodForm.control}
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
				control={zodForm.control}
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
				control={zodForm.control}
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
		</FormDialogContent>
	);
}

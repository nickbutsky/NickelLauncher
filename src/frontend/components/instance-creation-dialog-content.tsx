import { AppContext } from "@/app-context";
import { FormDialogContent } from "@/components/nickel/form-dialog-content";
import { InputWithOptions } from "@/components/nickel/input-with-options";
import { Input } from "@/components/shadcn-modified/input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/shadcn/form";
import { VersionSelector } from "@/components/version-selector";
import { useStore } from "@/store";
import { useArkTypeForm } from "@/utils";
import { type } from "arktype";
import { use } from "react";

export function InstanceCreationDialogContent() {
	const { versionTypeToVersions, reloadVersionTypeToVersions, instanceGroups, reloadInstanceGroups } = useStore(
		"versionTypeToVersions",
		"reloadVersionTypeToVersions",
		"instanceGroups",
		"reloadInstanceGroups",
	);
	const { scrollToInstance } = use(AppContext);
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
		<FormDialogContent
			title="Create new instance"
			submitText="Create"
			form={arkTypeForm}
			onSubmitBeforeClose={(data) =>
				pywebview.api.createInstance(data.instanceName, data.groupName, data.versionDisplayName).then((dirname) => {
					reloadInstanceGroups();
					scrollToInstance(dirname);
				})
			}
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
		</FormDialogContent>
	);
}

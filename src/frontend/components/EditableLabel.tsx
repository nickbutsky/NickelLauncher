import * as React from "react";

import { Input } from "@/components/ui/input";

interface Props {
  readonly defaultValue: string;
  readonly applyOnAboutToSave?: (value: string) => string;
  readonly isAllowedToSave?: (value: string) => boolean;
  readonly onSave?: (value: string) => void;
}

export const EditableLabel = React.forwardRef(
  (
    { defaultValue, applyOnAboutToSave, isAllowedToSave, onSave }: Props,
    ref: React.ForwardedRef<{ readonly enterEditMode: () => void }>
  ) => {
    React.useImperativeHandle(ref, () => {
      return { enterEditMode };
    });

    const [value, setValue] = React.useState(defaultValue);
    const [editMode, setEditMode] = React.useState(false);

    function enterEditMode() {
      setEditMode(true);
    }

    return (
      <>
        {editMode ? (
          <Input
            className="h-5"
            defaultValue={value}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setEditMode(false);
                return;
              }
              if (!(event.key === "Enter")) {
                return;
              }
              const newValue = applyOnAboutToSave?.(event.currentTarget.value ?? "") ?? event.currentTarget.value ?? "";
              if (isAllowedToSave && !isAllowedToSave(newValue)) {
                return;
              }
              onSave?.(newValue);
              setValue(newValue);
              setEditMode(false);
            }}
          />
        ) : (
          <div className="whitespace-pre">{value}</div>
        )}
      </>
    );
  }
);

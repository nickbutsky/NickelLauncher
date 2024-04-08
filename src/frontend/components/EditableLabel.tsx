import * as React from "react";

import { Input } from "@/components/ui/input";

interface Props {
  readonly initialText?: string;
  readonly applyOnAboutToSave?: (textAboutToBeSaved: string) => string;
  readonly isAllowedToSave?: (textToBeSaved: string) => boolean;
  readonly onSave?: (newText: string) => void;
}

export const EditableLabel = React.forwardRef(
  (
    { initialText, applyOnAboutToSave, isAllowedToSave, onSave }: Props,
    ref: React.ForwardedRef<{ readonly enterEditMode: () => void }>
  ) => {
    React.useImperativeHandle(ref, () => {
      return { enterEditMode };
    });

    const [editMode, setEditMode] = React.useState(false);

    function enterEditMode() {
      setEditMode(true);
    }

    return (
      <>
        {editMode ? (
          <Input
            defaultValue={initialText}
            onKeyDown={(event) => {
              if (!(event.key === "Enter")) {
                return;
              }
              const newText = applyOnAboutToSave?.(event.currentTarget.textContent ?? "") ?? "";
              if (isAllowedToSave && !isAllowedToSave(newText)) {
                return;
              }
              onSave?.(newText);
            }}
          />
        ) : (
          <div>{initialText}</div>
        )}
      </>
    );
  }
);

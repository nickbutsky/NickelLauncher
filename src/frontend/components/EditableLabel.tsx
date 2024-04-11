import * as React from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/utils";

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
      return { enterEditMode: () => setEditMode(true) };
    });

    const [value, setValue] = React.useState(defaultValue);
    const [editMode, setEditMode] = React.useState(false);

    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
      if (editMode) {
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    }, [editMode]);

    function discardChanges() {
      setEditMode(false);
      if (inputRef.current) {
        inputRef.current.value = value;
      }
    }

    return (
      <>
        <div className="whitespace-pre" hidden={editMode}>
          {value}
        </div>
        <Input
          className={cn("h-5", !editMode && "hidden")}
          ref={inputRef}
          defaultValue={value}
          onBlur={() => discardChanges()}
          onContextMenu={(event) => event.stopPropagation()}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              discardChanges();
              return;
            }
            if (!(event.key === "Enter")) {
              return;
            }
            const newValue = applyOnAboutToSave?.(event.currentTarget.value ?? "") ?? event.currentTarget.value ?? "";
            if (isAllowedToSave && !isAllowedToSave(newValue)) {
              return;
            }
            if (newValue === value) {
              discardChanges();
              return;
            }
            onSave?.(newValue);
            setValue(newValue);
            setEditMode(false);
            event.currentTarget.value = newValue;
          }}
        />
      </>
    );
  }
);

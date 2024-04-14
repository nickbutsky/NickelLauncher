import * as React from "react";

import { cn } from "@/utils";

interface Props {
  readonly defaultValue: string;
  maxLength?: number;
  readonly applyOnAboutToSave?: (value: string) => string;
  readonly isAllowedToSave?: (value: string) => boolean;
  readonly onSave?: (value: string) => void;
}

export const EditableLabel = React.forwardRef(
  (
    { defaultValue, maxLength, applyOnAboutToSave, isAllowedToSave, onSave }: Props,
    forwardedRef: React.ForwardedRef<{ readonly enterEditMode: () => void }>
  ) => {
    React.useImperativeHandle(forwardedRef, () => {
      return { enterEditMode: () => setEditMode(true) };
    });

    const [value, setValue] = React.useState(defaultValue);
    const [editMode, setEditMode] = React.useState(false);
    const [height, setHeight] = React.useState(0);

    const labelRef = React.useRef<HTMLDivElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
      if (editMode) {
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    }, [editMode]);

    React.useEffect(() => {
      if (labelRef.current) {
        setHeight(labelRef.current.clientHeight);
      }
    }, []);

    function discardChanges() {
      setEditMode(false);
      if (inputRef.current) {
        inputRef.current.value = value;
      }
    }

    return (
      <>
        <div className="whitespace-pre" ref={labelRef} hidden={editMode}>
          {value}
        </div>
        <input
          className={cn("w-full bg-transparent", !editMode && "hidden")}
          style={{ height: height }}
          ref={inputRef}
          defaultValue={value}
          maxLength={maxLength}
          onBlur={() => discardChanges()}
          onContextMenu={(event) => event.stopPropagation()}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              return discardChanges();
            }
            if (!(event.key === "Enter")) {
              return;
            }
            const newValue = applyOnAboutToSave?.(event.currentTarget.value ?? "") ?? event.currentTarget.value ?? "";
            if (isAllowedToSave && !isAllowedToSave(newValue)) {
              return;
            }
            if (newValue === value) {
              return discardChanges();
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

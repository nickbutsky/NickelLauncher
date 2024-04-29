import * as React from "react";

import * as Portal from "@radix-ui/react-portal";
import type { DeepReadonly } from "ts-essentials";

import { cn } from "@/utils";

interface Props
  extends DeepReadonly<{
    defaultValue: string;
    maxLength?: number;
    applyOnAboutToSave?: (value: string) => string;
    isAllowedToSave?: (value: string) => boolean;
    onSave?: (value: string) => void;
  }> {}

export const EditableLabel = React.forwardRef<
  HTMLDivElement & DeepReadonly<{ enterEditMode: () => void }>,
  Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue"> & Props
>(({ className, defaultValue, maxLength, applyOnAboutToSave, isAllowedToSave, onSave, ...props }, ref) => {
  React.useImperativeHandle(
    ref,
    () =>
      Object.assign(labelRef.current as Exclude<typeof labelRef.current, null>, {
        enterEditMode: () => setEditMode(true),
      }),
    [],
  );

  const [value, setValue] = React.useState(maxLength === undefined ? defaultValue : defaultValue.slice(0, maxLength));
  const [editMode, setEditMode] = React.useState(false);
  const [height, setHeight] = React.useState(0);

  const labelRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (labelRef.current) {
      setHeight(labelRef.current.clientHeight);
    }
  });

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
      <div className={cn("overflow-hidden text-ellipsis whitespace-pre", className)} ref={labelRef} {...props}>
        {editMode ? "" : value}
      </div>
      {editMode && (
        <Portal.Root
          asChild={true}
          className="absolute"
          style={{
            left: (labelRef.current?.getBoundingClientRect().left as number) - 4,
            top: labelRef.current?.getBoundingClientRect().top,
          }}
        >
          <DynamicInput
            style={{
              height: height,
              font: window
                .getComputedStyle(labelRef.current as Exclude<typeof labelRef.current, null>)
                .getPropertyValue("font"),
            }}
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
        </Portal.Root>
      )}
    </>
  );
});

const DynamicInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, onFocus, onChange, ...props }, ref) => {
    function resize(event: React.FocusEvent<HTMLInputElement, Element> | React.ChangeEvent<HTMLInputElement>) {
      event.target.style.width = "16px";
      event.target.style.width = `${event.target.scrollWidth}px`;
    }

    return (
      <input
        className={cn("bg-inherit px-1", className)}
        ref={ref}
        onFocus={(event) => {
          resize(event);
          onFocus?.(event);
        }}
        onChange={(event) => {
          event.currentTarget.value = event.currentTarget.value.trimStart();
          resize(event);
          onChange?.(event);
        }}
        {...props}
      />
    );
  },
);

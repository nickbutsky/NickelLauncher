import * as React from "react";

import * as Portal from "@radix-ui/react-portal";

import { cn } from "@/utils";

interface Props {
  readonly defaultValue: string;
  readonly maxLength?: number;
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

    const [value, setValue] = React.useState(maxLength === undefined ? defaultValue : defaultValue.slice(0, maxLength));
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
        <div className="whitespace-pre text-ellipsis overflow-hidden" ref={labelRef}>
          {editMode ? "" : value}
        </div>
        {editMode && (
          <Portal.Root
            asChild={true}
            className="absolute"
            style={{
              left: (labelRef.current?.getBoundingClientRect().left as number) - 4,
              top: labelRef.current?.getBoundingClientRect().top
            }}
          >
            <DynamicInput
              style={{
                height: height,
                font: window
                  .getComputedStyle(labelRef.current as Exclude<null, typeof labelRef.current>)
                  .getPropertyValue("font")
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
                const newValue =
                  applyOnAboutToSave?.(event.currentTarget.value ?? "") ?? event.currentTarget.value ?? "";
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
  }
);

const DynamicInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, onFocus, onChange, ...props }, forwardedRef) => {
    function resize(event: React.FocusEvent<HTMLInputElement, Element> | React.ChangeEvent<HTMLInputElement>) {
      event.target.style.width = "16px";
      event.target.style.width = `${event.target.scrollWidth}px`;
    }

    return (
      <input
        className={cn("px-1 bg-transparent", className)}
        ref={forwardedRef}
        onFocus={(event) => {
          resize(event);
          onFocus?.(event);
        }}
        onChange={(event) => {
          resize(event);
          onChange?.(event);
        }}
        {...props}
      />
    );
  }
);

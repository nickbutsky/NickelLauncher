import {
  type ComponentPropsWithoutRef,
  type ElementRef,
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import { Input } from "@/components/shadcn/input";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/shadcn/select";
import { cn } from "@/utils";

export const InputWithOptions = forwardRef<
  ElementRef<typeof Input>,
  Omit<ComponentPropsWithoutRef<typeof Input>, "value"> & {
    readonly options: readonly string[];
    readonly value?: string;
  }
>(({ className, onChange, options, value, defaultValue: _defaultValue, ...props }, ref) => {
  useImperativeHandle(ref, () => inputRef.current as Exclude<typeof inputRef.current, null>, []);

  const [currentValue, setCurrentValue] = useState(value);

  const inputRef = useRef<ElementRef<typeof Input>>(null);
  const selectTriggerRef = useRef<ElementRef<typeof SelectTrigger>>(null);

  return options.length > 0 ? (
    <div className="flex">
      <Input
        className={cn("rounded-r-none focus:z-10", className)}
        ref={inputRef}
        defaultValue={value}
        onChange={(event) => {
          setCurrentValue(event.currentTarget.value);
          onChange?.(event);
        }}
        {...props}
      />
      <Select
        value={currentValue}
        onValueChange={(value) => {
          if (!(value && inputRef.current)) {
            return;
          }
          Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(inputRef.current, value);
          inputRef.current.dispatchEvent(new Event("input", { bubbles: true }));
        }}
        onOpenChange={(open) => {
          function preventFocus() {
            selectTriggerRef.current?.blur();
          }

          if (!open) {
            selectTriggerRef.current?.addEventListener("focus", preventFocus);
            setTimeout(() => {
              inputRef.current?.focus();
              inputRef.current?.select();
              selectTriggerRef.current?.removeEventListener("focus", preventFocus);
            }, 0);
          }
        }}
      >
        <SelectTrigger className="w-min rounded-l-none" ref={selectTriggerRef} />
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  ) : (
    <Input
      className={className}
      ref={inputRef}
      onChange={(event) => {
        setCurrentValue(event.currentTarget.value);
        onChange?.(event);
      }}
      {...props}
    />
  );
});

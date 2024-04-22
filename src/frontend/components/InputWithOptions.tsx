import * as React from "react";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { cn } from "@/utils";

interface Props {
  readonly options: readonly string[];
}

export const InputWithOptions = React.forwardRef<
  React.ElementRef<typeof Input>,
  React.ComponentPropsWithoutRef<typeof Input> & Props
>(({ className, onChange, options, ...props }, ref) => {
  React.useImperativeHandle(ref, () => inputRef.current as Exclude<typeof inputRef.current, null>, []);

  const [value, setValue] = React.useState("");

  const inputRef = React.useRef<React.ElementRef<typeof Input>>(null);

  return (
    <div className="flex">
      <Input
        className={cn("rounded-r-none focus:z-10", className)}
        ref={inputRef}
        onChange={(event) => {
          setValue(event.currentTarget.value);
          onChange?.(event);
        }}
        {...props}
      />
      <Select
        value={value}
        onValueChange={(value) => {
          if (!(value && inputRef.current)) {
            return;
          }
          Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(inputRef.current, value);
          inputRef.current.dispatchEvent(new Event("input", { bubbles: true }));
        }}
        onOpenChange={(open) => {
          if (!open) {
            setTimeout(() => {
              inputRef.current?.focus();
              inputRef.current?.select();
            }, 0);
          }
        }}
      >
        <SelectTrigger className="w-min rounded-l-none" />
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
});
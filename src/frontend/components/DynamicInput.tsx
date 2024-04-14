import * as React from "react";

import { cn } from "@/utils";

export const DynamicInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, onFocus, onChange, ...props }, forwardedRef) => {
    function resize(event: React.FocusEvent<HTMLInputElement, Element> | React.ChangeEvent<HTMLInputElement>) {
      event.target.style.width = "8px";
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
DynamicInput.displayName = "Input";

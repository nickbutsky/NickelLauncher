import * as React from "react";

import { Button } from "@/components/ui/button";
import defaultLogo from "@/assets/default.png";

interface Props {
  readonly name: string;
  readonly displayVersionName: string;
}

export function InstanceButton({ name, displayVersionName }: Props) {
  return (
    <Button className="grid grid-cols-[max-content_1fr] gap-3 w-48 h-16" variant="outline">
      <img src={defaultLogo} alt="Instance logo" width="32" height="32" />
      <div className="grid grid-rows-2 text-left">
        <div>{name}</div>
        <div>{displayVersionName}</div>
      </div>
    </Button>
  );
}

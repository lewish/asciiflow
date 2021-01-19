import { useObserver } from "mobx-react";
import * as React from "react";

export function Files() {
  return useObserver(() => {
    return <div />;
  });
}

import React from "react";
import clsx from "clsx";

export function Input({ className, ...props }) {
  return (
    <input
      className={clsx(
        "w-full px-3 py-2 rounded-lg border border-base bg-transparent focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-700",
        className
      )}
      {...props}
    />
  );
}

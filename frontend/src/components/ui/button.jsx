import React from "react";
import clsx from "clsx";

export function Button({ className, variant = "primary", ...props }) {
  return (
    <button
      className={clsx(
        "px-4 py-2 rounded-lg font-medium transition-all",
        variant === "primary" && "bg-accent text-white hover:opacity-90",
        variant === "outline" && "border border-base text-sm hover:bg-slate-100/50 dark:hover:bg-slate-800/60",
        variant === "ghost" && "text-sm hover:bg-slate-100/50 dark:hover:bg-slate-800/60",
        className
      )}
      {...props}
    />
  );
}

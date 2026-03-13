import React from "react";
import { Button } from "./button.jsx";

export function Modal({ open, title, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="app-card w-full max-w-2xl">
        <div className="flex items-center justify-between border-b border-base pb-3">
          <h3 className="font-display text-lg">{title}</h3>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>
        <div className="pt-4">{children}</div>
      </div>
    </div>
  );
}

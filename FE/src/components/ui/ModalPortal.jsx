import { createPortal } from "react-dom";
import React from "react";

export default function ModalPortal({ children }) {
  const root = typeof document !== "undefined" ? document.getElementById("modal-root") || document.body : null;
  if (!root) return null;
  return createPortal(children, root);
}

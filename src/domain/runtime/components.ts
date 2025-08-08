import { ComponentManifestItem } from "@/domain/schema/v02";
import React from "react";

export function resolveElement(
  components: Record<string, ComponentManifestItem>,
  key: string
): string | React.ComponentType<Record<string, unknown>> {
  const item = components[key];
  if (!item) return "div";
  if (item.kind === "intrinsic") return item.tag as string;
  // v1: module components not supported in preview; fallback
  return "div";
}

"use client";
import React from "react";
import { ProjectDataV02 } from "@/domain/schema/v02";
import { resolveElement } from "./components";
import { evaluateExpression, toText } from "./expr";
import { computeStyleForInstance } from "./styles";
import { useProject } from "./ProjectContext";

export function Renderer() {
  const { project, selectedPageId, viewportWidth, dataSources } = useProject();
  if (!project || !selectedPageId) return null;
  const page = project.pages.byId[selectedPageId];
  if (!page) return <div>Page not found</div>;

  const ctx = { dataSources, pageParams: {} as Record<string, unknown> };

  const renderInst = (id: string): React.ReactNode => {
    const inst = project.instances[id];
    if (!inst) return null;
    const Element = resolveElement(project.components, inst.componentKey) as React.ElementType;

    const propsForInst = Object.values(project.props).filter(p => p.instanceId === id);
    const elementProps: Record<string, unknown> = {};

    for (const p of propsForInst) {
      switch (p.type) {
        case "string":
        case "number":
        case "boolean":
        case "json":
          (elementProps as Record<string, unknown>)[p.name] = (p as { value: unknown }).value;
          break;
        case "expression":
          (elementProps as Record<string, unknown>)[p.name] = evaluateExpression(p.value, ctx);
          break;
        // v1: ignore parameter/resource/asset/event
        default:
          break;
      }
    }

    const children = inst.children.map((ch, idx) => {
      if (ch.type === "id") return <React.Fragment key={idx}>{renderInst(ch.value)}</React.Fragment>;
      if (ch.type === "text") return <React.Fragment key={idx}>{ch.value}</React.Fragment>;
      if (ch.type === "expression") return <React.Fragment key={idx}>{toText(evaluateExpression(ch.value, ctx))}</React.Fragment>;
      return null;
    });

    const style = computeStyleForInstance(project, id, { width: viewportWidth });

    // Check if this is a void element that cannot have children
    const voidElements = new Set(['input', 'img', 'br', 'hr', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr']);
    const isVoidElement = typeof Element === 'string' && voidElements.has(Element);

    if (isVoidElement) {
      return <Element key={id} style={style} {...elementProps} />;
    }

    return <Element key={id} style={style} {...elementProps}>{children}</Element>;
  };

  return <>{renderInst(page.rootInstanceId)}</>;
}

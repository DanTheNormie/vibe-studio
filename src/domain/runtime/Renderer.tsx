"use client";
import React from "react";
import { resolveElement } from "./components";
import { evaluateExpression, evaluateValueExpr, toText } from "./expr";
import { useRouter } from "next/navigation";
import { computeStyleForInstance } from "./styles";
import { useProject } from "./ProjectContext";

export function Renderer() {
  const { project, selectedPageId, viewportWidth, dataSources, pageParams, setDataSource } = useProject();
  const router = useRouter();

  // Update document title from page.title (declare hook unconditionally)
  React.useEffect(() => {
    if (!project || !selectedPageId) return;
    const page = project.pages.byId[selectedPageId];
    if (!page) return;
    try {
      const title = toText(evaluateValueExpr(page.title, { dataSources, pageParams }));
      if (title) document.title = title;
    } catch {
      // ignore
    }
  }, [project, selectedPageId, dataSources, pageParams]);

  if (!project || !selectedPageId) return null;
  const page = project.pages.byId[selectedPageId];
  if (!page) return <div>Page not found</div>;

  const ctx = { dataSources, pageParams };

  function mapToReactEventName(name: string): string {
    if (name.startsWith("on")) return name;
    const n = name.toLowerCase();
    const table: Record<string, string> = {
      click: "onClick",
      change: "onChange",
      input: "onInput",
      submit: "onSubmit",
      keydown: "onKeyDown",
      keyup: "onKeyUp",
      mouseenter: "onMouseEnter",
      mouseleave: "onMouseLeave",
      focus: "onFocus",
      blur: "onBlur"
    };
    return table[n] ?? `on${name.charAt(0).toUpperCase()}${name.slice(1)}`;
  }

  function runActions(handlerId: string, actionsMap: Record<string, any>, order: string[]) {
    for (const actionId of order) {
      const action = actionsMap[actionId];
      if (!action) continue;
      switch (action.type) {
        case "setDataSource": {
          const value = evaluateExpression(action.value, ctx);
          setDataSource(action.id, value);
          break;
        }
        case "updateDataSource": {
          const current = (dataSources as Record<string, unknown>)[action.id];
          const delta = typeof action.amount === "number" ? action.amount : 1;
          const next = action.op === "decrement"
            ? (Number(current) || 0) - delta
            : (Number(current) || 0) + delta;
          setDataSource(action.id, next);
          break;
        }
        case "navigate": {
          const to = evaluateValueExpr(action.to, ctx);
          if (typeof to === "string" && to.length > 0) {
            if (to.startsWith("http://") || to.startsWith("https://")) {
              window.open(to, "_blank");
            } else {
              router.push(to);
            }
          }
          break;
        }
        case "noop":
        default:
          break;
      }
    }
  }

  const renderInst = (id: string): React.ReactNode => {
    const inst = project.instances[id];
    if (!inst) return null;
    const resolved = resolveElement(project.components, inst.componentKey);
    const Element = (typeof resolved === "string"
      ? (inst.tagOverride ?? resolved)
      : resolved) as React.ElementType;

    const propsForInst = Object.values(project.props).filter(p => p.instanceId === id);
    const elementProps: Record<string, unknown> = {};
    const eventProps: Record<string, unknown> = {};

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
        case "parameter": {
          const paramName = (p as { value: string }).value;
          (elementProps as Record<string, unknown>)[p.name] = (pageParams as Record<string, unknown>)[paramName];
          break;
        }
        case "asset": {
          const assetId = (p as { value: string }).value;
          const url = project.assets?.[assetId]?.url;
          (elementProps as Record<string, unknown>)[p.name] = url ?? undefined;
          break;
        }
        case "event": {
          const handlers = (p as { value: Record<string, { id: string; actions: Record<string, any>; order: string[] }> }).value;
          for (const [evtName, handler] of Object.entries(handlers)) {
            const reactName = mapToReactEventName(evtName);
            (eventProps as Record<string, unknown>)[reactName] = (e: unknown) => {
              runActions(handler.id, handler.actions, handler.order);
            };
          }
          break;
        }
        // v1: ignore resource/event for now
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
      return <Element key={id} style={style} {...elementProps} {...eventProps} />;
    }

    return <Element key={id} style={style} {...elementProps} {...eventProps}>{children}</Element>;
  };

  return <>{renderInst(page.rootInstanceId)}</>;
}

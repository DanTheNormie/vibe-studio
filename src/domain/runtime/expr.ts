import { Expression, RefExpr, ExpressionRef, ValueExpr } from "@/domain/schema/v02";

export type EvalContext = {
  dataSources: Record<string, unknown>;
  pageParams: Record<string, unknown>;
};

function evalRef(ref: ExpressionRef, ctx: EvalContext): unknown {
  switch (ref.type) {
    case "dataSource":
      return ctx.dataSources[ref.id];
    case "resource":
      // v1: resources not preloaded; return undefined placeholder
      return undefined;
    case "pageParam":
      return ctx.pageParams[ref.name];
    case "const":
      return ref.value;
    default:
      return undefined;
  }
}

export function evaluateExpression(expr: Expression | RefExpr, ctx: EvalContext): unknown {
  if ("ref" in expr) {
    return evalRef(expr.ref, ctx);
  }
  const { chunks, refs } = expr;
  // chunks.length === refs.length + 1 already validated by Zod
  let out = "";
  for (let i = 0; i < refs.length; i++) {
    out += chunks[i] ?? "";
    const v = evalRef(refs[i]!, ctx);
    out += toText(v);
  }
  out += chunks[refs.length] ?? "";
  return out;
}

export function evaluateValueExpr(val: ValueExpr, ctx: EvalContext): unknown {
  if (val === null) return null;
  const t = typeof val;
  if (t === "string" || t === "number" || t === "boolean") return val;
  // Check if it's an Expression or RefExpr by checking for 'chunks' or 'ref' property
  if (typeof val === 'object' && val !== null && ("ref" in val || "chunks" in val)) {
    return evaluateExpression(val as Expression | RefExpr, ctx);
  }
  return val as unknown;
}

export function toText(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

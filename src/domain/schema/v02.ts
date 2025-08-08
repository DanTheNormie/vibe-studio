import { z } from "zod";

/** Expressions */
export const zExpressionRef = z.discriminatedUnion("type", [
  z.object({ type: z.literal("dataSource"), id: z.string() }),
  z.object({ type: z.literal("resource"), id: z.string() }),
  z.object({ type: z.literal("pageParam"), name: z.string() }),
  z.object({ type: z.literal("const"), value: z.unknown() }),
]);
export type ExpressionRef = z.infer<typeof zExpressionRef>;

export const zExpression = z
  .object({
    chunks: z.array(z.string()),
    refs: z.array(zExpressionRef),
  })
  .superRefine((v, ctx) => {
    if (v.chunks.length !== v.refs.length + 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "chunks.length must equal refs.length + 1",
      });
    }
  });
export type Expression = z.infer<typeof zExpression>;

export const zRefExpr = z.object({ ref: zExpressionRef });
export type RefExpr = z.infer<typeof zRefExpr>;

export const zValueExpr = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
  zExpression,
  zRefExpr,
]);
export type ValueExpr = z.infer<typeof zValueExpr>;

/** Components */
export const zComponentManifestItem = z.discriminatedUnion("kind", [
  z.object({ key: z.string(), kind: z.literal("intrinsic"), tag: z.string() }),
  z.object({
    key: z.string(),
    kind: z.literal("module"),
    module: z.object({
      specifier: z.string(),
      export: z.object({ name: z.string().optional(), isDefault: z.boolean().optional() }),
    }),
    hint: z.object({ displayName: z.string().optional() }).optional(),
  }),
]);
export type ComponentManifestItem = z.infer<typeof zComponentManifestItem>;

/** Structure */
export const zInstanceChild = z.discriminatedUnion("type", [
  z.object({ type: z.literal("id"), value: z.string() }),
  z.object({ type: z.literal("text"), value: z.string(), placeholder: z.boolean().optional() }),
  z.object({ type: z.literal("expression"), value: z.union([zExpression, zRefExpr]) }),
]);
export type InstanceChild = z.infer<typeof zInstanceChild>;

export const zInstance = z.object({
  type: z.literal("instance"),
  id: z.string(),
  componentKey: z.string(),
  tagOverride: z.string().optional(),
  label: z.string().optional(),
  children: z.array(zInstanceChild),
});
export type Instance = z.infer<typeof zInstance>;

/** Props and events */
export const zAction = z.discriminatedUnion("type", [
  z.object({ type: z.literal("setDataSource"), id: z.string(), value: z.union([zExpression, zRefExpr]) }),
  z.object({ type: z.literal("callResource"), id: z.string(), payload: z.union([zExpression, zRefExpr]).optional(), assignTo: z.string().optional() }),
  z.object({ type: z.literal("navigate"), to: zValueExpr }),
  z.object({ type: z.literal("noop") }),
]);
export type Action = z.infer<typeof zAction>;

export const zEventHandler = z.object({
  id: z.string(),
  actions: z.record(z.string(), zAction),
  order: z.array(z.string()),
});
export type EventHandler = z.infer<typeof zEventHandler>;

export const zProp = z.discriminatedUnion("type", [
  z.object({ id: z.string(), instanceId: z.string(), name: z.string(), type: z.literal("string"), value: z.string() }),
  z.object({ id: z.string(), instanceId: z.string(), name: z.string(), type: z.literal("number"), value: z.number() }),
  z.object({ id: z.string(), instanceId: z.string(), name: z.string(), type: z.literal("boolean"), value: z.boolean() }),
  z.object({ id: z.string(), instanceId: z.string(), name: z.string(), type: z.literal("json"), value: z.unknown() }),
  z.object({ id: z.string(), instanceId: z.string(), name: z.string(), type: z.literal("expression"), value: z.union([zExpression, zRefExpr]) }),
  z.object({ id: z.string(), instanceId: z.string(), name: z.string(), type: z.literal("parameter"), value: z.string() }),
  z.object({ id: z.string(), instanceId: z.string(), name: z.string(), type: z.literal("resource"), value: z.string() }),
  z.object({ id: z.string(), instanceId: z.string(), name: z.string(), type: z.literal("asset"), value: z.string() }),
  z.object({ id: z.string(), instanceId: z.string(), name: z.string(), type: z.literal("event"), value: z.record(z.string(), zEventHandler) }),
]);
export type Prop = z.infer<typeof zProp>;

/** Styles */
export const zBreakpoint = z.object({
  id: z.string(),
  label: z.string().optional(),
  minWidth: z.number().optional(),
  maxWidth: z.number().optional(),
});
export type Breakpoint = z.infer<typeof zBreakpoint>;

export const zStyleSource = z.discriminatedUnion("type", [
  z.object({ type: z.literal("local"), id: z.string() }),
  z.object({ type: z.literal("token"), id: z.string(), name: z.string() }),
]);
export type StyleSource = z.infer<typeof zStyleSource>;

export const zStyleRule = z.object({
  id: z.string(),
  when: z.object({ breakpointId: z.string().optional(), state: z.string().optional() }).optional(),
  declarations: z.record(z.string(), z.unknown()),
});
export type StyleRule = z.infer<typeof zStyleRule>;

export const zStyleSheet = z.object({
  sourceId: z.string(),
  rules: z.record(z.string(), zStyleRule),
  order: z.array(z.string()),
});
export type StyleSheet = z.infer<typeof zStyleSheet>;

export const zStyleSourceSelection = z.object({
  instanceId: z.string(),
  order: z.array(z.string()),
});
export type StyleSourceSelection = z.infer<typeof zStyleSourceSelection>;

/** Data sources & resources */
export const zDataSource = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("variable"),
    id: z.string(),
    name: z.string(),
    scopeInstanceId: z.string(),
    value: z.object({
      kind: z.enum(["string", "number", "boolean", "json"]),
      value: z.unknown(),
    }),
  }),
  z.object({ type: z.literal("parameter"), id: z.string(), name: z.string(), scopeInstanceId: z.string() }),
  z.object({ type: z.literal("resource"), id: z.string(), name: z.string(), scopeInstanceId: z.string(), resourceId: z.string() }),
]);
export type DataSource = z.infer<typeof zDataSource>;

export const zResourceHeader = z.object({
  id: z.string(),
  name: z.string(),
  value: z.union([zExpression, zRefExpr]),
});
export type ResourceHeader = z.infer<typeof zResourceHeader>;

export const zResource = z.object({
  id: z.string(),
  name: z.string(),
  url: z.union([zExpression, zRefExpr]),
  method: z.enum(["get", "post", "put", "delete", "patch"]),
  headers: z.record(z.string(), zResourceHeader),
  headerOrder: z.array(z.string()),
  body: z.union([zExpression, zRefExpr]).optional(),
});
export type Resource = z.infer<typeof zResource>;

/** Assets */
export const zAsset = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string().optional(),
  type: z.enum(["image", "font", "file"]).optional(),
  meta: z.object({ width: z.number().optional(), height: z.number().optional(), mime: z.string().optional() }).optional(),
});
export type Asset = z.infer<typeof zAsset>;

/** Pages */
export const zRedirect = z.object({
  id: z.string(),
  from: z.string(),
  to: z.string(),
  status: z.enum(["301", "302"]).optional(),
});
export type Redirect = z.infer<typeof zRedirect>;

export const zPage = z.object({
  id: z.string(),
  name: z.string(),
  title: zValueExpr,
  path: z.string(),
  rootInstanceId: z.string(),
  systemDataSourceId: z.string().optional(),
  meta: z
    .object({
      description: zValueExpr.optional(),
      language: z.string().optional(),
      socialImageAssetId: z.string().optional(),
      socialImageUrl: zValueExpr.optional(),
      status: z.number().optional(),
      redirect: zValueExpr.optional(),
      custom: z.record(z.string(), zValueExpr).optional(),
    })
    .optional(),
});
export type Page = z.infer<typeof zPage>;

/** Root */
export const zProjectDataV02 = z.object({
  modelVersion: z.literal("0.2"),
  projectId: z.string(),
  meta: z.object({ siteName: z.string().optional(), faviconAssetId: z.string().optional() }).optional(),

  components: z.record(z.string(), zComponentManifestItem),

  pages: z.object({
    homePageId: z.string(),
    byId: z.record(z.string(), zPage),
    order: z.array(z.string()).optional(),
    redirects: z.record(z.string(), zRedirect).optional(),
  }),

  instances: z.record(z.string(), zInstance),
  props: z.record(z.string(), zProp),

  breakpoints: z.record(z.string(), zBreakpoint),

  styleSources: z.record(z.string(), zStyleSource),
  styleSheets: z.record(z.string(), zStyleSheet),
  styleSourceSelections: z.record(z.string(), zStyleSourceSelection),

  dataSources: z.record(z.string(), zDataSource),
  resources: z.record(z.string(), zResource),

  assets: z.record(z.string(), zAsset).optional(),
});
export type ProjectDataV02 = z.infer<typeof zProjectDataV02>;

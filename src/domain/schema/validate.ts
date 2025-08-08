import { zProjectDataV02, ProjectDataV02 } from "./v02";

export type ValidationResult =
  | { ok: true; data: ProjectDataV02 }
  | { ok: false; issues: string[] };

function checkKeyIdMatch<T extends { id: string }>(rec: Record<string, T>, label: string, issues: string[]) {
  for (const [k, v] of Object.entries(rec)) {
    if (v.id !== k) issues.push(`${label} key/id mismatch: key="${k}" id="${v.id}`);
  }
}

function checkKeyMatch<T>(rec: Record<string, T>, label: string, select: (v: T) => string, issues: string[]) {
  for (const [k, v] of Object.entries(rec)) {
    if (select(v) !== k) issues.push(`${label} key mismatch: key="${k}" != valueKey="${select(v)}"`);
  }
}

export function validateProjectData(input: unknown): ValidationResult {
  const parsed = zProjectDataV02.safeParse(input);
  if (!parsed.success) {
    return { ok: false, issues: parsed.error.issues.map(e => `${e.path.join(".")}: ${e.message}`) };
  }
  const data = parsed.data;
  const issues: string[] = [];

  // key ↔ id consistency (entities with intrinsic id field)
  checkKeyIdMatch(data.instances, "instances", issues);
  checkKeyIdMatch(data.props, "props", issues);
  checkKeyIdMatch(data.breakpoints, "breakpoints", issues);
  checkKeyIdMatch(data.styleSources, "styleSources", issues);
  checkKeyIdMatch(data.dataSources, "dataSources", issues);
  checkKeyIdMatch(data.resources, "resources", issues);
  if (data.assets) checkKeyIdMatch(data.assets, "assets", issues);
  checkKeyIdMatch(data.pages.byId, "pages.byId", issues);
  if (data.pages.redirects) checkKeyIdMatch(data.pages.redirects, "pages.redirects", issues);

  // key ↔ value-key consistency (maps keyed by another field)
  checkKeyMatch(data.styleSheets, "styleSheets", s => s.sourceId, issues);
  checkKeyMatch(data.styleSourceSelections, "styleSourceSelections", s => s.instanceId, issues);

  // referential integrity
  if (!data.pages.byId[data.pages.homePageId]) {
    issues.push(`pages.homePageId "${data.pages.homePageId}" not found in pages.byId`);
  }
  for (const prop of Object.values(data.props)) {
    if (!data.instances[prop.instanceId]) issues.push(`prop "${prop.id}" refers missing instance "${prop.instanceId}"`);
  }
  for (const inst of Object.values(data.instances)) {
    for (const child of inst.children) {
      if (child.type === "id" && !data.instances[child.value]) {
        issues.push(`instance "${inst.id}" child id "${child.value}" not found`);
      }
    }
  }
  for (const sel of Object.values(data.styleSourceSelections)) {
    for (const sid of sel.order) {
      if (!data.styleSources[sid]) issues.push(`styleSourceSelections[${sel.instanceId}] references missing styleSource "${sid}"`);
    }
  }
  for (const sheet of Object.values(data.styleSheets)) {
    if (!data.styleSources[sheet.sourceId]) issues.push(`styleSheet "${sheet.sourceId}" missing backing styleSource`);
    for (const rid of sheet.order) {
      if (!sheet.rules[rid]) issues.push(`styleSheet "${sheet.sourceId}" order contains unknown rule "${rid}"`);
    }
    for (const rule of Object.values(sheet.rules)) {
      if (rule.when?.breakpointId && !data.breakpoints[rule.when.breakpointId]) {
        issues.push(`styleRule "${rule.id}" references missing breakpoint "${rule.when.breakpointId}"`);
      }
    }
  }
  for (const res of Object.values(data.resources)) {
    for (const hid of res.headerOrder) {
      if (!res.headers[hid]) issues.push(`resource "${res.id}" headerOrder contains unknown header "${hid}"`);
    }
  }

  return issues.length ? { ok: false, issues } : { ok: true, data };
}

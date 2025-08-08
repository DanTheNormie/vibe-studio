import { Breakpoint, ProjectDataV02 } from "@/domain/schema/v02";

export function getActiveBreakpointId(width: number | undefined, breakpoints: Record<string, Breakpoint>): string {
  if (!width) return "base";
  // choose the most specific breakpoint that matches width
  const list = Object.values(breakpoints);
  const match = list
    .filter(b => (b.minWidth == null || width >= b.minWidth) && (b.maxWidth == null || width <= b.maxWidth))
    .sort((a, b) => (a.minWidth ?? -Infinity) - (b.minWidth ?? -Infinity) || (b.maxWidth ?? Infinity) - (a.maxWidth ?? Infinity))[0];
  return match?.id ?? "base";
}

export function getActiveBreakpoints(width: number | undefined, breakpoints: Record<string, Breakpoint>): Set<string> {
  const activeBreakpoints = new Set<string>();
  
  // Base is always active (like mobile-first CSS)
  activeBreakpoints.add("base");
  
  if (!width) return activeBreakpoints;
  
  // Add all breakpoints that match the current width
  for (const bp of Object.values(breakpoints)) {
    const minOk = bp.minWidth == null || width >= bp.minWidth;
    const maxOk = bp.maxWidth == null || width <= bp.maxWidth;
    if (minOk && maxOk) {
      activeBreakpoints.add(bp.id);
    }
  }
  
  return activeBreakpoints;
}

export function computeStyleForInstance(
  project: ProjectDataV02,
  instanceId: string,
  options: { width?: number; states?: Set<string> } = {}
): React.CSSProperties {
  const selection = project.styleSourceSelections[instanceId];
  if (!selection) return {};
  const states = options.states ?? new Set<string>();
  const out: Record<string, unknown> = {};

  // Get all breakpoints that should be active for current width
  const activeBreakpoints = getActiveBreakpoints(options.width, project.breakpoints);

  for (const sourceId of selection.order) {
    const sheet = project.styleSheets[sourceId];
    if (!sheet) continue;
    for (const ruleId of sheet.order) {
      const rule = sheet.rules[ruleId];
      if (!rule) continue;
      
      // Check if rule should apply based on breakpoint
      const bpOk = !rule.when?.breakpointId || activeBreakpoints.has(rule.when.breakpointId);
      
      // Check if rule should apply based on state
      const stateOk = !rule.when?.state || states.has(rule.when.state);
      
      if (bpOk && stateOk) {
        Object.assign(out, rule.declarations);
      }
    }
  }
  return out as React.CSSProperties;
}

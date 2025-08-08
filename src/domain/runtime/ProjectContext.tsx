"use client";
import React, { createContext, useContext, useMemo, useState } from "react";
import { ProjectDataV02 } from "@/domain/schema/v02";

export type RuntimeState = {
  project?: ProjectDataV02;
  setProject: (p?: ProjectDataV02) => void;
  selectedPageId?: string;
  setSelectedPageId: (id?: string) => void;
  viewportWidth?: number;
  setViewportWidth: (w?: number) => void;
  dataSources: Record<string, unknown>;
  setDataSource: (id: string, value: unknown) => void;
};

const Ctx = createContext<RuntimeState | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [project, setProject] = useState<ProjectDataV02 | undefined>();
  const [selectedPageId, setSelectedPageId] = useState<string | undefined>();
  const [viewportWidth, setViewportWidth] = useState<number | undefined>(undefined);
  const [dataSources, setDataSources] = useState<Record<string, unknown>>({});

  const setDataSource = (id: string, value: unknown) => setDataSources(prev => ({ ...prev, [id]: value }));

  const value = useMemo<RuntimeState>(() => ({
    project,
    setProject,
    selectedPageId,
    setSelectedPageId,
    viewportWidth,
    setViewportWidth,
    dataSources,
    setDataSource,
  }), [project, selectedPageId, viewportWidth, dataSources]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useProject() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useProject must be used within ProjectProvider");
  return v;
}

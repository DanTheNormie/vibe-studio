"use client";
import React, { useCallback, useMemo, useState } from "react";
import { validateProjectData } from "@/domain/schema/validate";
import { ProjectProvider, useProject } from "@/domain/runtime/ProjectContext";
import { Renderer } from "@/domain/runtime/Renderer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import Editor from "@monaco-editor/react";
import { 
  Settings, 
  Check, 
  AlertCircle, 
  Code2, 
  RotateCcw,
  Download,
  Maximize2,
  Eye,
  FileCheck,
  ZoomIn,
  ZoomOut,
  RotateCw
} from "lucide-react";

interface PreviewPanelProps {
  width: number;
  height: number;
  scale: number;
  onResize: (width: number, height: number) => void;
  onScaleChange: (scale: number) => void;
}

function PreviewPanel({ width, height, scale, onResize, onScaleChange }: PreviewPanelProps) {
  const { project, selectedPageId, setSelectedPageId, setViewportWidth, setPageParams } = useProject();
  const [isResizing, setIsResizing] = useState(false);
  
  const pages = useMemo(() => project ? Object.values(project.pages.byId) : [], [project]);

  // Drive breakpoint logic from the preview artboard width (unscaled)
  React.useEffect(() => {
    setViewportWidth(width);
    return () => setViewportWidth(undefined);
  }, [setViewportWidth, width]);

  // Populate page params from URL search params
  React.useEffect(() => {
    const updateFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const out: Record<string, string> = {};
      params.forEach((v, k) => { out[k] = v; });
      setPageParams(out);
    };
    updateFromUrl();
    window.addEventListener('popstate', updateFromUrl);
    window.addEventListener('hashchange', updateFromUrl);
    return () => {
      window.removeEventListener('popstate', updateFromUrl);
      window.removeEventListener('hashchange', updateFromUrl);
    };
  }, [setPageParams, project, selectedPageId]);
  
  if (!project || !selectedPageId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background text-muted-foreground min-h-full">
        <div className="text-center">
          <Code2 className="mx-auto h-16 w-16 mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2 text-foreground">No Project Loaded</h3>
          <p>Upload a JSON file or paste JSON content to see the preview</p>
        </div>
      </div>
    );
  }

  const scaledWidth = Math.round(width * scale);
  const scaledHeight = Math.round(height * scale);

  return (
    <div className={`flex-1 flex flex-col bg-background min-h-0 ${isResizing ? 'select-none' : ''}`}>
      {/* Controls Bar */}
      <div className="flex justify-center items-center py-3 px-4 bg-secondary border-b border-border text-sm">
        <div className="flex items-center gap-6">
          {/* Resolution Display */}
          <Badge variant="outline" className="bg-secondary border-border text-foreground">
            {width} × {height}
          </Badge>
          
          {/* Scale Controls */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onScaleChange(Math.max(0.25, scale - 0.25))}
              disabled={scale <= 0.25}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-secondary border border-border rounded"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="min-w-[60px] text-center font-mono text-gray-300 bg-gray-700 px-2 py-1 rounded text-xs">
              {Math.round(scale * 100)}%
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onScaleChange(Math.min(2, scale + 0.25))}
              disabled={scale >= 2}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-secondary border border-border rounded"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onScaleChange(1)}
              disabled={scale === 1}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-secondary border border-border rounded"
            >
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>

          {/* Page Selector */}
          <div className="flex items-center gap-2">
            <Label htmlFor="page-select" className="text-xs text-muted-foreground">Page:</Label>
            <Select value={selectedPageId} onValueChange={setSelectedPageId}>
              <SelectTrigger id="page-select" className="w-32 h-8 bg-secondary border-border text-foreground">
                <SelectValue placeholder="Select page" />
              </SelectTrigger>
              <SelectContent className="bg-secondary border-border">
                {pages.map(p => (
                  <SelectItem key={p.id} value={p.id} className="text-foreground focus:bg-secondary">{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {/* Preview Content with Resize Handles */}
      <div className="flex-1 flex justify-center items-start p-8 overflow-auto bg-background">
        <div 
          className="bg-white shadow-2xl relative border border-border"
          style={{ 
            width: `${scaledWidth}px`, 
            height: `${scaledHeight}px`,
            minWidth: '80px',
            minHeight: '50px'
          }}
        >
          {/* Horizontal Resize Handle */}
          <div 
            className="absolute bg-primary cursor-ew-resize opacity-30 hover:opacity-100 transition-opacity z-20"
            style={{
              right: '0',
              top: '0',
              bottom: '0', 
              width: `${Math.max(1, 1 / scale)}px`
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              setIsResizing(true);
              const startX = e.clientX;
              const startWidth = width;
              
              const handleMouseMove = (e: MouseEvent) => {
                e.preventDefault();
                const deltaX = (e.clientX - startX) / scale;
                const newWidth = Math.max(320, startWidth + deltaX);
                onResize(newWidth, height);
              };
              
              const handleMouseUp = (e: MouseEvent) => {
                e.preventDefault();
                setIsResizing(false);
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };
              
              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
          />
          
          {/* Vertical Resize Handle */}
          <div 
            className="absolute bg-primary cursor-ns-resize opacity-30 hover:opacity-100 transition-opacity z-20"
            style={{
              bottom: '0',
              left: '0',
              right: '0',
              height: `${Math.max(1, 1 / scale)}px`
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              setIsResizing(true);
              const startY = e.clientY;
              const startHeight = height;
              
              const handleMouseMove = (e: MouseEvent) => {
                e.preventDefault();
                const deltaY = (e.clientY - startY) / scale;
                const newHeight = Math.max(200, startHeight + deltaY);
                onResize(width, newHeight);
              };
              
              const handleMouseUp = (e: MouseEvent) => {
                e.preventDefault();
                setIsResizing(false);
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };
              
              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
          />
          
          {/* Corner Resize Handle */}
          <div 
            className="absolute bg-primary cursor-nw-resize opacity-50 hover:opacity-100 transition-opacity z-20"
            style={{
              bottom: '0',
              right: '0',
              width: `${Math.max(3, 3 / scale)}px`,
              height: `${Math.max(3, 3 / scale)}px`
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              setIsResizing(true);
              const startX = e.clientX;
              const startY = e.clientY;
              const startWidth = width;
              const startHeight = height;
              
              const handleMouseMove = (e: MouseEvent) => {
                e.preventDefault();
                const deltaX = (e.clientX - startX) / scale;
                const deltaY = (e.clientY - startY) / scale;
                const newWidth = Math.max(320, startWidth + deltaX);
                const newHeight = Math.max(200, startHeight + deltaY);
                onResize(newWidth, newHeight);
              };
              
              const handleMouseUp = (e: MouseEvent) => {
                e.preventDefault();
                setIsResizing(false);
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };
              
              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
          />
          
          {/* Rendered Content */}
          <div 
            className={`w-full h-full origin-top-left ${isResizing ? 'select-none pointer-events-none' : ''}`}
            style={{ 
              transform: `scale(${scale})`,
              width: `${width}px`,
              height: `${height}px`,
              overflow: scale === 1 ? 'auto' : 'hidden'
            }}
          >
            <div 
              className="w-full h-full"
              style={{ 
                overflow: 'auto',
                width: `${width}px`,
                height: `${height}px`
              }}
            >
              <Renderer />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function JsonEditorModal({ 
  isOpen, 
  onOpenChange, 
  value, 
  onChange,
  onFormat,
  onValidate,
  onGeneratePreview,
  onDownload,
  isValidated,
  isValidating,
  issues
}: { 
  isOpen: boolean; 
  onOpenChange: (open: boolean) => void; 
  value: string; 
  onChange: (value: string) => void;
  onFormat: () => void;
  onValidate: () => void;
  onGeneratePreview: () => void;
  onDownload: () => void;
  isValidated: boolean;
  isValidating: boolean;
  issues: string[];
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent 
        className="vscode-dark dark flex flex-col bg-popover border border-border text-foreground p-0"
        style={{ 
          width: '90vw', 
          height: '90vh', 
          maxWidth: '90vw',
          maxHeight: '90vh'
        }}
      >
        <DialogHeader className="p-6 pb-4 border-b border-border bg-popover">
          <DialogTitle className="text-foreground">JSON Editor</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col gap-4 min-h-0 p-6 bg-popover text-foreground">
          {/* Editor */}
          <div className="flex-1 border border-border rounded-md overflow-hidden bg-input">
            <Editor
              height="100%"
              defaultLanguage="json"
              value={value}
              onChange={(val) => onChange(val || "")}
              theme="vs-dark"
              options={{
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                fontSize: 14,
                tabSize: 2,
                wordWrap: "on",
                formatOnPaste: true,
                formatOnType: true,
                folding: true,
                lineNumbers: "on"
              }}
            />
          </div>
          
          {/* Action Buttons */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <Button 
                onClick={onFormat} 
                variant="outline" 
                size="sm" 
                disabled={!value.trim()}
                className="flex-1 bg-secondary border border-border text-foreground hover:bg-secondary"
              >
                <Code2 className="h-4 w-4 mr-1" />
                Format
              </Button>
              <Button 
                onClick={onDownload} 
                variant="outline" 
                size="sm" 
                disabled={!value.trim()}
                className="flex-1 bg-secondary border border-border text-foreground hover:bg-secondary"
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={onValidate} 
                variant={isValidated ? "default" : "outline"}
                size="sm" 
                disabled={!value.trim() || isValidating}
                className="flex-1"
              >
                {isValidating ? (
                  <>Loading...</>
                ) : (
                  <>
                    <FileCheck className="h-4 w-4 mr-1" />
                    Validate
                    {isValidated && <Check className="h-4 w-4 ml-1" />}
                  </>
                )}
              </Button>
              
              <Button 
                onClick={onGeneratePreview} 
                variant="default"
                size="sm" 
                disabled={!value.trim() || (!isValidated && !isValidating)}
                className="flex-1"
              >
                <Eye className="h-4 w-4 mr-1" />
                Preview
              </Button>
            </div>
          </div>
          
          {/* Validation Issues */}
          {issues.length > 0 && (
            <Card className="border-destructive bg-destructive/10">
              <CardContent className="pt-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                  <div className="text-destructive text-sm whitespace-pre-wrap font-mono">
                    {issues.join("\n")}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ProjectEditor() {
  const { project, setProject, selectedPageId, setSelectedPageId } = useProject();
  const [raw, setRaw] = useState("");
  const [issues, setIssues] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [isValidated, setIsValidated] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const onValidate = useCallback(async () => {
    if (!raw.trim()) {
      setIssues(["No JSON content to validate"]);
      setIsValidated(false);
      return;
    }
    
    setIsValidating(true);
    try {
      const json = JSON.parse(raw);
      const res = validateProjectData(json);
      if (!res.ok) {
        setIssues(res.issues);
        setIsValidated(false);
      } else {
        setIssues([]);
        setIsValidated(true);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setIssues([`JSON Parse Error: ${msg}`]);
      setIsValidated(false);
    } finally {
      setIsValidating(false);
    }
  }, [raw]);

  const onGeneratePreview = useCallback(async () => {
    if (!isValidated) {
      await onValidate();
      return;
    }

    try {
      const json = JSON.parse(raw);
      const res = validateProjectData(json);
      if (res.ok) {
        setProject(res.data);
        setSelectedPageId(res.data.pages.homePageId);
        setIsModalOpen(false); // Close modal after generating preview
      }
    } catch (e) {
      console.error("Unexpected error during preview generation:", e);
    }
  }, [raw, isValidated, onValidate, setProject, setSelectedPageId]);

  const onFormat = useCallback(() => {
    try {
      const json = JSON.parse(raw);
      setRaw(JSON.stringify(json, null, 2));
      setIssues([]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setIssues([`JSON Parse Error: ${msg}`]);
    }
  }, [raw]);

  const onFile = useCallback(async (f: File) => {
    try {
    const txt = await f.text();
      JSON.parse(txt);
    setRaw(txt);
      setIssues([]);
      setIsValidated(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setIssues([`Invalid JSON file: ${msg}`]);
      setIsValidated(false);
    }
  }, []);

  const onDownload = useCallback(() => {
    if (!raw.trim()) return;
    
    try {
      const json = JSON.parse(raw);
      const formatted = JSON.stringify(json, null, 2);
      
      const blob = new Blob([formatted], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'project.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      setIssues([`Cannot download invalid JSON: ${e instanceof Error ? e.message : String(e)}`]);
    }
  }, [raw]);

  const onReset = useCallback(() => {
    setRaw("");
    setProject(undefined);
    setSelectedPageId(undefined);
    setIssues([]);
    setIsValidated(false);
  }, [setProject, setSelectedPageId]);

  return (
    <div className="h-full flex flex-col bg-sidebar text-sidebar-foreground">
      <div className="p-6 pb-4 bg-sidebar border-b border-sidebar-border">
        <div className="flex items-center gap-2 text-lg text-sidebar-foreground">
          <Settings className="h-5 w-5" />
          Project Editor
          {project && <Badge variant="secondary" className="ml-auto bg-primary text-primary-foreground">Loaded</Badge>}
        </div>
      </div>
      
      <div className="flex-1 flex flex-col gap-4 overflow-hidden bg-sidebar text-sidebar-foreground p-6">
        {/* File Upload */}
        <div className="space-y-2">
          <Label htmlFor="file-upload" className="text-sm font-medium text-muted-foreground">Upload JSON File</Label>
          <div className="flex gap-2">
            <Input 
              id="file-upload"
              type="file" 
              accept="application/json" 
              onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); }}
              className="flex-1 bg-input border-border text-foreground"
            />
            <Button variant="outline" size="sm" onClick={onReset} title="Reset" className="bg-secondary border-border text-foreground hover:bg-secondary">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* JSON Editor */}
        <div className="flex-1 flex flex-col space-y-2 min-h-0">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-muted-foreground">JSON Content</Label>
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(true)} className="text-muted-foreground hover:text-foreground hover:bg-secondary border border-border rounded">
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 border border-border rounded-md overflow-hidden">
            <Editor
              height="100%"
              defaultLanguage="json"
              value={raw}
              onChange={(value) => {
                setRaw(value || "");
                setIsValidated(false);
              }}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: 13,
                tabSize: 2,
                wordWrap: "on",
                formatOnPaste: true,
                formatOnType: true
              }}
            />
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Button 
              onClick={onFormat} 
              variant="outline" 
              size="sm" 
              disabled={!raw.trim()}
              className="flex-1 bg-secondary border border-border text-foreground hover:bg-secondary"
            >
              <Code2 className="h-4 w-4 mr-1" />
              Format
            </Button>
            <Button 
              onClick={onDownload} 
              variant="outline" 
              size="sm" 
              disabled={!raw.trim()}
              className="flex-1 bg-secondary border border-border text-foreground hover:bg-secondary"
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={onValidate} 
              variant={isValidated ? "default" : "outline"}
              size="sm" 
              disabled={!raw.trim() || isValidating}
              className="flex-1"
            >
              {isValidating ? (
                <>Loading...</>
              ) : (
                <>
                  <FileCheck className="h-4 w-4 mr-1" />
                  Validate
                  {isValidated && <Check className="h-4 w-4 ml-1" />}
                </>
              )}
            </Button>
            
            <Button 
              onClick={onGeneratePreview} 
              variant="default"
              size="sm" 
              disabled={!raw.trim() || (!isValidated && !isValidating)}
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-1" />
              Preview
            </Button>
          </div>
        </div>
        
        {/* Validation Issues */}
        {issues.length > 0 && (
          <Card className="border-red-800 bg-red-900/20">
            <CardContent className="pt-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                <div className="text-red-300 text-sm whitespace-pre-wrap font-mono">
                  {issues.join("\n")}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* JSON Editor Modal */}
      <JsonEditorModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        value={raw}
        onChange={setRaw}
        onFormat={onFormat}
        onValidate={onValidate}
        onGeneratePreview={onGeneratePreview}
        onDownload={onDownload}
        isValidated={isValidated}
        isValidating={isValidating}
        issues={issues}
      />
    </div>
  );
}

function PreviewInner() {
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [previewWidth, setPreviewWidth] = useState(1024);
  const [previewHeight, setPreviewHeight] = useState(768);
  const [previewScale, setPreviewScale] = useState(1);
  
  const handleResize = useCallback((width: number, height: number) => {
    setPreviewWidth(width);
    setPreviewHeight(height);
  }, []);

  const handleScaleChange = useCallback((scale: number) => {
    setPreviewScale(scale);
  }, []);

  return (
    <div className="h-screen flex bg-background">
      <PanelGroup direction="horizontal">
        {/* Collapsible Resizable Panel */}
        {isPanelOpen && (
          <>
            <Panel defaultSize={25} minSize={15} maxSize={50}>
              <div className="h-full bg-sidebar border-r border-sidebar-border">
                <ProjectEditor />
          </div>
            </Panel>
            
            {/* Resize Handle */}
            <PanelResizeHandle className="w-1 bg-border hover:bg-ring transition-colors" />
          </>
        )}
        
        {/* Preview Area */}
        <Panel defaultSize={isPanelOpen ? 75 : 100}>
          <div className="h-full relative">
            {/* Panel Toggle Button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 left-4 z-50 bg-secondary/90 backdrop-blur-sm shadow-lg hover:bg-secondary text-foreground border border-border"
              onClick={() => setIsPanelOpen(!isPanelOpen)}
            >
              {isPanelOpen ? '⮜' : '⮞'}
            </Button>
            
            <PreviewPanel 
              width={previewWidth}
              height={previewHeight}
              scale={previewScale}
              onResize={handleResize}
              onScaleChange={handleScaleChange}
            />
      </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}

export default function Page() {
  return (
    <div className="dark vscode-dark">
    <ProjectProvider>
      <PreviewInner />
    </ProjectProvider>
    </div>
  );
}
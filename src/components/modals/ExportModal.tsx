/**
 * ExportModal Component
 * Phase 21: Export Engine
 * 
 * Displays the exported MJML and HTML code with tabs and copy functionality.
 */

"use client";

import { useState } from "react";
import { Check, Copy, Code2, FileCode, Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mjmlCode: string;
  htmlCode: string;
  errors?: string[];
}

export function ExportModal({
  open,
  onOpenChange,
  mjmlCode,
  htmlCode,
  errors = [],
}: ExportModalProps) {
  const [copiedTab, setCopiedTab] = useState<"html" | "mjml" | null>(null);
  const [copiedVisual, setCopiedVisual] = useState(false);

  const handleCopy = async (code: string, tab: "html" | "mjml") => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedTab(tab);
      setTimeout(() => setCopiedTab(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  /**
   * Visual Copy - Uses ClipboardItem API to write text/html blob
   * This allows pasting directly into Gmail/Outlook as rendered HTML
   */
  const handleCopyVisuals = async () => {
    try {
      // 1. Create Blobs for both HTML (rich text) and Plain Text (fallback)
      const blobHtml = new Blob([htmlCode], { type: "text/html" });
      const blobText = new Blob([htmlCode], { type: "text/plain" });

      // 2. Write to Clipboard using the Advanced API
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": blobHtml,
          "text/plain": blobText,
        }),
      ]);

      // 3. Feedback
      setCopiedVisual(true);
      setTimeout(() => setCopiedVisual(false), 2000);
    } catch (err) {
      console.error("Failed to copy visuals:", err);
      alert("Your browser does not support visual copying. Please use the 'Copy Code' button.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code2 className="h-5 w-5 text-primary" />
            Export Email
          </DialogTitle>
          <DialogDescription>
            Copy the generated code to use in your email campaigns. HTML is
            ready for Gmail/Outlook, MJML can be used with MJML-compatible
            tools.
          </DialogDescription>
        </DialogHeader>

        {/* Error Display */}
        {errors.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-sm">
            <p className="font-medium text-amber-800 mb-1">
              Compilation Warnings:
            </p>
            <ul className="list-disc list-inside text-amber-700 space-y-0.5">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <Tabs defaultValue="html" className="flex-1 flex flex-col">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="html" className="gap-1.5">
                <FileCode className="h-4 w-4" />
                HTML
              </TabsTrigger>
              <TabsTrigger value="mjml" className="gap-1.5">
                <Code2 className="h-4 w-4" />
                MJML
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value="html"
            className="mt-2 data-[state=inactive]:hidden"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">
                Email-ready HTML with inline styles and table layout
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  className="h-8 gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleCopyVisuals}
                >
                  {copiedVisual ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Mail className="h-3.5 w-3.5" />
                      Copy for Gmail / Outlook
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1.5"
                  onClick={() => handleCopy(htmlCode, "html")}
                >
                  {copiedTab === "html" ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-green-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy Code
                    </>
                  )}
                </Button>
              </div>
            </div>
            <pre className="h-[350px] overflow-auto bg-slate-950 text-slate-100 rounded-md p-4 text-xs font-mono leading-relaxed">
              <code>{htmlCode}</code>
            </pre>
          </TabsContent>

          <TabsContent
            value="mjml"
            className="mt-2 data-[state=inactive]:hidden"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">
                MJML source code for use with MJML tools
              </span>
              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1.5"
                onClick={() => handleCopy(mjmlCode, "mjml")}
              >
                {copiedTab === "mjml" ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-green-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copy MJML
                  </>
                )}
              </Button>
            </div>
            <pre className="h-[350px] overflow-auto bg-slate-950 text-slate-100 rounded-md p-4 text-xs font-mono leading-relaxed">
              <code>{mjmlCode}</code>
            </pre>
          </TabsContent>
        </Tabs>

        {/* Stats footer */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
          <span>
            HTML: {(htmlCode.length / 1024).toFixed(1)} KB
          </span>
          <span>
            MJML: {(mjmlCode.length / 1024).toFixed(1)} KB
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

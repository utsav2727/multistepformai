"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Check,
  Loader2,
  Cloud,
  CloudOff,
  Globe,
  GlobeLock,
  ExternalLink,
  Code,
  Share2,
  Copy,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface BuilderTopbarProps {
  formId: string;
  title: string;
  onTitleChange: (title: string) => void;
  saving: boolean;
  lastSaved: Date | null;
  isDirty: boolean;
  status: "draft" | "published" | "archived";
  onPublishToggle: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BuilderTopbar({
  formId,
  title,
  onTitleChange,
  saving,
  lastSaved,
  isDirty,
  status,
  onPublishToggle,
  activeTab,
  onTabChange,
}: BuilderTopbarProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingTitle && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingTitle]);

  const handleTitleSave = () => {
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== title) {
      onTitleChange(trimmed);
    } else {
      setEditTitle(title);
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleTitleSave();
    } else if (e.key === "Escape") {
      setEditTitle(title);
      setIsEditingTitle(false);
    }
  };

  const publicUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/f/${formId}`
      : `/f/${formId}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      toast.success("Form link copied to clipboard");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const tabs = [
    { id: "editor", label: "Editor" },
    { id: "preview", label: "Preview" },
    { id: "embed", label: "Embed" },
    { id: "settings", label: "Settings" },
  ];

  const renderSaveStatus = () => {
    if (saving) {
      return (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Loader2 className="size-3 animate-spin" />
          <span className="hidden sm:inline">Saving...</span>
        </div>
      );
    }

    if (isDirty) {
      return (
        <div className="flex items-center gap-1.5 text-xs text-amber-600">
          <CloudOff className="size-3" />
          <span className="hidden sm:inline">Unsaved</span>
        </div>
      );
    }

    if (lastSaved) {
      return (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Cloud className="size-3" />
          <span className="hidden sm:inline">Saved</span>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col border-b bg-background">
      {/* Top row: back, title, status, save, publish */}
      <div className="flex h-14 items-center px-3 sm:px-4 gap-2 sm:gap-4">
        {/* Back button */}
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          <ArrowLeft className="size-4" />
        </Link>

        {/* Title */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {isEditingTitle ? (
            <Input
              ref={inputRef}
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={handleTitleKeyDown}
              className="h-8 text-sm font-semibold w-full max-w-64"
            />
          ) : (
            <button
              onClick={() => {
                setEditTitle(title);
                setIsEditingTitle(true);
              }}
              className="text-sm font-semibold truncate max-w-40 sm:max-w-64 hover:text-primary transition-colors cursor-text"
              title="Click to edit title"
            >
              {title}
            </button>
          )}

          {/* Status badge */}
          <Badge
            variant={status === "published" ? "default" : "secondary"}
            className="text-[10px] shrink-0 hidden sm:inline-flex"
          >
            {status}
          </Badge>
        </div>

        {/* Save status */}
        <div className="shrink-0">{renderSaveStatus()}</div>

        {/* Share dropdown — only when published */}
        {status === "published" && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 shrink-0">
                <Share2 className="size-3.5" />
                <span className="hidden sm:inline">Share</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={copyLink}>
                <Copy className="mr-2 size-4" />
                Copy Link
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.open(publicUrl, "_blank")}>
                <ExternalLink className="mr-2 size-4" />
                Open Form
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onTabChange("embed")}>
                <Code className="mr-2 size-4" />
                Embed Code
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Publish toggle */}
        <Button
          variant={status === "published" ? "outline" : "default"}
          size="sm"
          onClick={onPublishToggle}
          className="gap-1.5 shrink-0"
        >
          {status === "published" ? (
            <>
              <GlobeLock className="size-3.5" />
              <span className="hidden sm:inline">Unpublish</span>
            </>
          ) : (
            <>
              <Globe className="size-3.5" />
              <span className="hidden sm:inline">Publish</span>
            </>
          )}
        </Button>
      </div>

      {/* Bottom row: tabs */}
      <div className="flex items-center gap-1 px-3 sm:px-4 pb-2">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onTabChange(tab.id)}
            className="text-xs flex-1 sm:flex-none"
          >
            {tab.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

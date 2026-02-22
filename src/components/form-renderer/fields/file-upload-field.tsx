"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";
import type { FieldProps } from "../field-renderer";

interface FileInfo {
  name: string;
  size: number;
  type: string;
}

export function FileUploadField({ field, value, onChange, onBlur, error, touched }: FieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileInfos, setFileInfos] = useState<FileInfo[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);

  const maxFileSize = field.maxFileSize || 10; // MB
  const maxFiles = field.maxFiles || 1;
  const allowedTypes = field.allowedFileTypes || [];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setFileError(null);

    const fileList = Array.from(files);

    // Check max files
    if (fileList.length > maxFiles) {
      setFileError(`Maximum ${maxFiles} file(s) allowed`);
      return;
    }

    // Validate each file
    for (const file of fileList) {
      // Check file size
      if (file.size > maxFileSize * 1024 * 1024) {
        setFileError(`File "${file.name}" exceeds maximum size of ${maxFileSize}MB`);
        return;
      }

      // Check file type
      if (allowedTypes.length > 0) {
        const ext = `.${file.name.split(".").pop()?.toLowerCase()}`;
        const typeMatch = allowedTypes.some(
          (t) =>
            t === ext ||
            t === file.type ||
            (t.endsWith("/*") && file.type.startsWith(t.replace("/*", "/")))
        );
        if (!typeMatch) {
          setFileError(
            `File "${file.name}" is not an allowed type. Allowed: ${allowedTypes.join(", ")}`
          );
          return;
        }
      }
    }

    const infos = fileList.map((f) => ({
      name: f.name,
      size: f.size,
      type: f.type,
    }));

    setFileInfos(infos);

    // Store file names as the value (actual upload handling depends on backend)
    const fileNames = fileList.map((f) => f.name);
    onChange(fileNames.length === 1 ? fileNames[0] : fileNames);

    if (onBlur) onBlur();
  };

  const handleRemove = () => {
    setFileInfos([]);
    setFileError(null);
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const displayError = fileError || (touched ? error : undefined);

  return (
    <div className="space-y-2">
      <Label>
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {field.description && (
        <p className="text-muted-foreground text-xs">{field.description}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={allowedTypes.join(",")}
        multiple={maxFiles > 1}
        onChange={handleFileChange}
      />

      {fileInfos.length === 0 ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="border-input hover:bg-accent flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed p-6 transition-colors"
        >
          <Upload className="text-muted-foreground size-8" />
          <span className="text-muted-foreground text-sm">
            Click to upload {maxFiles > 1 ? `(up to ${maxFiles} files)` : "a file"}
          </span>
          {allowedTypes.length > 0 && (
            <span className="text-muted-foreground text-xs">
              {allowedTypes.join(", ")}
            </span>
          )}
          <span className="text-muted-foreground text-xs">
            Max size: {maxFileSize}MB
          </span>
        </button>
      ) : (
        <div className="space-y-2">
          {fileInfos.map((info, idx) => (
            <div
              key={idx}
              className="bg-muted/50 flex items-center justify-between rounded-md border p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{info.name}</p>
                <p className="text-muted-foreground text-xs">
                  {formatSize(info.size)}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={handleRemove}
              >
                <X className="size-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {displayError && (
        <p className="text-destructive text-xs">{displayError}</p>
      )}
    </div>
  );
}

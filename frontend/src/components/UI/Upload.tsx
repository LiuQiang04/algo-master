import { useState, useRef, useCallback, type ReactNode, type ChangeEvent } from 'react';
import { Upload as UploadIcon, X, FileIcon, CheckCircle2, AlertCircle } from 'lucide-react';

/* ============================================
   Types
   ============================================ */

type FileStatus = 'pending' | 'uploading' | 'done' | 'error';

interface UploadFile {
  uid: string;
  name: string;
  size: number;
  type: string;
  status: FileStatus;
  progress: number;
  /** Object URL for preview (images) */
  url?: string;
  /** Server response after upload */
  response?: unknown;
  /** Error message if upload failed */
  error?: string;
  /** The raw File object */
  raw: File;
}

interface UploadProps {
  /** Upload endpoint URL */
  action?: string;
  /** Accepted file types (e.g. ".jpg,.png,.gif" or "image/*") */
  accept?: string;
  /** Whether to allow multiple file selection. Default: false */
  multiple?: boolean;
  /** Maximum number of files allowed */
  maxCount?: number;
  /** Maximum file size in bytes */
  maxSize?: number;
  /** Custom upload handler. If provided, overrides the default XHR upload */
  customRequest?: (file: UploadFile) => Promise<unknown>;
  /** Called when the file list changes */
  onChange?: (files: UploadFile[]) => void;
  /** Called when a file is removed */
  onRemove?: (file: UploadFile) => void;
  /** Whether to show file list. Default: true */
  showFileList?: boolean;
  /** Whether to enable drag-and-drop. Default: true */
  draggable?: boolean;
  /** Extra className for the wrapper */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Children to render as the upload trigger (overrides default button) */
  children?: ReactNode;
}

/* ============================================
   Helpers
   ============================================ */

let uidCounter = 0;
function genUid(): string {
  return `upload-${Date.now()}-${++uidCounter}`;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImage(type: string): boolean {
  return type.startsWith('image/');
}

/* ============================================
   Upload
   ============================================ */

export default function Upload({
  action,
  accept,
  multiple = false,
  maxCount,
  maxSize,
  customRequest,
  onChange,
  onRemove,
  showFileList = true,
  draggable = true,
  className = '',
  disabled = false,
  children,
}: UploadProps) {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const updateFileList = useCallback(
    (updater: (prev: UploadFile[]) => UploadFile[]) => {
      setFileList((prev) => {
        const next = updater(prev);
        onChange?.(next);
        return next;
      });
    },
    [onChange],
  );

  /** Validate and add files */
  const addFiles = useCallback(
    (rawFiles: FileList | File[]) => {
      const files = Array.from(rawFiles);
      const newEntries: UploadFile[] = [];

      for (const file of files) {
        // Check maxCount
        if (maxCount !== undefined && fileList.length + newEntries.length >= maxCount) {
          break;
        }

        // Check maxSize
        if (maxSize !== undefined && file.size > maxSize) {
          const entry: UploadFile = {
            uid: genUid(),
            name: file.name,
            size: file.size,
            type: file.type,
            status: 'error',
            progress: 0,
            error: `文件大小超过限制 (${formatSize(maxSize)})`,
            raw: file,
          };
          newEntries.push(entry);
          continue;
        }

        const entry: UploadFile = {
          uid: genUid(),
          name: file.name,
          size: file.size,
          type: file.type,
          status: 'pending',
          progress: 0,
          url: isImage(file.type) ? URL.createObjectURL(file) : undefined,
          raw: file,
        };
        newEntries.push(entry);
      }

      if (newEntries.length === 0) return;

      updateFileList((prev) => [...prev, ...newEntries]);

      // Start uploading entries that are pending
      for (const entry of newEntries) {
        if (entry.status === 'pending') {
          startUpload(entry);
        }
      }
    },
    [fileList.length, maxCount, maxSize, updateFileList],
  );

  /** Start uploading a single file */
  const startUpload = useCallback(
    async (fileEntry: UploadFile) => {
      // Mark as uploading
      updateFileList((prev) =>
        prev.map((f) => (f.uid === fileEntry.uid ? { ...f, status: 'uploading' as const, progress: 0 } : f)),
      );

      try {
        if (customRequest) {
          const response = await customRequest(fileEntry);
          updateFileList((prev) =>
            prev.map((f) =>
              f.uid === fileEntry.uid ? { ...f, status: 'done' as const, progress: 100, response } : f,
            ),
          );
        } else if (action) {
          // Default XHR upload with progress
          await xhrUpload(fileEntry, action, (progress) => {
            updateFileList((prev) =>
              prev.map((f) => (f.uid === fileEntry.uid ? { ...f, progress } : f)),
            );
          });
          updateFileList((prev) =>
            prev.map((f) => (f.uid === fileEntry.uid ? { ...f, status: 'done' as const, progress: 100 } : f)),
          );
        } else {
          // No action and no customRequest — just mark as done (local mode)
          updateFileList((prev) =>
            prev.map((f) => (f.uid === fileEntry.uid ? { ...f, status: 'done' as const, progress: 100 } : f)),
          );
        }
      } catch (err) {
        updateFileList((prev) =>
          prev.map((f) =>
            f.uid === fileEntry.uid
              ? { ...f, status: 'error' as const, error: err instanceof Error ? err.message : '上传失败' }
              : f,
          ),
        );
      }
    },
    [action, customRequest, updateFileList],
  );

  /** Remove a file */
  const handleRemove = useCallback(
    (file: UploadFile) => {
      if (file.url) URL.revokeObjectURL(file.url);
      updateFileList((prev) => prev.filter((f) => f.uid !== file.uid));
      onRemove?.(file);
    },
    [updateFileList, onRemove],
  );

  /** Input change */
  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.length) {
        addFiles(e.target.files);
        e.target.value = '';
      }
    },
    [addFiles],
  );

  /** Drag events */
  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) setDragOver(true);
    },
    [disabled],
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (!disabled && e.dataTransfer.files.length) {
        addFiles(e.dataTransfer.files);
      }
    },
    [disabled, addFiles],
  );

  const openPicker = useCallback(() => {
    if (!disabled) inputRef.current?.click();
  }, [disabled]);

  return (
    <div className={className}>
      {/* Drop zone / trigger */}
      {draggable ? (
        <div
          className={`
            relative border-2 border-dashed rounded-[var(--radius-xl)] p-6 text-center cursor-pointer transition-colors
            ${dragOver
              ? 'border-[var(--primary-400)] bg-[var(--primary-50)]'
              : disabled
                ? 'border-[var(--border-light)] bg-[var(--bg-tertiary)] opacity-50 cursor-not-allowed'
                : 'border-[var(--border-light)] hover:border-[var(--primary-300)] hover:bg-[var(--bg-card-hover)]'
            }
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openPicker}
        >
          {children ?? (
            <div className="flex flex-col items-center gap-2">
              <UploadIcon size={32} className={dragOver ? 'text-[var(--primary-500)]' : 'text-[var(--text-muted)]'} />
              <p className="text-sm text-[var(--text-secondary)]">
                将文件拖拽到此处，或 <span className="text-[var(--primary-600)] font-medium">点击上传</span>
              </p>
              {maxSize && (
                <p className="text-xs text-[var(--text-muted)]">单个文件最大 {formatSize(maxSize)}</p>
              )}
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleInputChange}
            className="hidden"
            disabled={disabled}
          />
        </div>
      ) : (
        <>
          {children ? (
            <div onClick={openPicker} className="inline-block">
              {children}
            </div>
          ) : (
            <button
              type="button"
              onClick={openPicker}
              disabled={disabled}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-[var(--border-light)] rounded-[var(--radius-lg)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UploadIcon size={16} />
              上传文件
            </button>
          )}
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleInputChange}
            className="hidden"
            disabled={disabled}
          />
        </>
      )}

      {/* File list */}
      {showFileList && fileList.length > 0 && (
        <div className="mt-3 space-y-2">
          {fileList.map((file) => (
            <div
              key={file.uid}
              className="flex items-center gap-3 px-3 py-2 bg-[var(--bg-secondary)] rounded-[var(--radius-md)] border border-[var(--border-light)]"
            >
              {/* Thumbnail / icon */}
              {file.url ? (
                <img
                  src={file.url}
                  alt={file.name}
                  className="w-10 h-10 rounded-[var(--radius-sm)] object-cover shrink-0"
                />
              ) : (
                <div className="w-10 h-10 flex items-center justify-center rounded-[var(--radius-sm)] bg-[var(--bg-tertiary)] shrink-0">
                  <FileIcon size={18} className="text-[var(--text-muted)]" />
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[var(--text-primary)] truncate">{file.name}</p>
                <p className="text-xs text-[var(--text-muted)]">{formatSize(file.size)}</p>

                {/* Progress bar (while uploading) */}
                {file.status === 'uploading' && (
                  <div className="mt-1 w-full h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--primary-500)] rounded-full transition-all duration-300"
                      style={{ width: `${file.progress}%` }}
                    />
                  </div>
                )}

                {/* Error message */}
                {file.status === 'error' && file.error && (
                  <p className="mt-0.5 text-xs text-[var(--danger-500)]">{file.error}</p>
                )}
              </div>

              {/* Status icon */}
              {file.status === 'done' && (
                <CheckCircle2 size={18} className="text-[var(--success-500)] shrink-0" />
              )}
              {file.status === 'error' && (
                <AlertCircle size={18} className="text-[var(--danger-500)] shrink-0" />
              )}
              {file.status === 'uploading' && (
                <span className="text-xs text-[var(--text-muted)] shrink-0">{file.progress}%</span>
              )}

              {/* Remove button */}
              <button
                onClick={() => handleRemove(file)}
                className="p-1 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors shrink-0"
                aria-label="移除文件"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================
   XHR upload with progress
   ============================================ */

function xhrUpload(
  fileEntry: UploadFile,
  action: string,
  onProgress: (percent: number) => void,
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('file', fileEntry.raw);

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch {
          resolve(xhr.responseText);
        }
      } else {
        reject(new Error(`上传失败 (${xhr.status})`));
      }
    });

    xhr.addEventListener('error', () => reject(new Error('网络错误')));
    xhr.addEventListener('abort', () => reject(new Error('上传已取消')));

    xhr.open('POST', action);
    xhr.send(formData);
  });
}

export type { UploadFile };

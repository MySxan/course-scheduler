import React from "react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmDialogTitle"
    >
      <div className="card bg-base-100 w-full max-w-md shadow-xl overflow-hidden">
        <div className="card-body p-6 gap-4">
          <div className="flex-1 items-start gap-3">
            <div className="space-y-1 flex items-center gap-3 mb-2">
              <span className="text-warning">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 9v4" />
                  <path d="M12 17h.01" />
                  <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
                </svg>
              </span>
              <div id="confirmDialogTitle" className="text-lg font-semibold">
                {title}
              </div>
            </div>
            <p className="text-sm text-base-content/70">{description}</p>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              className="btn shadow-none"
              onClick={onCancel}
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              className="btn btn-warning shadow-none"
              onClick={onConfirm}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

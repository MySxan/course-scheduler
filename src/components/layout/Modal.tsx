import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-lg m-4 relative animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-4 border-b border-base-200">
          <h3 className="text-lg font-bold text-base-content">{title}</h3>
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost text-base-content"
          >
            ✕
          </button>
        </div>
        <div className="p-4 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
      <div className="absolute inset-0 -z-10" onClick={onClose}></div>
    </div>
  );
};

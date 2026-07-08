import { useEffect, useRef } from "react";
import { CloseSquare } from "iconsax-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, description, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };

    const handleClick = (e: MouseEvent) => {
      const rect = dialog.getBoundingClientRect();
      const isInDialog =
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width;

      if (!isInDialog) {
        onClose();
      }
    };

    dialog.addEventListener("cancel", handleCancel);
    dialog.addEventListener("click", handleClick);

    return () => {
      dialog.removeEventListener("cancel", handleCancel);
      dialog.removeEventListener("click", handleClick);
    };
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-y-0 right-0 m-0 ml-auto h-full max-h-screen w-full max-w-3xl rounded-l-2xl rounded-r-none bg-white p-0 shadow-2xl backdrop:bg-slate-900/40 backdrop:backdrop-blur-sm open:animate-in open:fade-in-0 open:slide-in-from-right-full flex-col overflow-hidden sm:max-w-xl"
      style={{ display: isOpen ? 'flex' : 'none' }}
    >
      <div className="flex shrink-0 items-start justify-between border-b p-6 divider-accent bg-white z-10">
        <div>
          <h2 className="text-lg font-semibold leading-6 text-slate-950">{title}</h2>
          {description && <p className="mt-1 text-sm leading-5 text-slate-500">{description}</p>}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
        >
          <CloseSquare color="#2563eb" size={24} variant="Outline" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
        {children}
      </div>
    </dialog>
  );
}

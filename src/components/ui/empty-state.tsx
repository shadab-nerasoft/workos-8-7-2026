import { InfoCircle } from "iconsax-react";

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="surface-card flex min-h-48 flex-col items-center justify-center border-dashed p-8 text-center">
      <InfoCircle size={28} color="currentColor" className="text-primary-600" variant="Outline" aria-hidden="true" />
      <h3 className="mt-4 text-base font-semibold leading-7 text-slate-950">{title}</h3>
      <p className="mt-1 max-w-md text-sm leading-6 text-slate-600">{message}</p>
    </div>
  );
}

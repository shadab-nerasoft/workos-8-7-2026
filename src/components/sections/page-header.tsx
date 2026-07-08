interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
}

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <header className="mb-6 flex flex-col gap-2">
      <p className="text-xs font-semibold uppercase leading-5 tracking-normal text-primary-600">{eyebrow}</p>
      <h1 className="max-w-4xl text-2xl font-bold leading-[34px] text-slate-950 md:text-3xl md:leading-[36px]">
        {title}
      </h1>
      <p className="max-w-3xl text-base leading-7 text-slate-600">{description}</p>
    </header>
  );
}

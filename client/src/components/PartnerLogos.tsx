const PARTNERS = ['AWS', 'Microsoft', 'Vercel', 'Lovable', 'OpenAI', 'Minimax'] as const;

export function PartnerLogos() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-70">
      {PARTNERS.map((name) => (
        <span
          key={name}
          className="text-sm font-semibold tracking-tight text-neutral-500 dark:text-white/40 transition-colors hover:text-neutral-800 dark:hover:text-white/60"
        >
          {name}
        </span>
      ))}
    </div>
  );
}

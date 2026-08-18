export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-700',
    CONFIRMED: 'bg-blue-100 text-blue-700',
    PREPARING: 'bg-indigo-100 text-indigo-700',
    READY: 'bg-violet-100 text-violet-700',
    IN_TRANSIT: 'bg-cyan-100 text-cyan-700',
    PICKED_UP: 'bg-sky-100 text-sky-700',
    DELIVERED: 'bg-emerald-100 text-emerald-700',
    CANCELLED: 'bg-red-100 text-red-700',
    PAID: 'bg-emerald-100 text-emerald-700',
    COD: 'bg-slate-100 text-slate-700',
  };
  const label = status.replace(/_/g, ' ').toLowerCase();

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
        styles[status] ?? 'bg-slate-100 text-slate-600'
      }`}
    >
      {label}
    </span>
  );
}

export function formatPrice(amount: number): string {
  return `${amount.toFixed(2).replace('.', ',')} €`;
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function Spinner({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-spin rounded-full border-2 border-slate-300 border-t-orange-500 ${className ?? 'h-8 w-8'}`}
    />
  );
}

export function EmptyState({
  icon = '🛵',
  title,
  subtitle,
}: {
  icon?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <span className="mb-3 text-5xl">{icon}</span>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
    </div>
  );
}

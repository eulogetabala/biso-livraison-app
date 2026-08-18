import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMyOrdersQuery } from '../graphql/operations';
import { EmptyState, Spinner, StatusBadge, formatDate, formatPrice } from '../components/ui';

export function OrdersPage() {
  const [page, setPage] = useState(1);
  const { data, loading, error } = useMyOrdersQuery({
    variables: { page, limit: 8 },
  });

  const orders = data?.myOrders.items ?? [];
  const pageInfo = data?.myOrders.pageInfo;

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="h-10 w-10" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Mes commandes</h1>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error.message}
        </div>
      )}

      {!loading && orders.length === 0 && (
        <EmptyState
          icon="📦"
          title="Aucune commande pour le moment"
          subtitle="Parcourez les restaurants et commandez votre premier repas."
        />
      )}

      <div className="space-y-4">
        {orders.map((order) => (
          <Link
            key={order.id}
            to={`/orders/${order.id}`}
            className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
                  {order.restaurant?.imageUrl ? (
                    <img
                      src={order.restaurant.imageUrl}
                      alt={order.restaurant.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-xl">🍽️</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">
                    {order.restaurant?.name ?? 'Restaurant'}
                  </p>
                  <p className="text-sm text-slate-500">
                    {formatDate(order.createdAt)} · #{order.id.slice(0, 8)}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <StatusBadge status={order.status} />
                <span className="font-semibold text-slate-900">
                  {formatPrice(order.grandTotal)}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {pageInfo && pageInfo.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            ← Précédent
          </button>
          <span className="text-sm text-slate-500">
            Page {pageInfo.currentPage} / {pageInfo.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!pageInfo.hasNextPage}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            Suivant →
          </button>
        </div>
      )}
    </div>
  );
}

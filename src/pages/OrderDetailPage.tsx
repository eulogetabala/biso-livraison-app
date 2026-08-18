import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import {
  useCancelOrderMutation,
  useOrderQuery,
} from '../graphql/operations';
import { Spinner, StatusBadge, formatDate, formatPrice } from '../components/ui';

const STEPS = ['PENDING', 'CONFIRMED', 'PREPARING', 'IN_TRANSIT', 'DELIVERED'];

const STEP_LABELS: Record<string, string> = {
  PENDING: 'En attente',
  CONFIRMED: 'Confirmée',
  PREPARING: 'En préparation',
  IN_TRANSIT: 'En livraison',
  DELIVERED: 'Livrée',
  CANCELLED: 'Annulée',
};

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelOrderMutation] = useCancelOrderMutation();

  const { data, loading, error, refetch } = useOrderQuery({
    variables: { id: id! },
    pollInterval: 10000,
  });

  const order = data?.order;
  const successMessage = (location.state as { success?: string } | null)?.success;

  const isCancellable =
    order &&
    !['DELIVERED', 'CANCELLED', 'IN_TRANSIT'].includes(order.status);

  const handleCancel = async () => {
    if (!order) return;
    if (!window.confirm('Voulez-vous vraiment annuler cette commande ?')) return;
    setCancelling(true);
    setCancelError(null);
    try {
      await cancelOrderMutation({ variables: { id: order.id } });
      await refetch();
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : 'Annulation impossible');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="h-10 w-10" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-slate-500">
        Commande introuvable.
      </div>
    );
  }

  const currentStep = STEPS.indexOf(order.status);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {successMessage && (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          ✅ {successMessage}
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Commande #{order.id.slice(0, 8)}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {formatDate(order.createdAt)}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {cancelError && (
        <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {cancelError}
        </div>
      )}

      {/* Status timeline */}
      {order.status !== 'CANCELLED' && (
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step} className="flex flex-1 items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                      index <= currentStep
                        ? 'bg-orange-500 text-white'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {index < currentStep ? '✓' : index + 1}
                  </div>
                  <span
                    className={`mt-1.5 text-[11px] font-medium ${
                      index <= currentStep ? 'text-slate-900' : 'text-slate-400'
                    }`}
                  >
                    {STEP_LABELS[step]}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`mx-2 mb-5 h-0.5 flex-1 rounded ${
                      index < currentStep ? 'bg-orange-500' : 'bg-slate-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {order.status === 'CANCELLED' && (
        <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
          Cette commande a été annulée. Aucun montant n'a été encaissé.
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Restaurant */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-slate-500 uppercase">
            Restaurant
          </h2>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
              {order.restaurant?.imageUrl ? (
                <img
                  src={order.restaurant.imageUrl}
                  alt={order.restaurant.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>🍽️</span>
              )}
            </div>
            <div>
              <p className="font-semibold text-slate-900">
                {order.restaurant?.name}
              </p>
              <p className="text-sm text-slate-500">{order.restaurant?.phone}</p>
            </div>
          </div>
        </div>

        {/* Delivery info */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-slate-500 uppercase">
            Livraison
          </h2>
          <p className="text-sm text-slate-700">
            {order.deliveryAddress}
            <br />
            {order.deliveryCity} {order.deliveryZipCode}
          </p>
          <div className="mt-3 border-t border-slate-100 pt-3">
            {order.delivery?.driver ? (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-xl">🛵</span>
                <div>
                  <p className="font-medium text-slate-900">
                    {order.delivery.driver.firstName}{' '}
                    {order.delivery.driver.lastName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {order.delivery.driver.phone} · {order.delivery.status.replace(/_/g, ' ').toLowerCase()}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                Un livreur sera assigné dès que votre commande sera prête.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold text-slate-500 uppercase">
          Articles
        </h2>
        <div className="space-y-2">
          {order.items.map((item, index) => (
            <div key={`${item.menuItem?.id ?? 'item'}-${index}`} className="flex justify-between text-sm">
              <span className="text-slate-700">
                <span className="font-medium">{item.quantity}×</span>{' '}
                {item.menuItem?.name ?? 'Article'}
              </span>
              <span className="font-medium text-slate-900">
                {formatPrice(item.unitPrice * item.quantity)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-2 border-t border-slate-200 pt-4 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Sous-total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Frais de livraison</span>
            <span>{formatPrice(order.deliveryFee)}</span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-semibold text-slate-900">
            <span>Total</span>
            <span>{formatPrice(order.grandTotal)}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
            <span>Paiement</span>
            <span>
              {order.payment?.method === 'CASH_ON_DELIVERY'
                ? 'À la livraison (espèces)'
                : order.payment?.status}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex gap-3">
        {isCancellable && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            {cancelling ? 'Annulation…' : 'Annuler la commande'}
          </button>
        )}
        <Link
          to="/"
          className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          Retour aux restaurants
        </Link>
      </div>
    </div>
  );
}

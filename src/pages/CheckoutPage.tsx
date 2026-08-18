import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCreateOrderMutation } from '../graphql/operations';
import { useCart } from '../lib/cart';
import { EmptyState, formatPrice } from '../components/ui';

export function CheckoutPage() {
  const {
    items,
    restaurantId,
    restaurantName,
    deliveryFee,
    total,
    removeItem,
    updateQuantity,
    clear,
  } = useCart();
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [createOrderMutation] = useCreateOrderMutation();
  const navigate = useNavigate();

  if (items.length === 0 || !restaurantId) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState
          icon="🛒"
          title="Votre panier est vide"
          subtitle="Ajoutez des plats depuis un restaurant pour commencer."
        />
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
          >
            Voir les restaurants
          </Link>
        </div>
      </div>
    );
  }

  const grandTotal = total + deliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data } = await createOrderMutation({
        variables: {
          input: {
            restaurantId: restaurantId!,
            items: items.map((i) => ({
              menuItemId: i.menuItemId,
              quantity: i.quantity,
            })),
            deliveryAddress: address,
            deliveryCity: city,
            deliveryZipCode: zipCode,
            paymentMethod: 'CASH_ON_DELIVERY',
          },
        },
      });
      if (data?.createOrder?.id) {
        clear();
        navigate(`/orders/${data.createOrder.id}`, {
          state: { success: 'Commande créée avec succès !' },
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Échec de la commande');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Finaliser ma commande</h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              Adresse de livraison
            </h2>
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Adresse
                </label>
                <input
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
                  placeholder="12 rue des Lilas"
                />
              </div>
              <div className="grid grid-cols-[1fr_140px] gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Ville
                  </label>
                  <input
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
                    placeholder="Paris"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Code postal
                  </label>
                  <input
                    required
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
                    placeholder="75011"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              Paiement
            </h2>
            <div className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-800">
              💵 Paiement à la livraison — vous réglerez en espèces au livreur.
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-orange-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
          >
            {loading ? 'Création de la commande…' : `Commander · ${formatPrice(grandTotal)}`}
          </button>
        </form>

        {/* Summary */}
        <div className="h-fit rounded-2xl border border-slate-200 bg-white p-6 lg:sticky lg:top-20">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            {restaurantName}
          </h2>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.menuItemId} className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {item.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatPrice(item.price)} / unité
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                    className="flex h-6 w-6 items-center justify-center rounded border border-slate-200 text-slate-500 hover:bg-slate-50"
                  >
                    −
                  </button>
                  <span className="w-5 text-center text-sm font-medium">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                    className="flex h-6 w-6 items-center justify-center rounded border border-slate-200 text-slate-500 hover:bg-slate-50"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(item.menuItemId)}
                    className="ml-1 text-sm text-red-500 hover:text-red-600"
                    title="Retirer"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-2 border-t border-slate-200 pt-4 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Sous-total</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Frais de livraison</span>
              <span>{deliveryFee > 0 ? formatPrice(deliveryFee) : 'Offerts'}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-semibold text-slate-900">
              <span>Total</span>
              <span>{formatPrice(grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

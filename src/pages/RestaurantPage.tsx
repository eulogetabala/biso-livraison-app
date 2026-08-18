import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useMenuItemsByRestaurantQuery,
  useRestaurantQuery,
} from '../graphql/operations';
import { useCart } from '../lib/cart';
import { useAuth } from '../lib/auth';
import { Spinner, formatPrice } from '../components/ui';

export function RestaurantPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const { data: restData, loading: restLoading } = useRestaurantQuery({
    variables: { id: id! },
  });
  const { data: menuData, loading: menuLoading } = useMenuItemsByRestaurantQuery({
    variables: { restaurantId: id! },
  });

  const restaurant = restData?.restaurant;
  const items = menuData?.menuItemsByRestaurant.items ?? [];

  const getQty = (menuItemId: string) => quantities[menuItemId] ?? 1;

  const handleAdd = (menuItemId: string, name: string, price: number, imageUrl?: string | null) => {
    const qty = getQty(menuItemId);
    if (!restaurant) return;

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    addItem(
      { menuItemId, name, price, quantity: qty, imageUrl },
      restaurant.id,
      restaurant.name,
      restaurant.deliveryFee,
    );
    setQuantities((prev) => ({ ...prev, [menuItemId]: 1 }));
  };

  if (restLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="h-10 w-10" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center text-slate-500">
        Restaurant introuvable.
      </div>
    );
  }

  return (
    <div>
      {/* Banner */}
      <div className="relative h-64 bg-gradient-to-br from-orange-500 to-amber-500">
        {restaurant.coverImageUrl && (
          <img
            src={restaurant.coverImageUrl}
            alt={restaurant.name}
            className="h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 mx-auto max-w-6xl px-4 pb-6">
          <div className="flex items-end gap-4">
            <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-4 border-white bg-white shadow">
              {restaurant.imageUrl ? (
                <img
                  src={restaurant.imageUrl}
                  alt={restaurant.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-4xl">
                  🍕
                </div>
              )}
            </div>
            <div className="text-white">
              <h1 className="text-2xl font-bold">{restaurant.name}</h1>
              <p className="mt-1 text-sm text-orange-100">
                {restaurant.cuisineType} · {restaurant.address}, {restaurant.city}{' '}
                {restaurant.zipCode}
              </p>
              <div className="mt-2 flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  ⭐ {restaurant.rating > 0 ? restaurant.rating.toFixed(1) : '—'}
                </span>
                <span>
                  {restaurant.deliveryFee > 0
                    ? `${formatPrice(restaurant.deliveryFee)} de livraison`
                    : 'Livraison offerte'}
                </span>
                <span>~{restaurant.estimatedDeliveryTime} min</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="mx-auto max-w-4xl px-4 py-8">
        <h2 className="mb-4 text-xl font-bold text-slate-900">Menu</h2>

        {menuLoading && (
          <div className="flex justify-center py-8">
            <Spinner className="h-8 w-8" />
          </div>
        )}

        {!menuLoading && items.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-slate-500">
            Ce restaurant n'a pas encore de plats.
          </div>
        )}

        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-20 w-20 shrink-0 rounded-xl object-cover"
                />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-slate-900">{item.name}</h3>
                    {item.description && (
                      <p className="mt-0.5 line-clamp-2 text-sm text-slate-500">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 font-semibold text-slate-900">
                    {formatPrice(item.price)}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  {!item.isAvailable ? (
                    <span className="text-sm text-red-500">Indisponible</span>
                  ) : (
                    <>
                      <div className="flex items-center rounded-lg border border-slate-200">
                        <button
                          type="button"
                          onClick={() =>
                            setQuantities((prev) => ({
                              ...prev,
                              [item.id]: Math.max(1, getQty(item.id) - 1),
                            }))
                          }
                          className="px-2.5 py-1 text-slate-500 hover:bg-slate-50"
                        >
                          −
                        </button>
                        <span className="w-6 text-center text-sm font-medium">
                          {getQty(item.id)}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setQuantities((prev) => ({
                              ...prev,
                              [item.id]: getQty(item.id) + 1,
                            }))
                          }
                          className="px-2.5 py-1 text-slate-500 hover:bg-slate-50"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() =>
                          handleAdd(item.id, item.name, item.price, item.imageUrl)
                        }
                        className="rounded-lg bg-orange-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-orange-600"
                      >
                        Ajouter
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

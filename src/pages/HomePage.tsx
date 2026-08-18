import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSearchRestaurantsQuery } from '../graphql/operations';
import { Spinner, formatPrice } from '../components/ui';

const CUISINES = ['toutes', 'italien', 'asiatique', 'burger', 'africain'];

export function HomePage() {
  const [query, setQuery] = useState('');
  const [cuisine, setCuisine] = useState('toutes');
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState<string | undefined>(undefined);

  const { data, loading, error } = useSearchRestaurantsQuery({
    variables: {
      page,
      limit: 12,
      input: {
        query: searchInput || undefined,
        cuisineType: cuisine !== 'toutes' ? cuisine : undefined,
      },
    },
  });

  const restaurants = data?.searchRestaurants.items ?? [];
  const pageInfo = data?.searchRestaurants.pageInfo;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearchInput(query);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Hero */}
      <section className="mb-8 rounded-3xl bg-gradient-to-br from-orange-500 to-orange-600 px-8 py-12 text-white">
        <h1 className="text-3xl font-bold sm:text-4xl">
          Vos plats préférés, livrés chez vous.
        </h1>
        <p className="mt-2 max-w-xl text-orange-100">
          Commandez dans les meilleurs restaurants et suivez votre livraison en
          temps réel.
        </p>

        <form onSubmit={handleSearch} className="mt-6 flex max-w-xl gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un restaurant, un plat…"
            className="flex-1 rounded-xl border-0 bg-white/95 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/60"
          />
          <button
            type="submit"
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Rechercher
          </button>
        </form>
      </section>

      {/* Cuisine filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        {CUISINES.map((c) => (
          <button
            key={c}
            onClick={() => {
              setCuisine(c);
              setPage(1);
            }}
            className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
              cuisine === c
                ? 'bg-orange-500 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          Erreur de chargement : {error.message}
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-16">
          <Spinner className="h-10 w-10" />
        </div>
      )}

      {!loading && restaurants.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <span className="mb-3 block text-5xl">🍽️</span>
          <h3 className="text-lg font-semibold text-slate-900">
            Aucun restaurant trouvé
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Essayez une autre recherche ou un autre type de cuisine.
          </p>
        </div>
      )}

      {/* Restaurant grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {restaurants.map((r) => (
          <Link
            key={r.id}
            to={`/restaurant/${r.id}`}
            className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
          >
            <div className="relative h-44 overflow-hidden bg-slate-100">
              {r.imageUrl ? (
                <img
                  src={r.imageUrl}
                  alt={r.name}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-100 to-amber-100 text-5xl">
                  🍕
                </div>
              )}
              {r.rating > 0 && (
                <span className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-sm font-semibold text-slate-900 shadow">
                  ⭐ {r.rating.toFixed(1)}
                </span>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-slate-900">{r.name}</h3>
              <p className="mt-0.5 text-sm capitalize text-slate-500">
                {r.cuisineType} · {r.city}
              </p>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-600">
                  {r.deliveryFee > 0 ? `${formatPrice(r.deliveryFee)} de livraison` : 'Livraison offerte'}
                </span>
                <span className="text-slate-400">~{r.estimatedDeliveryTime} min</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {pageInfo && pageInfo.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!pageInfo.hasPreviousPage}
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

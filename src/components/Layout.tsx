import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { useCart } from '../lib/cart';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? 'bg-orange-100 text-orange-700' : 'text-slate-600 hover:bg-slate-100'
  }`;

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout, isAuthenticated } = useAuth();
  const { count } = useCart();
  const location = useLocation();
  const isAuthPage =
    location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="min-h-screen flex flex-col">
      {!isAuthPage && (
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
            <Link to="/" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 text-lg font-bold text-white">
                B
              </span>
              <span className="text-lg font-bold text-slate-900">
                Biso <span className="text-orange-500">Livraison</span>
              </span>
            </Link>

            <nav className="flex items-center gap-1">
              <NavLink to="/" className={navLinkClass} end>
                Restaurants
              </NavLink>
              {isAuthenticated && (
                <>
                  <NavLink to="/orders" className={navLinkClass} end>
                    Mes commandes
                  </NavLink>
                  <Link
                    to="/checkout"
                    className="relative ml-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                  >
                    Panier
                    {count > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-xs font-bold text-white">
                        {count}
                      </span>
                    )}
                  </Link>
                </>
              )}
            </nav>

            <div className="flex items-center gap-3">
              {isAuthenticated && user ? (
                <>
                  <span className="text-sm font-medium text-slate-700">
                    {user.firstName} {user.lastName}
                  </span>
                  <button
                    onClick={logout}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
                >
                  Connexion
                </Link>
              )}
            </div>
          </div>
        </header>
      )}

      <main className="flex-1">{children}</main>

      {!isAuthPage && (
        <footer className="border-t border-slate-200 bg-white py-6">
          <div className="mx-auto max-w-6xl px-4 text-center text-sm text-slate-500">
            © {new Date().getFullYear()} Biso Livraison — Commandez, suivez, savourez.
          </div>
        </footer>
      )}
    </div>
  );
}

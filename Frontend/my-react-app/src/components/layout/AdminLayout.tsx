import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Package,
  Calendar,
  Truck,
  CreditCard,
  Tag,
  Sparkles,
  Settings,
  Shirt,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../lib/utils";

const links = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/orders", label: "Orders", icon: Package },
  { to: "/admin/pickup-schedule", label: "Pickup Schedule", icon: Calendar },
  { to: "/admin/drivers", label: "Drivers", icon: Truck },
  { to: "/admin/payments", label: "Payments", icon: CreditCard },
  { to: "/admin/coupons", label: "Coupons", icon: Tag },
  { to: "/admin/ai-analytics", label: "AI Analytics", icon: Sparkles },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-base">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-ink/10 bg-white md:flex">
        <Link to="/" className="flex items-center gap-2 border-b border-ink/10 px-5 py-5 font-display text-lg font-semibold text-ink">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
            <Shirt size={16} />
          </span>
          DhobiG <span className="text-xs font-sans font-normal text-ink/40">Admin</span>
        </Link>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-ink/70 hover:bg-primary-50 hover:text-primary-700",
                  isActive && "bg-primary-50 text-primary-700"
                )
              }
            >
              <l.icon size={17} />
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-ink/10 p-3">
          <div className="mb-2 px-2 text-xs text-ink/50">{user?.name}</div>
          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-ink/70 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1">
        <div className="sticky top-0 z-30 border-b border-ink/10 bg-white/80 px-6 py-3 backdrop-blur md:hidden">
          <span className="font-display font-semibold">DhobiG Admin</span>
        </div>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { api, type Service } from "../../lib/api";
import { formatCurrency } from "../../lib/utils";
import { Button } from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    api
      .get<Service[]>("/services")
      .then((res) => setServices(res.data))
      .finally(() => setLoading(false));
  }, []);

  const grouped = services.reduce<Record<string, Service[]>>((acc, s) => {
    (acc[s.category] ||= []).push(s);
    return acc;
  }, {});

  const updateQty = (id: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [id]: next };
    });
  };

  const totalItems = Object.values(quantities).reduce((sum, q) => sum + q, 0);
  const totalPrice = services.reduce(
    (sum, s) => sum + (quantities[s.id] || 0) * s.price,
    0
  );

  return (
    <div className="container-page py-14">
      <div className="text-center">
        <h1 className="font-display text-4xl font-semibold text-ink">Our Services</h1>
        <p className="mx-auto mt-2 max-w-xl text-ink/60">
          From everyday Wash & Fold to specialty fabric care — every service includes free pickup & delivery
          on orders above Rs.299.
        </p>
      </div>

      {loading && <p className="mt-10 text-center text-ink/50">Loading services...</p>}

      <div className="mt-10 space-y-10">
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category}>
            <h2 className="mb-4 font-display text-xl font-semibold text-ink">{category}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((s) => {
                const qty = quantities[s.id] || 0;
                return (
                  <Card key={s.id}>
                    <CardContent className="pt-5">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-ink">{s.name}</h3>
                        <span className="font-mono text-sm font-semibold text-primary-600">
                          {formatCurrency(s.price)}
                          <span className="text-ink/40">/{s.unit}</span>
                        </span>
                      </div>
                      {s.description && <p className="mt-2 text-sm text-ink/60">{s.description}</p>}
                      <p className="mt-2 text-xs text-ink/40">Turnaround: {s.turnaround_hours}h</p>

                      <div className="mt-4 flex items-center justify-between border-t border-ink/10 pt-3">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => updateQty(s.id, -1)}
                            disabled={qty === 0}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-ink/15 text-ink/70 transition hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label={`Decrease ${s.name} quantity`}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-5 text-center font-mono text-sm font-semibold text-ink">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQty(s.id, 1)}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-ink/15 text-ink/70 transition hover:bg-ink/5"
                            aria-label={`Increase ${s.name} quantity`}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        {qty > 0 && (
                          <span className="font-mono text-xs text-ink/50">
                            {formatCurrency(qty * s.price)}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-14 flex flex-col items-center gap-3">
        {totalItems > 0 && (
          <div className="flex items-center gap-2 rounded-full bg-ink/5 px-4 py-2 text-sm text-ink/70">
            <ShoppingCart size={16} />
            <span>
              {totalItems} item{totalItems > 1 ? "s" : ""} selected — {formatCurrency(totalPrice)}
            </span>
          </div>
        )}
        <Link
          to="/book"
          state={{ quantities }}
        >
          <Button size="lg">Book a Pickup</Button>
        </Link>
      </div>
    </div>
  );
}
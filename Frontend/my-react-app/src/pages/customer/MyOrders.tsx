import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, type Order } from "../../lib/api";
import { formatCurrency, formatDateTime } from "../../lib/utils";
import { Button } from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { StatusTrack } from "../../components/shared/StatusTrack";

const STATUS_VARIANT: Record<string, "default" | "success" | "warning" | "danger" | "neutral"> = {
  booked: "default",
  pickup_assigned: "default",
  collected: "warning",
  cleaning: "warning",
  quality_check: "warning",
  out_for_delivery: "warning",
  delivered: "success",
  cancelled: "danger",
};

export default function MyOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  function load() {
    setLoading(true);
    api
      .get<Order[]>("/orders")
      .then((res) => setOrders(res.data))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function cancelOrder(id: string) {
    if (!confirm("Cancel this order?")) return;
    await api.post(`/orders/${id}/cancel`);
    load();
  }

  return (
    <div className="container-page py-12">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold text-ink">My Orders</h1>
        <Link to="/book">
          <Button>Book New Pickup</Button>
        </Link>
      </div>

      {loading && <p className="mt-8 text-ink/50">Loading orders...</p>}
      {!loading && orders.length === 0 && (
        <div className="mt-10 rounded-xl2 border border-dashed border-ink/20 p-10 text-center">
          <p className="text-ink/60">You haven't booked any pickups yet.</p>
          <Link to="/book">
            <Button className="mt-4">Book Your First Pickup</Button>
          </Link>
        </div>
      )}

      <div className="mt-6 space-y-4">
        {orders.map((o) => (
          <Card key={o.id}>
            <CardContent className="pt-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-ink">{o.order_number}</span>
                    <Badge variant={STATUS_VARIANT[o.status]}>{o.status.replace(/_/g, " ")}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-ink/50">
                    Pickup {formatDateTime(o.pickup_date)} · {o.items.length} item(s)
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-lg font-semibold text-primary-600">{formatCurrency(o.total)}</span>
                  <Button variant="outline" size="sm" onClick={() => setExpanded(expanded === o.id ? null : o.id)}>
                    {expanded === o.id ? "Hide" : "Details"}
                  </Button>
                </div>
              </div>

              {expanded === o.id && (
                <div className="mt-5 border-t border-ink/10 pt-5">
                  <StatusTrack status={o.status} />
                  <div className="mt-5 space-y-1.5">
                    {o.items.map((it) => (
                      <div key={it.id} className="flex justify-between text-sm">
                        <span className="text-ink/70">
                          {it.quantity} x {it.service?.name || "Item"}
                        </span>
                        <span className="font-mono">{formatCurrency(it.line_total)}</span>
                      </div>
                    ))}
                  </div>
                  {o.special_instructions && (
                    <p className="mt-3 rounded-lg bg-base px-3 py-2 text-xs text-ink/60">
                      Note: {o.special_instructions}
                    </p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link to={`/payment/${o.id}`}>
                      <Button size="sm" variant="outline">
                        Pay Now
                      </Button>
                    </Link>
                    <Link to={`/track?order=${o.order_number}`}>
                      <Button size="sm" variant="outline">
                        Track
                      </Button>
                    </Link>
                    {["booked", "pickup_assigned"].includes(o.status) && (
                      <Button size="sm" variant="destructive" onClick={() => cancelOrder(o.id)}>
                        Cancel Order
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

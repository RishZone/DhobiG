import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { api, type Order } from "../../lib/api";
import { formatCurrency, formatDateTime } from "../../lib/utils";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card, CardContent } from "../../components/ui/Card";
import { StatusTrack } from "../../components/shared/StatusTrack";

export default function OrderTracking() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(params.get("order") || "");
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function track(num: string) {
    if (!num) return;
    if (!user) {
      setError("Please log in to track your order.");
      return;
    }
    setLoading(true);
    setError("");
    setOrder(null);
    try {
      const res = await api.get<Order>(`/orders/track/${num}`);
      setOrder(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Order not found.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (params.get("order")) track(params.get("order")!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <div className="container-page py-14">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-4xl font-semibold text-ink">Track Your Order</h1>
        <p className="mt-2 text-ink/60">Enter your order number to see live status.</p>

        <div className="mt-6 flex gap-2">
          <Input
            placeholder="e.g. DG-2608-004213"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && track(orderNumber)}
            className="font-mono"
          />
          <Button onClick={() => track(orderNumber)} disabled={loading}>
            <Search size={16} />
            {loading ? "Searching..." : "Track"}
          </Button>
        </div>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>

      {order && (
        <Card className="mx-auto mt-10 max-w-3xl">
          <CardContent className="pt-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-mono text-lg font-semibold text-ink">{order.order_number}</p>
                <p className="text-xs text-ink/50">Pickup: {formatDateTime(order.pickup_date)} ({order.pickup_slot})</p>
              </div>
              <p className="font-mono text-xl font-semibold text-primary-600">{formatCurrency(order.total)}</p>
            </div>

            <StatusTrack status={order.status} />

            <div className="mt-8 space-y-2 border-t border-ink/10 pt-4">
              <h4 className="text-sm font-semibold text-ink/70">Items</h4>
              {order.items.map((it) => (
                <div key={it.id} className="flex justify-between text-sm">
                  <span className="text-ink/70">
                    {it.quantity} x {it.service?.name || "Item"}
                  </span>
                  <span className="font-mono">{formatCurrency(it.line_total)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

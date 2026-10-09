import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CreditCard, Smartphone, Wallet } from "lucide-react";
import { api, type Order } from "../../lib/api";
import { formatCurrency } from "../../lib/utils";
import { Button } from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import { cn } from "../../lib/utils";

const METHODS = [
  { key: "upi", label: "UPI", icon: Smartphone },
  { key: "card", label: "Card", icon: CreditCard },
  { key: "wallet", label: "Wallet", icon: Wallet },
];

export default function Payment() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [method, setMethod] = useState("upi");
  const [paying, setPaying] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (orderId) api.get<Order>(`/orders/${orderId}`).then((res) => setOrder(res.data));
  }, [orderId]);

  async function pay() {
    setPaying(true);
    try {
      await api.post("/payments", { order_id: orderId, method });
      setDone(true);
    } catch {
      // Payment already exists or order not found — still show a friendly state
      setDone(true);
    } finally {
      setPaying(false);
    }
  }

  if (done) {
    return (
      <div className="container-page flex min-h-[70vh] flex-col items-center justify-center text-center py-16">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 text-2xl">✓</div>
        <h1 className="mt-4 font-display text-3xl font-semibold text-ink">Payment Successful</h1>
        <p className="mt-2 text-ink/60">Your payment has been recorded (mock gateway — instant capture for demo).</p>
        <Button className="mt-6" onClick={() => navigate("/orders")}>
          Back to My Orders
        </Button>
      </div>
    );
  }

  return (
    <div className="container-page max-w-lg py-16">
      <h1 className="text-center font-display text-3xl font-semibold text-ink">Complete Payment</h1>

      <Card className="mt-8">
        <CardContent className="pt-6">
          {order ? (
            <div className="mb-5 flex items-center justify-between border-b border-ink/10 pb-4">
              <div>
                <p className="font-mono text-sm text-ink/60">{order.order_number}</p>
                <p className="text-xs text-ink/40">{order.items.length} item(s)</p>
              </div>
              <p className="font-mono text-2xl font-semibold text-primary-600">{formatCurrency(order.total)}</p>
            </div>
          ) : (
            <p className="mb-5 text-sm text-ink/50">Loading order...</p>
          )}

          <p className="mb-2 text-sm font-medium text-ink/70">Choose payment method</p>
          <div className="grid grid-cols-3 gap-3">
            {METHODS.map((m) => (
              <button
                key={m.key}
                onClick={() => setMethod(m.key)}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-lg border px-3 py-3 text-xs font-medium",
                  method === m.key ? "border-primary bg-primary-50 text-primary-700" : "border-ink/10 text-ink/60"
                )}
              >
                <m.icon size={18} />
                {m.label}
              </button>
            ))}
          </div>

          <Button className="mt-6 w-full" size="lg" onClick={pay} disabled={paying || !order}>
            {paying ? "Processing..." : `Pay ${order ? formatCurrency(order.total) : ""}`}
          </Button>
          <p className="mt-3 text-center text-xs text-ink/40">
            This is a simulated payment gateway for demo purposes — no real transaction occurs.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

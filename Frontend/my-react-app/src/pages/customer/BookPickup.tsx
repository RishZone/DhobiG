import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Minus, Plus, Tag } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { api, type Address, type Service } from "../../lib/api";
import { formatCurrency } from "../../lib/utils";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Input, Label, Select, Textarea } from "../../components/ui/Input";


const SLOTS = ["08:00-10:00", "10:00-12:00", "12:00-14:00", "14:00-16:00", "16:00-18:00", "18:00-20:00"];

export default function BookPickup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const passedQuantities = (location.state as { quantities?: Record<string, number> })?.quantities;

  const [services, setServices] = useState<Service[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [cart, setCart] = useState<Record<string, number>>(passedQuantities || {});
  const [addressId, setAddressId] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [slot, setSlot] = useState(SLOTS[1]);
  const [instructions, setInstructions] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: "Home", line1: "", city: "", state: "", pincode: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successOrder, setSuccessOrder] = useState<string | null>(null);

  useEffect(() => {
    api.get<Service[]>("/services").then((res) => setServices(res.data));
    if (user) {
      api.get<Address[]>("/addresses").then((res) => {
        setAddresses(res.data);
        const def = res.data.find((a) => a.is_default) || res.data[0];
        if (def) setAddressId(def.id);
        else setShowAddressForm(true);
      });
    }
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setPickupDate(tomorrow.toISOString().slice(0, 10));
  }, [user]);

  const grouped = services.reduce<Record<string, Service[]>>((acc, s) => {
    (acc[s.category] ||= []).push(s);
    return acc;
  }, {});

  const cartItems = Object.entries(cart)
    .filter(([, qty]) => qty > 0)
    .map(([id, qty]) => ({ service: services.find((s) => s.id === id)!, qty }))
    .filter((c) => c.service);

  const subtotal = cartItems.reduce((sum, c) => sum + c.service.price * c.qty, 0);

  function updateQty(id: string, delta: number) {
    setCart((prev) => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) + delta) }));
  }

  async function saveAddress() {
    if (!newAddress.line1 || !newAddress.city || !newAddress.state) return;
    const res = await api.post<Address>("/addresses", { ...newAddress, pincode: newAddress.pincode || "000000", is_default: addresses.length === 0 });
    setAddresses((prev) => [...prev, res.data]);
    setAddressId(res.data.id);
    setShowAddressForm(false);
  }

  async function submitBooking() {
    if (!user) {
      navigate("/login");
      return;
    }
    setError("");
    if (!addressId) {
      setError("Please add or select a pickup address.");
      return;
    }
    if (cartItems.length === 0) {
      setError("Please add at least one item to your order.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post("/orders", {
        address_id: addressId,
        pickup_date: `${pickupDate}T${slot.split("-")[0]}:00`,
        pickup_slot: slot,
        special_instructions: instructions || undefined,
        coupon_code: couponCode || undefined,
        items: cartItems.map((c) => ({ service_id: c.service.id, quantity: c.qty })),
      });
      setSuccessOrder(res.data.order_number);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Could not create booking.");
    } finally {
      setSubmitting(false);
    }
  }

  if (successOrder) {
    return (
      <div className="container-page flex min-h-[70vh] flex-col items-center justify-center text-center py-16">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-50 text-primary-600">✓</div>
        <h1 className="mt-4 font-display text-3xl font-semibold text-ink">Pickup Booked!</h1>
        <p className="mt-2 text-ink/60">
          Order <span className="font-mono font-semibold text-ink">{successOrder}</span> has been confirmed.
        </p>
        <div className="mt-6 flex gap-3">
          <Button onClick={() => navigate("/orders")}>View My Orders</Button>
          <Button variant="outline" onClick={() => navigate(`/track?order=${successOrder}`)}>
            Track Order
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-12">
      <h1 className="font-display text-3xl font-semibold text-ink">Book a Pickup</h1>
      <p className="mt-1 text-ink/60">Select garments, choose a slot, and we'll handle the rest.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>1. Select Garments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(grouped).map(([category, items]) => (
                <div key={category}>
                  <h4 className="mb-2 text-sm font-semibold text-ink/70">{category}</h4>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {items.map((s) => (
                      <div key={s.id} className="flex items-center justify-between rounded-lg border border-ink/10 px-3 py-2">
                        <div>
                          <p className="text-sm font-medium text-ink">{s.name}</p>
                          <p className="font-mono text-xs text-ink/50">{formatCurrency(s.price)}/{s.unit}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQty(s.id, -1)}
                            className="flex h-6 w-6 items-center justify-center rounded-full border border-ink/20 text-ink/60 hover:bg-ink/5"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-5 text-center text-sm font-medium">{cart[s.id] || 0}</span>
                          <button
                            onClick={() => updateQty(s.id, 1)}
                            className="flex h-6 w-6 items-center justify-center rounded-full border border-ink/20 text-ink/60 hover:bg-ink/5"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Pickup Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!user && <p className="text-sm text-ink/60">Please log in to select or add a pickup address.</p>}
              {addresses.map((a) => (
                <label
                  key={a.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 ${
                    addressId === a.id ? "border-primary bg-primary-50" : "border-ink/10"
                  }`}
                >
                  <input type="radio" name="address" checked={addressId === a.id} onChange={() => setAddressId(a.id)} className="mt-1" />
                  <div>
                    <p className="text-sm font-medium text-ink">
                      {a.label} {a.is_default && <span className="text-xs text-primary-600">(default)</span>}
                    </p>
                    <p className="text-xs text-ink/60">
                      {a.line1}, {a.city}, {a.state} {a.pincode}
                    </p>
                  </div>
                </label>
              ))}
              {user && !showAddressForm && (
                <Button variant="outline" size="sm" onClick={() => setShowAddressForm(true)}>
                  + Add New Address
                </Button>
              )}
              {user && showAddressForm && (
                <div className="space-y-2 rounded-lg border border-dashed border-ink/20 p-3">
                  <Input placeholder="Label (Home/Work)" value={newAddress.label} onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })} />
                  <Input placeholder="Address line" value={newAddress.line1} onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })} />
                  <div className="grid grid-cols-3 gap-2">
                    <Input placeholder="City" value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} />
                    <Input placeholder="State" value={newAddress.state} onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })} />
                    <Input placeholder="Pincode" value={newAddress.pincode} onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })} />
                  </div>
                  <Button size="sm" onClick={saveAddress}>
                    Save Address
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Pickup Date & Time</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Date</Label>
                <Input type="date" value={pickupDate} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setPickupDate(e.target.value)} />
              </div>
              <div>
                <Label>Time Slot</Label>
                <Select value={slot} onChange={(e) => setSlot(e.target.value)}>
                  {SLOTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label>Special Instructions (optional)</Label>
                <Textarea placeholder="e.g. no starch, handle zari work with care..." value={instructions} onChange={(e) => setInstructions(e.target.value)} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {cartItems.length === 0 && <p className="text-sm text-ink/50">No items added yet.</p>}
              {cartItems.map((c) => (
                <div key={c.service.id} className="flex justify-between text-sm">
                  <span className="text-ink/70">
                    {c.qty} x {c.service.name}
                  </span>
                  <span className="font-mono font-medium">{formatCurrency(c.service.price * c.qty)}</span>
                </div>
              ))}

              <div className="flex items-center gap-2 border-t border-ink/10 pt-3">
                <Tag size={14} className="text-ink/40" />
                <Input placeholder="Coupon code" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} className="h-8 text-xs" />
              </div>

              <div className="flex justify-between border-t border-ink/10 pt-3 font-semibold text-ink">
                <span>Subtotal</span>
                <span className="font-mono">{formatCurrency(subtotal)}</span>
              </div>
              {subtotal > 0 && subtotal < 299 && (
                <p className="text-xs text-accent-600">+Rs.49 pickup fee applies below Rs.299 (added at delivery).</p>
              )}

              {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}

              <Button className="w-full" size="lg" onClick={submitBooking} disabled={submitting}>
                {submitting ? "Booking..." : user ? "Confirm Booking" : "Login to Book"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

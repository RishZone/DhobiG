import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { api, type Address } from "../../lib/api";
import { Button } from "../../components/ui/Button";
import { Input, Label } from "../../components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";

export default function Profile() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [form, setForm] = useState({ label: "Home", line1: "", city: "", state: "", pincode: "" });
  const [showForm, setShowForm] = useState(false);

  function load() {
    api.get<Address[]>("/addresses").then((res) => setAddresses(res.data));
  }
  useEffect(load, []);

  async function addAddress() {
    if (!form.line1 || !form.city || !form.state || !form.pincode) return;
    await api.post("/addresses", { ...form, is_default: addresses.length === 0 });
    setForm({ label: "Home", line1: "", city: "", state: "", pincode: "" });
    setShowForm(false);
    load();
  }

  async function deleteAddress(id: string) {
    await api.delete(`/addresses/${id}`);
    load();
  }

  return (
    <div className="container-page max-w-3xl py-12">
      <h1 className="font-display text-3xl font-semibold text-ink">Profile</h1>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Name</Label>
            <Input value={user?.name || ""} disabled />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={user?.email || ""} disabled />
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={user?.phone || "—"} disabled />
          </div>
          <div>
            <Label>Role</Label>
            <Input value={user?.role || ""} disabled className="capitalize" />
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Saved Addresses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {addresses.map((a) => (
            <div key={a.id} className="flex items-start justify-between rounded-lg border border-ink/10 px-3 py-2.5">
              <div>
                <p className="text-sm font-medium text-ink">
                  {a.label} {a.is_default && <span className="text-xs text-primary-600">(default)</span>}
                </p>
                <p className="text-xs text-ink/60">
                  {a.line1}, {a.city}, {a.state} {a.pincode}
                </p>
              </div>
              <button onClick={() => deleteAddress(a.id)} className="text-ink/30 hover:text-red-600">
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          {!showForm && (
            <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
              + Add Address
            </Button>
          )}
          {showForm && (
            <div className="space-y-2 rounded-lg border border-dashed border-ink/20 p-3">
              <Input placeholder="Label" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
              <Input placeholder="Address line" value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} />
              <div className="grid grid-cols-3 gap-2">
                <Input placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                <Input placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
                <Input placeholder="Pincode" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
              </div>
              <Button size="sm" onClick={addAddress}>
                Save
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

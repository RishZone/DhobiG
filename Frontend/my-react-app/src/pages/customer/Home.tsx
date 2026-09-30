import { Link } from "react-router-dom";
import { ArrowRight, Bot, Clock, Shirt, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";

const HIGHLIGHTS = [
  { icon: Truck, title: "Free Doorstep Pickup", desc: "Free pickup & delivery on orders above Rs.299, every day 8AM-8PM." },
  { icon: Clock, title: "48-72 Hour Turnaround", desc: "Standard service in 2-3 days; express same-day available in select zones." },
  { icon: ShieldCheck, title: "Quality Checked", desc: "Every order passes a quality check before it's dispatched back to you." },
  { icon: Bot, title: "AI Assistant", desc: "Ask our assistant to quote prices, book pickups, or track your order." },
];

const SERVICES = [
  { name: "Wash & Fold", price: "From Rs.79/kg" },
  { name: "Dry Cleaning", price: "From Rs.79/piece" },
  { name: "Steam Ironing", price: "From Rs.15/piece" },
  { name: "Shoe Cleaning", price: "From Rs.149" },
  { name: "Curtain Cleaning", price: "From Rs.99/panel" },
  { name: "Sofa Cleaning", price: "From Rs.999" },
];

const STEPS = [
  { step: "1", title: "Book a Pickup", desc: "Choose your services, pick a slot, and confirm your address." },
  { step: "2", title: "We Collect & Clean", desc: "A verified partner picks up your garments and takes them for cleaning." },
  { step: "3", title: "Delivered to You", desc: "Freshly cleaned and pressed items delivered back to your doorstep." },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 to-base">
        <div className="container-page grid items-center gap-10 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold text-accent-600">
              <Sparkles size={13} /> AI-Powered Laundry Platform
            </span>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl">
              Laundry & dry cleaning,
              <br />
              <span className="text-primary">picked up at your door.</span>
            </h1>
            <p className="mt-4 max-w-md text-ink/60">
              Book a pickup in under a minute, track every stage of the wash cycle live, and let our
              AI Assistant quote prices or answer fabric-care questions instantly.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/book">
                <Button size="lg">
                  Book a Pickup <ArrowRight size={16} />
                </Button>
              </Link>
              <Link to="/assistant">
                <Button size="lg" variant="outline">
                  Ask the AI Assistant
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-sm">
            <div className="rounded-xl2 border border-ink/10 bg-white p-6 shadow-soft">
              <div className="flex items-center justify-between">
                <span className="font-display text-lg font-semibold">Order DG-2608-1123</span>
                <span className="rounded-full bg-accent/20 px-2.5 py-0.5 text-xs font-semibold text-accent-600">
                  Cleaning
                </span>
              </div>
              <div className="mt-5 space-y-3">
                {["Booked", "Pickup Assigned", "Collected", "Cleaning"].map((s, i) => (
                  <div key={s} className="flex items-center gap-3">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${
                        i < 3 ? "bg-primary text-white" : "bg-accent text-ink"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span className="text-sm text-ink/70">{s}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-5 -right-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white shadow-soft">
              <Shirt size={26} />
            </div>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="container-page py-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {HIGHLIGHTS.map((h) => (
            <Card key={h.title}>
              <CardContent className="pt-5">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                  <h.icon size={20} />
                </div>
                <h3 className="font-semibold text-ink">{h.title}</h3>
                <p className="mt-1 text-sm text-ink/60">{h.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Services preview */}
      <section className="bg-white py-16">
        <div className="container-page">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-semibold text-ink">Our Services</h2>
              <p className="mt-1 text-ink/60">Everything from everyday laundry to specialty fabric care.</p>
            </div>
            <Link to="/services" className="hidden text-sm font-semibold text-primary hover:underline sm:block">
              View all services →
            </Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s) => (
              <div
                key={s.name}
                className="flex items-center justify-between rounded-xl2 border border-ink/10 bg-base px-5 py-4"
              >
                <span className="font-medium text-ink">{s.name}</span>
                <span className="font-mono text-sm text-primary-600">{s.price}</span>
              </div>
            ))}
          </div>
          <Link to="/services" className="mt-6 block text-sm font-semibold text-primary hover:underline sm:hidden">
            View all services →
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="container-page py-16">
        <h2 className="text-center text-3xl font-semibold text-ink">How DhobiG Works</h2>
        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.step} className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary font-display text-lg font-semibold text-white">
                {s.step}
              </div>
              <h3 className="mt-4 font-semibold text-ink">{s.title}</h3>
              <p className="mt-1 text-sm text-ink/60">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-16">
        <div className="container-page flex flex-col items-center gap-4 text-center">
          <h2 className="font-display text-3xl font-semibold text-white">Ready for fresh, folded laundry?</h2>
          <p className="max-w-md text-primary-50/90">
            Book your first pickup today and use code <span className="font-mono font-semibold">WELCOME20</span> for 20% off.
          </p>
          <Link to="/book">
            <Button size="lg" variant="accent">
              Book a Pickup <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

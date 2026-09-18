import { ShieldCheck, Sparkles, Truck, Users } from "lucide-react";

const VALUES = [
  { icon: ShieldCheck, title: "Quality First", desc: "Every order passes a quality check before dispatch." },
  { icon: Truck, title: "Reliable Logistics", desc: "Verified pickup & delivery partners, tracked in real time." },
  { icon: Sparkles, title: "AI-Native", desc: "RAG-powered support and agentic workflows built in from day one." },
  { icon: Users, title: "Customer Obsessed", desc: "Transparent pricing, easy cancellations, fast resolutions." },
];

export default function About() {
  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-4xl font-semibold text-ink">About DhobiG</h1>
        <p className="mt-4 text-ink/60">
          DhobiG is an AI-powered laundry & dry-cleaning platform built to make everyday garment care
          effortless — doorstep pickup, transparent per-item pricing, live order tracking, and an AI
          Assistant that can quote prices, book pickups, and answer fabric-care questions instantly.
        </p>
      </div>

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {VALUES.map((v) => (
          <div key={v.title} className="rounded-xl2 border border-ink/10 bg-white p-5 text-center shadow-card">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
              <v.icon size={20} />
            </div>
            <h3 className="font-semibold text-ink">{v.title}</h3>
            <p className="mt-1 text-sm text-ink/60">{v.desc}</p>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-16 max-w-3xl rounded-xl2 border border-ink/10 bg-primary-50 p-8">
        <h2 className="font-display text-xl font-semibold text-ink">Built as a full-stack + AI portfolio project</h2>
        <p className="mt-2 text-sm text-ink/60">
          DhobiG demonstrates a React + FastAPI + RAG + Agentic AI stack: a LangGraph multi-agent router
          orchestrates a Booking Agent, Tracking Agent, Pricing Agent, and Recommendation Agent, backed by
          a ChromaDB knowledge base and a real PostgreSQL-ready order management system.
        </p>
      </div>
    </div>
  );
}

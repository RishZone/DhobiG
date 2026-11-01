import { Link } from "react-router-dom";
import { Shirt } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-ink/10 bg-white">
      <div className="container-page grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-white">
              <Shirt size={16} />
            </span>
            Dhobi<span className="text-accent-600">G</span>
          </div>
          <p className="mt-3 text-sm text-ink/60">
            AI-powered laundry & dry cleaning, picked up and delivered to your door.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-ink">Company</h4>
          <ul className="space-y-2 text-sm text-ink/60">
            <li><Link to="/about" className="hover:text-primary">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
            <li><Link to="/services" className="hover:text-primary">Services</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-ink">Account</h4>
          <ul className="space-y-2 text-sm text-ink/60">
            <li><Link to="/login" className="hover:text-primary">Login</Link></li>
            <li><Link to="/register" className="hover:text-primary">Register</Link></li>
            <li><Link to="/orders" className="hover:text-primary">My Orders</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-ink">Get help</h4>
          <ul className="space-y-2 text-sm text-ink/60">
            <li><Link to="/assistant" className="hover:text-primary">Ask the AI Assistant</Link></li>
            <li><Link to="/track" className="hover:text-primary">Track an Order</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ink/10 py-4 text-center text-xs text-ink/40">
        © {new Date().getFullYear()} DhobiG. Built as an AI + full-stack portfolio project.
      </div>
    </footer>
  );
}

import { useState } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input, Label, Textarea } from "../../components/ui/Input";
import { Card, CardContent } from "../../components/ui/Card";

export default function Contact() {
  const [sent, setSent] = useState(false);

  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-4xl font-semibold text-ink">Contact Us</h1>
        <p className="mt-2 text-ink/60">Questions about an order? Our AI Assistant can often help instantly — or reach us directly below.</p>
      </div>

      <div className="mx-auto mt-10 grid max-w-4xl gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div className="flex items-center gap-3 text-sm text-ink/70">
              <Phone size={16} className="text-primary" /> +91 8920 552758
            </div>
            <div className="flex items-center gap-3 text-sm text-ink/70">
              <Mail size={16} className="text-primary" /> rishabhc394@gmail.com
            </div>
            <div className="flex items-center gap-3 text-sm text-ink/70">
              <MapPin size={16} className="text-primary" /> Sector 3, Faridabad, Haryana, India
            </div>
            <p className="pt-2 text-xs text-ink/40">Store hours: 8:00 AM – 9:00 PM, all 7 days.</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            {sent ? (
              <p className="text-sm text-primary-700">Thanks! We've received your message and will get back to you shortly.</p>
            ) : (
              <form
                className="space-y-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  setSent(true);
                }}
              >
                <div>
                  <Label>Name</Label>
                  <Input required placeholder="Your name" />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input required type="email" placeholder="you@example.com" />
                </div>
                <div>
                  <Label>Message</Label>
                  <Textarea required placeholder="How can we help?" />
                </div>
                <Button type="submit" className="w-full">
                  Send Message
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

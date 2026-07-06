import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ShoppingBag, UtensilsCrossed, GraduationCap, Stethoscope, Hotel, Building2,
  Factory, Sprout, Wrench, ArrowRight, Check, BarChart3, Users, Package, Shield, Zap
} from "lucide-react";

const industries = [
  { icon: ShoppingBag, name: "Retail" },
  { icon: UtensilsCrossed, name: "Restaurants" },
  { icon: GraduationCap, name: "Schools" },
  { icon: Stethoscope, name: "Clinics" },
  { icon: Hotel, name: "Hotels" },
  { icon: Building2, name: "Real Estate" },
  { icon: Factory, name: "Manufacturing" },
  { icon: Sprout, name: "Agriculture" },
  { icon: Wrench, name: "Services" },
];

const features = [
  { icon: BarChart3, title: "Live analytics", copy: "Revenue, orders, inventory and margin — updated the moment a sale happens." },
  { icon: Package, title: "Inventory that self-checks", copy: "Low-stock alerts, SKU search, category breakdowns without the spreadsheet." },
  { icon: Users, title: "CRM that follows through", copy: "Every customer, every order, every touchpoint — in one profile." },
  { icon: Shield, title: "Serious security", copy: "JWT auth, role-based access, encrypted passwords. Built by engineers, not marketers." },
  { icon: Zap, title: "Runs where you run", copy: "Optimised for one branch or fifty. No plugins, no bloat." },
];

const plans = [
  { name: "Starter", price: "$0", cta: "Start free", features: ["Up to 2 users", "500 products", "Core modules", "Email support"] },
  { name: "Growth", price: "$29", period: "/mo", featured: true, cta: "Start 14-day trial",
    features: ["Up to 10 users", "Unlimited products", "Reports + exports", "Priority support"] },
  { name: "Scale", price: "Custom", cta: "Talk to sales",
    features: ["Unlimited users", "Multi-branch", "API access", "Dedicated CSM"] },
];

const faqs = [
  { q: "Do I need to install anything?", a: "No. BusinessFlow runs in your browser. Sign up and start operating in under a minute." },
  { q: "Can I import my existing data?", a: "Yes — CSV import for products, customers and suppliers is available on any plan." },
  { q: "Is it secure?", a: "Passwords are bcrypt-hashed, sessions use httpOnly JWT cookies, and every request is auth-checked." },
  { q: "Can I try it with sample data?", a: "Yes — one click in your dashboard loads a realistic demo workspace." },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-neutral-900">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2" data-testid="brand-link">
            <div className="w-8 h-8 bg-[#002FA7] flex items-center justify-center text-white font-black text-lg">B</div>
            <span className="font-display text-xl font-bold tracking-tight">BusinessFlow</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm">
            <a href="#features" className="hover:text-[#002FA7] transition-colors">Features</a>
            <a href="#industries" className="hover:text-[#002FA7] transition-colors">Industries</a>
            <a href="#pricing" className="hover:text-[#002FA7] transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-[#002FA7] transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login" data-testid="header-login-link" className="text-sm hover:text-[#002FA7]">Log in</Link>
            <Link to="/register" data-testid="header-signup-link">
              <Button className="bg-[#002FA7] hover:bg-[#00227A] text-white rounded-sm h-9 px-4">
                Start free <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative blueprint-grid">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24 md:py-32 grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-7">
            <div className="text-xs uppercase tracking-[0.2em] text-neutral-500 mb-6">
              <span className="inline-block w-8 h-px bg-[#002FA7] align-middle mr-3" />
              Operating system for SMEs
            </div>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter leading-[1.02]">
              Run your entire<br/>business from<br/>
              <span className="text-[#002FA7]">one</span> workspace.
            </h1>
            <p className="mt-8 text-lg text-neutral-600 max-w-xl leading-relaxed">
              Inventory. Customers. Orders. Invoices. Reports. BusinessFlow replaces
              five apps and a stack of paperwork with a single, ruthlessly efficient dashboard.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link to="/register" data-testid="hero-primary-cta">
                <Button className="bg-[#002FA7] hover:bg-[#00227A] text-white rounded-sm h-11 px-6 text-sm">
                  Start free — no card required <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/login" data-testid="hero-secondary-cta">
                <Button variant="outline" className="rounded-sm h-11 px-6 text-sm border-neutral-300">
                  See it in action
                </Button>
              </Link>
            </div>
            <div className="mt-10 flex items-center gap-8 text-xs text-neutral-500">
              <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#059669]" /> 14-day trial</div>
              <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#059669]" /> No credit card</div>
              <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#059669]" /> Cancel anytime</div>
            </div>
          </div>
          <div className="md:col-span-5">
            <div className="relative">
              <div className="absolute -inset-2 bg-[#FFD700]/40 -z-10" />
              <img
                src="https://images.unsplash.com/photo-1515263487990-61b07816b324?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MDV8MHwxfHNlYXJjaHwyfHxtb2Rlcm4lMjBhcmNoaXRlY3R1cmFsJTIwb2ZmaWNlJTIwYnVpbGRpbmd8ZW58MHx8fHwxNzgyNDQ1MTg2fDA&ixlib=rb-4.1.0&q=85"
                alt="Modern architectural building"
                className="w-full h-[480px] object-cover grayscale"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Trusted */}
      <section className="border-y border-neutral-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 flex flex-wrap items-center justify-between gap-6 text-xs uppercase tracking-[0.2em] text-neutral-500">
          <span>Built for operators, not accountants</span>
          <div className="flex gap-8 mono">
            <span>UPTIME 99.98%</span>
            <span>&lt; 120MS API</span>
            <span>SOC-2 READY</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-12 gap-12 mb-16">
            <div className="md:col-span-4">
              <div className="text-xs uppercase tracking-[0.2em] text-neutral-500 mb-4">01 — Capabilities</div>
              <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                Every operation.<br/>One system of record.
              </h2>
            </div>
            <div className="md:col-span-8 grid md:grid-cols-2 gap-6">
              {features.map((f, i) => (
                <div key={i} className="bg-white border-2 border-neutral-100 hover:border-neutral-900 transition-colors duration-300 p-8">
                  <f.icon className="w-6 h-6 text-[#002FA7] mb-4" strokeWidth={1.5} />
                  <h3 className="font-display text-xl font-semibold mb-2">{f.title}</h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">{f.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Industries */}
      <section id="industries" className="py-24 md:py-32 bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-xs uppercase tracking-[0.2em] text-neutral-400 mb-4">02 — Industries</div>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-12 max-w-2xl">
            Ready-made for the industries that keep the world running.
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-9 border-t border-l border-neutral-800">
            {industries.map((ind) => (
              <div key={ind.name} className="aspect-square border-r border-b border-neutral-800 flex flex-col items-center justify-center gap-3 hover:bg-[#002FA7] transition-colors group">
                <ind.icon className="w-6 h-6 text-neutral-400 group-hover:text-white" strokeWidth={1.5} />
                <span className="text-xs mono tracking-wider text-neutral-400 group-hover:text-white">{ind.name.toUpperCase()}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="text-xs uppercase tracking-[0.2em] text-neutral-500 mb-4">03 — Pricing</div>
            <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">Honest pricing.<br/>No surprises.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((p, i) => (
              <div key={p.name} data-testid={`pricing-${p.name.toLowerCase()}`}
                   className={`p-8 border-2 ${p.featured ? "border-[#002FA7] bg-white relative" : "border-neutral-200 bg-white"}`}>
                {p.featured && (
                  <div className="absolute -top-3 left-8 bg-[#FFD700] px-3 py-1 text-xs uppercase tracking-wider font-bold text-neutral-900">
                    Most popular
                  </div>
                )}
                <div className="text-sm uppercase tracking-widest text-neutral-500 mb-3">{p.name}</div>
                <div className="mb-6">
                  <span className="font-display text-5xl font-black tracking-tighter">{p.price}</span>
                  {p.period && <span className="text-neutral-500 ml-1">{p.period}</span>}
                </div>
                <ul className="space-y-3 mb-8">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-neutral-700">
                      <Check className="w-4 h-4 text-[#002FA7] flex-shrink-0 mt-0.5" strokeWidth={2} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/register">
                  <Button className={`w-full rounded-sm h-11 ${p.featured ? "bg-[#002FA7] hover:bg-[#00227A] text-white" : "bg-white border border-neutral-300 text-neutral-900 hover:bg-neutral-50"}`}>
                    {p.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-24 bg-[#F5F5F0] border-y border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-5">
            <img src="https://images.pexels.com/photos/7693692/pexels-photo-7693692.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
                 alt="Team collaborating" className="w-full h-[420px] object-cover grayscale" />
          </div>
          <div className="md:col-span-7">
            <div className="text-xs uppercase tracking-[0.2em] text-neutral-500 mb-4">Customer story</div>
            <blockquote className="font-display text-2xl md:text-3xl font-medium leading-snug tracking-tight text-neutral-900">
              "We replaced Excel, Trello, our POS, and half of our email with BusinessFlow.
              Our team saves eleven hours a week — and I finally know what our margin actually is."
            </blockquote>
            <div className="mt-8 text-sm">
              <div className="font-semibold">Marisol Fernández</div>
              <div className="text-neutral-500 mono uppercase tracking-wider text-xs mt-1">CEO, Casa Fernández — 4 stores, Barcelona</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 md:py-32">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="text-xs uppercase tracking-[0.2em] text-neutral-500 mb-4">04 — Questions</div>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-12">Answers, quickly.</h2>
          <div className="divide-y divide-neutral-200 border-y border-neutral-200">
            {faqs.map((f, i) => (
              <details key={i} className="group py-6" data-testid={`faq-item-${i}`}>
                <summary className="flex justify-between items-center cursor-pointer list-none">
                  <span className="font-semibold text-lg">{f.q}</span>
                  <span className="mono text-2xl text-neutral-400 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-4 text-neutral-600 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-[#002FA7] text-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="font-display text-4xl md:text-6xl font-black tracking-tighter leading-tight">
            Stop juggling apps.<br/>Start running your business.
          </h2>
          <Link to="/register" data-testid="footer-cta">
            <Button className="mt-10 bg-white text-[#002FA7] hover:bg-[#FFD700] hover:text-neutral-900 rounded-sm h-12 px-8 text-sm font-semibold">
              Start your free trial <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-neutral-400 py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-wrap justify-between items-center gap-6 text-sm">
          <div className="flex items-center gap-2 text-white">
            <div className="w-6 h-6 bg-[#FFD700] flex items-center justify-center text-neutral-900 font-black text-sm">B</div>
            <span className="font-display font-bold">BusinessFlow</span>
          </div>
          <div className="mono text-xs uppercase tracking-widest">© 2026 BusinessFlow — All rights reserved</div>
        </div>
      </footer>
    </div>
  );
}

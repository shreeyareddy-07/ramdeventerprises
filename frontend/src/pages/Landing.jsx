import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ShoppingBag, UtensilsCrossed, GraduationCap, Stethoscope, Hotel, Building2,
  Factory, Sprout, Wrench, ArrowRight, ArrowUpRight, Check, BarChart3, Users,
  Package, Shield, Zap, Command, Layers, LineChart, TrendingUp, DollarSign
} from "lucide-react";

const industries = [
  { icon: ShoppingBag, name: "Retail" }, { icon: UtensilsCrossed, name: "Restaurants" },
  { icon: GraduationCap, name: "Schools" }, { icon: Stethoscope, name: "Clinics" },
  { icon: Hotel, name: "Hotels" }, { icon: Building2, name: "Real Estate" },
  { icon: Factory, name: "Manufacturing" }, { icon: Sprout, name: "Agriculture" },
  { icon: Wrench, name: "Services" },
];

const features = [
  { icon: BarChart3, kicker: "Analytics", title: "Live analytics", copy: "Revenue, orders, inventory and margin — updated the moment a sale happens." },
  { icon: Package, kicker: "Inventory", title: "Self-checking stock", copy: "Low-stock alerts, SKU search, category breakdowns without the spreadsheet." },
  { icon: Users, kicker: "CRM", title: "Every customer, remembered", copy: "One profile. Every order. Every touchpoint. Every follow-up." },
  { icon: Shield, kicker: "Security", title: "Serious security", copy: "JWT auth, role-based access, bcrypt-hashed passwords. Built by engineers, not marketers." },
  { icon: Zap, kicker: "Performance", title: "Runs where you run", copy: "Optimised for one branch or fifty. No plugins, no bloat." },
  { icon: Command, kicker: "Speed", title: "Command palette", copy: "Cmd+K to find any customer, order or invoice — in milliseconds." },
];

const plans = [
  { name: "Starter", price: "₹0", cta: "Start free", features: ["Up to 2 users", "500 products", "Core modules", "Email support"] },
  { name: "Growth", price: "₹2,400", period: "/mo", featured: true, cta: "Start 14-day trial",
    features: ["Up to 10 users", "Unlimited products", "Reports + exports", "Priority support"] },
  { name: "Scale", price: "Custom", cta: "Talk to sales",
    features: ["Unlimited users", "Multi-branch", "API access", "Dedicated CSM"] },
];

const faqs = [
  { q: "Do I need to install anything?", a: "No. BusinessFlow runs entirely in your browser. Sign up and start operating in under a minute." },
  { q: "Can I import my existing data?", a: "Yes — CSV import for products, customers and suppliers is available on any plan." },
  { q: "Is it secure?", a: "Passwords are bcrypt-hashed, sessions use httpOnly JWT cookies, and every request is auth-checked and owner-scoped." },
  { q: "Can I try it with sample data?", a: "Yes — one click in your dashboard loads a realistic demo workspace." },
];

function Counter({ to, prefix = "", suffix = "" }) {
  const [n, setN] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      let start = 0; const dur = 1400; const from = 0; const t0 = performance.now();
      const tick = (t) => {
        const p = Math.min(1, (t - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        setN(Math.floor(from + (to - from) * eased));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      io.disconnect();
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [to]);
  return <span ref={ref} className="tabular">{prefix}{n.toLocaleString()}{suffix}</span>;
}

function DashboardPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
      className="relative"
    >
      <div className="absolute -inset-4 bg-[#FFD700]/60 -z-10" style={{ clipPath: "polygon(0 12%, 100% 0, 96% 100%, 4% 92%)" }} />
      <div className="bg-white border border-neutral-900 shadow-[0_24px_60px_rgba(0,0,0,0.15)] overflow-hidden">
        <div className="bg-neutral-900 h-9 flex items-center px-4 gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#E53935]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#FFD700]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#059669]" />
          <div className="ml-auto text-[10px] mono text-neutral-500 uppercase tracking-widest">businessflow.io/app</div>
        </div>
        <div className="grid grid-cols-12 h-[520px]">
          <div className="col-span-3 bg-neutral-900 text-white p-5 space-y-1.5">
            <div className="flex items-center gap-2 pb-4 border-b border-neutral-800 mb-3">
              <div className="w-6 h-6 bg-[#FFD700] flex items-center justify-center text-neutral-900 font-black text-xs">B</div>
              <span className="font-display font-bold text-sm">BusinessFlow</span>
            </div>
            {["Dashboard", "Products", "Customers", "Orders", "Invoices", "Reports"].map((l, i) => (
              <div key={l} className={`flex items-center gap-2 text-xs py-1.5 px-2 ${i === 0 ? "bg-[#002FA7]" : "text-neutral-400"}`}>
                <div className="w-1 h-1 rounded-full bg-current" /> {l}
              </div>
            ))}
          </div>
          <div className="col-span-9 p-6 bg-[#F5F5F0]">
            <div className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 mb-1">Overview</div>
            <div className="font-display text-2xl font-bold mb-4">Command center</div>
            <div className="grid grid-cols-4 gap-3 mb-4">
              {[
                { l: "Revenue", v: "₹48,290", c: "text-[#002FA7]" },
                { l: "Orders", v: "312", c: "" },
                { l: "Customers", v: "1,204", c: "" },
                { l: "Profit", v: "₹18,441", c: "text-[#002FA7]" },
              ].map((k) => (
                <div key={k.l} className="bg-white border border-neutral-200 p-3">
                  <div className="text-[9px] uppercase tracking-widest text-neutral-500">{k.l}</div>
                  <div className={`font-display font-black text-lg tabular mt-1 ${k.c}`}>{k.v}</div>
                </div>
              ))}
            </div>
            <div className="bg-white border border-neutral-200 p-4 h-48">
              <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-2">Revenue — 14d</div>
              <svg viewBox="0 0 300 100" className="w-full h-32">
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#002FA7" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#002FA7" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <motion.path
                  initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }} transition={{ duration: 1.6, ease: "easeOut" }}
                  d="M0,70 L25,60 L50,65 L75,45 L100,55 L125,30 L150,40 L175,20 L200,35 L225,15 L250,25 L275,10 L300,20"
                  fill="none" stroke="#002FA7" strokeWidth="2" strokeLinecap="round" />
                <path d="M0,70 L25,60 L50,65 L75,45 L100,55 L125,30 L150,40 L175,20 L200,35 L225,15 L250,25 L275,10 L300,20 L300,100 L0,100 Z" fill="url(#g)" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Landing() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, -80]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-neutral-900 selection:bg-[#002FA7] selection:text-white">
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
            <Link to="/login" data-testid="header-login-link" className="text-sm hover:text-[#002FA7] transition-colors">Log in</Link>
            <Link to="/register" data-testid="header-signup-link">
              <Button className="bg-[#002FA7] hover:bg-[#00227A] text-white rounded-sm h-9 px-4 group">
                Start free
                <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section ref={ref} className="relative blueprint-grid overflow-hidden">
        <motion.div style={{ y }} className="absolute top-20 -right-32 w-96 h-96 bg-[#FFD700]/30 rounded-full blur-3xl -z-10" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 md:py-28 grid md:grid-cols-12 gap-10 items-center relative">
          <div className="md:col-span-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-neutral-500 mb-6 border border-neutral-300 px-3 py-1 bg-white/60">
              <span className="w-1.5 h-1.5 bg-[#059669] rounded-full animate-pulse" />
              Version 1.0 · Live now
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05 }}
              className="font-display text-[52px] sm:text-6xl lg:text-7xl font-black tracking-tighter leading-[0.98]"
            >
              Run your entire<br/>business from<br/>
              <span className="relative inline-block">
                <span className="relative z-10 text-[#002FA7]">one</span>
                <motion.span
                  initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.6, delay: 0.6 }}
                  style={{ transformOrigin: "left" }}
                  className="absolute bottom-1 left-0 right-0 h-3 bg-[#FFD700] -z-0"
                />
              </span> workspace.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-7 text-lg text-neutral-600 max-w-xl leading-relaxed"
            >
              Inventory. Customers. Orders. Invoices. Reports. BusinessFlow replaces five apps
              and a stack of paperwork with a single, ruthlessly efficient dashboard.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-9 flex flex-wrap gap-3"
            >
              <Link to="/register" data-testid="hero-primary-cta">
                <Button className="bg-[#002FA7] hover:bg-[#00227A] text-white rounded-sm h-12 px-6 text-sm group">
                  Start free — no card required
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </Link>
              <Link to="/login" data-testid="hero-secondary-cta">
                <Button variant="outline" className="rounded-sm h-12 px-6 text-sm border-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors">
                  See it in action
                </Button>
              </Link>
            </motion.div>
            <div className="mt-9 flex flex-wrap items-center gap-6 text-xs text-neutral-500">
              <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#059669]" strokeWidth={2.5} /> 14-day trial</div>
              <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#059669]" strokeWidth={2.5} /> No credit card</div>
              <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#059669]" strokeWidth={2.5} /> Cancel anytime</div>
            </div>
          </div>
          <div className="md:col-span-6">
            <DashboardPreview />
          </div>
        </div>
      </section>

      {/* Counters strip */}
      <section className="border-y border-neutral-900 bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 divide-x divide-neutral-800">
          {[
            { v: 12400, l: "Businesses", suffix: "+" },
            { v: 3200000, l: "Orders processed", prefix: "$" },
            { v: 99, l: "Uptime", suffix: ".98%" },
            { v: 120, l: "API latency", suffix: "ms" },
          ].map((c) => (
            <div key={c.l} className="py-10 px-6 text-center">
              <div className="font-display text-3xl md:text-4xl font-black tracking-tighter">
                <Counter to={c.v} prefix={c.prefix} suffix={c.suffix} />
              </div>
              <div className="text-[10px] mono uppercase tracking-widest text-neutral-500 mt-2">{c.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features — Bento */}
      <section id="features" className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-12 gap-12 mb-16">
            <div className="md:col-span-5">
              <div className="text-xs uppercase tracking-[0.2em] text-neutral-500 mb-4">01 — Capabilities</div>
              <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                Every operation.<br/>One system of record.
              </h2>
              <p className="mt-6 text-neutral-600 max-w-md">
                From the first product you list to the fiftieth branch you open — the same
                workspace scales with you. No add-ons. No integrations. No spreadsheets.
              </p>
            </div>
            <div className="md:col-span-7 grid grid-cols-6 gap-4 auto-rows-[180px]">
              {features.map((f, i) => {
                const spans = ["col-span-6 md:col-span-4", "col-span-6 md:col-span-2", "col-span-6 md:col-span-3",
                               "col-span-6 md:col-span-3", "col-span-6 md:col-span-2", "col-span-6 md:col-span-4"];
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className={`${spans[i]} group relative bg-white border-2 border-neutral-100 hover:border-neutral-900 transition-all duration-300 p-6 overflow-hidden`}
                  >
                    <f.icon className="w-5 h-5 text-[#002FA7] mb-3" strokeWidth={1.5} />
                    <div className="text-[10px] mono uppercase tracking-widest text-neutral-500 mb-1">{f.kicker}</div>
                    <h3 className="font-display text-lg font-semibold mb-1.5">{f.title}</h3>
                    <p className="text-xs text-neutral-600 leading-relaxed">{f.copy}</p>
                    <ArrowUpRight className="absolute top-5 right-5 w-4 h-4 text-neutral-300 group-hover:text-[#002FA7] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Modules row */}
      <section className="py-16 border-y border-neutral-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-xs mono uppercase tracking-widest text-neutral-500 mb-6">Included modules — all plans</div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { icon: Package, name: "Inventory" }, { icon: Users, name: "CRM" },
              { icon: DollarSign, name: "Orders" }, { icon: BarChart3, name: "Reports" },
              { icon: Layers, name: "Suppliers" }, { icon: TrendingUp, name: "Analytics" },
            ].map((m) => (
              <div key={m.name} className="flex items-center gap-2 text-sm py-2">
                <m.icon className="w-4 h-4 text-[#002FA7]" strokeWidth={1.5} />
                <span>{m.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries */}
      <section id="industries" className="py-24 md:py-32 bg-neutral-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 blueprint-grid opacity-10" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
          <div className="text-xs uppercase tracking-[0.2em] text-neutral-400 mb-4">02 — Industries</div>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-3 max-w-2xl">
            Purpose-built for the industries that keep the world running.
          </h2>
          <p className="text-neutral-400 max-w-xl mb-14">Every module ships pre-configured for your industry — from restaurant POS to clinic patient records.</p>
          <div className="grid grid-cols-3 md:grid-cols-9 border-t border-l border-neutral-800">
            {industries.map((ind, i) => (
              <motion.div
                key={ind.name}
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                viewport={{ once: true }} transition={{ delay: i * 0.04 }}
                className="aspect-square border-r border-b border-neutral-800 flex flex-col items-center justify-center gap-3 hover:bg-[#002FA7] transition-colors group cursor-pointer"
              >
                <ind.icon className="w-6 h-6 text-neutral-400 group-hover:text-white transition-colors" strokeWidth={1.5} />
                <span className="text-[10px] mono tracking-wider text-neutral-400 group-hover:text-white transition-colors">{ind.name.toUpperCase()}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial + image */}
      <section className="py-24 bg-[#F5F5F0]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-5 relative">
            <div className="absolute -inset-3 bg-[#002FA7] -z-10" />
            <img src="https://images.pexels.com/photos/7693692/pexels-photo-7693692.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
                 alt="Team collaborating" className="w-full h-[440px] object-cover grayscale" />
          </div>
          <div className="md:col-span-7">
            <div className="text-xs uppercase tracking-[0.2em] text-neutral-500 mb-4">Customer story</div>
            <div className="text-6xl font-display font-black text-[#002FA7] leading-none mb-4">"</div>
            <blockquote className="font-display text-2xl md:text-3xl font-medium leading-snug tracking-tight -mt-8">
              We replaced Excel, Trello, our POS, and half of our email with BusinessFlow.
              Our team saves eleven hours a week — and I finally know what our margin actually is.
            </blockquote>
            <div className="mt-10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-neutral-900 text-white flex items-center justify-center font-display font-bold">MF</div>
              <div>
                <div className="font-semibold">Marisol Fernández</div>
                <div className="text-neutral-500 mono uppercase tracking-wider text-[10px] mt-0.5">CEO · CASA FERNÁNDEZ · 4 STORES · BARCELONA</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="text-xs uppercase tracking-[0.2em] text-neutral-500 mb-4">03 — Pricing</div>
            <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">Honest pricing.<br/>No surprises.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                data-testid={`pricing-${p.name.toLowerCase()}`}
                className={`p-8 border-2 relative transition-all duration-300 ${p.featured ? "border-[#002FA7] bg-neutral-900 text-white -translate-y-4" : "border-neutral-200 bg-white hover:border-neutral-900"}`}
              >
                {p.featured && (
                  <div className="absolute -top-3 left-8 bg-[#FFD700] px-3 py-1 text-xs uppercase tracking-wider font-bold text-neutral-900">
                    Most popular
                  </div>
                )}
                <div className={`text-sm uppercase tracking-widest mb-3 ${p.featured ? "text-neutral-400" : "text-neutral-500"}`}>{p.name}</div>
                <div className="mb-6">
                  <span className="font-display text-5xl font-black tracking-tighter">{p.price}</span>
                  {p.period && <span className={`ml-1 ${p.featured ? "text-neutral-400" : "text-neutral-500"}`}>{p.period}</span>}
                </div>
                <ul className="space-y-3 mb-8">
                  {p.features.map((f) => (
                    <li key={f} className={`flex items-start gap-2 text-sm ${p.featured ? "text-neutral-200" : "text-neutral-700"}`}>
                      <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${p.featured ? "text-[#FFD700]" : "text-[#002FA7]"}`} strokeWidth={2} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/register">
                  <Button className={`w-full rounded-sm h-11 ${p.featured ? "bg-[#FFD700] hover:bg-white text-neutral-900" : "bg-neutral-900 hover:bg-[#002FA7] text-white"} transition-colors`}>
                    {p.cta}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 md:py-32 bg-[#F5F5F0]">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="text-xs uppercase tracking-[0.2em] text-neutral-500 mb-4">04 — Questions</div>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-12">Answers, quickly.</h2>
          <div className="divide-y divide-neutral-300 border-y border-neutral-300">
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
      <section className="py-24 bg-[#002FA7] text-white relative overflow-hidden">
        <div className="absolute inset-0 blueprint-grid opacity-10" />
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center relative">
          <h2 className="font-display text-4xl md:text-6xl font-black tracking-tighter leading-[1.02]">
            Stop juggling apps.<br/>Start running your business.
          </h2>
          <p className="mt-6 text-white/70 max-w-xl mx-auto">Join thousands of operators who ship, sell, and scale on BusinessFlow.</p>
          <Link to="/register" data-testid="footer-cta">
            <Button className="mt-10 bg-[#FFD700] text-neutral-900 hover:bg-white rounded-sm h-12 px-8 text-sm font-semibold group">
              Start your free trial
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
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

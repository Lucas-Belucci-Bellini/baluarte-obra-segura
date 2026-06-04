import { Check, X, User, Zap, Building2, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { useLanguage } from "../contexts/LanguageContext";
import { Navigation } from "../components/Navigation";

const tiers = [
  {
    id: "free",
    icon: User,
    color: "text-zinc-400",
    border: "border-zinc-700",
    bg: "bg-zinc-900",
    badge: null,
    name: { pt: "Gratuito", en: "Free" },
    price: { pt: "R$ 0", en: "R$ 0" },
    period: { pt: "/mês", en: "/mo" },
    description: { pt: "Para quem está conhecendo a plataforma", en: "Get to know the platform" },
    features: [
      { pt: "Catálogo completo de materiais", en: "Full material catalog", ok: true },
      { pt: "Catálogo de ferramentas", en: "Tool catalog", ok: true },
      { pt: "8 calculadoras offline", en: "8 offline calculators", ok: true },
      { pt: "Alertas de segurança", en: "Safety alerts", ok: true },
      { pt: "Comparador de materiais", en: "Material comparator", ok: true },
      { pt: "5 favoritos", en: "5 saved items", ok: true },
      { pt: "1 projeto", en: "1 project", ok: true },
      { pt: "Chatbot IA (Mestre de Obra)", en: "AI Chatbot (Master Builder)", ok: false },
      { pt: "Favoritos ilimitados", en: "Unlimited favorites", ok: false },
      { pt: "Projetos ilimitados", en: "Unlimited projects", ok: false },
      { pt: "Export PDF", en: "PDF Export", ok: false },
    ],
    cta: { pt: "Plano atual", en: "Current plan" },
    ctaDisabled: true,
  },
  {
    id: "pro",
    icon: Zap,
    color: "text-orange-400",
    border: "border-orange-500",
    bg: "bg-zinc-900",
    badge: { pt: "Mais popular", en: "Most popular" },
    name: { pt: "Pro", en: "Pro" },
    price: { pt: "R$ 19", en: "R$ 19" },
    period: { pt: "/mês", en: "/mo" },
    description: { pt: "Para profissionais e donos de obra", en: "For professionals and site owners" },
    features: [
      { pt: "Catálogo completo de materiais", en: "Full material catalog", ok: true },
      { pt: "Catálogo de ferramentas", en: "Tool catalog", ok: true },
      { pt: "20 calculadoras offline", en: "20 offline calculators", ok: true },
      { pt: "Alertas de segurança", en: "Safety alerts", ok: true },
      { pt: "Comparador de materiais", en: "Material comparator", ok: true },
      { pt: "Favoritos ilimitados", en: "Unlimited favorites", ok: true },
      { pt: "Projetos ilimitados", en: "Unlimited projects", ok: true },
      { pt: "Chatbot IA (Mestre de Obra)", en: "AI Chatbot (Master Builder)", ok: true },
      { pt: "Export PDF de projetos", en: "Project PDF Export", ok: true },
      { pt: "Suporte prioritário", en: "Priority support", ok: true },
      { pt: "API key B2B", en: "B2B API key", ok: false },
    ],
    cta: { pt: "Assinar Pro", en: "Subscribe Pro" },
    ctaDisabled: false,
  },
  {
    id: "enterprise",
    icon: Building2,
    color: "text-blue-400",
    border: "border-blue-600",
    bg: "bg-zinc-900",
    badge: null,
    name: { pt: "Enterprise", en: "Enterprise" },
    price: { pt: "R$ 149", en: "R$ 149" },
    period: { pt: "/mês", en: "/mo" },
    description: { pt: "Para construtoras e grandes equipes", en: "For construction firms and large teams" },
    features: [
      { pt: "Tudo do plano Pro", en: "Everything in Pro", ok: true },
      { pt: "API key B2B", en: "B2B API key", ok: true },
      { pt: "Integração de preços em tempo real", en: "Real-time price integration", ok: true },
      { pt: "Suporte dedicado", en: "Dedicated support", ok: true },
      { pt: "White-label disponível", en: "White-label available", ok: true },
      { pt: "SLA garantido", en: "Guaranteed SLA", ok: true },
      { pt: "Onboarding personalizado", en: "Custom onboarding", ok: true },
      { pt: "Dashboard de analytics", en: "Analytics dashboard", ok: true },
      { pt: "Multi-usuário", en: "Multi-user", ok: true },
      { pt: "CNPJ com nota fiscal", en: "Invoice with CNPJ", ok: true },
      { pt: "Treinamento da equipe", en: "Team training", ok: true },
    ],
    cta: { pt: "Falar com vendas", en: "Contact sales" },
    ctaDisabled: false,
  },
];

export default function Pricing() {
  const { language } = useLanguage();
  const [, navigate] = useLocation();
  const pt = language === "PT";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Navigation />
      <div className="max-w-6xl mx-auto px-4 py-16">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-zinc-400 hover:text-zinc-100 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {pt ? "Voltar" : "Back"}
        </button>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            {pt ? "Planos e preços" : "Plans & pricing"}
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            {pt
              ? "Escolha o plano ideal para sua obra. Cancele a qualquer momento."
              : "Choose the right plan for your build. Cancel anytime."}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {tiers.map((tier) => {
            const Icon = tier.icon;
            return (
              <div
                key={tier.id}
                className={`relative rounded-2xl border ${tier.border} ${tier.bg} p-8 flex flex-col`}
              >
                {tier.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      {tier.badge[pt ? "pt" : "en"]}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg bg-zinc-800`}>
                    <Icon className={`w-5 h-5 ${tier.color}`} />
                  </div>
                  <h2 className="text-xl font-bold">{tier.name[pt ? "pt" : "en"]}</h2>
                </div>

                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-bold">{tier.price[pt ? "pt" : "en"]}</span>
                  <span className="text-zinc-400">{tier.period[pt ? "pt" : "en"]}</span>
                </div>

                <p className="text-zinc-400 text-sm mb-6">{tier.description[pt ? "pt" : "en"]}</p>

                <ul className="space-y-3 flex-1 mb-8">
                  {tier.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      {f.ok ? (
                        <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-zinc-600 flex-shrink-0" />
                      )}
                      <span className={f.ok ? "text-zinc-200" : "text-zinc-500"}>
                        {f[pt ? "pt" : "en"]}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  disabled={tier.ctaDisabled}
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                    tier.ctaDisabled
                      ? "bg-zinc-800 text-zinc-500 cursor-default"
                      : tier.id === "pro"
                      ? "bg-orange-500 hover:bg-orange-400 text-white"
                      : "border border-blue-600 text-blue-400 hover:bg-blue-600/10"
                  }`}
                  onClick={() => {
                    if (!tier.ctaDisabled && tier.id === "enterprise") {
                      window.open("mailto:enterprise@baluarte.app", "_blank");
                    }
                  }}
                >
                  {tier.cta[pt ? "pt" : "en"]}
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-zinc-500 text-sm">
            {pt
              ? "Pagamentos processados com segurança. Cancele a qualquer momento sem fidelidade."
              : "Payments processed securely. Cancel anytime, no lock-in."}
          </p>
        </div>
      </div>
    </div>
  );
}

import { Zap, X } from "lucide-react";
import { useLocation } from "wouter";
import { useLanguage } from "../contexts/LanguageContext";

interface Props {
  reason: "saved_items" | "projects" | "chat";
  onClose?: () => void;
}

const messages = {
  saved_items: {
    pt: { title: "Limite de favoritos atingido", body: "O plano gratuito suporta até 5 itens salvos. Faça upgrade para Pro para favoritos ilimitados." },
    en: { title: "Favorites limit reached", body: "The free plan supports up to 5 saved items. Upgrade to Pro for unlimited favorites." },
  },
  projects: {
    pt: { title: "Limite de projetos atingido", body: "O plano gratuito permite apenas 1 projeto. Faça upgrade para Pro para projetos ilimitados." },
    en: { title: "Projects limit reached", body: "The free plan allows only 1 project. Upgrade to Pro for unlimited projects." },
  },
  chat: {
    pt: { title: "Chatbot disponível no Pro", body: "O Mestre de Obra Digital com IA está disponível a partir do plano Pro." },
    en: { title: "Chatbot available on Pro", body: "The AI-powered Digital Master Builder is available starting with the Pro plan." },
  },
};

export function UpgradeBanner({ reason, onClose }: Props) {
  const { language } = useLanguage();
  const [, navigate] = useLocation();
  const pt = language === "PT";
  const msg = messages[reason][pt ? "pt" : "en"];

  return (
    <div className="rounded-xl border border-orange-500/50 bg-orange-950/30 p-4 flex items-start gap-4">
      <div className="p-2 rounded-lg bg-orange-500/20 flex-shrink-0">
        <Zap className="w-5 h-5 text-orange-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-orange-300 text-sm">{msg.title}</p>
        <p className="text-zinc-400 text-sm mt-0.5">{msg.body}</p>
        <button
          onClick={() => navigate("/pricing")}
          className="mt-3 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold transition-colors"
        >
          <Zap className="w-3.5 h-3.5" />
          {pt ? "Ver planos" : "See plans"}
        </button>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-zinc-500 hover:text-zinc-300 transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

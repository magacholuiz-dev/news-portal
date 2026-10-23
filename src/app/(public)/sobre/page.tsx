import type { Metadata } from "next";
import AboutContent from "@/components/AboutContent";

export const metadata: Metadata = {
  title: "Sobre o projeto",
  description:
    "Metodologia, fontes de dados e ficha técnica da equipe por trás do projeto.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-neutral-950">
      <AboutContent />
    </div>
  );
}

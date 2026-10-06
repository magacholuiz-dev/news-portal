import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sobre o projeto",
  description:
    "Metodologia, fontes de dados e ficha técnica da equipe por trás do projeto.",
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-white/10 py-10 first:border-t-0 first:pt-0">
      <h2 className="mb-4 font-serif text-2xl font-black text-white">
        {title}
      </h2>
      <div className="space-y-4 text-base leading-relaxed text-neutral-300">
        {children}
      </div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-neutral-950">
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <p className="mb-3 text-xs font-bold tracking-wide text-amber-400 uppercase">
        Sobre
      </p>
      <h1 className="mb-8 font-serif text-3xl leading-tight font-black text-white sm:text-4xl">
        O projeto
      </h1>

      <Section title="Apresentação">
        <p>
          Este projeto multimídia e interativo é um produto de jornalismo
          desenvolvido como Trabalho de Conclusão de Curso (TCC 2) no Curso
          de Jornalismo da Universidade Positivo. O objetivo é analisar os
          desafios geográficos, políticos e operacionais do jornalismo de
          cobertura de conflitos e guerra e de direitos humanos ao redor do
          mundo.
        </p>
      </Section>

      <Section title="Metodologia e transparência de dados">
        <p>
          A classificação de acesso e os índices de risco de cada território
          são baseados nos relatórios anuais do{" "}
          <strong className="text-white">Repórteres Sem Fronteiras (RSF)</strong> e do{" "}
          <strong className="text-white">Committee to Protect Journalists (CPJ)</strong>.
        </p>
        <p>
          A métrica de volume de noticiário global é estimada a partir do
          cruzamento de dados do <strong className="text-white">GDELT Project</strong> e do{" "}
          <strong className="text-white">Media Cloud</strong>.
        </p>
        <p>
          <a
            href="https://docs.google.com/spreadsheets/d/1guw7E2U8knP3OvaT8sLiXRja9k8oHorcbJaaxsHVGew/edit?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-amber-400 hover:underline"
          >
            Acessar a base de dados completa (planilha) &rarr;
          </a>
        </p>
      </Section>

      <Section title="Ficha técnica">
        <dl className="space-y-3">
          <div>
            <dt className="font-semibold text-white">
              Reportagem, pesquisa e produção
            </dt>
            <dd>
              Luana Motta, Mariana Godoi, Maria Eduarda Seniski e Nathália
              Plonkovski
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-white">
              Edição de vídeo e design gráfico
            </dt>
            <dd>Eduardo Santos</dd>
          </div>
          <div>
            <dt className="font-semibold text-white">
              Mapeamento de dados
            </dt>
            <dd>Mariana Godoi</dd>
          </div>
          <div>
            <dt className="font-semibold text-white">
              Orientação acadêmica
            </dt>
            <dd>Prof. Dr. Felipe Harmata Marinho</dd>
          </div>
        </dl>
        <p className="pt-4 text-sm text-neutral-500">
          Universidade Positivo — ECOD (Escola de Comunicação e Design)
          <br />
          Curso de Jornalismo — 2026
        </p>
      </Section>
    </article>
    </div>
  );
}

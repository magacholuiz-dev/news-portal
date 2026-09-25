import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

type SeedArticle = Parameters<typeof prisma.article.create>[0]["data"];

const articles: SeedArticle[] = [
  {
    slug: "exemplo-video-em-destaque",
    title: "Matéria de exemplo: clique na foto para assistir ao vídeo",
    subtitle:
      "Esta é uma matéria de demonstração criada automaticamente para mostrar o popup de vídeo.",
    excerpt:
      "Clique na imagem de destaque abaixo para abrir o vídeo vinculado em um popup.",
    heroImageUrl: "/uploads/sample-hero.svg",
    videoUrl: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
    category: "Demonstração",
    author: "Equipe do Portal",
    published: true,
    publishedAt: new Date("2026-09-02T09:00:00Z"),
    contentHtml: `
      <p>Esta matéria foi criada automaticamente para demonstrar o funcionamento do site.</p>
      <p>Ao clicar na imagem de destaque no topo da página, um popup é aberto reproduzindo o vídeo vinculado (neste exemplo, o trailer de <em>Big Buck Bunny</em>, um curta livre de direitos autorais usado apenas para teste).</p>
      <h2>Como editar</h2>
      <p>Acesse a área administrativa em <a href="/admin/login">/admin/login</a> para editar, criar ou remover matérias, incluindo textos, imagens de destaque e vídeos.</p>
    `.trim(),
    galleryItems: {
      create: [
        {
          imageUrl: "https://picsum.photos/seed/gallery-1/640/480",
          videoUrl: "https://www.youtube.com/watch?v=eRsGyueVLvQ",
          caption: "Cena 1 — Sintel",
          order: 0,
        },
        {
          imageUrl: "https://picsum.photos/seed/gallery-2/640/480",
          videoUrl: "https://www.youtube.com/watch?v=R6MlUcmOul8",
          caption: "Cena 2 — Tears of Steel",
          order: 1,
        },
        {
          imageUrl: "https://picsum.photos/seed/gallery-3/640/480",
          videoUrl: null,
          caption: "Foto sem vídeo vinculado",
          order: 2,
        },
      ],
    },
  },
  {
    slug: "prefeitura-lanca-corredor-de-onibus-eletricos",
    title: "Prefeitura lança corredor de ônibus elétricos na região central",
    subtitle:
      "Nova frota promete reduzir emissões e cortar o tempo médio de viagem em até 20%",
    excerpt:
      "Primeira etapa do projeto entra em operação nesta semana com 30 veículos elétricos.",
    heroImageUrl: "https://picsum.photos/seed/onibus-eletrico/1280/720",
    videoUrl: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
    category: "Cidades",
    author: "Marina Duarte",
    published: true,
    publishedAt: new Date("2026-08-28T12:00:00Z"),
    contentHtml: `
      <p>A prefeitura inaugurou nesta segunda-feira o primeiro corredor exclusivo para ônibus elétricos da cidade, ligando a zona norte ao centro em um trajeto de 12 quilômetros.</p>
      <p>Segundo a secretaria de transportes, a primeira etapa do projeto coloca 30 veículos elétricos em operação, com previsão de chegar a 120 até o fim do próximo ano. A expectativa é reduzir em até 20% o tempo médio de viagem nos horários de pico.</p>
      <h2>Impacto ambiental</h2>
      <p>De acordo com o estudo apresentado pela prefeitura, a substituição da frota a diesel pela elétrica nesse corredor deve evitar a emissão de cerca de 4 mil toneladas de CO₂ por ano.</p>
      <p>Moradores da região relataram expectativa positiva, mas cobraram mais informações sobre os novos pontos de parada e integração com outras linhas.</p>
    `.trim(),
  },
  {
    slug: "selecao-local-conquista-torneio-regional-de-volei",
    title: "Seleção local conquista torneio regional de vôlei após final eletrizante",
    subtitle: "Equipe venceu por 3 sets a 2 depois de estar perdendo por dois sets de diferença",
    excerpt:
      "Vitória de virada garante o título estadual pela primeira vez em oito anos.",
    heroImageUrl: "https://picsum.photos/seed/volei-final/1280/720",
    videoUrl: "https://www.youtube.com/watch?v=eRsGyueVLvQ",
    category: "Esportes",
    author: "Rafael Nogueira",
    published: true,
    publishedAt: new Date("2026-08-30T21:30:00Z"),
    contentHtml: `
      <p>Depois de perder os dois primeiros sets, a seleção local buscou uma virada histórica neste domingo e venceu a final do torneio regional de vôlei por 3 sets a 2.</p>
      <p>O ginásio, com mais de 4 mil torcedores, viveu momentos de tensão no quinto set, decidido apenas nos pontos finais. É o primeiro título estadual da equipe em oito anos.</p>
      <h2>Reação do técnico</h2>
      <p>"A equipe acreditou até o último ponto. Esse título é resultado de um trabalho de reconstrução que começou há três temporadas", afirmou o técnico após a partida.</p>
    `.trim(),
  },
  {
    slug: "banco-central-avalia-nova-taxa-de-juros",
    title: "Banco Central sinaliza possível revisão na taxa básica de juros",
    subtitle:
      "Ata da última reunião do comitê de política monetária indica cautela para os próximos meses",
    excerpt:
      "Analistas do mercado financeiro dividem opiniões sobre o próximo movimento da taxa básica.",
    heroImageUrl: "https://picsum.photos/seed/economia-juros/1280/720",
    videoUrl: null,
    category: "Economia",
    author: "Camila Rocha",
    published: false,
    publishedAt: null,
    contentHtml: `
      <p>A ata da última reunião do comitê de política monetária, divulgada nesta terça-feira, indica que a instituição deve manter cautela nas próximas decisões sobre a taxa básica de juros.</p>
      <p>Para analistas ouvidos pela reportagem, a sinalização abre espaço para uma possível revisão gradual ao longo do segundo semestre, dependendo da trajetória da inflação nos próximos meses.</p>
      <p><em>Esta matéria está salva como rascunho — não publicada — para demonstrar o fluxo de revisão no painel administrativo.</em></p>
    `.trim(),
  },
  {
    slug: "festival-de-cinema-independente-anuncia-selecao-2026",
    title: "Festival de cinema independente anuncia seleção oficial de 2026",
    subtitle: "Edição deste ano recebeu recorde de inscrições de curtas-metragens nacionais",
    excerpt:
      "Mostra competitiva reúne 24 produções selecionadas entre mais de 900 inscritas.",
    heroImageUrl: "https://picsum.photos/seed/festival-cinema/1280/720",
    videoUrl: "https://www.youtube.com/watch?v=R6MlUcmOul8",
    category: "Cultura",
    author: "Equipe de Cultura",
    published: true,
    publishedAt: new Date("2026-08-25T18:00:00Z"),
    contentHtml: `
      <p>O festival de cinema independente divulgou nesta semana a seleção oficial da edição de 2026, com 24 curtas-metragens escolhidos entre mais de 900 inscrições recebidas de todo o país.</p>
      <p>A mostra competitiva acontece ao longo de cinco dias, com sessões gratuitas e debates com os diretores selecionados ao final de cada bloco de exibição.</p>
      <h2>Destaques da seleção</h2>
      <p>Entre os trabalhos escolhidos estão produções voltadas a animação, documentário e ficção, refletindo a diversidade regional que a organização diz ter buscado neste ano.</p>
    `.trim(),
  },
  {
    slug: "pesquisadores-descobrem-nova-especie-de-ra-em-reserva-nacional",
    title: "Pesquisadores descobrem nova espécie de rã em reserva nacional",
    subtitle:
      "Espécie foi identificada durante expedição de mapeamento de biodiversidade",
    excerpt:
      "Descoberta reforça a importância da preservação de áreas ainda pouco estudadas.",
    heroImageUrl: "https://picsum.photos/seed/nova-especie-ra/1280/720",
    videoUrl: "https://www.youtube.com/watch?v=TLkA0RELQ1g",
    category: "Ciência",
    author: "Dr. Eduardo Lima",
    published: true,
    publishedAt: new Date("2026-08-20T15:00:00Z"),
    contentHtml: `
      <p>Uma equipe de pesquisadores identificou uma nova espécie de rã durante uma expedição de mapeamento de biodiversidade em uma reserva nacional. O estudo foi publicado em revista científica na semana passada.</p>
      <p>A espécie, ainda sem nome popular definido, foi encontrada em uma área de difícil acesso e apresenta características únicas de coloração e vocalização em comparação com espécies próximas já catalogadas.</p>
      <p>Segundo os pesquisadores, a descoberta reforça a importância de se manter a proteção de áreas ainda pouco estudadas, que podem abrigar espécies desconhecidas pela ciência.</p>
    `.trim(),
  },
];

async function main() {
  for (const data of articles) {
    const existing = await prisma.article.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      console.log(`Já existe, pulando: ${data.slug}`);
      continue;
    }

    await prisma.article.create({ data });
    console.log(`Criada: ${data.slug}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

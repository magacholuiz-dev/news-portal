/**
 * Loop 0 do rebuild em scrollytelling: limpa o banco e recria com os 14
 * territórios REAIS da planilha do projeto (cobertura, classificação de
 * atenção midiática e observação jornalística vêm da aba "Dados - site
 * (tcc)"). Categoria de acesso e nível de risco RSF ainda não foram
 * enviados pelo usuário — ficam `null` (editáveis depois em
 * /admin/territories).
 *
 * O texto de cada reportagem (contentHtml) é placeholder — monta um
 * resumo a partir dos dados reais da planilha, não é a reportagem final
 * que a equipe vai escrever. Imagens e vídeos continuam sendo stock/demo
 * até os episódios reais ficarem prontos.
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { slugify } from "../src/lib/slug";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Vídeos de demonstração (curtas livres de direitos da Blender
// Foundation) usados como placeholder até os episódios reais existirem.
const DEMO_VIDEOS = [
  "https://www.youtube.com/watch?v=aqz-KE-bpKQ", // Big Buck Bunny
  "https://www.youtube.com/watch?v=eRsGyueVLvQ", // Sintel
  "https://www.youtube.com/watch?v=R6MlUcmOul8", // Tears of Steel
  "https://www.youtube.com/watch?v=TLkA0RELQ1g", // Elephant's Dream
];

type Territory = {
  id: string; // Territorio_ID da planilha
  name: string;
  lat: number;
  lng: number;
  continent: string;
  continentOrder: number;
  displayOrder: number; // Ordem_Exibicao
  coveragePct: number; // Proporcao_Cobertura_Pct
  mediaAttentionClass: string; // Clas_Atencao_Midia
  journalistNote: string; // Observacao_Jornalistica
  isAnchorEpisode: boolean;
  episodeTheme?: string; // só pros 5 episódios-âncora
};

const TERRITORIES: Territory[] = [
  {
    id: "UCRA",
    name: "Kiev, Ucrânia",
    lat: 50.45,
    lng: 30.5241,
    continent: "Europa",
    continentOrder: 1,
    displayOrder: 1,
    coveragePct: 100.0,
    mediaAttentionClass: "Hipercoberta",
    journalistNote:
      "Conflito no topo da agenda global com presença massiva de imprensa internacional.",
    isAnchorEpisode: true,
    episodeTheme: "O conflito no topo da agenda global",
  },
  {
    id: "GAZA",
    name: "Cidade de Gaza",
    lat: 31.5017,
    lng: 34.4668,
    continent: "Asia e Oriente Medio",
    continentOrder: 2,
    displayOrder: 2,
    coveragePct: 85.0,
    mediaAttentionClass: "Hipercoberta",
    journalistNote:
      "Cobertura intensa, porém operada sob risco extremo e bloqueios de entrada.",
    isAnchorEpisode: true,
    episodeTheme: "Cobertura sob risco extremo e bloqueios de entrada",
  },
  {
    id: "ISRA",
    name: "Jerusalém, Israel",
    lat: 31.7683,
    lng: 35.2137,
    continent: "Asia e Oriente Medio",
    continentOrder: 2,
    displayOrder: 13,
    coveragePct: 2.0,
    mediaAttentionClass: "Contexto Específico",
    journalistNote:
      "Cobertura associada aos desdobramentos de segurança interna e diplomacia.",
    isAnchorEpisode: false,
  },
  {
    id: "IRAN",
    name: "Teerã, Irã",
    lat: 35.6892,
    lng: 51.389,
    continent: "Asia e Oriente Medio",
    continentOrder: 2,
    displayOrder: 6,
    coveragePct: 10.0,
    mediaAttentionClass: "Cobertura Restrita",
    journalistNote:
      "Dependência de fontes locais ou imagens de redes sociais devido ao bloqueio.",
    isAnchorEpisode: false,
  },
  {
    id: "LEBA",
    name: "Beirute, Líbano",
    lat: 33.8938,
    lng: 35.5018,
    continent: "Asia e Oriente Medio",
    continentOrder: 2,
    displayOrder: 3,
    coveragePct: 35.0,
    mediaAttentionClass: "Média Cobertura",
    journalistNote:
      "Atenção vinculada à escalada regional do Oriente Médio.",
    isAnchorEpisode: false,
  },
  {
    id: "MYAN",
    name: "Naypyidaw, Mianmar",
    lat: 19.7633,
    lng: 96.0785,
    continent: "Asia e Oriente Medio",
    continentOrder: 2,
    displayOrder: 8,
    coveragePct: 7.0,
    mediaAttentionClass: "Negligenciada",
    journalistNote:
      "Pouca atenção internacional contínua; cobertura isolada na imprensa regional.",
    isAnchorEpisode: false,
  },
  {
    id: "SYRI",
    name: "Damasco, Síria",
    lat: 33.5138,
    lng: 36.2765,
    continent: "Asia e Oriente Medio",
    continentOrder: 2,
    displayOrder: 4,
    coveragePct: 20.0,
    mediaAttentionClass: "Baixa Cobertura",
    journalistNote:
      "Cobertura pontual devido à duração prolongada e dificuldades de acesso.",
    isAnchorEpisode: false,
  },
  {
    id: "YEME",
    name: "Saná, Iêmen",
    lat: 15.3694,
    lng: 44.191,
    continent: "Asia e Oriente Medio",
    continentOrder: 2,
    displayOrder: 9,
    coveragePct: 6.0,
    mediaAttentionClass: "Negligenciada",
    journalistNote:
      "Considerada uma das guerras mais silenciadas do mundo pela ONU.",
    isAnchorEpisode: false,
  },
  {
    id: "CISJ",
    name: "Ramallah, Cisjordânia",
    lat: 31.9038,
    lng: 35.2034,
    continent: "Asia e Oriente Medio",
    continentOrder: 2,
    displayOrder: 11,
    coveragePct: 5.0,
    mediaAttentionClass: "Média / Baixa",
    journalistNote:
      "Sombra da cobertura principal concentrada no território de Gaza.",
    isAnchorEpisode: false,
  },
  {
    id: "SUDA",
    name: "Cartum, Sudão",
    lat: 15.5007,
    lng: 32.5599,
    continent: "Africa",
    continentOrder: 3,
    displayOrder: 7,
    coveragePct: 8.0,
    mediaAttentionClass: "Negligenciada",
    journalistNote:
      "Crise humanitária grave com baixa visibilidade nos grandes veículos ocidentais.",
    isAnchorEpisode: true,
    episodeTheme: "A crise humanitária grave que o mundo não vê",
  },
  {
    id: "LIBY",
    name: "Trípoli, Líbia",
    lat: 32.8872,
    lng: 13.1913,
    continent: "Africa",
    continentOrder: 3,
    displayOrder: 10,
    coveragePct: 5.0,
    mediaAttentionClass: "Negligenciada",
    journalistNote:
      "Cobertura esporádica associada a crises migratórias no Mediterrâneo.",
    isAnchorEpisode: false,
  },
  {
    id: "CUBA",
    name: "Havana, Cuba",
    lat: 23.1136,
    lng: -82.3666,
    continent: "Americas",
    continentOrder: 4,
    displayOrder: 12,
    coveragePct: 3.0,
    mediaAttentionClass: "Baixa Cobertura",
    journalistNote:
      "Foco pontual em direitos humanos, repressão a protestos e êxodo migratório.",
    isAnchorEpisode: true,
    episodeTheme: "Voltar para casa",
  },
  {
    id: "MEXI",
    name: "Cidade do México, México",
    lat: 19.4326,
    lng: -99.1332,
    continent: "Americas",
    continentOrder: 4,
    displayOrder: 5,
    coveragePct: 12.0,
    mediaAttentionClass: "Cobertura Localizada",
    journalistNote:
      "Foco pontual em episódios de violência extrema contra a imprensa.",
    isAnchorEpisode: false,
  },
  {
    id: "PNG_B",
    name: "Port Moresby, Papua-Nova Guiné",
    lat: -9.4438,
    lng: 147.1803,
    continent: "Oceania",
    continentOrder: 5,
    displayOrder: 14,
    coveragePct: 0.5,
    mediaAttentionClass: "Zonas de Sombra",
    journalistNote:
      "Silêncio quase total na imprensa internacional sobre disputas locais/regionais.",
    isAnchorEpisode: true,
    episodeTheme: "O silêncio quase total da imprensa internacional",
  },
];

function buildArticle(territory: Territory, videoUrl: string) {
  const countryName = territory.name.split(",").slice(1).join(",").trim() || territory.name;
  const title = territory.isAnchorEpisode
    ? `${countryName}: ${territory.episodeTheme}`
    : `${countryName}: panorama da cobertura jornalística`;

  const contentHtml = `
    <p><em>Reportagem de exemplo — conteúdo placeholder até a produção do episódio/reportagem real pela equipe.</em></p>
    <p>${territory.journalistNote}</p>
    <p>Segundo o levantamento do projeto, a cobertura internacional sobre este território representa aproximadamente <strong>${territory.coveragePct}%</strong> do volume de atenção midiática mapeado entre os 14 territórios analisados, classificada como <strong>${territory.mediaAttentionClass}</strong>.</p>
    ${
      territory.isAnchorEpisode
        ? `<h2>Sobre o episódio</h2><p>Este território é a âncora em vídeo da região ${territory.continent.replace("e Oriente Medio", "e Oriente Médio")} nesta série documental.</p>`
        : ""
    }
  `.trim();

  return {
    slug: slugify(`${territory.id}-${territory.name}`),
    title,
    subtitle: territory.isAnchorEpisode
      ? territory.episodeTheme
      : `Cobertura midiática: ${territory.mediaAttentionClass.toLowerCase()}`,
    excerpt: territory.journalistNote,
    heroImageUrl: `https://picsum.photos/seed/${territory.id.toLowerCase()}/1280/720`,
    videoUrl,
    category: territory.continent,
    author: "Equipe Documental",
    contentHtml,
    isAnchorEpisode: territory.isAnchorEpisode,
  };
}

async function main() {
  console.log("Limpando banco de dados...");
  await prisma.galleryItem.deleteMany({});
  await prisma.article.deleteMany({});
  await prisma.location.deleteMany({});
  console.log("Banco limpo.");

  for (const [index, territory] of TERRITORIES.entries()) {
    const location = await prisma.location.create({
      data: {
        name: territory.name,
        slug: slugify(territory.name),
        lat: territory.lat,
        lng: territory.lng,
        continent: territory.continent,
        continentOrder: territory.continentOrder,
        displayOrder: territory.displayOrder,
        coveragePct: territory.coveragePct,
        mediaAttentionClass: territory.mediaAttentionClass,
        journalistNote: territory.journalistNote,
        // accessCategory / riskLevelRSF: ainda não enviados pelo usuário.
      },
    });

    const videoUrl = DEMO_VIDEOS[index % DEMO_VIDEOS.length];
    const article = buildArticle(territory, videoUrl);

    await prisma.article.create({
      data: {
        slug: article.slug,
        title: article.title,
        subtitle: article.subtitle,
        excerpt: article.excerpt,
        heroImageUrl: article.heroImageUrl,
        videoUrl: article.videoUrl,
        contentHtml: article.contentHtml,
        author: article.author,
        category: article.category,
        published: true,
        publishedAt: new Date(),
        locationId: location.id,
        isAnchorEpisode: article.isAnchorEpisode,
      },
    });

    console.log(
      `Criado: ${territory.id} — ${territory.name} (${territory.continent}${
        territory.isAnchorEpisode ? ", EPISÓDIO-ÂNCORA" : ""
      })`,
    );
  }

  console.log("Concluído: 14 territórios criados.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

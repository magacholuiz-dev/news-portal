/**
 * Limpa o banco (Article, GalleryItem, Location) e recria com reportagens
 * de exemplo sobre conflitos internacionais reais, cada uma vinculada a um
 * local no mapa. Conteúdo é resumo neutro e genérico — placeholder até as
 * reportagens/documentários reais serem produzidos. Imagens e vídeos são
 * stock/demo (picsum.photos e curtas livres de direitos da Blender
 * Foundation), não material de arquivo real.
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { slugify } from "../src/lib/slug";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

type SeedArticle = {
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  heroImageUrl: string;
  videoUrl: string;
  category: string;
  author: string;
  contentHtml: string;
  location: { name: string; lat: number; lng: number };
};

const articles: SeedArticle[] = [
  {
    slug: "guerra-na-ucrania-panorama",
    title: "Guerra na Ucrânia: um panorama do conflito",
    subtitle: "Episódio-piloto da série sobre o conflito entre Rússia e Ucrânia",
    excerpt:
      "Desde a invasão russa em fevereiro de 2022, a guerra na Ucrânia se tornou um dos maiores conflitos armados na Europa desde a Segunda Guerra Mundial, com impacto humanitário e geopolítico global.",
    heroImageUrl: "https://picsum.photos/seed/conflito-ucrania/1280/720",
    videoUrl: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
    category: "Guerra na Ucrânia",
    author: "Equipe Documental",
    contentHtml: `
      <p><em>Reportagem de exemplo — conteúdo placeholder até a produção do episódio real.</em></p>
      <p>A guerra em larga escala entre Rússia e Ucrânia começou em fevereiro de 2022, após anos de tensões que remontam a 2014. O conflito provocou uma das maiores crises de deslocamento populacional da Europa nas últimas décadas, além de impactos econômicos sentidos globalmente.</p>
      <p>Este episódio da série documental pretende apresentar o contexto histórico do conflito, ouvir relatos de quem vive na região e acompanhar os esforços diplomáticos em curso.</p>
    `.trim(),
    location: { name: "Kiev, Ucrânia", lat: 50.45, lng: 30.5241 },
  },
  {
    slug: "conflito-israel-gaza-panorama",
    title: "Israel e Gaza: décadas de conflito",
    subtitle: "Contextualizando um dos conflitos mais antigos do Oriente Médio",
    excerpt:
      "O conflito entre Israel e grupos palestinos, com raízes que remontam a décadas, voltou a se intensificar de forma significativa a partir de outubro de 2023, com graves consequências humanitárias na Faixa de Gaza.",
    heroImageUrl: "https://picsum.photos/seed/conflito-gaza/1280/720",
    videoUrl: "https://www.youtube.com/watch?v=eRsGyueVLvQ",
    category: "Conflito Israel-Gaza",
    author: "Equipe Documental",
    contentHtml: `
      <p><em>Reportagem de exemplo — conteúdo placeholder até a produção do episódio real.</em></p>
      <p>O conflito israelo-palestino tem raízes históricas que remontam a mais de sete décadas. A escalada iniciada em outubro de 2023 resultou em uma das crises humanitárias mais graves da região nos últimos anos, com organizações internacionais alertando para a situação da população civil na Faixa de Gaza.</p>
      <p>Este episódio busca apresentar diferentes perspectivas sobre o conflito e o esforço da comunidade internacional por uma solução duradoura.</p>
    `.trim(),
    location: { name: "Cidade de Gaza", lat: 31.5017, lng: 34.4668 },
  },
  {
    slug: "guerra-civil-sudao-panorama",
    title: "Sudão: a guerra civil esquecida",
    subtitle: "Um dos maiores deslocamentos populacionais do mundo em curso",
    excerpt:
      "Desde abril de 2023, o conflito entre o Exército sudanês e as Forças de Apoio Rápido gerou uma das maiores crises humanitárias e de deslocamento interno do mundo, com cobertura internacional limitada.",
    heroImageUrl: "https://picsum.photos/seed/conflito-sudao/1280/720",
    videoUrl: "https://www.youtube.com/watch?v=R6MlUcmOul8",
    category: "Guerra Civil no Sudão",
    author: "Equipe Documental",
    contentHtml: `
      <p><em>Reportagem de exemplo — conteúdo placeholder até a produção do episódio real.</em></p>
      <p>Desde abril de 2023, o Sudão enfrenta um conflito armado entre o Exército sudanês e as Forças de Apoio Rápido (RSF), que já provocou o deslocamento de milhões de pessoas e é descrito por organizações humanitárias como uma das maiores crises de deslocamento do mundo atualmente.</p>
      <p>Apesar da magnitude da crise, o conflito recebe cobertura midiática internacional comparativamente limitada — um dos motivos pelos quais este episódio busca dar visibilidade ao tema.</p>
    `.trim(),
    location: { name: "Cartum, Sudão", lat: 15.5007, lng: 32.5599 },
  },
  {
    slug: "conflito-iemen-panorama",
    title: "Iêmen: a crise humanitária mais grave do mundo",
    subtitle: "Anos de guerra civil e bloqueio agravam a situação da população",
    excerpt:
      "A guerra civil no Iêmen, agravada pela intervenção de uma coalizão internacional a partir de 2015, é apontada há anos por organizações da ONU como uma das piores crises humanitárias do planeta.",
    heroImageUrl: "https://picsum.photos/seed/conflito-iemen/1280/720",
    videoUrl: "https://www.youtube.com/watch?v=TLkA0RELQ1g",
    category: "Conflito no Iêmen",
    author: "Equipe Documental",
    contentHtml: `
      <p><em>Reportagem de exemplo — conteúdo placeholder até a produção do episódio real.</em></p>
      <p>O conflito no Iêmen se intensificou a partir de 2014-2015, com o avanço de forças Houthi e a subsequente intervenção de uma coalizão liderada pela Arábia Saudita. Anos de combates, somados a um bloqueio parcial, agravaram severamente a situação humanitária no país.</p>
      <p>Este episódio pretende explorar o impacto do conflito na vida civil e os esforços de mediação internacional em curso.</p>
    `.trim(),
    location: { name: "Saná, Iêmen", lat: 15.3694, lng: 44.191 },
  },
  {
    slug: "crise-haiti-panorama",
    title: "Haiti: violência armada e crise institucional",
    subtitle: "Grupos armados e o colapso das instituições estatais",
    excerpt:
      "Nos últimos anos, o Haiti enfrenta uma escalada de violência ligada a grupos armados e a um vácuo institucional, levando à intervenção de uma força internacional de apoio à segurança.",
    heroImageUrl: "https://picsum.photos/seed/conflito-haiti/1280/720",
    videoUrl: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
    category: "Crise no Haiti",
    author: "Equipe Documental",
    contentHtml: `
      <p><em>Reportagem de exemplo — conteúdo placeholder até a produção do episódio real.</em></p>
      <p>Nos últimos anos, o Haiti tem enfrentado uma grave crise de segurança, com grupos armados controlando partes significativas da capital, Porto Príncipe, em meio a um vácuo institucional agravado após o assassinato do presidente Jovenel Moïse em 2021.</p>
      <p>Este episódio acompanha o esforço internacional de apoio à segurança e o cotidiano da população em meio à crise.</p>
    `.trim(),
    location: { name: "Porto Príncipe, Haiti", lat: 18.5944, lng: -72.3074 },
  },
  {
    slug: "guerra-civil-mianmar-panorama",
    title: "Mianmar: guerra civil após o golpe de 2021",
    subtitle: "Resistência armada se espalha pelo país desde o golpe militar",
    excerpt:
      "Desde o golpe militar de fevereiro de 2021, Mianmar mergulhou em uma guerra civil generalizada entre a junta militar e uma rede de forças de resistência, com graves consequências para a população civil.",
    heroImageUrl: "https://picsum.photos/seed/conflito-mianmar/1280/720",
    videoUrl: "https://www.youtube.com/watch?v=eRsGyueVLvQ",
    category: "Guerra Civil em Mianmar",
    author: "Equipe Documental",
    contentHtml: `
      <p><em>Reportagem de exemplo — conteúdo placeholder até a produção do episódio real.</em></p>
      <p>Após o golpe militar de fevereiro de 2021, que derrubou o governo civil eleito, Mianmar mergulhou em um conflito armado generalizado entre as forças da junta militar e uma ampla rede de grupos de resistência armada e milícias étnicas.</p>
      <p>Este episódio busca contextualizar as origens do golpe e o impacto do conflito prolongado na população civil do país.</p>
    `.trim(),
    location: { name: "Naypyidaw, Mianmar", lat: 19.7633, lng: 96.0785 },
  },
];

async function main() {
  console.log("Limpando banco de dados...");
  await prisma.galleryItem.deleteMany({});
  await prisma.article.deleteMany({});
  await prisma.location.deleteMany({});
  console.log("Banco limpo.");

  for (const item of articles) {
    const location = await prisma.location.create({
      data: {
        name: item.location.name,
        slug: slugify(item.location.name),
        lat: item.location.lat,
        lng: item.location.lng,
      },
    });

    await prisma.article.create({
      data: {
        slug: item.slug,
        title: item.title,
        subtitle: item.subtitle,
        excerpt: item.excerpt,
        heroImageUrl: item.heroImageUrl,
        videoUrl: item.videoUrl,
        contentHtml: item.contentHtml,
        author: item.author,
        category: item.category,
        published: true,
        publishedAt: new Date(),
        locationId: location.id,
      },
    });

    console.log(`Criada: ${item.slug} (${item.location.name})`);
  }

  console.log("Concluído.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { BlockKey, BriefInput, SearchResult } from "./types";

/**
 * Deterministic placeholder data used when TAVILY_API_KEY is not set.
 * Deliberately leaves serviceContext (and interests without a known ЛПР name)
 * empty so the UI/LLM path for "не найдено" gets exercised too, matching
 * the PRD's low-confidence blocks (section 9).
 */
export function pseudoYear(seed: string, base: number, spread: number): number {
  const sum = [...seed].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return base + (sum % spread);
}

export function mockSearch(
  input: BriefInput,
  queriesByBlock: Record<BlockKey, string[]>
): Record<BlockKey, SearchResult[]> {
  const { companyName, decisionMakerName } = input;
  const foundedYear = pseudoYear(companyName, 2008, 14);

  const company: SearchResult[] = [
    {
      query: queriesByBlock.company[0],
      title: `${companyName} — официальный сайт`,
      url: `https://example-${slug(companyName)}.kz`,
      content: `${companyName} — компания, работающая в сфере предоставления услуг B2B-клиентам. Информация со страницы «О компании».`,
    },
    {
      query: queriesByBlock.company[1],
      title: `Данные реестра — ${companyName}`,
      url: "https://kgd.gov.kz/ru/app/objects-taxpayers",
      content: `Дата регистрации в реестре: ${foundedYear} год. Статус регистрации: действующее юридическое лицо.`,
    },
  ];

  const tax: SearchResult[] = [
    {
      query: queriesByBlock.tax[0],
      title: "Статус налогоплательщика — kgd.gov.kz",
      url: "https://kgd.gov.kz/ru/app/tax-status",
      content:
        "По данным портала: задолженность по налогам и обязательным платежам отсутствует. Налоговый режим: общеустановленный порядок.",
    },
  ];

  const decisionMaker: SearchResult[] = decisionMakerName
    ? [
        {
          query: queriesByBlock.decisionMaker[0],
          title: `${decisionMakerName} — профиль LinkedIn`,
          url: "https://linkedin.com/in/example-profile",
          content: `${decisionMakerName} занимает должность руководителя направления в ${companyName} с ${pseudoYear(
            decisionMakerName,
            2018,
            6
          )} года. Отвечает за операционное управление и работу с ключевыми партнёрами.`,
        },
      ]
    : [];

  const serviceContext: SearchResult[] = [];

  const relatedCompanies: SearchResult[] = [
    {
      query: queriesByBlock.relatedCompanies[0],
      title: `Аффилированные лица — ${companyName}`,
      url: "https://kgd.gov.kz/ru/app/affiliated-persons",
      content: `По данным реестра, учредитель ${companyName} также выступает учредителем компании «${companyName}-Сервис».`,
    },
  ];

  const interests: SearchResult[] = decisionMakerName
    ? [
        {
          query: queriesByBlock.interests[0],
          title: `Интервью — ${decisionMakerName}`,
          url: "https://example-business-media.kz/interview",
          content: `В интервью деловому изданию ${decisionMakerName} упомянул(а) увлечение горными лыжами и интерес к развитию локальных технологических стартапов.`,
        },
      ]
    : [];

  return { company, tax, decisionMaker, serviceContext, interests, relatedCompanies };
}

function slug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9а-яё]+/gi, "-")
    .replace(/^-+|-+$/g, "") || "company";
}

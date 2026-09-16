import { BlockKey, BriefInput } from "./types";

export function buildQueries(input: BriefInput): Record<BlockKey, string[]> {
  const { companyName, bin, decisionMakerName } = input;
  const binPart = bin ? ` ${bin}` : "";

  return {
    company: [
      `${companyName}${binPart} официальный сайт сфера деятельности`,
      `${companyName}${binPart} реестр egov.kz ИЛИ kgd.gov.kz ИЛИ ЕГРЮЛ дата регистрации`,
    ],
    tax: [
      `${companyName}${binPart} налоговая задолженность kgd.gov.kz`,
      `${companyName}${binPart} прозрачный бизнес nalog.ru налоговый режим`,
    ],
    decisionMaker: [
      decisionMakerName
        ? `${decisionMakerName} ${companyName} LinkedIn должность`
        : `${companyName} директор ЛПР LinkedIn команда`,
      `${companyName} назначение руководитель пресс-релиз`,
    ],
    serviceContext: [
      `${companyName} банк партнёр подрядчик тендер госзакупки`,
      `${companyName} пресс-релиз партнёрство`,
    ],
    interests: [
      decisionMakerName
        ? `${decisionMakerName} интервью хобби конференция`
        : `${companyName} директор интервью деловые СМИ`,
    ],
    relatedCompanies: [
      `${companyName}${binPart} аффилированные лица учредитель другие компании`,
      `${companyName} дочерняя компания ИЛИ материнская компания холдинг группа`,
    ],
  };
}

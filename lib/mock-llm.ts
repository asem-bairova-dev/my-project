import { BlockKey, Brief, BriefInput, Field, SearchResult } from "./types";
import { pseudoYear } from "./mock-search";
import { buildMeetingPrep } from "./meeting-prep";

function found(value: string, source: SearchResult): Field {
  return { value, found: true, source: { label: source.title, url: source.url } };
}

function notFound(): Field {
  return { value: "не найдено", found: false };
}

/**
 * Stands in for the LLM summarization step when ANTHROPIC_API_KEY is not
 * set. Deterministically derives fields from the mock search fragments so
 * the "не найдено" behavior (PRD 6.3) is exercised the same way it would be
 * with a real model.
 */
export function mockSummarize(
  input: BriefInput,
  resultsByBlock: Record<BlockKey, SearchResult[]>
): Brief {
  const { companyName, decisionMakerName } = input;
  const [companySite, companyRegistry] = resultsByBlock.company;
  const [taxStatus] = resultsByBlock.tax;
  const [dmProfile] = resultsByBlock.decisionMaker;
  const [interestSource] = resultsByBlock.interests;
  const [affiliatedSource] = resultsByBlock.relatedCompanies;

  const foundedYear = pseudoYear(companyName, 2008, 14);

  const company = {
    name: found(companyName, companySite),
    industry: found("Предоставление услуг B2B-клиентам", companySite),
    foundedDate: found(`${foundedYear} год`, companyRegistry),
    registrationStatus: found("Действующее юридическое лицо", companyRegistry),
  };
  const tax = {
    debtStatus: found("Задолженность отсутствует", taxStatus),
    taxRegime: found("Общеустановленный порядок", taxStatus),
  };
  const decisionMaker = dmProfile
    ? {
        fullName: found(decisionMakerName as string, dmProfile),
        position: found("Руководитель направления", dmProfile),
        tenure: found(`С ${pseudoYear(decisionMakerName as string, 2018, 6)} года`, dmProfile),
        responsibility: found(
          "Операционное управление, работа с ключевыми партнёрами",
          dmProfile
        ),
      }
    : {
        fullName: notFound(),
        position: notFound(),
        tenure: notFound(),
        responsibility: notFound(),
      };
  const serviceContext = { summary: notFound() };
  const interests = interestSource
    ? {
        hobbies: found("Горные лыжи", interestSource),
        publicAppearances: found("Интервью деловому изданию", interestSource),
        talkingPoints: found(
          "Развитие локальных технологических стартапов",
          interestSource
        ),
      }
    : {
        hobbies: notFound(),
        publicAppearances: notFound(),
        talkingPoints: notFound(),
      };
  const relatedCompanies = affiliatedSource
    ? {
        found: true,
        companies: [
          {
            name: `«${companyName}-Сервис»`,
            relation: "тот же учредитель",
            source: { label: affiliatedSource.title, url: affiliatedSource.url },
          },
        ],
      }
    : { found: false, companies: [] };

  return {
    input,
    generatedAt: new Date().toISOString(),
    meetingPrep: buildMeetingPrep({
      companyName,
      company,
      tax,
      decisionMaker,
      serviceContext,
      interests,
      relatedCompanies,
    }),
    company,
    tax,
    decisionMaker,
    serviceContext,
    interests,
    relatedCompanies,
  };
}

import {
  CompanyBlock,
  DecisionMakerBlock,
  InterestsBlock,
  MeetingPrep,
  ServiceContextBlock,
  TaxBlock,
} from "./types";

/**
 * Derives the "Коротко" summary, stop-factors and suggested questions
 * programmatically from already-resolved, source-backed fields — never from
 * a fresh LLM pass — so this step can't introduce new, ungrounded claims.
 */
export function buildMeetingPrep(brief: {
  companyName: string;
  company: CompanyBlock;
  tax: TaxBlock;
  decisionMaker: DecisionMakerBlock;
  serviceContext: ServiceContextBlock;
  interests: InterestsBlock;
}): MeetingPrep {
  const { companyName, company, tax, decisionMaker, serviceContext, interests } = brief;

  const stopFactors: string[] = [];
  if (tax.debtStatus.found && !/отсутств/i.test(tax.debtStatus.value)) {
    stopFactors.push(
      `Налоговый статус: «${tax.debtStatus.value}» — уточнить причину и сроки погашения.`
    );
  }
  if (company.registrationStatus.found && !/действ/i.test(company.registrationStatus.value)) {
    stopFactors.push(
      `Статус регистрации требует внимания: «${company.registrationStatus.value}».`
    );
  }

  const suggestedQuestions: string[] = [];
  if (!decisionMaker.fullName.found) {
    suggestedQuestions.push("Кто в компании принимает решение по этому направлению?");
  }
  if (!serviceContext.summary.found) {
    suggestedQuestions.push("С каким банком и подрядчиками компания сейчас работает?");
  }
  if (!tax.debtStatus.found) {
    suggestedQuestions.push("Есть ли сейчас задолженность по налогам или спорные начисления?");
  }
  if (!interests.hobbies.found && !interests.talkingPoints.found) {
    suggestedQuestions.push(
      "Тема для small talk не подготовлена заранее — найдите момент уточнить интересы по ходу разговора."
    );
  }

  const summaryParts: string[] = [];
  summaryParts.push(
    stopFactors.length > 0
      ? `${companyName}: ${stopFactors.length} стоп-фактор(а) требуют внимания перед сделкой.`
      : `${companyName}: явных стоп-факторов не обнаружено.`
  );
  if (decisionMaker.fullName.found) {
    summaryParts.push(
      `ЛПР — ${decisionMaker.fullName.value}${
        decisionMaker.position.found ? `, ${decisionMaker.position.value}` : ""
      }.`
    );
  }
  const talkingPoint = interests.talkingPoints.found
    ? interests.talkingPoints.value
    : interests.hobbies.found
      ? interests.hobbies.value
      : null;
  if (talkingPoint) {
    summaryParts.push(`Тема для small talk: ${talkingPoint}.`);
  }

  return {
    summary: summaryParts.join(" "),
    stopFactors,
    suggestedQuestions,
  };
}

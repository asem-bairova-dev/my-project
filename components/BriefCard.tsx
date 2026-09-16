import { Brief } from "@/lib/types";
import { FieldRow } from "./FieldRow";

function BriefBlock({
  title,
  warning,
  children,
}: {
  title: string;
  warning?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white px-4 py-3 sm:px-5 sm:py-4">
      <div className="mb-1 flex items-center justify-between gap-2">
        <h3 className="font-sans text-sm font-semibold text-slate-800">{title}</h3>
        {warning && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">
            ⚠ {warning}
          </span>
        )}
      </div>
      <dl>{children}</dl>
    </section>
  );
}

function hasIssue(value: string, found: boolean): boolean {
  if (!found) return false;
  return !/отсутств|действ/i.test(value);
}

export function BriefCard({ brief }: { brief: Brief }) {
  const taxIssue = hasIssue(brief.tax.debtStatus.value, brief.tax.debtStatus.found);
  const regIssue = hasIssue(
    brief.company.registrationStatus.value,
    brief.company.registrationStatus.found
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2 px-1">
        <h2 className="font-sans text-lg font-semibold text-slate-900">
          {brief.input.companyName}
        </h2>
        <span className="font-mono text-xs text-slate-400">
          обновлено {new Date(brief.generatedAt).toLocaleString("ru-RU")}
        </span>
      </div>

      <section className="rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 sm:px-5 sm:py-4">
        <h3 className="mb-1 font-sans text-sm font-semibold text-teal-900">Коротко</h3>
        <p className="text-sm text-slate-800">{brief.meetingPrep.summary}</p>

        {brief.meetingPrep.stopFactors.length > 0 && (
          <ul className="mt-2 flex flex-col gap-1">
            {brief.meetingPrep.stopFactors.map((factor, i) => (
              <li key={i} className="text-sm text-red-700">
                ⚠ {factor}
              </li>
            ))}
          </ul>
        )}

        {brief.meetingPrep.recommendations.length > 0 && (
          <div className="mt-2">
            <p className="text-xs font-medium uppercase tracking-wide text-teal-800">
              Как выстроить взаимодействие
            </p>
            <ul className="mt-1 flex flex-col gap-1">
              {brief.meetingPrep.recommendations.map((r, i) => (
                <li key={i} className="text-sm text-slate-700">
                  → {r}
                </li>
              ))}
            </ul>
          </div>
        )}

        {brief.meetingPrep.suggestedQuestions.length > 0 && (
          <div className="mt-2">
            <p className="text-xs font-medium uppercase tracking-wide text-teal-800">
              Вопросы для встречи
            </p>
            <ul className="mt-1 flex flex-col gap-1">
              {brief.meetingPrep.suggestedQuestions.map((q, i) => (
                <li key={i} className="text-sm text-slate-700">
                  • {q}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <BriefBlock title="1. Компания" warning={regIssue ? "проверить статус" : undefined}>
        <FieldRow label="Название" field={brief.company.name} />
        <FieldRow label="Сфера деятельности" field={brief.company.industry} />
        <FieldRow label="Дата образования" field={brief.company.foundedDate} />
        <FieldRow label="Статус регистрации" field={brief.company.registrationStatus} />
      </BriefBlock>

      <BriefBlock title="2. Налоговый статус" warning={taxIssue ? "стоп-фактор" : undefined}>
        <FieldRow label="Задолженность" field={brief.tax.debtStatus} />
        <FieldRow label="Налоговый режим" field={brief.tax.taxRegime} />
      </BriefBlock>

      <BriefBlock title="3. Лицо, принимающее решения">
        <FieldRow label="ФИО" field={brief.decisionMaker.fullName} />
        <FieldRow label="Должность" field={brief.decisionMaker.position} />
        <FieldRow label="Срок в компании" field={brief.decisionMaker.tenure} />
        <FieldRow label="Зона ответственности" field={brief.decisionMaker.responsibility} />
      </BriefBlock>

      <BriefBlock title="4. Контекст обслуживания">
        <FieldRow label="Банк / подрядчики / партнёры" field={brief.serviceContext.summary} />
      </BriefBlock>

      <BriefBlock title="5. Интересы ЛПР">
        <FieldRow label="Хобби" field={brief.interests.hobbies} />
        <FieldRow label="Публичные выступления" field={brief.interests.publicAppearances} />
        <FieldRow label="Темы для small talk" field={brief.interests.talkingPoints} />
      </BriefBlock>

      <BriefBlock title="6. Связанные компании">
        {brief.relatedCompanies.found ? (
          <ul className="flex flex-col divide-y divide-slate-100">
            {brief.relatedCompanies.companies.map((c, i) => (
              <li key={i} className="flex flex-col gap-0.5 py-2 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className="font-mono text-sm text-slate-900">{c.name}</span>
                  <span className="text-xs text-slate-500">{c.relation}</span>
                </div>
                {c.source && (
                  <a
                    href={c.source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-teal-700 underline decoration-teal-300 underline-offset-2 hover:text-teal-900"
                  >
                    {c.source.label || "источник"}
                  </a>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-2 font-mono text-sm italic text-slate-400">не найдено</p>
        )}
      </BriefBlock>
    </div>
  );
}

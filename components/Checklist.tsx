"use client";

import { useState } from "react";

const ITEMS = [
  "Название и сфера деятельности подтверждены официальным реестром",
  "Известны ФИО и должность ЛПР",
  "Дата образования компании и налоговый статус проверены",
  "Нет неучтённых стоп-факторов (долги, суды)",
  "Есть 1-2 факта для small talk",
  "Карточка перечитана за 5 минут до встречи",
];

export function Checklist({ resetKey }: { resetKey: string }) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  return (
    <section
      key={resetKey}
      className="rounded-lg border border-slate-200 bg-white px-4 py-3 sm:px-5 sm:py-4"
    >
      <h3 className="mb-2 font-sans text-sm font-semibold text-slate-800">
        Готовность к встрече
      </h3>
      <ul className="flex flex-col gap-1.5">
        {ITEMS.map((label, i) => (
          <li key={i}>
            <label className="flex cursor-pointer items-start gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={Boolean(checked[i])}
                onChange={(e) =>
                  setChecked((prev) => ({ ...prev, [i]: e.target.checked }))
                }
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-teal-700 focus:ring-teal-600"
              />
              <span className={checked[i] ? "text-slate-400 line-through" : ""}>
                {label}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </section>
  );
}

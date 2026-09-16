import { Field } from "@/lib/types";

export function FieldRow({ label, field }: { label: string; field: Field }) {
  return (
    <div className="flex flex-col gap-0.5 py-2 sm:flex-row sm:items-baseline sm:gap-3 border-b border-slate-100 last:border-b-0">
      <dt className="w-full shrink-0 text-xs font-medium uppercase tracking-wide text-slate-500 sm:w-44">
        {label}
      </dt>
      <dd className="flex flex-1 flex-wrap items-baseline gap-x-2 gap-y-0.5">
        {field.found ? (
          <span className="font-mono text-sm text-slate-900">{field.value}</span>
        ) : (
          <span className="font-mono text-sm italic text-slate-400">не найдено</span>
        )}
        {field.found && field.source && (
          <a
            href={field.source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-teal-700 underline decoration-teal-300 underline-offset-2 hover:text-teal-900"
          >
            {field.source.label || "источник"}
          </a>
        )}
      </dd>
    </div>
  );
}

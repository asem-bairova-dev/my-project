"use client";

import { useState, FormEvent } from "react";
import { Brief } from "@/lib/types";
import { BriefCard } from "@/components/BriefCard";
import { Checklist } from "@/components/Checklist";

type Meta = { searchLive: boolean; llmLive: boolean };

export default function Home() {
  const [companyName, setCompanyName] = useState("");
  const [bin, setBin] = useState("");
  const [decisionMakerName, setDecisionMakerName] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [brief, setBrief] = useState<Brief | null>(null);
  const [meta, setMeta] = useState<Meta | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setBrief(null);

    try {
      const res = await fetch("/api/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName, bin, decisionMakerName }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Не удалось собрать карточку");
        return;
      }

      setBrief(data.brief);
      setMeta(data.meta);
    } catch {
      setError("Сетевая ошибка. Проверьте подключение и попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <header>
        <h1 className="font-sans text-xl font-semibold text-slate-900">
          Клиентский брифинг
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Карточка по клиенту перед выездом на встречу — 30-60 секунд на прочтение.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:p-5"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="companyName" className="text-xs font-medium text-slate-600">
            Название компании *
          </label>
          <input
            id="companyName"
            required
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="ТОО «Пример»"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="bin" className="text-xs font-medium text-slate-600">
            БИН / ИНН (опционально)
          </label>
          <input
            id="bin"
            value={bin}
            onChange={(e) => setBin(e.target.value)}
            placeholder="123456789012"
            className="rounded-md border border-slate-300 px-3 py-2 font-mono text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="dm" className="text-xs font-medium text-slate-600">
            ФИО ЛПР, если уже известно (опционально)
          </label>
          <input
            id="dm"
            value={decisionMakerName}
            onChange={(e) => setDecisionMakerName(e.target.value)}
            placeholder="Иванов Иван Иванович"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-1 rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Собираем карточку..." : "Собрать карточку"}
        </button>
      </form>

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {meta && (!meta.searchLive || !meta.llmLive) && (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Демо-режим: {!meta.searchLive && "поиск"}
          {!meta.searchLive && !meta.llmLive && " и "}
          {!meta.llmLive && "LLM-суммаризация"} используют тестовые данные, а не
          реальные источники. Добавьте {!meta.searchLive && "TAVILY_API_KEY"}
          {!meta.searchLive && !meta.llmLive && " и "}
          {!meta.llmLive && "ANTHROPIC_API_KEY"} в .env.local для реального сбора данных.
        </p>
      )}

      {brief && (
        <div className="flex flex-col gap-3">
          <BriefCard brief={brief} />
          <Checklist resetKey={brief.generatedAt} />
        </div>
      )}
    </main>
  );
}

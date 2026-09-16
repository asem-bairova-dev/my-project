import Anthropic from "@anthropic-ai/sdk";
import { BlockKey, Brief, BriefInput, Field, SearchResult } from "./types";
import { mockSummarize } from "./mock-llm";
import { buildMeetingPrep } from "./meeting-prep";

export const isLLMLive = () => Boolean(process.env.ANTHROPIC_API_KEY);

const fieldSchema = {
  type: "object" as const,
  properties: {
    value: {
      type: "string",
      description:
        'Итоговое значение поля на русском языке. Если по фрагментам ничего не найдено — ровно "не найдено".',
    },
    found: { type: "boolean" },
    sourceIndex: {
      type: ["integer", "null"],
      description:
        "1-based индекс фрагмента из списка для ЭТОГО блока, который подтверждает значение. null, если found=false.",
    },
  },
  required: ["value", "found", "sourceIndex"],
};

const briefToolSchema = {
  name: "emit_brief",
  description:
    "Записать итоговую карточку клиента строго на основе предоставленных фрагментов источников.",
  input_schema: {
    type: "object" as const,
    properties: {
      company: {
        type: "object",
        properties: {
          name: fieldSchema,
          industry: fieldSchema,
          foundedDate: fieldSchema,
          registrationStatus: fieldSchema,
        },
        required: ["name", "industry", "foundedDate", "registrationStatus"],
      },
      tax: {
        type: "object",
        properties: { debtStatus: fieldSchema, taxRegime: fieldSchema },
        required: ["debtStatus", "taxRegime"],
      },
      decisionMaker: {
        type: "object",
        properties: {
          fullName: fieldSchema,
          position: fieldSchema,
          tenure: fieldSchema,
          responsibility: fieldSchema,
        },
        required: ["fullName", "position", "tenure", "responsibility"],
      },
      serviceContext: {
        type: "object",
        properties: { summary: fieldSchema },
        required: ["summary"],
      },
      interests: {
        type: "object",
        properties: {
          hobbies: fieldSchema,
          publicAppearances: fieldSchema,
          talkingPoints: fieldSchema,
        },
        required: ["hobbies", "publicAppearances", "talkingPoints"],
      },
    },
    required: [
      "company",
      "tax",
      "decisionMaker",
      "serviceContext",
      "interests",
    ],
  },
};

type RawField = { value: string; found: boolean; sourceIndex: number | null };
type RawBrief = {
  company: {
    name: RawField;
    industry: RawField;
    foundedDate: RawField;
    registrationStatus: RawField;
  };
  tax: { debtStatus: RawField; taxRegime: RawField };
  decisionMaker: {
    fullName: RawField;
    position: RawField;
    tenure: RawField;
    responsibility: RawField;
  };
  serviceContext: { summary: RawField };
  interests: {
    hobbies: RawField;
    publicAppearances: RawField;
    talkingPoints: RawField;
  };
};

function resolveField(raw: RawField, sources: SearchResult[]): Field {
  const idx = raw.sourceIndex != null ? raw.sourceIndex - 1 : -1;
  const source = idx >= 0 && idx < sources.length ? sources[idx] : undefined;

  // Anti-hallucination guard: only trust found=true if it actually points at
  // a real fragment we gave the model.
  if (!raw.found || !source) {
    return { value: raw.found ? raw.value : "не найдено", found: Boolean(raw.found && source) };
  }

  return {
    value: raw.value,
    found: true,
    source: { label: source.title, url: source.url },
  };
}

function formatFragments(block: BlockKey, results: SearchResult[]): string {
  if (results.length === 0) return "(фрагменты не найдены)";
  return results
    .map(
      (r, i) =>
        `[${i + 1}] ${r.title}\nURL: ${r.url}\n${r.content}`
    )
    .join("\n\n");
}

export async function summarizeBrief(
  input: BriefInput,
  resultsByBlock: Record<BlockKey, SearchResult[]>
): Promise<Brief> {
  if (!isLLMLive()) {
    return mockSummarize(input, resultsByBlock);
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const prompt = `Ты помогаешь менеджеру подготовиться к встрече с клиентом. На основе фрагментов из открытых источников заполни карточку по пяти блокам.

ПРАВИЛА:
- Используй ТОЛЬКО факты, явно присутствующие во фрагментах ниже. Никогда не додумывай и не генерируй правдоподобные, но не подтверждённые данные.
- Если по полю нет подтверждения во фрагментах — value должно быть ровно "не найдено", found=false, sourceIndex=null.
- Если значение найдено — укажи sourceIndex, указывающий на конкретный фрагмент (в пределах своего блока), который его подтверждает.
- Пиши по-русски, кратко, по-деловому.

Компания: ${input.companyName}
${input.bin ? `БИН/ИНН: ${input.bin}` : ""}
${input.decisionMakerName ? `Известное ФИО ЛПР: ${input.decisionMakerName}` : ""}

=== Блок "Компания" ===
${formatFragments("company", resultsByBlock.company)}

=== Блок "Налоговый статус" ===
${formatFragments("tax", resultsByBlock.tax)}

=== Блок "ЛПР" ===
${formatFragments("decisionMaker", resultsByBlock.decisionMaker)}

=== Блок "Контекст обслуживания" ===
${formatFragments("serviceContext", resultsByBlock.serviceContext)}

=== Блок "Интересы ЛПР" ===
${formatFragments("interests", resultsByBlock.interests)}

Вызови emit_brief с заполненной структурой.`;

  const response = await client.messages.create({
    model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5",
    max_tokens: 2000,
    tools: [briefToolSchema],
    tool_choice: { type: "tool", name: "emit_brief" },
    messages: [{ role: "user", content: prompt }],
  });

  const toolUse = response.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
  );

  if (!toolUse) {
    throw new Error("LLM did not return a structured brief");
  }

  const raw = toolUse.input as RawBrief;

  const company = {
    name: resolveField(raw.company.name, resultsByBlock.company),
    industry: resolveField(raw.company.industry, resultsByBlock.company),
    foundedDate: resolveField(raw.company.foundedDate, resultsByBlock.company),
    registrationStatus: resolveField(
      raw.company.registrationStatus,
      resultsByBlock.company
    ),
  };
  const tax = {
    debtStatus: resolveField(raw.tax.debtStatus, resultsByBlock.tax),
    taxRegime: resolveField(raw.tax.taxRegime, resultsByBlock.tax),
  };
  const decisionMaker = {
    fullName: resolveField(raw.decisionMaker.fullName, resultsByBlock.decisionMaker),
    position: resolveField(raw.decisionMaker.position, resultsByBlock.decisionMaker),
    tenure: resolveField(raw.decisionMaker.tenure, resultsByBlock.decisionMaker),
    responsibility: resolveField(
      raw.decisionMaker.responsibility,
      resultsByBlock.decisionMaker
    ),
  };
  const serviceContext = {
    summary: resolveField(raw.serviceContext.summary, resultsByBlock.serviceContext),
  };
  const interests = {
    hobbies: resolveField(raw.interests.hobbies, resultsByBlock.interests),
    publicAppearances: resolveField(
      raw.interests.publicAppearances,
      resultsByBlock.interests
    ),
    talkingPoints: resolveField(raw.interests.talkingPoints, resultsByBlock.interests),
  };

  return {
    input,
    generatedAt: new Date().toISOString(),
    meetingPrep: buildMeetingPrep({
      companyName: input.companyName,
      company,
      tax,
      decisionMaker,
      serviceContext,
      interests,
    }),
    company,
    tax,
    decisionMaker,
    serviceContext,
    interests,
  };
}

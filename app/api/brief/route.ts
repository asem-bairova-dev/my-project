import { NextRequest, NextResponse } from "next/server";
import { runSearch, isSearchLive } from "@/lib/search";
import { summarizeBrief, isLLMLive } from "@/lib/llm";
import { BriefInput } from "@/lib/types";

export async function POST(request: NextRequest) {
  let body: Partial<BriefInput>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Некорректный JSON в теле запроса" }, { status: 400 });
  }

  const companyName = body.companyName?.trim();
  if (!companyName) {
    return NextResponse.json(
      { error: "Название компании обязательно" },
      { status: 400 }
    );
  }

  const input: BriefInput = {
    companyName,
    bin: body.bin?.trim() || undefined,
    decisionMakerName: body.decisionMakerName?.trim() || undefined,
  };

  try {
    const resultsByBlock = await runSearch(input);
    const brief = await summarizeBrief(input, resultsByBlock);

    return NextResponse.json({
      brief,
      meta: { searchLive: isSearchLive(), llmLive: isLLMLive() },
    });
  } catch (err) {
    console.error("Failed to build brief", err);
    return NextResponse.json(
      { error: "Не удалось собрать карточку. Попробуйте ещё раз." },
      { status: 500 }
    );
  }
}

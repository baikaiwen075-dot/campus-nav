import { NextRequest, NextResponse } from "next/server";
import type { Submission } from "@/lib/types";

const submissions: Submission[] = [];

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Partial<Submission>;

  if (!body.name || !body.url || !body.reason) {
    return NextResponse.json(
      { message: "name、url、reason 为必填字段。" },
      { status: 400 }
    );
  }

  const submission: Submission = {
    name: body.name.trim(),
    url: body.url.trim(),
    reason: body.reason.trim(),
    tags: body.tags ?? []
  };

  submissions.push(submission);

  return NextResponse.json({
    message: "投稿已收到，后续可接入数据库和审核后台。",
    data: submission
  });
}

import { NextResponse } from "next/server";
import { sites } from "@/data/sites";

export async function GET() {
  return NextResponse.json({
    total: sites.length,
    data: sites
  });
}

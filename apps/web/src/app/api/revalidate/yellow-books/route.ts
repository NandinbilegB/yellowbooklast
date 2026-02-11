import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import { COLLECTION_TAG } from "@/app/yellow-books/_lib/filters";

const AUTH_HEADER = "x-revalidate-token";

export const dynamic = "force-dynamic";

type RevalidatePayload = {
  id?: string;
  path?: string;
  tags?: string[];
  collection?: boolean;
};

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ revalidated: false, error: "Invalid token" }, { status: 401 });
  }

  const payload = await parsePayload(request);
  const tagsRevalidated: string[] = [];

  if (payload?.id) {
    const detailTag = `yellow-book:${payload.id}`;
    revalidateTag(detailTag);
    revalidatePath(`/yellow-books/${payload.id}`);
    tagsRevalidated.push(detailTag);
  }

  if (payload?.collection !== false) {
    revalidateTag(COLLECTION_TAG);
    revalidatePath("/yellow-books");
    revalidatePath("/yellow-books/search");
    tagsRevalidated.push(COLLECTION_TAG);
  }

  if (Array.isArray(payload?.tags)) {
    for (const tag of payload.tags) {
      if (typeof tag === "string" && tag.length > 0) {
        revalidateTag(tag);
        tagsRevalidated.push(tag);
      }
    }
  }

  if (payload?.path) {
    revalidatePath(payload.path);
  }

  return NextResponse.json({ revalidated: true, tags: tagsRevalidated, timestamp: Date.now() });
}

export function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

function isAuthorized(request: Request) {
  const headerToken = request.headers.get(AUTH_HEADER);
  const url = new URL(request.url);
  const queryToken = url.searchParams.get("token");
  const provided = headerToken ?? queryToken ?? "";

  if (!process.env.REVALIDATE_TOKEN) {
    return true;
  }

  return provided === process.env.REVALIDATE_TOKEN;
}

async function parsePayload(request: Request): Promise<RevalidatePayload | null> {
  try {
    const json = await request.json();
    if (json && typeof json === "object") {
      return json as RevalidatePayload;
    }
    return null;
  } catch {
    return null;
  }
}

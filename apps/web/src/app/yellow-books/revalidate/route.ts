import { revalidatePath, revalidateTag } from "next/cache";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { id, secret } = body as { id?: string; secret?: string };

  if (process.env.REVALIDATE_SECRET && secret !== process.env.REVALIDATE_SECRET) {
    return new Response("Invalid token", { status: 401 });
  }

  if (!id) {
    return new Response("Missing id", { status: 400 });
  }

  // Нэг байгууллагын дэлгэрэнгүй хуудас
  revalidatePath(`/yellow-books/${id}`);

  // Жагсаалтын хуудас
  revalidatePath("/yellow-books");

  // Tag-тай fetch-үүдийг ч зэрэг invalidate-лэнэ
  revalidateTag("yellow-books-list");
  revalidateTag("yellow-books-detail");

  return Response.json({ revalidated: true, id });
}

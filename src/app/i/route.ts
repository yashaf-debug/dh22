export const runtime = "edge";

export async function GET() {
  // Можно отдать 404 или редирект на плейсхолдер:
  // return Response.redirect("/placeholder.png", 302);
  return new Response("Not found", { status: 404 });
}

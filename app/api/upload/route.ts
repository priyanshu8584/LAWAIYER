export async function POST() {
  return Response.json({
    ok: true,
    route: "upload",
    message:
      "Use /api/uploadthing for UploadThing uploads. This route is only a health stub.",
  });
}

export async function GET() {
  return Response.json(
    {
      status: "ok",
      message: "Speech Activity Builder API is running",
    },
    { status: 200 }
  );
}
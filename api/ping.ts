export default function handler() {
  return new Response(
    JSON.stringify({
      ok: true,
      message: "ping",
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
      },
    }
  );
}

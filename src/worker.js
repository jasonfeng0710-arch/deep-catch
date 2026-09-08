// Cloudflare caps stored assets at 25 MiB; the Godot wasm is 37.68 MiB raw.
// It ships pre-compressed as index.wasm.br (6.58 MiB) and is decompressed by the
// browser, so /index.wasm is served from that asset with an explicit encoding.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== "/index.wasm") {
      return env.ASSETS.fetch(request);
    }

    if (!/\bbr\b/.test(request.headers.get("Accept-Encoding") || "")) {
      return new Response("This build requires Brotli support.", { status: 406 });
    }

    const asset = await env.ASSETS.fetch(new URL("/index.wasm.br", url));
    const headers = new Headers(asset.headers);
    headers.set("Content-Type", "application/wasm");
    headers.set("Content-Encoding", "br");
    headers.delete("Content-Length");
    return new Response(asset.body, { status: asset.status, headers });
  },
};

import { serve } from "https://deno.land/std@0.194.0/http/server.ts";
import { join } from "https://deno.land/std@0.194.0/path/mod.ts";
import { serveFile } from "https://deno.land/std@0.194.0/http/file_server.ts";

const port = 8000;

const handler = async (req: Request) => {
  const url = new URL(req.url);
  
  if (url.pathname === "/") {
    // Serve the HTML file
    return serveFile(req, join(Deno.cwd(), "index.html"));
  } else if (url.pathname === "/style.css") {
    // Serve the CSS file
    return serveFile(req, join(Deno.cwd(), "style.css"));
  } else if (url.pathname === "/script.js") {
    // Serve the JS file
    return serveFile(req, join(Deno.cwd(), "script.js"));
  } else {
    // Return 404 for any other requests
    return new Response("Not Found", { status: 404 });
  }
};

// Start the server
console.log(`Server running on http://localhost:${port}`);
serve(handler, { port });

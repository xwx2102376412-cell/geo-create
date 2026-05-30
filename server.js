const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const port = process.env.PORT || 5500;
const host = process.env.HOST || "0.0.0.0";
const types = {
  ".html": "text/html;charset=utf-8",
  ".css": "text/css;charset=utf-8",
  ".js": "text/javascript;charset=utf-8",
  ".png": "image/png",
};

function loadLocalEnv() {
  [".env.local", ".env"].forEach((fileName) => {
    const filePath = path.join(root, fileName);
    if (!fs.existsSync(filePath)) {
      return;
    }

    fs.readFileSync(filePath, "utf8")
      .split(/\r?\n/)
      .forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) {
          return;
        }

        const separatorIndex = trimmed.indexOf("=");
        if (separatorIndex === -1) {
          return;
        }

        const key = trimmed.slice(0, separatorIndex).trim();
        const value = trimmed.slice(separatorIndex + 1).trim().replace(/^["']|["']$/g, "");
        if (key && !process.env[key]) {
          process.env[key] = value;
        }
      });
  });
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        request.destroy();
        reject(new Error("Request body is too large."));
      }
    });
    request.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}"));
      } catch {
        reject(new Error("Invalid JSON body."));
      }
    });
    request.on("error", reject);
  });
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json;charset=utf-8",
  });
  response.end(JSON.stringify(payload));
}

function buildPrompt(values) {
  return `
You are a senior B2B SEO and GEO content strategist for industrial products.

Generate a long-form English buyer guide article using this exact JSON shape:
{
  "titles": ["primary title", "alternate title 1", "alternate title 2", "alternate title 3"],
  "metaTitle": "SEO meta title",
  "metaDescription": "SEO meta description",
  "url": "/markets/example-url/",
  "links": ["/internal/link-1/", "/internal/link-2/", "/internal/link-3/"],
  "sections": [
    {
      "heading": "1. What Are ...?",
      "blocks": [
        {"type":"paragraph","text":"..."},
        {"type":"table","headers":["..."],"rows":[["..."]]},
        {"type":"subheading","text":"..."},
        {"type":"list","items":["..."]}
      ]
    }
  ],
  "faq": [{"q":"...","a":"..."}],
  "cta": "Send Inquiry for Quote and Samples"
}

Rules:
- Return valid JSON only. No markdown fences.
- Follow this article style: practical industrial buyer guide, similar to "How to Choose EN388 Certified Cut Resistant Gloves for Industrial Use".
- Include opening buyer-focused paragraphs.
- Include numbered sections.
- Include multiple comparison/specification/application tables.
- Include common buyer concerns and recommended solutions.
- Include application-based selection guide.
- Include questions to ask before bulk purchasing.
- Include 6-8 FAQ items.
- Avoid unsupported claims such as best, No.1, 100% safe, guaranteed protection, world leading.
- Be factual and procurement-focused.

Input:
- Keyword: ${values.keyword}
- Article type: ${values.articleType}
- Product category: ${values.category}
- Target market: ${values.market}
- Output language preference: ${values.language}
- DeepSeek model: ${values.model || "default"}
- Company name: ${values.company}
- Extra requirements: ${values.notes || "None"}
`.trim();
}

function extractJson(content) {
  const trimmed = content.trim();
  if (trimmed.startsWith("{")) {
    return JSON.parse(trimmed);
  }

  const match = trimmed.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error("AI response did not contain JSON.");
  }

  return JSON.parse(match[0]);
}

async function generateArticle(values) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const deepseekBaseUrl = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";
  const allowedModels = new Set(["deepseek-chat", "deepseek-reasoner"]);
  const requestedModel = values.model || process.env.DEEPSEEK_MODEL || "deepseek-chat";
  const deepseekModel = allowedModels.has(requestedModel) ? requestedModel : "deepseek-chat";
  if (!apiKey) {
    const error = new Error("Missing DEEPSEEK_API_KEY.");
    error.statusCode = 500;
    throw error;
  }

  const apiResponse = await fetch(`${deepseekBaseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: deepseekModel,
      messages: [
        {
          role: "system",
          content: "You generate structured B2B GEO article drafts as valid JSON only.",
        },
        {
          role: "user",
          content: buildPrompt(values),
        },
      ],
      temperature: 0.7,
      max_tokens: 5000,
      response_format: { type: "json_object" },
    }),
  });

  const responseText = await apiResponse.text();
  if (!apiResponse.ok) {
    const error = new Error(`DeepSeek API error: ${apiResponse.status} ${responseText}`);
    error.statusCode = 502;
    throw error;
  }

  const data = JSON.parse(responseText);
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    const error = new Error("DeepSeek API returned an empty response.");
    error.statusCode = 502;
    throw error;
  }

  return extractJson(content);
}

loadLocalEnv();

http
  .createServer(async (request, response) => {
    if (request.method === "POST" && request.url === "/api/generate") {
      try {
        const values = await readJsonBody(request);
        const draft = await generateArticle(values);
        sendJson(response, 200, { draft });
      } catch (error) {
        sendJson(response, error.statusCode || 500, {
          error: error.message || "Failed to generate article.",
        });
      }
      return;
    }

    let pathname = decodeURIComponent(request.url.split("?")[0]);
    if (pathname === "/") {
      pathname = "/index.html";
    }

    const filePath = path.join(root, pathname);
    if (!filePath.startsWith(root)) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }

    fs.readFile(filePath, (error, data) => {
      if (error) {
        response.writeHead(404);
        response.end("Not found");
        return;
      }

      response.writeHead(200, {
        "Content-Type": types[path.extname(filePath)] || "application/octet-stream",
      });
      response.end(data);
    });
  })
  .listen(port, host, () => {
    console.log(`GEO Content Studio is running on ${host}:${port}`);
  });

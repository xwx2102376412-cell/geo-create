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
  const outputLanguage =
    values.language === "zh" ? "Chinese" : values.language === "en" ? "English" : values.language;
  const articleType = values.articleTypeLabel || values.articleType;
  const productCategory = values.categoryLabel || values.category;
  const extraRequirements = values.notes?.trim() || "None";
  const extraRequirementRule =
    extraRequirements === "None"
      ? "- No extra user requirements were provided."
      : `- Extra user requirements are mandatory and MUST be followed: "${extraRequirements}". If any extra requirement conflicts with factual accuracy, certifications, legal compliance, or safety, keep the content factual and use conservative wording.`;

  return `
You are a senior B2B SEO and GEO content strategist for industrial products.

Generate a long-form ${outputLanguage} buyer guide article using this exact JSON shape:
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
- Every table must use this format exactly: {"type":"table","headers":["A","B"],"rows":[["cell 1","cell 2"],["cell 1","cell 2"]]}.
- Every table row MUST be an array of strings. Separate every row and every cell with commas. Do not use markdown table syntax.
- Escape all double quotes inside text strings or replace them with single quotes.
- You MUST write the article based on all user inputs below: keyword, article type, product category, target market, output language, and company name.
- The primary title, meta title, meta description, URL, section headings, tables, FAQ, and CTA MUST all reflect the keyword: "${values.keyword}".
- The article structure and angle MUST match the selected article type: "${articleType}".
- The product facts, materials, specifications, applications, and buyer advice MUST focus on the selected product category: "${productCategory}".
- The buyer context, compliance concerns, wording, and examples MUST be adapted to the target market: "${values.market}".
- The entire article content MUST be written in ${outputLanguage}. Do not mix languages except for standard technical terms, certifications, or product names.
- The company advantage section and CTA MUST mention the company name "${values.company}" naturally.
${extraRequirementRule}
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
- Article type: ${articleType} (${values.articleType})
- Product category: ${productCategory} (${values.category})
- Target market: ${values.market}
- Output language: ${outputLanguage} (${values.language})
- DeepSeek model: ${values.model || "default"}
- Company name: ${values.company}
- Extra requirements: ${extraRequirements}
`.trim();
}

function buildPublishTargetPrompt(values) {
  return `
You are a B2B GEO distribution strategist.

Suggest suitable publishing destinations for an industrial GEO article.
Return valid JSON only using this exact shape:
{
  "targets": [
    {
      "platform": "Platform or website name",
      "url": "https://example.com/path/",
      "reason": "Why this is suitable for this keyword",
      "method": "CMS login, guest post submission, company blog, industry directory, or marketplace profile"
    }
  ]
}

Rules:
- Return 8-12 targets.
- Prefer practical destinations a B2B industrial company might actually use:
  company blog/CMS, WordPress admin pattern, Shopify blog admin, Webflow CMS, LinkedIn article, Medium, industry directory, trade marketplace profile, distributor portal, or relevant guest-post opportunity type.
- If you are not certain about a real submission URL, recommend the safest public homepage or submission/contact page pattern and explain that it needs manual verification.
- Do not invent credentials or claim guaranteed publication.
- Keep reasons concise.

Input:
- Keyword: ${values.keyword}
- Current target URL, if any: ${values.currentUrl || "None"}
- Platform preference: ${values.platform || "Any"}
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

async function repairJsonContent(content, config) {
  const apiResponse = await fetch(`${config.deepseekBaseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.deepseekModel,
      messages: [
        {
          role: "system",
          content:
            "You repair malformed JSON. Return valid JSON only. Do not add markdown fences or explanations.",
        },
        {
          role: "user",
          content: `Repair this malformed JSON into valid JSON. Preserve the same data shape and content as much as possible:\n\n${content}`,
        },
      ],
      temperature: 0,
      max_tokens: 8000,
      response_format: { type: "json_object" },
    }),
  });

  const responseText = await apiResponse.text();
  if (!apiResponse.ok) {
    const error = new Error(`DeepSeek JSON repair error: ${apiResponse.status} ${responseText}`);
    error.statusCode = 502;
    throw error;
  }

  const data = JSON.parse(responseText);
  const repairedContent = data.choices?.[0]?.message?.content;
  if (!repairedContent) {
    const error = new Error("DeepSeek JSON repair returned an empty response.");
    error.statusCode = 502;
    throw error;
  }

  return extractJson(repairedContent);
}

function parseAiJson(content, config) {
  try {
    return Promise.resolve(extractJson(content));
  } catch {
    return repairJsonContent(content, config);
  }
}

function getDeepSeekConfig(values = {}) {
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

  return { apiKey, deepseekBaseUrl, deepseekModel };
}

async function generateArticle(values) {
  const config = getDeepSeekConfig(values);

  const apiResponse = await fetch(`${config.deepseekBaseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.deepseekModel,
      messages: [
        {
          role: "system",
          content:
            "You generate structured B2B GEO article drafts as valid JSON only. Never output malformed arrays or markdown tables.",
        },
        {
          role: "user",
          content: buildPrompt(values),
        },
      ],
      temperature: 0.55,
      max_tokens: 8000,
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

  return parseAiJson(content, config);
}

async function suggestPublishTargets(values) {
  const { apiKey, deepseekBaseUrl, deepseekModel } = getDeepSeekConfig(values);

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
          content: "You suggest B2B content publishing destinations as valid JSON only.",
        },
        {
          role: "user",
          content: buildPublishTargetPrompt(values),
        },
      ],
      temperature: 0.4,
      max_tokens: 2500,
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

  const parsed = extractJson(content);
  return Array.isArray(parsed.targets) ? parsed.targets : [];
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

    if (request.method === "POST" && request.url === "/api/suggest-publish-targets") {
      try {
        const values = await readJsonBody(request);
        const targets = await suggestPublishTargets(values);
        sendJson(response, 200, { targets });
      } catch (error) {
        sendJson(response, error.statusCode || 500, {
          error: error.message || "Failed to suggest publish targets.",
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

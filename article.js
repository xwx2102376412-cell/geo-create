const titlesOutput = document.querySelector("#titles");
const metaTitleOutput = document.querySelector("#metaTitle");
const metaDescriptionOutput = document.querySelector("#metaDescription");
const urlOutput = document.querySelector("#urlSlug");
const internalLinksOutput = document.querySelector("#internalLinks");
const articleBodyOutput = document.querySelector("#articleBody");
const faqOutput = document.querySelector("#faqOutput");
const ctaOutput = document.querySelector("#ctaOutput");
const draftStatus = document.querySelector("#draftStatus");
const copyAllButton = document.querySelector("#copyAll");
const downloadButton = document.querySelector("#downloadMarkdown");
const downloadWordButton = document.querySelector("#downloadWord");

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderEmptyState() {
  titlesOutput.innerHTML = "<li>暂无文章草稿，请先返回生成页面生成文章。</li>";
  metaTitleOutput.textContent = "暂无内容";
  metaDescriptionOutput.textContent = "暂无内容";
  urlOutput.textContent = "暂无内容";
  internalLinksOutput.innerHTML = "<li>暂无内容</li>";
  articleBodyOutput.innerHTML = `
    <section>
      <h5>暂无文章</h5>
      <p>请先进入文章生成页面，填写关键词和业务信息后点击生成文章草稿。</p>
    </section>
  `;
  faqOutput.innerHTML = "";
  ctaOutput.textContent = "返回生成页面";
  ctaOutput.href = "./generator.html";
  draftStatus.textContent = "暂无草稿";
  document.querySelector(".article-page").classList.add("has-empty-draft");
}

function renderBlock(block) {
  if (block.type === "subheading") {
    return `<h6>${block.text}</h6>`;
  }

  if (block.type === "list") {
    return `
      <ul>
        ${block.items.map((item) => `<li>${item}</li>`).join("")}
      </ul>
    `;
  }

  if (block.type === "table") {
    return `
      <div class="table-wrap">
        <table>
          <thead>
            <tr>${block.headers.map((header) => `<th>${header}</th>`).join("")}</tr>
          </thead>
          <tbody>
            ${block.rows
              .map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`)
              .join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  return `<p>${block.text}</p>`;
}

function renderDraft(draft) {
  document.querySelector(".article-page").classList.remove("has-empty-draft");
  titlesOutput.innerHTML = draft.titles.map((title) => `<li>${title}</li>`).join("");
  metaTitleOutput.textContent = draft.metaTitle;
  metaDescriptionOutput.textContent = draft.metaDescription;
  urlOutput.textContent = draft.url;
  internalLinksOutput.innerHTML = draft.links.map((link) => `<li>${link}</li>`).join("");
  articleBodyOutput.innerHTML = draft.sections
    .map(
      (section) => `
        <section>
          <h5>${section.heading}</h5>
          ${(section.blocks || [{ type: "paragraph", text: section.text }]).map(renderBlock).join("")}
        </section>
      `,
    )
    .join("");
  faqOutput.innerHTML = draft.faq
    .map(
      (item) => `
        <section>
          <h5>${item.q}</h5>
          <p>${item.a}</p>
        </section>
      `,
    )
    .join("");
  ctaOutput.textContent = draft.cta;
  ctaOutput.setAttribute("aria-label", draft.cta);
  draftStatus.textContent = "已读取最新草稿";
}

function getDraft() {
  const rawDraft = localStorage.getItem("geoArticleDraft");
  if (!rawDraft) {
    return null;
  }

  try {
    return JSON.parse(rawDraft);
  } catch {
    return null;
  }
}

function getMarkdown() {
  return localStorage.getItem("geoArticleMarkdown") || "";
}

function blockToWordHtml(block) {
  if (block.type === "subheading") {
    return `<h3>${escapeHtml(block.text)}</h3>`;
  }

  if (block.type === "list") {
    return `<ul>${block.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
  }

  if (block.type === "table") {
    return `
      <table>
        <thead>
          <tr>${block.headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${block.rows
            .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`)
            .join("")}
        </tbody>
      </table>
    `;
  }

  return `<p>${escapeHtml(block.text || "")}</p>`;
}

function draftToWordHtml(draft) {
  const title = draft.titles?.[0] || "GEO Article Draft";
  const sections = draft.sections
    .map(
      (section) => `
        <h2>${escapeHtml(section.heading)}</h2>
        ${(section.blocks || [{ type: "paragraph", text: section.text }]).map(blockToWordHtml).join("")}
      `,
    )
    .join("");
  const faq = draft.faq
    .map((item) => `<h3>${escapeHtml(item.q)}</h3><p>${escapeHtml(item.a)}</p>`)
    .join("");
  const links = draft.links.map((link) => `<li>${escapeHtml(link)}</li>`).join("");

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(title)}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.55; color: #17212b; }
          h1 { font-size: 28px; }
          h2 { font-size: 20px; margin-top: 28px; }
          h3 { font-size: 16px; margin-top: 18px; }
          table { width: 100%; border-collapse: collapse; margin: 12px 0; }
          th, td { border: 1px solid #d9e2e5; padding: 8px; text-align: left; vertical-align: top; }
          th { background: #eef5f3; }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(title)}</h1>
        <p><strong>Meta Title:</strong> ${escapeHtml(draft.metaTitle)}</p>
        <p><strong>Meta Description:</strong> ${escapeHtml(draft.metaDescription)}</p>
        <p><strong>URL:</strong> ${escapeHtml(draft.url)}</p>
        <h2>Internal Links</h2>
        <ul>${links}</ul>
        ${sections}
        <h2>FAQ</h2>
        ${faq}
        <h2>Inquiry Button</h2>
        <p>${escapeHtml(draft.cta)}</p>
      </body>
    </html>
  `;
}

const currentDraft = getDraft();
if (currentDraft) {
  renderDraft(currentDraft);
} else {
  renderEmptyState();
}

copyAllButton.addEventListener("click", async () => {
  const markdown = getMarkdown();
  if (!markdown) {
    draftStatus.textContent = "暂无可复制内容";
    return;
  }

  await navigator.clipboard.writeText(markdown);
  draftStatus.textContent = "已复制";
});

downloadButton.addEventListener("click", () => {
  const markdown = getMarkdown();
  if (!markdown) {
    draftStatus.textContent = "暂无可导出内容";
    return;
  }

  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "geo-article-draft.md";
  link.click();
  URL.revokeObjectURL(link.href);
});

downloadWordButton.addEventListener("click", () => {
  const draft = getDraft();
  if (!draft) {
    draftStatus.textContent = "暂无可导出内容";
    return;
  }

  const blob = new Blob([draftToWordHtml(draft)], { type: "application/msword;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "geo-article-draft.doc";
  link.click();
  URL.revokeObjectURL(link.href);
  draftStatus.textContent = "已导出 Word";
});

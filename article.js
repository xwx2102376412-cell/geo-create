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

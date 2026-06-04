const publishStorageKey = "geoPublishRecords";
const publishForm = document.querySelector("#publishForm");
const publishUrl = document.querySelector("#publishUrl");
const publishPlatform = document.querySelector("#publishPlatform");
const publishStatus = document.querySelector("#publishStatus");
const publishNotes = document.querySelector("#publishNotes");
const publishMessage = document.querySelector("#publishMessage");
const savePublishRecord = document.querySelector("#savePublishRecord");
const publishRows = document.querySelector("#publishRows");
const publishKeyword = document.querySelector("#publishKeyword");
const suggestPublishTargets = document.querySelector("#suggestPublishTargets");
const suggestStatus = document.querySelector("#suggestStatus");
const suggestionRows = document.querySelector("#suggestionRows");

function getPublishRecords() {
  try {
    return JSON.parse(localStorage.getItem(publishStorageKey) || "[]");
  } catch {
    return [];
  }
}

function savePublishRecords(records) {
  localStorage.setItem(publishStorageKey, JSON.stringify(records));
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function normalizeUrl(value) {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error("请先输入发布目标网址");
  }

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const url = new URL(withProtocol);
  return url.toString();
}

function readPublishRecord() {
  return {
    id: String(Date.now()),
    time: new Date().toLocaleString("zh-CN"),
    platform: publishPlatform.value,
    url: normalizeUrl(publishUrl.value),
    status: publishStatus.value,
    notes: publishNotes.value.trim(),
  };
}

function addPublishRecord(statusOverride) {
  const record = readPublishRecord();
  if (statusOverride) {
    record.status = statusOverride;
  }

  savePublishRecords([record, ...getPublishRecords()]);
  renderPublishRecords();
  return record;
}

function renderPublishRecords() {
  const records = getPublishRecords();
  if (!records.length) {
    publishRows.innerHTML = `
      <tr>
        <td colspan="6">暂无发布记录。输入发布网址后，可以打开后台并保存记录。</td>
      </tr>
    `;
    return;
  }

  publishRows.innerHTML = records
    .map(
      (record) => `
        <tr>
          <td>${escapeHtml(record.time)}</td>
          <td>${escapeHtml(record.platform)}</td>
          <td><a href="${escapeHtml(record.url)}" target="_blank" rel="noreferrer">${escapeHtml(record.url)}</a></td>
          <td>${escapeHtml(record.status)}</td>
          <td>${escapeHtml(record.notes)}</td>
          <td><button class="table-action" type="button" data-id="${record.id}">删除</button></td>
        </tr>
      `,
    )
    .join("");
}

function renderSuggestions(targets) {
  if (!targets.length) {
    suggestionRows.innerHTML = `
      <tr>
        <td colspan="7">没有返回推荐网址，请换一个更具体的关键词再试。</td>
      </tr>
    `;
    return;
  }

  suggestionRows.innerHTML = targets
    .map(
      (target) => `
        <tr>
          <td>${escapeHtml(target.platform || "未命名平台")}</td>
          <td><a href="${escapeHtml(target.url)}" target="_blank" rel="noreferrer">${escapeHtml(target.url)}</a></td>
          <td>${escapeHtml(target.reason || "适合发布相关 GEO 内容")}</td>
          <td>${escapeHtml(target.method || "手动发布")}</td>
          <td>${escapeHtml(target.googleIndexCondition || target.indexing || "公开发布后提交到 Google Search Console 或等待抓取")}</td>
          <td>${escapeHtml(target.aiCitationFit || target.aiSearchValue || "公开、结构化、可被搜索引擎发现后更利于 AI 搜索引用")}</td>
          <td>
            <button class="table-action" type="button" data-use-url="${escapeHtml(target.url)}" data-platform="${escapeHtml(target.platform || "其他 CMS")}">
              使用
            </button>
          </td>
        </tr>
      `,
    )
    .join("");
}

async function requestPublishTargets() {
  const keyword = publishKeyword.value.trim();
  if (!keyword) {
    throw new Error("请先输入关键词");
  }

  const response = await fetch("/api/suggest-publish-targets", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      keyword,
      currentUrl: publishUrl.value.trim(),
      platform: publishPlatform.value,
    }),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || "AI 搜索发布网址失败");
  }

  return payload.targets || [];
}

publishForm.addEventListener("submit", (event) => {
  event.preventDefault();

  try {
    const record = addPublishRecord("已打开后台");
    publishMessage.textContent = "已打开发布网址";
    window.open(record.url, "_blank", "noopener,noreferrer");
  } catch (error) {
    publishMessage.textContent = error.message;
  }
});

suggestPublishTargets.addEventListener("click", () => {
  suggestPublishTargets.disabled = true;
  suggestPublishTargets.textContent = "搜索中...";
  suggestStatus.textContent = "AI 正在推荐";

  requestPublishTargets()
    .then((targets) => {
      renderSuggestions(targets);
      suggestStatus.textContent = `已推荐 ${targets.length} 个网址`;
    })
    .catch((error) => {
      suggestStatus.textContent =
        error.message === "Missing DEEPSEEK_API_KEY."
          ? "请先配置 DeepSeek API Key"
          : error.message;
    })
    .finally(() => {
      suggestPublishTargets.disabled = false;
      suggestPublishTargets.textContent = "AI 搜索发布网址";
    });
});

suggestionRows.addEventListener("click", (event) => {
  const button = event.target.closest("[data-use-url]");
  if (!button) {
    return;
  }

  publishUrl.value = button.dataset.useUrl;
  const platformOption = [...publishPlatform.options].find((option) =>
    button.dataset.platform.toLowerCase().includes(option.value.toLowerCase()),
  );
  if (platformOption) {
    publishPlatform.value = platformOption.value;
  } else {
    publishPlatform.value = "其他 CMS";
  }
  publishMessage.textContent = "已填入推荐发布网址";
});

savePublishRecord.addEventListener("click", () => {
  try {
    addPublishRecord();
    publishMessage.textContent = "已保存发布记录";
  } catch (error) {
    publishMessage.textContent = error.message;
  }
});

publishRows.addEventListener("click", (event) => {
  if (!event.target.matches("[data-id]")) {
    return;
  }

  const id = event.target.dataset.id;
  savePublishRecords(getPublishRecords().filter((record) => record.id !== id));
  publishMessage.textContent = "已删除记录";
  renderPublishRecords();
});

renderPublishRecords();

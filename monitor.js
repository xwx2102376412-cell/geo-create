const storageKey = "geoAiSearchMonitorRecords";
const form = document.querySelector("#monitorForm");
const monitorRows = document.querySelector("#monitorRows");
const monitorStatus = document.querySelector("#monitorStatus");
const exportButton = document.querySelector("#exportCsv");
const clearButton = document.querySelector("#clearRecords");
const totalCount = document.querySelector("#totalCount");
const brandCount = document.querySelector("#brandCount");
const linkCount = document.querySelector("#linkCount");
const visibilityRate = document.querySelector("#visibilityRate");

function getRecords() {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || "[]");
  } catch {
    return [];
  }
}

function saveRecords(records) {
  localStorage.setItem(storageKey, JSON.stringify(records));
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function updateStats(records) {
  const brandHits = records.filter((record) => record.brandVisible === "yes").length;
  const linkHits = records.filter((record) => record.linkVisible === "yes").length;
  const visibleHits = records.filter(
    (record) => record.brandVisible === "yes" || record.linkVisible === "yes",
  ).length;

  totalCount.textContent = String(records.length);
  brandCount.textContent = String(brandHits);
  linkCount.textContent = String(linkHits);
  visibilityRate.textContent = records.length
    ? `${Math.round((visibleHits / records.length) * 100)}%`
    : "0%";
}

function renderRecords() {
  const records = getRecords();
  updateStats(records);

  if (!records.length) {
    monitorRows.innerHTML = `
      <tr>
        <td colspan="9">暂无记录。发布文章后，去 AI 搜索平台测试问题，再把结果记录在这里。</td>
      </tr>
    `;
    return;
  }

  monitorRows.innerHTML = records
    .map(
      (record) => `
        <tr>
          <td>${escapeHtml(record.testDate)}</td>
          <td>${escapeHtml(record.aiPlatform)}</td>
          <td><a href="${escapeHtml(record.articleUrl)}" target="_blank" rel="noreferrer">${escapeHtml(record.articleUrl)}</a></td>
          <td>${escapeHtml(record.searchQuery)}</td>
          <td>${record.brandVisible === "yes" ? "是" : "否"}</td>
          <td>${record.linkVisible === "yes" ? "是" : "否"}</td>
          <td>${escapeHtml(record.position)}</td>
          <td>${escapeHtml(record.notes)}</td>
          <td><button class="table-action" type="button" data-id="${record.id}">删除</button></td>
        </tr>
      `,
    )
    .join("");
}

function readForm() {
  return {
    id: String(Date.now()),
    testDate: document.querySelector("#testDate").value,
    aiPlatform: document.querySelector("#aiPlatform").value,
    articleUrl: document.querySelector("#articleUrl").value.trim(),
    searchQuery: document.querySelector("#searchQuery").value.trim(),
    brandVisible: document.querySelector("#brandVisible").value,
    linkVisible: document.querySelector("#linkVisible").value,
    position: document.querySelector("#position").value.trim() || "未记录",
    notes: document.querySelector("#notes").value.trim(),
  };
}

function toCsv(records) {
  const headers = ["日期", "平台", "文章 URL", "测试问题", "品牌出现", "链接引用", "位置", "备注"];
  const rows = records.map((record) => [
    record.testDate,
    record.aiPlatform,
    record.articleUrl,
    record.searchQuery,
    record.brandVisible === "yes" ? "是" : "否",
    record.linkVisible === "yes" ? "是" : "否",
    record.position,
    record.notes,
  ]);

  return [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
}

document.querySelector("#testDate").valueAsDate = new Date();

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const record = readForm();

  if (!record.articleUrl || !record.searchQuery) {
    monitorStatus.textContent = "请填写文章 URL 和测试问题";
    return;
  }

  const records = [record, ...getRecords()];
  saveRecords(records);
  form.reset();
  document.querySelector("#testDate").valueAsDate = new Date();
  monitorStatus.textContent = "已添加记录";
  renderRecords();
});

monitorRows.addEventListener("click", (event) => {
  if (!event.target.matches("[data-id]")) {
    return;
  }

  const id = event.target.dataset.id;
  saveRecords(getRecords().filter((record) => record.id !== id));
  monitorStatus.textContent = "已删除记录";
  renderRecords();
});

exportButton.addEventListener("click", () => {
  const records = getRecords();
  if (!records.length) {
    monitorStatus.textContent = "暂无可导出记录";
    return;
  }

  const blob = new Blob([`\ufeff${toCsv(records)}`], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "ai-search-monitor-records.csv";
  link.click();
  URL.revokeObjectURL(link.href);
  monitorStatus.textContent = "已导出 CSV";
});

clearButton.addEventListener("click", () => {
  if (!window.confirm("确定清空全部 AI 搜索监测记录吗？")) {
    return;
  }

  saveRecords([]);
  monitorStatus.textContent = "已清空";
  renderRecords();
});

renderRecords();

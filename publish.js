const publishStorageKey = "geoPublishRecords";
const publishForm = document.querySelector("#publishForm");
const publishUrl = document.querySelector("#publishUrl");
const publishPlatform = document.querySelector("#publishPlatform");
const publishStatus = document.querySelector("#publishStatus");
const publishNotes = document.querySelector("#publishNotes");
const publishMessage = document.querySelector("#publishMessage");
const savePublishRecord = document.querySelector("#savePublishRecord");
const publishRows = document.querySelector("#publishRows");

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

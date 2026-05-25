const productLibrary = {
  fiber: {
    label: "UHMWPE Fiber",
    zh: "超高分子量聚乙烯纤维",
    material: "UHMWPE",
    benefits: ["high strength-to-weight ratio", "abrasion resistance", "chemical resistance", "low moisture absorption"],
    certifications: ["ISO management system", "customer-specific test reports"],
    industries: ["cut resistant gloves", "ropes", "ballistic composites", "protective textiles"],
    buyers: ["industrial buyers", "fabric mills", "rope manufacturers", "protective product brands"],
    links: ["/materials/uhmwpe-fiber/", "/products/uhmwpe-fiber/", "/blog/what-is-uhmwpe-fiber/"],
  },
  gloves: {
    label: "Cut Resistant Gloves",
    zh: "防割手套",
    material: "UHMWPE, glass fiber, steel fiber, nylon, polyester, coating options",
    benefits: ["cut protection", "abrasion resistance", "comfortable fit", "coating choices"],
    certifications: ["EN388", "ANSI/ISEA cut levels", "CE where applicable"],
    industries: ["metal handling", "glass handling", "construction", "logistics", "food processing"],
    buyers: ["PPE distributors", "industrial safety buyers", "OEM brands", "factories"],
    links: ["/products/cut-resistant-gloves/", "/applications/metal-handling-gloves/", "/blog/en388-vs-ansi-cut-resistance/"],
  },
  fabric: {
    label: "Cut Resistant Fabric",
    zh: "防割面料",
    material: "UHMWPE, aramid, nylon, polyester blends",
    benefits: ["cut resistance", "flexible textile structure", "wearable protection", "custom fabric construction"],
    certifications: ["EN388 related testing", "custom lab reports", "buyer-required standards"],
    industries: ["protective clothing", "workwear", "sleeves", "industrial uniforms"],
    buyers: ["workwear brands", "garment factories", "PPE distributors", "industrial buyers"],
    links: ["/products/cut-resistant-fabric/", "/applications/cut-resistant-workwear/", "/materials/uhmwpe-cut-resistant-fabric/"],
  },
  ballistic: {
    label: "Ballistic UD Fabric",
    zh: "防弹 UD 布",
    material: "UHMWPE UD or aramid composite material",
    benefits: ["lightweight ballistic protection", "layered composite design", "custom roll or sheet supply"],
    certifications: ["NIJ test requirements when provided by project", "customer-specific ballistic testing"],
    industries: ["body armor", "bulletproof vest", "ballistic plate", "military and police protection"],
    buyers: ["armor manufacturers", "defense contractors", "security product brands"],
    links: ["/products/ballistic-ud-fabric/", "/applications/ballistic-fabric-for-body-armor/", "/materials/uhmwpe-ballistic-fabric/"],
  },
  rope: {
    label: "UHMWPE Rope",
    zh: "UHMWPE 绳索",
    material: "UHMWPE fiber",
    benefits: ["high strength", "light weight", "low stretch", "corrosion resistance"],
    certifications: ["project-based inspection reports", "marine and industrial test requirements"],
    industries: ["marine mooring", "towing", "rescue", "winch rope", "off-road"],
    buyers: ["marine suppliers", "rescue equipment buyers", "off-road brands", "industrial distributors"],
    links: ["/products/uhmwpe-rope/", "/applications/uhmwpe-rope-for-marine-mooring/", "/blog/uhmwpe-rope-vs-steel-wire-rope/"],
  },
  cooling: {
    label: "Cooling Fabric / Mat",
    zh: "凉感面料 / 凉垫",
    material: "cooling fiber blends, PE, nylon, polyester and functional yarns",
    benefits: ["cool touch", "breathability", "washable options", "custom textile design"],
    certifications: ["buyer-required textile reports", "material safety documentation where applicable"],
    industries: ["outdoor", "home textile", "pet products", "sports accessories"],
    buyers: ["home textile brands", "outdoor brands", "retail product buyers"],
    links: ["/products/cooling-fabric/", "/applications/cooling-mat-material/", "/blog/how-cooling-fabric-works/"],
  },
  flame: {
    label: "Flame Resistant Material",
    zh: "阻燃材料",
    material: "aramid, flame resistant yarns, functional textile blends",
    benefits: ["flame resistance", "thermal protection", "durable textile performance"],
    certifications: ["project-specific flame resistant standards", "buyer-required lab reports"],
    industries: ["fire protection", "industrial safety", "protective workwear"],
    buyers: ["PPE brands", "workwear manufacturers", "industrial safety buyers"],
    links: ["/products/flame-resistant-material/", "/applications/fire-resistant-workwear/", "/materials/aramid-fiber/"],
  },
};

const templates = {
  product: {
    title: (keyword) => `What Is ${titleCase(keyword)}? Applications, Benefits, and Buying Guide`,
    sections: [
      "What Is {keyword}?",
      "Key Material Features",
      "Main Applications",
      "Common Specifications",
      "Certifications and Standards",
      "How to Choose the Right Product",
      "Why Choose {company}",
    ],
    path: "/products/",
  },
  application: {
    title: (keyword) => `How ${titleCase(keyword)} Is Used in Industrial Applications`,
    sections: [
      "Industry Pain Points",
      "Why This Product Is Needed",
      "Key Performance Requirements",
      "Recommended Materials or Product Types",
      "Application Scenarios",
      "Buying Tips",
    ],
    path: "/applications/",
  },
  buyer: {
    title: (keyword) => `How to Choose ${titleCase(keyword)}: A Practical Guide for Industrial Buyers`,
    sections: [
      "Quick Answer",
      "Why Buyers Care About This Question",
      "Key Factors to Compare",
      "Common Mistakes",
      "Recommended Applications",
    ],
    path: "/blog/",
  },
  geo: {
    title: (keyword, market) => `${titleCase(keyword)} for ${market}`,
    sections: [
      "Product Supply for {market}",
      "Common Buyer Requirements in This Market",
      "Product Specifications",
      "Certifications and Standards",
      "Application Industries",
      "Export, Customization, and OEM Capability",
      "Why Work With {company}",
    ],
    path: "/markets/",
  },
};

const forbiddenClaims = ["best", "No.1", "100% safe", "guaranteed protection", "world leading"];

const categorySelect = document.querySelector("#category");
const form = document.querySelector("#generatorForm");
const titlesOutput = document.querySelector("#titles");
const metaTitleOutput = document.querySelector("#metaTitle");
const metaDescriptionOutput = document.querySelector("#metaDescription");
const urlOutput = document.querySelector("#urlSlug");
const internalLinksOutput = document.querySelector("#internalLinks");
const articleBodyOutput = document.querySelector("#articleBody");
const faqOutput = document.querySelector("#faqOutput");
const ctaOutput = document.querySelector("#ctaOutput");
const draftStatus = document.querySelector("#draftStatus");
const libraryGrid = document.querySelector("#libraryGrid");
const copyAllButton = document.querySelector("#copyAll");
const downloadButton = document.querySelector("#downloadMarkdown");

let latestMarkdown = "";
let generationCount = 0;

function titleCase(value) {
  return value
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function sentenceList(items) {
  return items.join(", ");
}

function populateCategories() {
  categorySelect.innerHTML = Object.entries(productLibrary)
    .map(([key, product]) => `<option value="${key}">${product.label}</option>`)
    .join("");
  categorySelect.value = "gloves";
}

function renderLibrary() {
  libraryGrid.innerHTML = Object.values(productLibrary)
    .map(
      (product) => `
        <article class="library-card">
          <h3>${product.label}</h3>
          <p><strong>中文名：</strong>${product.zh}</p>
          <p><strong>核心材料：</strong>${product.material}</p>
          <p><strong>应用行业：</strong>${sentenceList(product.industries)}</p>
          <div class="tag-list">
            ${product.benefits.map((item) => `<span>${item}</span>`).join("")}
          </div>
        </article>
      `,
    )
    .join("");
}

function makeParagraph(section, context) {
  const { keyword, market, product, company, notes } = context;
  const normalizedSection = section
    .replace("{keyword}", titleCase(keyword))
    .replace("{market}", market)
    .replace("{company}", company);

  if (normalizedSection.includes("Quick Answer")) {
    return `${titleCase(keyword)} should be selected according to material structure, certification requirements, end-use risk, comfort or handling needs, and supplier support. Buyers should verify real specifications before placing bulk orders.`;
  }

  if (normalizedSection.includes("Certifications")) {
    return `Typical reference standards may include ${sentenceList(product.certifications)}. Do not assume a product meets a standard unless the supplier provides valid test reports for the exact model, material, or batch.`;
  }

  if (normalizedSection.includes("Specifications")) {
    return `Common specification discussions include material composition, size or roll format, coating or structure, color, packing, MOQ, sample availability, and required test documents. Exact specifications should be confirmed by quotation and technical sheet.`;
  }

  if (normalizedSection.includes("Why")) {
    return `${company} can support industrial buyers with product selection, OEM or customization discussion, sample preparation, quotation support, and documentation based on project requirements. The content should remain factual and avoid claims such as ${sentenceList(forbiddenClaims)}.`;
  }

  if (normalizedSection.includes("Export") || normalizedSection.includes("Supply")) {
    return `For ${market} buyers, the page should clearly explain supply scope, customization options, packing, lead-time discussion, export documentation, and communication process. This helps procurement teams compare suppliers before requesting a quote.`;
  }

  if (normalizedSection.includes("Applications") || normalizedSection.includes("Scenarios")) {
    return `${titleCase(keyword)} is commonly evaluated for ${sentenceList(product.industries)}. The article should connect each application with buyer pain points such as durability, safety compliance, weight, comfort, or replacement cost.`;
  }

  if (normalizedSection.includes("Features") || normalizedSection.includes("Performance")) {
    return `Key features to discuss include ${sentenceList(product.benefits)}. Keep the language practical and connect every feature to a procurement or application reason.`;
  }

  const cleanNotes = notes.trim();
  const hasUsefulNotes = cleanNotes && !["无", "none", "no", "n/a"].includes(cleanNotes.toLowerCase());

  if (hasUsefulNotes) {
    return `${titleCase(keyword)} content should be written for ${market} buyers using the selected product information. Additional requirement: ${cleanNotes}`;
  }

  return `${titleCase(keyword)} should be explained with clear buyer context, realistic product information, applicable industries, and a direct path to request samples, a quotation, or custom specifications.`;
}

function makeFaq(context) {
  const { keyword, product, market } = context;
  return [
    {
      q: `What is ${keyword} used for?`,
      a: `${titleCase(keyword)} is commonly used in ${sentenceList(product.industries)}, depending on material design, certification needs, and buyer requirements.`,
    },
    {
      q: `How should buyers choose ${keyword}?`,
      a: `Buyers should compare material, application risk, certification documents, comfort or handling needs, MOQ, sample policy, and supplier customization capability.`,
    },
    {
      q: `Can ${keyword} be customized for ${market}?`,
      a: `Customization may include material, size, coating, color, packing, label, roll format, or OEM requirements. Exact options should be confirmed with the sales team.`,
    },
    {
      q: "What information is needed for a quotation?",
      a: "A clear inquiry should include product type, application, target standard, quantity, size or specification, destination market, and any required documents.",
    },
  ];
}

function generateDraft(values) {
  const product = productLibrary[values.category];
  const template = templates[values.articleType];
  const title = template.title(values.keyword, values.market);
  const titles = [
    title,
    `${titleCase(values.keyword)}: Buyer Guide, Applications, and Supplier Checklist`,
    `${titleCase(values.keyword)} for Industrial Buyers: Specifications, Standards, and Quote Tips`,
    values.articleType === "geo"
      ? `${titleCase(product.label)} Supplier for ${values.market} Buyers`
      : `${titleCase(product.label)} Guide for B2B Procurement Teams`,
  ];

  const context = { ...values, product };
  const sections = template.sections.map((section) => {
    const heading = section
      .replace("{keyword}", titleCase(values.keyword))
      .replace("{market}", values.market)
      .replace("{company}", values.company);
    return { heading, text: makeParagraph(section, context) };
  });
  const faq = makeFaq(context);
  const slugBase =
    values.articleType === "geo"
      ? `${values.market}-${values.keyword}-supplier`
      : values.keyword;
  const url = `${template.path}${slugify(slugBase)}/`;
  const metaTitle = `${titleCase(values.keyword)} | ${values.company}`;
  const metaDescription = `${titleCase(values.keyword)} guide for ${values.market} buyers. Learn applications, materials, standards, specifications, customization options, and how to request a quote.`;
  const cta =
    values.language === "zh"
      ? "需要获取报价、样品或定制规格？请联系销售团队，并提供应用场景、目标标准、数量和目的市场。"
      : "Need a quote, sample, or custom specification? Contact our sales team with your application, target standard, quantity, and destination market.";

  return {
    titles,
    sections,
    faq,
    url,
    metaTitle,
    metaDescription,
    links: product.links,
    cta,
  };
}

function renderDraft(draft) {
  generationCount += 1;
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
          <p>${section.text}</p>
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
  draftStatus.textContent = `已重新生成 ${new Date().toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })}`;
  draftStatus.dataset.count = String(generationCount);
  document.querySelector(".result-panel").classList.remove("is-updated");
  requestAnimationFrame(() => {
    document.querySelector(".result-panel").classList.add("is-updated");
  });
  latestMarkdown = toMarkdown(draft);
}

function toMarkdown(draft) {
  return [
    "# Title Options",
    ...draft.titles.map((title, index) => `${index + 1}. ${title}`),
    "",
    `Meta Title: ${draft.metaTitle}`,
    `Meta Description: ${draft.metaDescription}`,
    `URL: ${draft.url}`,
    "",
    "## Internal Links",
    ...draft.links.map((link) => `- ${link}`),
    "",
    "## Article Body",
    ...draft.sections.flatMap((section) => [`### ${section.heading}`, section.text, ""]),
    "## FAQ",
    ...draft.faq.flatMap((item) => [`### ${item.q}`, item.a, ""]),
    "## CTA",
    draft.cta,
  ].join("\n");
}

function readForm() {
  return {
    keyword: document.querySelector("#keyword").value.trim() || "UHMWPE fiber",
    articleType: document.querySelector("#articleType").value,
    category: document.querySelector("#category").value,
    market: document.querySelector("#market").value,
    language: document.querySelector("#language").value,
    company: document.querySelector("#companyName").value.trim() || "Your Company",
    notes: document.querySelector("#notes").value,
  };
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  renderDraft(generateDraft(readForm()));
});

form.addEventListener("input", () => {
  draftStatus.textContent = "已修改，点击生成";
});

copyAllButton.addEventListener("click", async () => {
  if (!latestMarkdown) {
    renderDraft(generateDraft(readForm()));
  }
  await navigator.clipboard.writeText(latestMarkdown);
  draftStatus.textContent = "已复制";
});

downloadButton.addEventListener("click", () => {
  if (!latestMarkdown) {
    renderDraft(generateDraft(readForm()));
  }
  const blob = new Blob([latestMarkdown], { type: "text/markdown;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${slugify(readForm().keyword)}-geo-draft.md`;
  link.click();
  URL.revokeObjectURL(link.href);
});

populateCategories();
renderLibrary();
renderDraft(generateDraft(readForm()));

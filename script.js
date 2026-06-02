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
    title: (keyword) => `How to Choose ${titleCase(keyword)} for Industrial Use`,
    path: "/products/",
  },
  application: {
    title: (keyword) => `How to Choose ${titleCase(keyword)} for Industrial Applications`,
    path: "/applications/",
  },
  buyer: {
    title: (keyword) => `How to Choose ${titleCase(keyword)}: A Practical Guide for Industrial Buyers`,
    path: "/blog/",
  },
  geo: {
    title: (keyword, market) => `How to Choose ${titleCase(keyword)} for ${market} Buyers`,
    path: "/markets/",
  },
};

const forbiddenClaims = ["best", "No.1", "100% safe", "guaranteed protection", "world leading"];

const categorySelect = document.querySelector("#category");
const form = document.querySelector("#generatorForm");
const draftStatus = document.querySelector("#draftStatus");
const appHeader = document.querySelector(".app-header");

function setupPageEffects() {
  const updateHeader = () => {
    appHeader.classList.toggle("is-scrolled", window.scrollY > 8);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  const revealItems = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 },
  );

  revealItems.forEach((item) => observer.observe(item));
}

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

function getArticleSubject(keyword, product, market) {
  const supplierPattern = /\b(supplier|manufacturer|factory|wholesale|distributor|distributors)\b/i;
  if (supplierPattern.test(keyword)) {
    return product.label;
  }

  const marketPattern = new RegExp(`\\b(in\\s+${market}|for\\s+${market}|${market})\\b`, "gi");
  const cleaned = keyword.replace(marketPattern, "").replace(/\s+/g, " ").trim();
  return cleaned ? titleCase(cleaned) : product.label;
}

function populateCategories() {
  categorySelect.innerHTML = Object.entries(productLibrary)
    .map(([key, product]) => `<option value="${key}">${product.label}</option>`)
    .join("");
  categorySelect.value = "gloves";
}

function makeIntro(context) {
  const { keyword, market, product, subject } = context;
  return [
    `${subject} are designed for industrial buyers who need reliable product performance in applications such as ${sentenceList(product.industries)}.`,
    `For global distributors, safety managers, importers, and procurement teams in ${market}, choosing the right ${subject.toLowerCase()} is not only about price. Buyers also need to verify material, certification, application fit, comfort, durability, customization options, and bulk supply consistency.`,
    `This guide explains how to choose ${subject.toLowerCase()} for different industrial applications and what buyers should confirm before placing a bulk order.`,
  ];
}

function makeMaterialRows(product) {
  return [
    [product.material, sentenceList(product.benefits), product.industries[0] || "industrial use"],
    ["UHMWPE / HPPE fiber", "Lightweight, high strength, flexible, comfortable", "cut resistant gloves and protective textiles"],
    ["Aramid fiber", "Heat resistance and cut resistance", "welding, heat-related work, protective workwear"],
    ["Nylon / polyester blend", "Flexibility and cost control", "light-duty handling and general industrial use"],
  ];
}

function makeSpecificationRows(product) {
  return [
    ["Protection level", sentenceList(product.certifications), "Helps match the product to real application risks"],
    ["Material", product.material, "Determines comfort, durability, weight, and performance"],
    ["Application fit", sentenceList(product.industries), "Avoids choosing a product that does not match the working environment"],
    ["Customization", "size, color, coating, label, packing, or OEM options", "Important for distributors, brands, and importers"],
    ["Bulk supply", "stable quality, documentation, packing, lead time, and repeat order control", "Reduces complaints and supply risk"],
  ];
}

function makeApplicationRows(product) {
  return product.industries.slice(0, 5).map((industry) => [
    titleCase(industry),
    "cut, abrasion, handling, durability, compliance, or replacement cost",
    `${product.label} with confirmed specification, test documents, and suitable customization options`,
  ]);
}

function makeConcernSections(context) {
  const { keyword, product, market } = context;
  return [
    {
      title: "Concern 1: Does the product match the real working risk?",
      solution: `Buyers should compare the selected ${keyword} with the real application, contact pressure, frequency of use, working environment, and required protection level. For ${market} orders, sample testing before bulk purchase is recommended.`,
    },
    {
      title: "Concern 2: Are the certificates matched to the exact product model?",
      solution: `Ask for the full report, product model, testing standard, lab information, testing date, and product marking details. The document should match the actual material, construction, coating, size, or batch being ordered.`,
    },
    {
      title: "Concern 3: Will end users accept the product during long shifts?",
      solution: `Comfort, flexibility, weight, breathability, and handling performance matter. A product with high protection but poor usability may be rejected by workers or end users.`,
    },
    {
      title: "Concern 4: Can the supplier support stable repeat orders?",
      solution: `Confirm MOQ, lead time, packing, inspection process, sample policy, and quality control. Stable bulk supply is especially important for ${sentenceList(product.buyers)}.`,
    },
  ];
}

function makeBulkQuestions() {
  return [
    ["Can you provide test reports or certification documents?", "Verifies performance claims"],
    ["Does the report match the exact product model?", "Avoids mismatched documentation"],
    ["What material and structure are used?", "Determines comfort, durability, and protection"],
    ["What customization options are available?", "Supports OEM, private label, and market-specific needs"],
    ["What is the MOQ and lead time?", "Helps procurement planning"],
    ["Can you provide samples before bulk order?", "Reduces purchasing risk"],
    ["How do you control quality during mass production?", "Supports stable repeat orders"],
  ];
}

function makeArticleSections(context) {
  const { keyword, product, company, notes, subject } = context;
  const cleanNotes = notes.trim();
  const hasUsefulNotes = cleanNotes && !["无", "none", "no", "n/a"].includes(cleanNotes.toLowerCase());
  const noteBlock = hasUsefulNotes
    ? [{ type: "paragraph", text: `Additional buyer requirement for this draft: ${cleanNotes}` }]
    : [];

  return [
    {
      heading: `1. What Are ${subject}?`,
      blocks: [
        ...makeIntro(context).map((text) => ({ type: "paragraph", text })),
        {
          type: "table",
          headers: ["Material", "Main Advantage", "Common Application"],
          rows: makeMaterialRows(product),
        },
      ],
    },
    {
      heading: "2. Key Specifications Buyers Should Check",
      blocks: [
        { type: "paragraph", text: `Before purchasing ${keyword} in bulk, buyers should confirm the following specifications.` },
        {
          type: "table",
          headers: ["Buyer Requirement", "Recommended Specification", "Why It Matters"],
          rows: makeSpecificationRows(product),
        },
      ],
    },
    {
      heading: "3. How to Choose the Right Specification",
      blocks: [
        { type: "paragraph", text: "A higher specification is not always better if it makes the product too expensive, too heavy, too stiff, or unsuitable for the actual working environment." },
        {
          type: "table",
          headers: ["Application", "Main Risk", "Recommended Product Type"],
          rows: makeApplicationRows(product),
        },
      ],
    },
    {
      heading: "4. Common Buyer Concerns and Solutions",
      blocks: makeConcernSections(context).flatMap((item) => [
        { type: "subheading", text: item.title },
        { type: "paragraph", text: `Recommended solution: ${item.solution}` },
      ]),
    },
    {
      heading: `5. ${titleCase(product.label)} vs Other Material Options`,
      blocks: [
        { type: "paragraph", text: `${product.label} should be compared with alternative materials based on protection, comfort, durability, cost, and application requirements.` },
        {
          type: "table",
          headers: ["Material", "Protection / Performance", "Comfort", "Common Use"],
          rows: [
            [product.material, "High when matched to the correct specification", "Depends on construction and coating", sentenceList(product.industries.slice(0, 2))],
            ["UHMWPE / HPPE", "High strength-to-weight ratio", "Excellent", "cut resistant gloves and protective textiles"],
            ["Aramid", "Cut and heat resistance", "Good", "heat and flame-related work"],
            ["Steel or glass fiber blend", "High cut resistance", "Medium", "heavy-duty industrial protection"],
          ],
        },
      ],
    },
    {
      heading: "6. Application-Based Selection Guide",
      blocks: product.industries.slice(0, 5).flatMap((industry) => [
        { type: "subheading", text: titleCase(industry) },
        {
          type: "list",
          items: [
            `Choose ${product.label} with suitable protection and documentation.`,
            `Confirm material, size, packing, customization, and sample availability.`,
            `Check whether the product can support long working hours and repeat orders.`,
          ],
        },
      ]),
    },
    {
      heading: "7. Questions to Ask Before Bulk Purchasing",
      blocks: [
        {
          type: "table",
          headers: ["Question", "Why It Matters"],
          rows: makeBulkQuestions(),
        },
      ],
    },
    {
      heading: "8. Final Recommendation for Industrial Buyers",
      blocks: [
        {
          type: "list",
          items: [
            `Reliable documents such as ${sentenceList(product.certifications)}`,
            `Suitable material and construction: ${product.material}`,
            "Comfortable use in the target working environment",
            "Stable bulk production quality and repeat order control",
            "OEM, private label, sample, and quotation support",
          ],
        },
        {
          type: "paragraph",
          text: `Buyers should avoid choosing ${subject.toLowerCase()} based only on price or a single specification. The right product should match the actual working environment, user comfort needs, compliance requirements, and long-term supply expectations.`,
        },
        {
          type: "paragraph",
          text: `${company} can support buyers with product selection, sample preparation, OEM discussion, quotation support, and project documentation. The content should remain factual and avoid claims such as ${sentenceList(forbiddenClaims)}.`,
        },
        ...noteBlock,
      ],
    },
  ];
}

function makeFaq(context) {
  const { product, market, subject } = context;
  return [
    {
      q: `What are ${subject} used for?`,
      a: `${subject} are commonly used in ${sentenceList(product.industries)}, depending on material design, certification needs, and buyer requirements.`,
    },
    {
      q: `How should buyers choose ${subject.toLowerCase()}?`,
      a: `Buyers should compare material, application risk, certification documents, comfort or handling needs, MOQ, sample policy, and supplier customization capability.`,
    },
    {
      q: `Can ${subject.toLowerCase()} be customized for ${market}?`,
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
  const subject = getArticleSubject(values.keyword, product, values.market);
  const title = `How to Choose ${subject} for Industrial Use`;
  const titles = [
    title,
    `${subject}: Buyer Guide, Applications, and Supplier Checklist`,
    `${subject} for Industrial Buyers: Specifications, Standards, and Quote Tips`,
    values.articleType === "geo"
      ? `${titleCase(product.label)} Supplier for ${values.market} Buyers`
      : `${titleCase(product.label)} Guide for B2B Procurement Teams`,
  ];

  const context = { ...values, product, subject };
  const sections = makeArticleSections(context);
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
      ? "立即询盘，获取报价和样品方案"
      : "Send Inquiry for Quote and Samples";

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

function saveDraft(draft) {
  localStorage.setItem("geoArticleDraft", JSON.stringify(draft));
  localStorage.setItem("geoArticleMarkdown", toMarkdown(draft));
}

async function requestAiDraft(values) {
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || "文章生成失败");
  }

  return payload.draft;
}

function toMarkdown(draft) {
  const blockToMarkdown = (block) => {
    if (block.type === "subheading") {
      return `#### ${block.text}`;
    }

    if (block.type === "list") {
      return block.items.map((item) => `- ${item}`).join("\n");
    }

    if (block.type === "table") {
      return [
        `| ${block.headers.join(" | ")} |`,
        `| ${block.headers.map(() => "---").join(" | ")} |`,
        ...block.rows.map((row) => `| ${row.join(" | ")} |`),
      ].join("\n");
    }

    return block.text;
  };

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
    ...draft.sections.flatMap((section) => [
      `### ${section.heading}`,
      ...(section.blocks || [{ type: "paragraph", text: section.text }]).map(blockToMarkdown),
      "",
    ]),
    "## FAQ",
    ...draft.faq.flatMap((item) => [`### ${item.q}`, item.a, ""]),
    "## 询盘按钮",
    draft.cta,
  ].join("\n");
}

function readForm() {
  const articleTypeSelect = document.querySelector("#articleType");
  const categorySelectElement = document.querySelector("#category");

  return {
    keyword: document.querySelector("#keyword").value.trim() || "UHMWPE fiber",
    articleType: articleTypeSelect.value,
    articleTypeLabel: articleTypeSelect.options[articleTypeSelect.selectedIndex].text,
    category: categorySelectElement.value,
    categoryLabel: categorySelectElement.options[categorySelectElement.selectedIndex].text,
    market: document.querySelector("#market").value,
    language: document.querySelector("#language").value,
    model: document.querySelector("#deepseekModel").value,
    company: document.querySelector("#companyName").value.trim() || "DingQing",
    notes: document.querySelector("#notes").value,
  };
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const submitButton = form.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = "生成中...";

  requestAiDraft(readForm())
    .then((draft) => {
      saveDraft(draft);
      draftStatus.textContent = "AI 已生成，正在打开文章页面";
      window.location.href = "./article.html";
    })
    .catch((error) => {
      draftStatus.textContent =
        error.message === "Missing DEEPSEEK_API_KEY."
          ? "请先在 .env 中配置 DeepSeek API Key"
          : error.message;
    })
    .finally(() => {
      submitButton.disabled = false;
      submitButton.textContent = "生成文章草稿";
    });
});

form.addEventListener("input", () => {
  draftStatus.textContent = "已修改，点击生成";
});

populateCategories();
setupPageEffects();

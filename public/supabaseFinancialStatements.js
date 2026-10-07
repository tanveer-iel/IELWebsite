const supabaseUrl = "https://bfxmfaakufrmzcxhtgfw.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmeG1mYWFrdWZybXpjeGh0Z2Z3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MTQzMTIsImV4cCI6MjA3NTM5MDMxMn0.qtNn0qXNhn8ol8fTSb2Hp9nQkYfFA2Y_Zec4LuISPZQ";

let supabaseClient = null;

// ────────────────────────────────────────────────
// Tab mapping
// ────────────────────────────────────────────────
const tabMapping = {
  "Economy-tab": {
    contentId: "Economy-content",
    tabValue: "Audited Financials 30 June",
  },
  "Strategy-tab": {
    contentId: "Strategy-content",
    tabValue: "Half Yearly 31 Dec",
  },
  "Sector-tab": {
    contentId: "Sector-content",
    tabValue: "Quarter Ended 30 Sept",
  },
  "Market-tab": {
    contentId: "Market-content",
    tabValue: "Quarter Ended 31 March",
  },
  "lcb-tab": {
    contentId: "lcb-content",
    tabValue: "LCB",
  },
};

// Holds the rows that were originally hard-coded in the HTML, captured once
// on load so they can be merged with whatever Supabase returns and re-sorted
// together.
const staticData = {};

// ────────────────────────────────────────────────
// Date parsing helper
// ────────────────────────────────────────────────
// Titles look like "IEL Audited Financial Statements June 30 2020",
// "LCB July 2020", "FS IEL Period Ended Sept 30, 2020", etc. There is no
// dedicated date column for the hard-coded rows (and the Supabase table only
// has short_des/pdf/tab/created_at), so we derive a sortable Date from the
// title text itself. If a row ever provides a real `date` value (e.g. a
// future `statement_date` column in Supabase), that value is preferred over
// this parser — see mapSupabaseItem() below.
const MONTH_LOOKUP = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
};

function parseDateFromTitle(title) {
  if (!title) return null;
  const text = title.toLowerCase();

  const yearMatch = text.match(/(20\d{2})/);
  if (!yearMatch) return null;
  const year = parseInt(yearMatch[1], 10);

  let month = 0;
  for (const key in MONTH_LOOKUP) {
    const re = new RegExp("\\b" + key + "\\b");
    if (re.test(text)) {
      month = MONTH_LOOKUP[key];
      break;
    }
  }

  let day = 1;
  const dayMatches = text.match(/\b(\d{1,2})(?:st|nd|rd|th)?\b/g);
  if (dayMatches) {
    for (const d of dayMatches) {
      const num = parseInt(d, 10);
      if (num >= 1 && num <= 31 && d !== yearMatch[1]) {
        day = num;
        break;
      }
    }
  }

  return new Date(year, month, day);
}

function getItemDate(item) {
  return item.date || parseDateFromTitle(item.title) || new Date(0);
}

function sortNewestFirst(items) {
  return items.slice().sort((a, b) => getItemDate(b) - getItemDate(a));
}

function makeFileName(title, url) {
  let name = (title || "").trim();
  if (!name && url) {
    name = decodeURIComponent(
      url
        .split("?")[0]
        .split("/")
        .pop()
        .replace(/\.pdf$/i, ""),
    );
  }
  name = name.replace(/[\\/:*?"<>|]+/g, "").replace(/\s+/g, "-") || "document";
  return /\.pdf$/i.test(name) ? name : name + ".pdf";
}

function triggerSave(href, fileName) {
  const a = document.createElement("a");
  a.href = href;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function withDownloadParam(url, fileName) {
  try {
    const u = new URL(url, window.location.href);
    if (
      u.hostname.endsWith(".supabase.co") &&
      u.pathname.includes("/storage/v1/object/")
    ) {
      u.searchParams.set("download", fileName);
      return u.toString();
    }
  } catch (e) {}
  return url;
}
function resolveUrl(url) {
  // Encodes spaces and special characters in static paths like
  // "IEL Assets/PDF/Half Yearly 31 Dec/..."
  return new URL(url, window.location.href).href;
}

async function downloadPdf(url, fileName, btn) {
  if (!url || url === "#") return;

  const originalLabel = btn ? btn.textContent : "";
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Downloading...";
  }

  const downloadUrl = withDownloadParam(resolveUrl(url), fileName);

  try {
    const res = await fetch(downloadUrl, { cache: "no-store" });
    if (!res.ok) throw new Error("HTTP " + res.status + " for " + downloadUrl);

    const type = res.headers.get("content-type") || "";
    if (type.includes("text/html")) {
      throw new Error("Server returned HTML instead of a PDF: " + downloadUrl);
    }

    const blob = new Blob([await res.blob()], {
      type: "application/octet-stream",
    });
    const blobUrl = URL.createObjectURL(blob);
    triggerSave(blobUrl, fileName);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  } catch (err) {
    console.error("Download failed:", err);

    const u = new URL(downloadUrl);
    // "null" origin (file://) must NOT count as same-origin
    const sameOrigin =
      u.origin !== "null" && u.origin === window.location.origin;

    if (sameOrigin || u.searchParams.has("download")) {
      triggerSave(downloadUrl, fileName);
    } else {
      window.open(downloadUrl, "_blank", "noopener");
    }
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = originalLabel;
    }
  }
}
// ────────────────────────────────────────────────
// Row rendering
// ────────────────────────────────────────────────
function createStatementRow(title, pdfUrl) {
  const wrapper = document.createElement("div");

  const div = document.createElement("div");
  div.className = "flex justify-between mt-[40px]";

  const p = document.createElement("p");
  p.className =
    "w-[180px] sm:w-auto text-[16px] sm:text-[20px] leading-[24px] font-[600] text-[#000000E5]";
  p.textContent = title || "Untitled Document";

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className =
    "download-btn text-[#EA5B29] font-[700] text-[16px] leading-[24px] cursor-pointer disabled:opacity-60";
  btn.textContent = "Download";
  btn.dataset.file = pdfUrl || "";
  btn.addEventListener("click", () =>
    downloadPdf(pdfUrl, makeFileName(title, pdfUrl), btn),
  );

  div.appendChild(p);
  div.appendChild(btn);

  const hr = document.createElement("hr");
  hr.className = "mt-[16px]";

  wrapper.appendChild(div);
  wrapper.appendChild(hr);

  return wrapper;
}

function renderSortedList(container, items) {
  container.innerHTML = "";
  sortNewestFirst(items).forEach((item) => {
    container.appendChild(createStatementRow(item.title, item.pdfUrl));
  });
}

// ────────────────────────────────────────────────
// LCB accordion (grouped by year, newest year first & expanded)
// ────────────────────────────────────────────────
function renderLCBAccordion(container, items) {
  container.innerHTML = "";

  const groups = {};
  items.forEach((item) => {
    const year = getItemDate(item).getFullYear();
    if (!groups[year]) groups[year] = [];
    groups[year].push(item);
  });

  const years = Object.keys(groups).sort((a, b) => b - a);

  years.forEach((year, index) => {
    const yearItems = sortNewestFirst(groups[year]);
    const isOpen = index === 0; // most recent year starts expanded

    const section = document.createElement("div");
    section.className =
      "mb-4 border border-[#ECECEC] rounded-[12px] overflow-hidden";

    const header = document.createElement("button");
    header.type = "button";
    header.className =
      "w-full flex justify-between items-center px-4 py-4 md:px-6 md:py-5 bg-[#FAFAFA] hover:bg-[#F4F4F4] transition text-left";
    header.innerHTML = `
      <span class="text-[24px] md:text-[32px] font-[700]">FY ${year}</span>
      <svg
        class="lcb-chevron w-5 h-5 md:w-6 md:h-6 shrink-0 transform transition-transform duration-200 ${
          isOpen ? "rotate-180" : ""
        }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
      </svg>
    `;

    const panel = document.createElement("div");
    panel.className = `lcb-panel px-4 md:px-6 pb-2 ${isOpen ? "" : "hidden"}`;

    yearItems.forEach((item) => {
      panel.appendChild(createStatementRow(item.title, item.pdfUrl));
    });

    header.addEventListener("click", () => {
      panel.classList.toggle("hidden");
      header.querySelector(".lcb-chevron").classList.toggle("rotate-180");
    });

    section.appendChild(header);
    section.appendChild(panel);
    container.appendChild(section);
  });
}

function renderTab(contentId, tabValue, items) {
  const container = document.getElementById(contentId);
  if (!container) return;

  if (tabValue === "LCB") {
    renderLCBAccordion(container, items);
  } else {
    renderSortedList(container, items);
  }
}

// ────────────────────────────────────────────────
// Capture the hard-coded rows already in the HTML, then do an initial
// sorted render immediately (no need to wait on the network for this part).
// ────────────────────────────────────────────────
function extractStaticRows(container) {
  const rows = [];
  container.querySelectorAll(".flex.justify-between").forEach((rowDiv) => {
    const p = rowDiv.querySelector("p");
    const a = rowDiv.querySelector("a");
    if (p && a) {
      rows.push({
        title: p.textContent.trim(),
        pdfUrl: a.getAttribute("href") || a.dataset.file,
      });
    }
  });
  return rows;
}

function captureAndRenderStatic() {
  Object.values(tabMapping).forEach(({ contentId, tabValue }) => {
    const container = document.getElementById(contentId);
    if (!container) return;

    const rows = extractStaticRows(container);
    staticData[contentId] = rows;
    renderTab(contentId, tabValue, rows);
  });
}

captureAndRenderStatic();

// ────────────────────────────────────────────────
// Supabase init + fetch (merges with staticData once loaded)
// ────────────────────────────────────────────────
function initSupabase() {
  if (typeof supabase === "undefined") {
    console.warn("Supabase global not ready yet, waiting...");
    setTimeout(initSupabase, 100);
    return;
  }

  try {
    const { createClient } = supabase;
    supabaseClient = createClient(supabaseUrl, supabaseKey);
    console.log("Supabase client initialized!", supabaseClient);
    loadFinancialStatements();
  } catch (error) {
    console.error("Failed to initialize Supabase:", error);
  }
}

initSupabase();

function mapSupabaseItem(item) {
  return {
    title: item.short_des,
    pdfUrl: item.pdf,
    // Prefer a real date column if one exists (e.g. a future
    // "statement_date" field) — falls back to parsing short_des otherwise.
    date: item.statement_date ? new Date(item.statement_date) : null,
  };
}

async function loadFinancialStatements() {
  if (!supabaseClient) {
    console.error(
      "Cannot load financial statements: Supabase client is not initialized.",
    );
    return;
  }

  try {
    console.log("Loading financial statements from Supabase...");

    const { data, error } = await supabaseClient
      .from("finanicial_statements")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) throw error;

    if (!data || data.length === 0) {
      console.log("No additional documents in Supabase");
      return;
    }

    console.log(
      `Successfully loaded ${data.length} financial statements`,
      data,
    );

    const grouped = {};
    data.forEach((item) => {
      const tabKey = item.tab;
      if (!grouped[tabKey]) grouped[tabKey] = [];
      grouped[tabKey].push(mapSupabaseItem(item));
    });

    Object.values(tabMapping).forEach(({ contentId, tabValue }) => {
      const dynamicItems = grouped[tabValue] || [];
      if (dynamicItems.length === 0) return;

      const merged = (staticData[contentId] || []).concat(dynamicItems);
      renderTab(contentId, tabValue, merged);
    });
  } catch (err) {
    console.error("Failed to load Supabase financial statements:", err);
  }
}

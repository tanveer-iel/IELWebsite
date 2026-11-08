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

// ────────────────────────────────────────────────
// Financial year helpers
// ────────────────────────────────────────────────
// The financial year runs 1 July to 30 June and is named by the two calendar
// years it spans: Jul 2026 - Jun 2027 is "FY 2026-27".

// Returns the calendar year in which the financial year of `date` starts.
// JavaScript months are 0-based: 6 = July.
function fiscalYearStart(date) {
  return date.getMonth() >= 6 ? date.getFullYear() : date.getFullYear() - 1;
}

// 2026 -> "FY 2026-27"
function fiscalYearLabel(startYear) {
  const endYY = String((startYear + 1) % 100).padStart(2, "0");
  return `FY ${startYear}-${endYY}`;
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
// Rendering: every tab is grouped by financial year (Jul-Jun), newest first.
// Each year is a collapsible card holding a Description | PDF table.
// ────────────────────────────────────────────────
const PDF_ICON =
  '<svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5zM14 3v5h5"></path></svg>';

function createStatementRow(item) {
  const tr = document.createElement("tr");
  tr.className = "fs-row border-t border-[#ECECEC]";
  tr.dataset.search = (item.title || "").toLowerCase();

  const tdTitle = document.createElement("td");
  tdTitle.className =
    "px-4 md:px-6 py-4 text-[14px] md:text-[16px] font-[600] text-[#000000E5] align-top";
  tdTitle.textContent = item.title || "Untitled Document";

  const tdPdf = document.createElement("td");
  tdPdf.className = "px-4 md:px-6 py-4 align-top text-right sm:text-left";

  const link = document.createElement("a");
  link.className =
    "inline-flex items-center gap-1.5 text-[#EA5B29] font-[700] text-[14px] md:text-[15px] hover:underline";
  link.href = item.pdfUrl ? resolveUrl(item.pdfUrl) : "#";
  link.target = "_blank";
  link.rel = "noopener";
  link.innerHTML = PDF_ICON + "<span>View PDF</span>";

  tdPdf.appendChild(link);
  tr.appendChild(tdTitle);
  tr.appendChild(tdPdf);
  return tr;
}

function groupByFinancialYear(items) {
  const groups = {};
  items.forEach((item) => {
    const d = getItemDate(item);
    if (d.getTime() === 0) {
      console.warn("Statement title has no readable year:", item.title);
    }
    const year = fiscalYearStart(d);
    (groups[year] = groups[year] || []).push(item);
  });
  return groups;
}

function applySearch(container, query) {
  const q = query.trim().toLowerCase();
  let anyVisible = false;

  container.querySelectorAll(".fs-section").forEach((section) => {
    const label = section.dataset.label.toLowerCase();
    const sectionMatches = q && label.includes(q);
    let visibleRows = 0;

    section.querySelectorAll(".fs-row").forEach((row) => {
      const show = !q || sectionMatches || row.dataset.search.includes(q);
      row.classList.toggle("hidden", !show);
      if (show) visibleRows++;
    });

    section.classList.toggle("hidden", visibleRows === 0);
    if (visibleRows > 0) anyVisible = true;

    const panel = section.querySelector(".fs-panel");
    const chevron = section.querySelector(".fs-chevron");
    if (q && visibleRows > 0) {
      panel.classList.remove("hidden");
      chevron.classList.add("rotate-180");
    } else if (!q) {
      const open = section.dataset.defaultOpen === "1";
      panel.classList.toggle("hidden", !open);
      chevron.classList.toggle("rotate-180", open);
    }
    const count = section.querySelector(".fs-count");
    count.textContent = `${visibleRows} document${visibleRows === 1 ? "" : "s"}`;
  });

  const empty = container.querySelector(".fs-empty");
  if (empty) empty.classList.toggle("hidden", anyVisible);
}

function renderTab(contentId, tabValue, items) {
  const container = document.getElementById(contentId);
  if (!container) return;
  container.innerHTML = "";

  // Search box
  const searchWrap = document.createElement("div");
  searchWrap.className =
    "mb-4 p-3 md:p-4 border border-[#ECECEC] rounded-[12px] bg-white";
  const input = document.createElement("input");
  input.type = "search";
  input.placeholder = "Search by title or year (e.g. 2026-27)...";
  input.setAttribute("aria-label", "Search financial statements");
  input.className =
    "w-full sm:w-[340px] px-3 py-2 text-[14px] border border-[#ECECEC] rounded-[8px] bg-[#FAFAFA] outline-none focus:border-[#EA5B29]";
  searchWrap.appendChild(input);
  container.appendChild(searchWrap);

  const groups = groupByFinancialYear(items);
  const years = Object.keys(groups).sort((a, b) => b - a);

  years.forEach((year, index) => {
    const yearItems = sortNewestFirst(groups[year]);
    const isOpen = index === 0; // newest year starts expanded
    const label = fiscalYearLabel(Number(year));

    const section = document.createElement("div");
    section.className =
      "fs-section mb-4 border border-[#ECECEC] rounded-[12px] overflow-hidden bg-white";
    section.dataset.label = label;
    section.dataset.defaultOpen = isOpen ? "1" : "0";

    const header = document.createElement("button");
    header.type = "button";
    header.className =
      "w-full flex justify-between items-center px-4 py-4 md:px-6 bg-[#FAFAFA] hover:bg-[#F4F4F4] transition text-left";
    header.innerHTML = `
      <span class="flex items-baseline gap-3">
        <span class="text-[18px] md:text-[20px] font-[700]">${label}</span>
        <span class="fs-count text-[13px] text-[#00000099]">${yearItems.length} document${yearItems.length === 1 ? "" : "s"}</span>
      </span>
      <svg class="fs-chevron w-5 h-5 shrink-0 transform transition-transform duration-200 ${isOpen ? "rotate-180" : ""}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
      </svg>`;

    const panel = document.createElement("div");
    panel.className = `fs-panel overflow-x-auto ${isOpen ? "" : "hidden"}`;

    const table = document.createElement("table");
    table.className = "w-full text-left";
    table.innerHTML = `
      <thead>
        <tr class="text-[12px] uppercase tracking-wide text-[#00000099]">
          <th class="px-4 md:px-6 py-3 font-[700]">Description</th>
          <th class="px-4 md:px-6 py-3 font-[700] text-right sm:text-left">PDF</th>
        </tr>
      </thead>`;
    const tbody = document.createElement("tbody");
    yearItems.forEach((item) => tbody.appendChild(createStatementRow(item)));
    table.appendChild(tbody);
    panel.appendChild(table);

    header.addEventListener("click", () => {
      panel.classList.toggle("hidden");
      header.querySelector(".fs-chevron").classList.toggle("rotate-180");
    });

    section.appendChild(header);
    section.appendChild(panel);
    container.appendChild(section);
  });

  const empty = document.createElement("p");
  empty.className = `fs-empty text-[14px] text-[#00000099] py-6 text-center ${years.length ? "hidden" : ""}`;
  empty.textContent = "No documents found.";
  container.appendChild(empty);

  input.addEventListener("input", () => applySearch(container, input.value));
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

// "2026-07-01" -> local-time Date. new Date("2026-07-01") would read it as
// midnight UTC, which is 30 June for visitors west of UTC and would move the
// document into the previous financial year.
function parseStatementDate(value) {
  if (!value) return null;
  const [y, m, d] = String(value).slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function mapSupabaseItem(item) {
  return {
    title: item.short_des,
    pdfUrl: item.pdf,
    // Prefer a real date column if one exists (e.g. a future
    // "statement_date" field) — falls back to parsing short_des otherwise.
    date: parseStatementDate(item.statement_date),
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

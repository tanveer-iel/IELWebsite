const supabaseUrl = "https://bfxmfaakufrmzcxhtgfw.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmeG1mYWFrdWZybXpjeGh0Z2Z3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MTQzMTIsImV4cCI6MjA3NTM5MDMxMn0.qtNn0qXNhn8ol8fTSb2Hp9nQkYfFA2Y_Zec4LuISPZQ";

let supabaseClient = null;

function initSupabase() {
  if (typeof supabase === "undefined") {
    console.warn("supabase global not ready yet, waiting...");
    setTimeout(initSupabase, 100);
    return;
  }

  const { createClient } = supabase;
  supabaseClient = createClient(supabaseUrl, supabaseKey);
  console.log("Supabase client initialized!", supabaseClient);
}

initSupabase();

async function loadLatestNews() {


  const { data, error } = await supabaseClient
    .from("news")
    .select("short_des, pdf")
    .order("created_at", { ascending: false })
    .limit(1);

  const descEl = document.getElementById("latest-news-desc");
  const linkEl = document.getElementById("latest-news-pdf");

  if (error || !data || data.length === 0) {
    console.error("Error fetching latest news or no data:", error);
    if (descEl) descEl.textContent = "";
    if (linkEl) linkEl.href = "#"; // or fallback PDF
    return;
  }

  const item = data[0];
  if (descEl) descEl.textContent = item.short_des?.trim() || "";
  if (linkEl) linkEl.href = item.pdf || "#";
}

loadLatestNews();

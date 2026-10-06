const supabaseUrl  = "https://bfxmfaakufrmzcxhtgfw.supabase.co";
const supabaseKey  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmeG1mYWFrdWZybXpjeGh0Z2Z3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MTQzMTIsImV4cCI6MjA3NTM5MDMxMn0.qtNn0qXNhn8ol8fTSb2Hp9nQkYfFA2Y_Zec4LuISPZQ";

let supabaseClient = null;

function initSupabase() {
  if (typeof supabase === "undefined") {
    console.warn("Supabase JS library not loaded yet — retrying...");
    setTimeout(initSupabase, 200);
    return;
  }

  const { createClient } = supabase;
  supabaseClient = createClient(supabaseUrl, supabaseKey);
  console.log("Supabase client initialized");

  // Now that client is ready → load news
  loadNews();
}

async function loadNews() {
  if (!supabaseClient) {
    console.error("Supabase client not initialized yet");
    document.getElementById('dynamic-news').innerHTML = 
      '<p class="text-red-600">Error: Database connection not ready. Please refresh.</p>';
    return;
  }

  const { data, error } = await supabaseClient
    .from('news')
    .select('short_des, pdf')
    .order('created_at', { ascending: false })
    .limit(20);   // ← important: prevent fetching thousands of rows

  const container = document.getElementById('dynamic-news');
  if (!container) {
    console.error("Container #dynamic-news not found in DOM");
    return;
  }

 
  if (error) {
    console.error('Error fetching news:', error);
    container.innerHTML += '<p class="text-red-600">Failed to load news. Please try again later.</p>';
    return;
  }

  if (!data || data.length === 0) {
    container.innerHTML += '<p class="text-gray-600">No additional news available at the moment.</p>';
    return;
  }

  let html = '';
  data.forEach(item => {
    const desc    = item.short_des?.trim() || 'Update on Attock Cement Acquisition';
    const pdfLink = item.pdf || '#';

    html += `
      <div class="flex justify-between mb-4">
        <div class="me-10">
          <p class="w-[180px] sm:w-auto text-[16px] sm:text-[20px] leading-[24px] font-[600] text-[#000000E5]">
            ${desc}
          </p>
        </div>
        <a href="${pdfLink}" target="_blank" class="text-[#EA5B29] font-[700] text-[16px] leading-[24px]">
          Download
        </a>
      </div>
      <hr class="my-[16px]" />
    `;
  });

  container.innerHTML += html;
}

// Start initialization
initSupabase();
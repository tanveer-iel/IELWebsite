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

async function loadBlogs() {
  const container = document.getElementById("blog-container");
  const loading = document.getElementById("loading");

  if (!container) return;

  container.innerHTML = ""; // clear previous content
  loading?.classList.remove("hidden"); // show loading

  try {
    const { data: blogs, error } = await supabaseClient
      .from("blogs")
      .select("title, img, desc, id")
      .order("created_at", { ascending: false }); // newest first – change to 'created_at' if you have that column

    if (error) throw error;

    if (!blogs || blogs.length === 0) {
      container.innerHTML =
        '<p class="col-span-full text-center py-12 text-gray-500">No blogs found.</p>';
      return;
    }

    blogs.forEach((blog) => {
      const card = document.createElement("div");
      card.className = "relative";

      // You can change the link to e.g. `blog-detail.html?id=${blog.id}` later
      card.innerHTML = `
        <a href="NewBlogDetail.html?id=${blog.id}">
          <img
            src="${blog.img || "https://via.placeholder.com/400x280?text=No+Image"}"
            alt="${blog.title || "Blog"}"
            class="w-full h-[280px] object-cover rounded-[16px]"
            onerror="this.src='https://via.placeholder.com/400x280?text=Image+Error'"
          />
          <div
            class="absolute h-[110px] top-[170px] inset-0 rounded-b-[16px]"
            style="background: linear-gradient(180deg, rgba(0,0,0,0) 0%, #000000 75.46%);"
          ></div>
          <div class="absolute bottom-[14px] px-[12px] w-full text-white">
            <p class="font-[600] text-[14px] leading-[100%]">
              ${blog.title || "Untitled"}
            </p>
          
          </div>
        </a>
      `;

      container.appendChild(card);
    });
  } catch (err) {
    console.error("Error loading blogs:", err);
    container.innerHTML =
      '<p class="col-span-full text-center py-12 text-red-600">Failed to load blogs. Please try again later.</p>';
  } finally {
    loading?.classList.add("hidden");
  }
}

loadBlogs();

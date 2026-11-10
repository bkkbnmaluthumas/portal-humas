/**
 * PORTAL BERITA & MEDIA CENTER HUMAS KEMENDUKBANGGA/BKKBN
 * File: script.js
 * Mode: Cloud-Connected (Firebase Firestore Real-time)
 */

// ================= TAILWIND CONFIGURATION =================
tailwind.config = {
  theme: {
    extend: {
      colors: {
        bkkbn: {
          deep: '#0B4A8B',       // Primary official deep blue
          primary: '#005BAC',    // Vibrant primary blue
          dark: '#083363',       // Dark navy tone
          surface: '#F8FAFC',    // Clean background
          gold: '#F4B400',       // Accent badge yellow/gold
          goldHover: '#DF9B00',
          accent: '#E3B341',
          lightBlue: '#EBF4FD',
          borderSlate: '#E2E8F0' // Modern slate border
        }
      },
      fontFamily: {
        heading: ['Montserrat', 'sans-serif'],
        body: ['Poppins', 'sans-serif']
      }
    }
  }
};

// ================= DATABASE CADANGAN (FALLBACK JIKA OFFLINE) =================
const fallbackArticles = [
  {
    id: "fb-101",
    tag: "Berita",
    category: "Berita",
    title: "Akselerasi Penurunan Stunting: BKKBN Perkuat Tim Pendamping Keluarga di Desa Prioritas",
    date: "10 November 2026",
    excerpt: "Ternate – Perwakilan BKKBN Maluku Utara mengintensifkan pendampingan keluarga berisiko stunting bersama jajaran kader lapangan...",
    content: "<p>Ternate – Perwakilan BKKBN Maluku Utara mengintensifkan pendampingan keluarga berisiko stunting bersama jajaran kader lapangan...</p>",
    author: "Humas Malut",
    image: "image1.jpg"
  },
  {
    id: "fb-102",
    tag: "Berita",
    category: "Berita",
    title: "Pelayanan KB Serentak Sejuta Akseptor (PSA) Sukses Catatkan Rekor Partisipasi",
    date: "8 November 2026",
    excerpt: "Pelayanan serentak kontrasepsi metode jangka panjang (MKJP) melampaui target sasaran di seluruh fasilitas kesehatan daerah...",
    content: "<p>Pelayanan serentak kontrasepsi metode jangka panjang (MKJP) melampaui target sasaran di seluruh fasilitas kesehatan daerah...</p>",
    author: "Tim Media",
    image: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "fb-201",
    tag: "Artikel",
    category: "Artikel",
    title: "Senyum Bahagia Penerima MBG 3B Warga Jailolo",
    date: "27 Oktober 2026",
    excerpt: "Jailolo – Sebanyak 351 Penerima Makanan Bergizi Gratis (MBG) 3B yang terdiri dari ibu hamil, ibu menyusui, dan baduta di wilayah pesisir...",
    content: "<p>Jailolo – Sebanyak 351 Penerima Makanan Bergizi Gratis (MBG) 3B yang terdiri dari ibu hamil, ibu menyusui, dan baduta di wilayah pesisir...</p>",
    author: "Admin Maluku Utara",
    image: "image1.jpg"
  },
  {
    id: "fb-202",
    tag: "Artikel",
    category: "Artikel",
    title: "MBG 3B: Investasi Gizi Vital untuk Mencetak Generasi Bebas Stunting",
    date: "19 Oktober 2026",
    excerpt: "Memahami pemenuhan nutrisi makro dan mikro pada 1000 Hari Pertama Kehidupan (HPK) sebagai pondasi kecerdasan dan pertumbuhan anak...",
    content: "<p>Memahami pemenuhan nutrisi makro dan mikro pada 1000 Hari Pertama Kehidupan (HPK) sebagai pondasi kecerdasan dan pertumbuhan anak...</p>",
    author: "Admin Maluku Utara",
    image: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=800&q=80"
  }
];

const fallbackPosters = [
  { image: "ASI1.jpg", title: "Batasi Waktu Layar Anak: Kebiasaan Digital Sehat Sejak Dini" },
  { image: "poster.jpg", title: "Donatur Gerakan Orang Tua Asuh Cegah Stunting (GENTING)" },
  { image: "image1.jpg", title: "Akselerasi Penurunan Stunting di Maluku Utara" }
];

// State Global Dinamis
let cloudArticles = [];
let cloudPosters = [];
let currentPosterIndex = 0;
let activeModalArticle = null;
let currentCategory = "Semua";
let currentArticleTab = "berita";

const categories = [
  "Semua",
  "Berita",
  "Artikel",
  "Pengumuman",
  "Infografis",
  "Galeri"
];

// ================= INISIALISASI HALAMAN =================
document.addEventListener("DOMContentLoaded", () => {
  initClock();
  initPrayerTimes();
  renderCategoryNav();
  initTypewriter();

  // Sinkronisasi Cloud Firestore
  listenCloudArticles();
  listenCloudPosters();
  listenCloudSettings();
  listenCloudTeam();
  listenCloudAgendas();
});

// Listener Event Modal
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeArticleModal();
    closeMediaInquiryModal();
  }
});

document.getElementById("articleModal")?.addEventListener("click", (e) => {
  if (e.target.id === "articleModal") closeArticleModal();
});

document.getElementById("mediaInquiryModal")?.addEventListener("click", (e) => {
  if (e.target.id === "mediaInquiryModal") closeMediaInquiryModal();
});

// ================= FIRESTORE: SINKRONISASI BERITA & ARTIKEL =================
function listenCloudArticles() {
  if (typeof db === "undefined") {
    cloudArticles = fallbackArticles;
    renderTabContent();
    renderTrendingList();
    return;
  }

  db.collection("articles").orderBy("createdAt", "desc").onSnapshot(snapshot => {
    if (!snapshot.empty) {
      cloudArticles = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } else {
      cloudArticles = fallbackArticles;
    }
    renderTabContent();
    renderTrendingList();
  }, err => {
    console.error("Gagal sinkronisasi artikel Firestore:", err);
    cloudArticles = fallbackArticles;
    renderTabContent();
    renderTrendingList();
  });
}

function switchTabContent(type) {
  currentArticleTab = type;
  renderTabContent();
}

function renderTabContent() {
  const btnBerita = document.getElementById("tabBeritaBtn");
  const btnArtikel = document.getElementById("tabArtikelBtn");
  const heading = document.getElementById("currentTabHeading");
  const container = document.getElementById("tabContentList");

  if (!btnBerita || !btnArtikel || !heading || !container) return;

  const isBerita = currentArticleTab === "berita";
  const filtered = cloudArticles.filter(item => {
    const t = (item.tag || item.category || "").toLowerCase();
    return isBerita ? t.includes("berita") : t.includes("artikel");
  });

  const items = filtered.slice(0, 4);

  if (isBerita) {
    btnBerita.className = "flex-1 py-3 px-4 text-center text-sm font-bold bg-[#0088CC] text-white rounded-xl shadow transition duration-200";
    btnArtikel.className = "flex-1 py-3 px-4 text-center text-sm font-bold text-slate-700 hover:text-sky-600 transition duration-200 rounded-xl";
    heading.textContent = "Berita Terbaru";
  } else {
    btnArtikel.className = "flex-1 py-3 px-4 text-center text-sm font-bold bg-[#0088CC] text-white rounded-xl shadow transition duration-200";
    btnBerita.className = "flex-1 py-3 px-4 text-center text-sm font-bold text-slate-700 hover:text-sky-600 transition duration-200 rounded-xl";
    heading.textContent = "Artikel";
  }

  if (items.length === 0) {
    container.innerHTML = `<div class="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">Belum ada konten ${isBerita ? 'berita' : 'artikel'} di cloud.</div>`;
    return;
  }

  container.innerHTML = items.map(item => `
    <article class="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm hover:shadow-md transition flex flex-col sm:flex-row gap-5 group cursor-pointer" onclick="location.href='detail.html?id=${item.id}'">
      <div class="w-full sm:w-48 h-36 flex-shrink-0 rounded-xl overflow-hidden bg-slate-100 border border-slate-100">
        <img 
          src="${item.image || 'image1.jpg'}" 
          alt="${item.title}" 
          class="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          onerror="this.onerror=null; this.src='image1.jpg';"
        />
      </div>
      <div class="flex-1 flex flex-col justify-between py-0.5">
        <div>
          <div class="flex items-center justify-between gap-2 mb-1.5">
            <span class="px-3 py-0.5 rounded-full ${isBerita ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-[#0088CC]'} text-[11px] font-bold">
              ${item.tag || (isBerita ? 'Berita' : 'Artikel')}
            </span>
            <span class="text-[11px] text-slate-400 font-medium">${item.date || '-'}</span>
          </div>
          <h3 class="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#0088CC] transition line-clamp-2 leading-snug">
            ${item.title}
          </h3>
          <p class="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
            ${item.excerpt || ''} <span class="text-[#0088CC] font-semibold">selengkapnya</span>
          </p>
        </div>
        <div class="pt-3 mt-2 border-t border-slate-100 text-[11px] text-slate-400 italic">
          Author: <span class="font-medium text-slate-600 not-italic">${item.author || 'Admin Maluku Utara'}</span>
        </div>
      </div>
    </article>
  `).join('');
}

// ================= RENDER TRENDING (6 KONTEN CLOUD) =================
function renderTrendingList() {
  const container = document.getElementById("trendingListContainer");
  if (!container) return;

  const latestSix = cloudArticles.slice(0, 6);

  container.innerHTML = latestSix.map((item, index) => {
    const numberLabel = String(index + 1).padStart(2, '0');
    return `
      <div onclick="location.href='detail.html?id=${item.id}'" class="p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition cursor-pointer group flex items-start gap-3.5">
        <span class="text-2xl font-extrabold text-sky-200 group-hover:text-bkkbn-primary transition font-heading flex-shrink-0 leading-none mt-0.5">
          ${numberLabel}
        </span>
        <div class="flex-1 min-w-0">
          <span class="text-[10px] font-bold text-bkkbn-primary uppercase tracking-wider block mb-1">
            ${item.tag || item.category || 'INFORMASI'}
          </span>
          <h4 class="text-xs font-bold text-slate-800 group-hover:text-[#0088CC] transition line-clamp-2 leading-snug">
            ${item.title}
          </h4>
          <div class="flex items-center gap-2 text-[10px] text-slate-400 mt-1.5">
            <span>${item.date || '-'}</span>
            <span>•</span>
            <span>${item.author || 'Humas Malut'}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ================= FIRESTORE: SINKRONISASI POSTER SLIDER =================
function listenCloudPosters() {
  if (typeof db === "undefined") {
    cloudPosters = fallbackPosters;
    updatePosterDisplay();
    return;
  }

  db.collection("posters").orderBy("createdAt", "desc").onSnapshot(snapshot => {
    if (!snapshot.empty) {
      cloudPosters = snapshot.docs.map(doc => doc.data());
    } else {
      cloudPosters = fallbackPosters;
    }
    currentPosterIndex = 0;
    updatePosterDisplay();
  }, () => {
    cloudPosters = fallbackPosters;
    updatePosterDisplay();
  });
}

function updatePosterDisplay() {
  const imgElement = document.getElementById("currentPosterImg");
  const captionElement = document.getElementById("posterCaption");
  const counterElement = document.getElementById("posterCounter");

  if (!imgElement || cloudPosters.length === 0) return;

  if (currentPosterIndex >= cloudPosters.length) {
    currentPosterIndex = 0;
  }

  imgElement.classList.add("opacity-60");
  
  setTimeout(() => {
    imgElement.src = cloudPosters[currentPosterIndex].image;
    imgElement.alt = cloudPosters[currentPosterIndex].title;
    
    if (captionElement) captionElement.textContent = cloudPosters[currentPosterIndex].title;
    if (counterElement) counterElement.textContent = `${currentPosterIndex + 1} / ${cloudPosters.length}`;
    
    imgElement.classList.remove("opacity-60");
  }, 120);
}

function prevPoster() {
  if (cloudPosters.length === 0) return;
  currentPosterIndex = (currentPosterIndex - 1 + cloudPosters.length) % cloudPosters.length;
  updatePosterDisplay();
}

function nextPoster() {
  if (cloudPosters.length === 0) return;
  currentPosterIndex = (currentPosterIndex + 1) % cloudPosters.length;
  updatePosterDisplay();
}

// ================= FIRESTORE: SINKRONISASI KONTAK & LAYANAN =================
function listenCloudSettings() {
  if (typeof db === "undefined") return;

  db.collection("settings").doc("contact").onSnapshot(doc => {
    if (!doc.exists) return;
    const cfg = doc.data();

    // 1. WhatsApp LO
    const loBtn = document.querySelector("#contactMediaSection a[href*='wa.me']") || document.getElementById("loWhatsAppBtn");
    const loDesc = document.getElementById("loServiceDesc");
    if (loBtn && cfg.loPhone) {
      const cleanNumber = cfg.loPhone.replace(/[^0-9]/g, '');
      const waNumber = cleanNumber.startsWith('0') ? '62' + cleanNumber.slice(1) : cleanNumber;
      loBtn.href = `https://wa.me/${waNumber}?text=Halo%20LO%20Humas%20BKKBN%20Maluku%20Utara`;
      loBtn.innerHTML = `<i class="fab fa-whatsapp text-sm"></i><span>${cfg.loButtonText || 'Hubungi Media Officer'}</span>`;
    }
    if (loDesc && cfg.loDesc) loDesc.textContent = cfg.loDesc;

    // 2. Formulir Wawancara Pimpinan
    const formBtn = document.getElementById("openInquiryFormBtn") || document.getElementById("mediaFormBtn");
    const formTitle = document.getElementById("inquiryFormTitle");
    const formDesc = document.getElementById("inquiryFormDesc");
    if (formTitle && cfg.formTitle) formTitle.textContent = cfg.formTitle;
    if (formDesc && cfg.formDesc) formDesc.textContent = cfg.formDesc;
    if (formBtn && cfg.formUrl && cfg.formUrl.trim() !== "" && cfg.formUrl !== "-") {
      formBtn.onclick = (e) => {
        e.preventDefault();
        window.open(cfg.formUrl, '_blank');
      };
    }

    // 3. Sekretariat Humas & Footer
    const picEl = document.getElementById("secretariatPic");
    const mailEl = document.getElementById("secretariatEmail") || document.getElementById("footerEmail");
    const addrEl = document.getElementById("secretariatAddress") || document.getElementById("footerAddress");

    if (picEl && cfg.picName) picEl.textContent = cfg.picName;
    if (addrEl && cfg.address) addrEl.textContent = cfg.address;
    if (mailEl && cfg.email) {
      mailEl.textContent = cfg.email;
      if (mailEl.tagName === 'A') mailEl.href = `mailto:${cfg.email}`;
    }
  });
}

// ================= FIRESTORE: STRUKTUR REDAKSI TIM HUMAS =================
function listenCloudTeam() {
  const container = document.getElementById("teamMembersContainer");
  if (!container) return;

  if (typeof db === "undefined") {
    renderDefaultTeam(container);
    return;
  }

  db.collection("team").orderBy("order", "asc").onSnapshot(snapshot => {
    if (snapshot.empty) {
      renderDefaultTeam(container);
      return;
    }

    container.innerHTML = snapshot.docs.map(doc => {
      const m = doc.data();
      const hasPhoto = m.photo && m.photo.trim() !== "";
      const avatarHtml = hasPhoto
        ? `<img src="${m.photo}" alt="${m.name}" class="w-full h-full object-cover object-top" onerror="this.style.display='none'; this.nextElementSibling.classList.remove('hidden');">
           <div class="hidden w-full h-full bg-[#0B4A8B] text-white font-bold flex items-center justify-center text-sm font-heading">FOTO</div>`
        : `<div class="w-full h-full bg-[#0B4A8B] text-white font-bold flex items-center justify-center text-sm font-heading">FOTO</div>`;

      return `
        <div class="group bg-slate-50 rounded-2xl border border-slate-200/80 p-4 text-center hover:bg-white hover:shadow-md hover:border-sky-300 transition-all duration-300 flex flex-col justify-between">
          <div>
            <div class="relative w-28 h-28 mx-auto mb-4 rounded-full overflow-hidden border-2 border-white shadow-md group-hover:scale-105 transition-transform duration-300 bg-slate-200 flex items-center justify-center">
              ${avatarHtml}
            </div>
            <h4 class="font-bold text-slate-900 text-sm font-heading group-hover:text-sky-600 transition-colors">
              ${m.name}
            </h4>
            <span class="inline-block px-2.5 py-0.5 rounded-full bg-blue-100 text-[#0B4A8B] text-[10px] font-semibold mt-1">
              ${m.role}
            </span>
            <p class="text-[11px] text-slate-500 mt-2 leading-relaxed line-clamp-3">
              ${m.desc || '-'}
            </p>
          </div>
        </div>
      `;
    }).join('');
  }, () => {
    renderDefaultTeam(container);
  });
}

function renderDefaultTeam(container) {
  const fallbackTeam = [
    { name: "Syarif Sillia", role: "Ketua Tim Kerja Humas", photo: "", desc: "Penanggung Jawab Komunikasi Kebijakan & Media Center" },
    { name: "Husni, S.Sos", role: "Media Officer", photo: "", desc: "Peliputan Lapangan & Hubungan Kemitraan Wartawan" },
    { name: "Samsul Ifat, SKM", role: "Desainer Grafis & Audio Visual", photo: "", desc: "Anggota HUMAS - Produksi Media Informasi Edukatif" },
    { name: "Administrator Redaksi", role: "Administrator Portal", photo: "", desc: "Anggota HUMAS - Manajemen Konten & Publikasi Portal" }
  ];

  container.innerHTML = fallbackTeam.map(m => `
    <div class="group bg-slate-50 rounded-2xl border border-slate-200/80 p-4 text-center hover:bg-white hover:shadow-md hover:border-sky-300 transition-all duration-300 flex flex-col justify-between">
      <div>
        <div class="relative w-28 h-28 mx-auto mb-4 rounded-full overflow-hidden border-2 border-white shadow-md group-hover:scale-105 transition-transform duration-300 bg-slate-200 flex items-center justify-center">
          <div class="w-full h-full bg-[#0B4A8B] text-white font-bold flex items-center justify-center text-sm font-heading">FOTO</div>
        </div>
        <h4 class="font-bold text-slate-900 text-sm font-heading group-hover:text-sky-600 transition-colors">
          ${m.name}
        </h4>
        <span class="inline-block px-2.5 py-0.5 rounded-full bg-blue-100 text-[#0B4A8B] text-[10px] font-semibold mt-1">
          ${m.role}
        </span>
        <p class="text-[11px] text-slate-500 mt-2 leading-relaxed line-clamp-3">
          ${m.desc}
        </p>
      </div>
    </div>
  `).join('');
}

// ================= FIRESTORE: SINKRONISASI AGENDA HUMAS =================
function listenCloudAgendas() {
  const container = document.getElementById("publicAgendasContainer");
  if (!container || typeof db === "undefined") return;

  db.collection("agendas").orderBy("createdAt", "desc").limit(3).onSnapshot(snapshot => {
    if (snapshot.empty) return;
    container.innerHTML = snapshot.docs.map(doc => {
      const a = doc.data();
      return `
        <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-sky-200 transition flex items-center gap-3">
          <div class="w-12 h-12 rounded-lg bg-sky-100 text-bkkbn-deep flex flex-col items-center justify-center font-heading flex-shrink-0">
            <span class="text-sm font-extrabold leading-none">${a.day || '01'}</span>
            <span class="text-[9px] uppercase font-bold leading-none mt-0.5">${a.month || 'BLN'}</span>
          </div>
          <div class="min-w-0 flex-1">
            <h5 class="text-xs font-bold text-slate-800 truncate">${a.title}</h5>
            <p class="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
              <span><i class="far fa-clock"></i> ${a.time || '-'}</span>
              <span><i class="fas fa-map-marker-alt"></i> ${a.location || '-'}</span>
            </p>
          </div>
        </div>
      `;
    }).join('');
  });
}

// ================= JAM DIGITAL BERJALAN =================
function initClock() {
  const clockEl = document.getElementById("liveClock");
  if (!clockEl) return;
  function update() {
    const now = new Date();
    const options = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    clockEl.innerHTML = `<i class="far fa-clock mr-1 text-bkkbn-gold"></i> ${now.toLocaleDateString('id-ID', options)} WIT`;
  }
  update();
  setInterval(update, 1000);
}

// ================= JADWAL SHOLAT & HITUNG MUNDUR =================
function initPrayerTimes() {
  const prayers = [
    { name: "Subuh", time: "05:08" },
    { name: "Dzuhur", time: "12:28" },
    { name: "Ashar", time: "15:47" },
    { name: "Maghrib", time: "18:32" },
    { name: "Isya", time: "19:42" }
  ];

  function updatePrayerCountdown() {
    const nameEl = document.getElementById("nextPrayerName");
    const countEl = document.getElementById("nextPrayerCountdown");
    if (!nameEl || !countEl) return;

    const now = new Date();
    let nextPrayer = null;
    let targetDate = null;

    for (let p of prayers) {
      const [h, m] = p.time.split(":").map(Number);
      const prayerDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0);
      if (prayerDate > now) {
        nextPrayer = p;
        targetDate = prayerDate;
        break;
      }
    }

    if (!nextPrayer) {
      nextPrayer = prayers[0];
      const [h, m] = prayers[0].time.split(":").map(Number);
      targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, h, m, 0);
    }

    nameEl.textContent = nextPrayer.name;
    const diff = Math.floor((targetDate - now) / 1000);
    const hours = String(Math.floor(diff / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
    const seconds = String(diff % 60).padStart(2, '0');

    countEl.textContent = `${hours}:${minutes}:${seconds}`;
  }

  updatePrayerCountdown();
  setInterval(updatePrayerCountdown, 1000);
}

// ================= NAVBAR KATEGORI =================
function renderCategoryNav() {
  const navContainer = document.getElementById("categoryNav");
  if (!navContainer) return;

  navContainer.innerHTML = categories.map(cat => {
    const isActive = cat === currentCategory;
    const textStyle = isActive 
      ? "text-amber-400 font-bold border-b-2 border-amber-400 pb-1" 
      : "text-white/90 hover:text-white font-semibold hover:border-b-2 hover:border-white/60 pb-1";

    return `
      <button 
        type="button" 
        onclick="setCategoryFilter('${cat}')" 
        class="transition-all whitespace-nowrap text-sm tracking-normal bg-transparent px-1 outline-none ${textStyle}">
        ${cat}
      </button>
    `;
  }).join('');
}

function setCategoryFilter(cat) {
  currentCategory = cat;
  if (cat === "Semua") {
    window.location.href = "kategori.html?cat=semua";
  } else if (cat === "Berita") {
    window.location.href = "kategori.html?cat=berita";
  } else if (cat === "Artikel") {
    window.location.href = "kategori.html?cat=artikel";
  } else if (cat === "Pengumuman") {
    window.location.href = "kategori.html?cat=pengumuman";
  } else if (cat === "Infografis") {
    scrollToSection("currentPosterImg");
  } else if (cat === "Galeri") {
    window.location.href = "kategori.html?cat=galeri";
  }
}

// ================= EFEK MESIN TIK BANNER =================
function initTypewriter() {
  const typewriterEl = document.getElementById("typewriterText");
  if (!typewriterEl) return;

  const fullText = `Selamat Datang di Portal Berita \nHUMAS Kemendukbangga/BKKBN\nPerwakilan Provinsi Maluku Utara`;
  let charIndex = 0;
  let isDeleting = false;
  const typingSpeed = 75;
  const deletingSpeed = 35;
  const pauseDelay = 2200;

  function typeLoop() {
    const currentSlice = fullText.substring(0, charIndex);
    const formattedText = currentSlice.split('\n').map((line, idx) => {
      if (idx === 2) {
        return `<span class="text-[#E3B341]">${line}</span>`;
      }
      return line;
    }).join('<br>');

    typewriterEl.innerHTML = formattedText;

    if (!isDeleting && charIndex === fullText.length) {
      setTimeout(() => {
        isDeleting = true;
        typeLoop();
      }, pauseDelay);
      return;
    }

    if (isDeleting && charIndex === 0) {
      isDeleting = false;
      setTimeout(typeLoop, 500);
      return;
    }

    charIndex = isDeleting ? charIndex - 1 : charIndex + 1;
    setTimeout(typeLoop, isDeleting ? deletingSpeed : typingSpeed);
  }

  typeLoop();
}

// ================= MODAL & SISTEM BACA =================
function openArticleModal(id) {
  const article = cloudArticles.find(item => item.id == id);
  if (!article) return;

  activeModalArticle = article;
  const catBadge = document.getElementById("modalCategoryBadge");
  const readTime = document.getElementById("modalReadTime");
  const title = document.getElementById("modalTitle");
  const date = document.getElementById("modalDate");
  const author = document.getElementById("modalAuthor");
  const loc = document.getElementById("modalLocation");
  const img = document.getElementById("modalImage");
  const content = document.getElementById("modalContent");

  if (catBadge) catBadge.textContent = article.tag || article.category || "Berita";
  if (readTime) readTime.innerHTML = `<i class="far fa-clock"></i> 3 Menit`;
  if (title) title.textContent = article.title;
  if (date) date.innerHTML = `<i class="far fa-calendar-alt text-bkkbn-primary mr-1"></i> ${article.date || '-'}`;
  if (author) author.innerHTML = `<i class="far fa-user text-bkkbn-primary mr-1"></i> ${article.author || 'Redaksi Humas'}`;
  if (loc) loc.innerHTML = `<i class="fas fa-map-pin text-rose-500 mr-1"></i> Maluku Utara`;
  if (img) img.src = article.image || 'image1.jpg';
  if (content) content.innerHTML = article.content || `<p>${article.excerpt || ''}</p>`;

  document.getElementById("articleModal")?.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeArticleModal() {
  const modal = document.getElementById("articleModal");
  if (!modal) return;
  modal.classList.add("hidden");
  document.body.style.overflow = "auto";
  activeModalArticle = null;
}

function copyCurrentArticleLink() {
  const dummyUrl = window.location.href.split('#')[0] + "#berita-" + (activeModalArticle ? activeModalArticle.id : '1');
  navigator.clipboard.writeText(dummyUrl).then(() => {
    showToast("Tautan berita berhasil disalin!");
  }).catch(() => {
    showToast("Gagal menyalin tautan.");
  });
}

function shareToWhatsApp() {
  if (!activeModalArticle) return;
  const text = encodeURIComponent(`*${activeModalArticle.title}*\nBaca selengkapnya di Portal Humas BKKBN Malut:\n${window.location.href}`);
  window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
}

function shareToTwitter() {
  if (!activeModalArticle) return;
  const text = encodeURIComponent(`Siaran Pers Humas BKKBN Malut: ${activeModalArticle.title}`);
  window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
}

function openMediaInquiryModal() {
  const modal = document.getElementById("mediaInquiryModal");
  if (!modal) return;
  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeMediaInquiryModal() {
  const modal = document.getElementById("mediaInquiryModal");
  if (!modal) return;
  modal.classList.add("hidden");
  document.body.style.overflow = "auto";
}

function handleInquirySubmit(e) {
  e.preventDefault();
  closeMediaInquiryModal();
  showToast("Permohonan liputan terkirim! Tim LO Humas akan segera menghubungi.");
  e.target.reset();
}

function showToast(message) {
  const toast = document.getElementById("toastBox");
  const msgEl = document.getElementById("toastMessage");
  if (!toast || !msgEl) return;

  msgEl.textContent = message;
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 3500);
}

function scrollToSection(id) {
  const target = document.getElementById(id);
  if (target) {
    target.scrollIntoView({ behavior: 'smooth' });
  }
}
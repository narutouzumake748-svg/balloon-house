let siteSettings = null;

document.addEventListener("DOMContentLoaded", async () => {
  setupNav();
  setupLightbox();

  const [settings, gallery] = await Promise.all([
    fetch("data/settings.json").then(r => r.json()).catch(() => null),
    fetch("data/gallery.json").then(r => r.json()).catch(() => ({ items: [] })),
  ]);

  siteSettings = settings;
  if (siteSettings) applyConfig(siteSettings);

  renderGallery(gallery.items || []);
  setupGalleryFilter();
  attachLightboxHandlers();

  setupInquiryForm();
  document.getElementById("year").textContent = new Date().getFullYear();
});

function renderGallery(items) {
  const grid = document.getElementById("galleryGrid");
  grid.innerHTML = items.map(item => `
    <div class="gallery-item" data-category="${item.category}">
      <img src="${item.src}" alt="${item.alt}">
    </div>
  `).join("");
}

function applyConfig(config) {
  const waLink = `https://wa.me/${config.whatsappNumber}`;

  document.getElementById("whatsappLink").href = waLink;
  document.getElementById("callLink").href = `tel:${config.phoneNumber.replace(/\s+/g, "")}`;
  document.getElementById("instaLink").href = config.instagramUrl;
  document.getElementById("emailLink").href = `mailto:${config.email}`;

  document.getElementById("footerInsta").href = config.instagramUrl;
  document.getElementById("footerWhatsapp").href = waLink;
  document.getElementById("footerEmail").href = `mailto:${config.email}`;

  const followLink = document.getElementById("instaFollowLink");
  followLink.href = config.instagramUrl;
  followLink.textContent = config.instagramHandle;
  document.getElementById("instaPlaceholderLink").href = config.instagramUrl;

  document.getElementById("locationValue").textContent = config.location;
  document.getElementById("footerLocation").textContent = `📍 Serving ${config.location}`;
}

function setupNav() {
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");

  toggle.addEventListener("click", () => links.classList.toggle("open"));

  links.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => links.classList.remove("open"));
  });
}

function setupGalleryFilter() {
  const buttons = document.querySelectorAll(".filter-btn");
  const items = document.querySelectorAll(".gallery-item");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.dataset.filter;
      items.forEach(item => {
        const match = filter === "all" || item.dataset.category === filter;
        item.classList.toggle("hidden", !match);
      });
    });
  });
}

function setupLightbox() {
  const lightbox = document.getElementById("lightbox");
  const closeBtn = document.getElementById("lightboxClose");

  const close = () => lightbox.classList.remove("open");
  closeBtn.addEventListener("click", close);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) close();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}

function attachLightboxHandlers() {
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");

  document.querySelectorAll(".gallery-item img").forEach(img => {
    img.addEventListener("click", () => {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightbox.classList.add("open");
    });
  });
}

function setupInquiryForm() {
  const form = document.getElementById("inquiryForm");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!siteSettings) return;

    const name = document.getElementById("name").value.trim();
    const eventType = document.getElementById("eventType").value;
    const eventDate = document.getElementById("eventDate").value;
    const message = document.getElementById("message").value.trim();

    const lines = [
      `Hi Balloon House! I'd like a quote.`,
      `Name: ${name}`,
      `Event Type: ${eventType}`,
      eventDate ? `Event Date: ${eventDate}` : null,
      message ? `Details: ${message}` : null,
    ].filter(Boolean);

    const text = encodeURIComponent(lines.join("\n"));
    window.open(`https://wa.me/${siteSettings.whatsappNumber}?text=${text}`, "_blank");
  });
}

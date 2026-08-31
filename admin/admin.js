const AUTH_KEY = "balloonhouse_admin_auth";

document.addEventListener("DOMContentLoaded", () => {
  const saved = getAuth();
  if (saved) showPanel(saved);

  document.getElementById("loginBtn").addEventListener("click", handleLogin);
  document.getElementById("logoutBtn").addEventListener("click", handleLogout);
  document.getElementById("uploadBtn").addEventListener("click", handleUpload);
  document.getElementById("saveSettingsBtn").addEventListener("click", handleSaveSettings);

  document.querySelectorAll(".admin-tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });
});

function getAuth() {
  const raw = sessionStorage.getItem(AUTH_KEY);
  return raw ? JSON.parse(raw) : null;
}

async function handleLogin() {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  const errorEl = document.getElementById("loginError");
  errorEl.textContent = "";

  if (!email || !password) {
    errorEl.textContent = "Enter your email and password.";
    return;
  }

  try {
    const res = await fetch("/.netlify/functions/check-auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      errorEl.textContent = "Incorrect email or password.";
      return;
    }

    const auth = { email, password };
    sessionStorage.setItem(AUTH_KEY, JSON.stringify(auth));
    showPanel(auth);
  } catch (e) {
    errorEl.textContent = "Something went wrong. Try again.";
  }
}

function handleLogout() {
  sessionStorage.removeItem(AUTH_KEY);
  document.getElementById("panelSection").hidden = true;
  document.getElementById("loginSection").hidden = false;
}

function showPanel(auth) {
  document.getElementById("loginSection").hidden = true;
  document.getElementById("panelSection").hidden = false;
  document.getElementById("loggedInAs").textContent = `Logged in as ${auth.email}`;
  loadGallery();
  loadSettings();
}

function switchTab(tab) {
  document.querySelectorAll(".admin-tab-btn").forEach((b) =>
    b.classList.toggle("active", b.dataset.tab === tab)
  );
  document.getElementById("galleryTab").hidden = tab !== "gallery";
  document.getElementById("settingsTab").hidden = tab !== "settings";
}

async function loadGallery() {
  const res = await fetch(`/data/gallery.json?_=${Date.now()}`);
  const data = await res.json();
  const grid = document.getElementById("adminGalleryGrid");

  grid.innerHTML = (data.items || [])
    .map(
      (item) => `
    <div class="admin-gallery-item">
      <img src="${item.src}" alt="${item.alt}">
      <div class="admin-gallery-meta">${item.category}</div>
      <button class="btn-remove" data-src="${item.src}">Remove</button>
    </div>
  `
    )
    .join("");

  grid.querySelectorAll(".btn-remove").forEach((btn) => {
    btn.addEventListener("click", () => handleRemove(btn.dataset.src));
  });
}

async function loadSettings() {
  const res = await fetch(`/data/settings.json?_=${Date.now()}`);
  const s = await res.json();
  document.getElementById("s_whatsappNumber").value = s.whatsappNumber || "";
  document.getElementById("s_phoneNumber").value = s.phoneNumber || "";
  document.getElementById("s_email").value = s.email || "";
  document.getElementById("s_instagramUrl").value = s.instagramUrl || "";
  document.getElementById("s_instagramHandle").value = s.instagramHandle || "";
  document.getElementById("s_location").value = s.location || "";
}

function resizeImage(file, maxDim = 1600, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => {
      img.src = reader.result;
    };
    reader.onerror = reject;
    img.onload = () => {
      let { width, height } = img;
      if (width > height && width > maxDim) {
        height = Math.round(height * (maxDim / width));
        width = maxDim;
      } else if (height > maxDim) {
        width = Math.round(width * (maxDim / height));
        height = maxDim;
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", quality).split(",")[1]);
    };
    img.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function handleUpload() {
  const auth = getAuth();
  const fileInput = document.getElementById("photoFile");
  const alt = document.getElementById("photoAlt").value.trim();
  const category = document.getElementById("photoCategory").value;
  const statusEl = document.getElementById("uploadStatus");

  if (!fileInput.files[0]) {
    statusEl.textContent = "Choose a photo first.";
    return;
  }

  statusEl.textContent = "Uploading...";

  try {
    const imageBase64 = await resizeImage(fileInput.files[0]);
    const filename = `photo-${Date.now()}.jpg`;

    const res = await fetch("/.netlify/functions/add-photo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...auth, imageBase64, filename, alt, category }),
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Upload failed");

    statusEl.textContent = "Uploaded! It'll appear on the live site within about a minute.";
    fileInput.value = "";
    document.getElementById("photoAlt").value = "";
    setTimeout(loadGallery, 1000);
  } catch (e) {
    statusEl.textContent = `Error: ${e.message}`;
  }
}

async function handleRemove(src) {
  const auth = getAuth();
  if (!confirm("Remove this photo?")) return;

  try {
    const res = await fetch("/.netlify/functions/remove-photo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...auth, src }),
    });
    if (!res.ok) throw new Error("Failed to remove photo.");
    loadGallery();
  } catch (e) {
    alert(e.message);
  }
}

async function handleSaveSettings() {
  const auth = getAuth();
  const statusEl = document.getElementById("settingsStatus");
  const settings = {
    whatsappNumber: document.getElementById("s_whatsappNumber").value.trim(),
    phoneNumber: document.getElementById("s_phoneNumber").value.trim(),
    email: document.getElementById("s_email").value.trim(),
    instagramUrl: document.getElementById("s_instagramUrl").value.trim(),
    instagramHandle: document.getElementById("s_instagramHandle").value.trim(),
    location: document.getElementById("s_location").value.trim(),
  };

  statusEl.textContent = "Saving...";

  try {
    const res = await fetch("/.netlify/functions/save-settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...auth, settings }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Save failed");
    statusEl.textContent = "Saved! It'll appear on the live site within about a minute.";
  } catch (e) {
    statusEl.textContent = `Error: ${e.message}`;
  }
}

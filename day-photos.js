"use strict";
// Day photos stay in the owner's private Storage folder; URLs live only in memory.
let dayPhotoOwner = null, dayPhotoEpoch = 0, dayPhotoState = "idle";
const dayPhotos = new Map(), dayPhotoBusy = new Set();
const dayPhotoBucket = "fishing-day-photos";
const dayPhotoObserver = typeof IntersectionObserver === "function" ? new IntersectionObserver((entries) => {
  for (const entry of entries) if (entry.isIntersecting) {
    const panel = entry.target.querySelector("[data-day-photo]");
    const date = panel?.dataset.dayPhoto, photo = dayPhotos.get(date);
    if (photo && !photo.url && !photo.loading && !photo.error) void downloadDayPhoto(date, photo);
    dayPhotoObserver.unobserve(entry.target);
  }
}, { rootMargin: "300px" }) : null;
function resetDayPhotos() {
  dayPhotoEpoch++;
  dayPhotoObserver?.disconnect();
  for (const photo of dayPhotos.values()) if (photo.url) URL.revokeObjectURL(photo.url);
  dayPhotos.clear(); dayPhotoBusy.clear(); dayPhotoOwner = null; dayPhotoState = "idle";
}
async function loadDayPhotos({ refresh = false } = {}) {
  if (!session || !client?.storage) return;
  if (dayPhotoOwner !== session.user.id) { resetDayPhotos(); dayPhotoOwner = session.user.id; }
  if (refresh && dayPhotoState !== "loading") dayPhotoState = "idle";
  if (dayPhotoState !== "idle") return;
  const owner = dayPhotoOwner, epoch = dayPhotoEpoch;
  dayPhotoState = "loading";
  try {
    const names = [];
    for (let offset = 0;; offset += 100) {
      const { data, error } = await client.storage.from(dayPhotoBucket).list(owner, { limit: 100, offset, sortBy: { column: "name", order: "asc" } });
      if (epoch !== dayPhotoEpoch || session?.user.id !== owner) return;
      if (error) throw error;
      names.push(...data);
      if (data.length < 100) break;
    }
    const files = new Map(names.filter((file) => /^\d{4}-\d{2}-\d{2}\.jpg$/.test(file.name)).map((file) => [file.name.slice(0, 10), file]));
    for (const [date, photo] of dayPhotos) {
      if (dayPhotoBusy.has(date)) continue;
      const file = files.get(date), version = file?.updated_at || file?.created_at || "";
      if (!file || photo.version !== version) {
        if (photo.url) URL.revokeObjectURL(photo.url);
        dayPhotos.delete(date);
      }
    }
    for (const [date, file] of files) if (!dayPhotos.has(date) && !dayPhotoBusy.has(date)) {
      dayPhotos.set(date, { url: null, loading: false, version: file.updated_at || file.created_at || "" });
    }
    dayPhotoState = "ready";
  } catch { if (epoch === dayPhotoEpoch) dayPhotoState = "error"; }
  if (epoch === dayPhotoEpoch) paintDayPhotos();
}
async function downloadDayPhoto(date, photo) {
  if (photo.loading || photo.url || !session) return;
  photo.loading = true;
  const epoch = dayPhotoEpoch, owner = session.user.id;
  try {
    const { data, error } = await client.storage.from(dayPhotoBucket).download(`${owner}/${date}.jpg`);
    if (epoch !== dayPhotoEpoch || session?.user.id !== owner || dayPhotos.get(date) !== photo) return;
    if (error) throw error;
    photo.url = URL.createObjectURL(data);
  } catch { photo.error = true; }
  finally { photo.loading = false; }
  if (epoch === dayPhotoEpoch) paintDayPhotos();
}
function paintDayPhotos() {
  document.querySelectorAll("[data-day-photo]").forEach((panel) => {
    const date = panel.dataset.dayPhoto, photo = dayPhotos.get(date), busy = dayPhotoBusy.has(date);
    const image = panel.querySelector("img");
    image.hidden = !photo?.url;
    if (photo?.url) { if (image.src !== photo.url) image.src = photo.url; }
    else image.removeAttribute("src");
    const thumbnail = panel.closest(".day-card").querySelector(".day-photo-thumb");
    thumbnail.hidden = !photo?.url;
    if (photo?.url) thumbnail.src = photo.url; else thumbnail.removeAttribute("src");
    panel.querySelector(".day-photo-choose").textContent = photo ? "Replace photo" : "Add photo";
    panel.querySelector(".day-photo-remove").hidden = !photo;
    panel.querySelectorAll("button,input").forEach((control) => { control.disabled = busy; });
    const retry = panel.querySelector(".day-photo-retry");
    retry.hidden = dayPhotoState !== "error" && !photo?.error;
    const status = panel.querySelector("[role=status]");
    if (!status.dataset.message) status.textContent = busy ? "Saving photo…" : photo?.error || dayPhotoState === "error" ? "Photo could not load. Try again when connected." : photo ? "" : "One private photo to remember this day.";
    if (photo && !photo.url && !photo.loading && !photo.error) {
      if (dayPhotoObserver) dayPhotoObserver.observe(panel.closest(".day-card"));
      else void downloadDayPhoto(date, photo);
    }
  });
}
async function prepareDayPhoto(file) {
  if (!file || file.size > 20 * 1024 * 1024) throw Error("Choose a photo smaller than 20 MB.");
  if (!file.type.startsWith("image/")) throw Error("Choose an image file.");
  const url = URL.createObjectURL(file), image = new Image();
  try {
    image.src = url;
    await image.decode();
    const scale = Math.min(1, 1600 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext("2d");
    context.fillStyle = "#fff"; context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", .85));
    if (!blob || blob.size > 5 * 1024 * 1024) throw Error("Photo is too large. Try a smaller image.");
    return blob;
  } catch (error) { throw Error(error.message.includes("large") ? error.message : "This photo could not be opened. Try a JPEG, PNG or WebP image."); }
  finally { URL.revokeObjectURL(url); }
}
async function saveDayPhoto(date, file, remove = false) {
  if (!session || dayPhotoBusy.has(date)) return;
  const owner = session.user.id, epoch = dayPhotoEpoch;
  const current = () => epoch === dayPhotoEpoch && session?.user.id === owner;
  dayPhotoBusy.add(date);
  document.querySelectorAll(`[data-day-photo="${date}"] [role=status]`).forEach((s) => { delete s.dataset.message; });
  paintDayPhotos();
  let message;
  try {
    const blob = remove ? null : await prepareDayPhoto(file);
    if (!current()) return;
    const store = client.storage.from(dayPhotoBucket), path = `${owner}/${date}.jpg`;
    const result = remove ? await store.remove([path]) : await store.upload(path, blob, { contentType: "image/jpeg", cacheControl: "0", upsert: true });
    if (!current()) return;
    if (result.error) throw Error("Photo could not be saved. Check your connection and try again.");
    const previous = dayPhotos.get(date);
    if (previous?.url) URL.revokeObjectURL(previous.url);
    if (remove) dayPhotos.delete(date);
    else dayPhotos.set(date, { url: URL.createObjectURL(blob), loading: false });
    message = remove ? "Photo removed." : "Photo saved privately.";
  } catch (error) { message = error.message || "Photo could not be saved. Please try again."; }
  finally {
    if (current()) {
      dayPhotoBusy.delete(date);
      document.querySelectorAll(`[data-day-photo="${date}"] [role=status]`).forEach((s) => { s.textContent = message; s.dataset.message = "true"; });
      paintDayPhotos();
    }
  }
}
function createDayPhotoPanel(date) {
  const panel = document.createElement("div"); panel.className = "day-photo-panel"; panel.dataset.dayPhoto = date;
  panel.innerHTML = `<img class="day-photo-preview" loading="lazy" alt="Photo from fishing on ${esc(date)}" hidden><div class="day-photo-actions"><button type="button" class="quiet day-photo-choose">Add photo</button><button type="button" class="quiet day-photo-remove" hidden>Remove photo</button><button type="button" class="quiet day-photo-retry" hidden>Retry photos</button><input class="sr-only" type="file" accept="image/*" aria-label="Choose a photo for ${esc(date)}"><p class="small muted" role="status"></p></div>`;
  const input = panel.querySelector("input");
  panel.querySelector(".day-photo-choose").onclick = () => input.click();
  input.onchange = () => { const file = input.files[0]; input.value = ""; if (file) void saveDayPhoto(date, file); };
  panel.querySelector(".day-photo-remove").onclick = () => { if (confirm("Remove this day's photo?")) void saveDayPhoto(date, null, true); };
  panel.querySelector(".day-photo-retry").onclick = () => {
    const photo = dayPhotos.get(date); if (photo) photo.error = false;
    if (dayPhotoState === "error") { dayPhotoState = "idle"; void loadDayPhotos(); }
    paintDayPhotos();
  };
  return panel;
}

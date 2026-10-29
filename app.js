"use strict";
const $ = (id) => document.getElementById(id);
const config = window.JOURNAL_CONFIG;
const species = {
  kabeljo: ["Kabeljou", "#176a47"],
  red_roman: ["Red Roman", "#bb483c"],
  red_steenbras: ["Red Steenbras", "#9e396c"],
  miss_lucy: ["Miss Lucy", "#7c4fa3"],
  geelbek: ["Geelbek", "#9b7014"],
  haai: ["Shark", "#546474"],
  carpenter: ["Carpenter", "#297a88"],
  santer: ["Santer", "#ce6130"],
  yellowbelly: ["Yellowbelly", "#88781a"],
  musselcracker: ["Black Musselcracker", "#3459a0"],
  hake: ["South African Hake", "#666743"],
  yellowtail: ["Cape Yellowtail", "#a38a24"],
  dageraad: ["Dageraad", "#bd592d"],
  scotsman: ["Scotsman", "#98733c"],
  sea_barbel: ["See Baber", "#637b73"],
  mackerel: ["Mackerel", "#267f86"],
  blacktail: ["Blacktail", "#9b987b"],
  belman: ["Belman", "#8b8b79"],
  galjoen: ["Galjoen", "#536761"],
  shad: ["Shad / Elf", "#41867b"],
  dusky_kob: ["Dusky Kob", "#648079"],
  spotted_grunter: ["Spotted Grunter", "#9a8355"],
  white_steenbras: ["White Steenbras", "#7b8175"],
  garrick: ["Garrick / Leervis", "#68875d"],
  zebra: ["Zebra / Wildeperd", "#7e7052"],
  white_musselcracker: ["White Musselcracker", "#788a66"],
};
// Species identity and captured fishing style are independent. Red Roman is shared.
const shoreOnlySpecies = new Set([
  "blacktail",
  "belman",
  "galjoen",
  "shad",
  "dusky_kob",
  "spotted_grunter",
  "white_steenbras",
  "garrick",
  "zebra",
  "white_musselcracker",
]);
const fishingModeLabels = { offshore: "Offshore", shore: "Shore", all: "All fishing" };
let fishingMode = "offshore";
try {
  const saved = localStorage.getItem("fishing-journal-mode");
  if (Object.hasOwn(fishingModeLabels, saved)) fishingMode = saved;
} catch { /* Private storage may be unavailable; default to Offshore. */ }
function recordFishingMode(record) {
  return record.fishing_mode ?? record.raw_payload?.fishing_mode ?? "offshore";
}
function matchesFishingMode(record) {
  return fishingMode === "all" || recordFishingMode(record) === fishingMode;
}
function modeSpeciesIds() {
  return Object.keys(species).filter((id) =>
    fishingMode === "all" ||
    (fishingMode === "shore"
      ? shoreOnlySpecies.has(id) || id === "red_roman"
      : !shoreOnlySpecies.has(id))
  );
}
function updateModeControls() {
  document.body.dataset.fishingMode = fishingMode;
  document.querySelectorAll("button[data-fishing-mode]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.fishingMode === fishingMode));
  });
  const selected = $("species").value;
  $("species").replaceChildren(new Option("All species", ""));
  for (const id of modeSpeciesIds()) $("species").add(new Option(species[id][0], id));
  if (modeSpeciesIds().includes(selected)) $("species").value = selected;
}
function setFishingMode(mode) {
  if (!Object.hasOwn(fishingModeLabels, mode)) return;
  fishingMode = mode;
  try {
    localStorage.setItem("fishing-journal-mode", mode);
  } catch { /* Preference only. */ }
  conditionsGeneration++;
  $("details").close();
  updateModeControls();
  render();
}
const dayColours = [
  "#176a47",
  "#7c4fa3",
  "#ce6130",
  "#3459a0",
  "#9b7014",
  "#bb483c",
  "#297a88",
  "#9e396c",
];
const esc = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[c]),
  );
const dateFormat = new Intl.DateTimeFormat("en-ZA", {
  timeZone: config.timezone,
  day: "numeric",
  month: "short",
  year: "numeric",
});
const timeFormat = new Intl.DateTimeFormat("en-ZA", {
  timeZone: config.timezone,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});
const dayFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: config.timezone,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
function dayKey(value) {
  const parts = Object.fromEntries(
    dayFormat.formatToParts(new Date(value)).map((p) => [p.type, p.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}`;
}
const dateLabel = (value) => dateFormat.format(new Date(value));
const timeLabel = (value) => timeFormat.format(new Date(value));
const nameOf = (c) => species[c.species_id]?.[0] || c.recorded_label || c.species_id;
// Small previews travel with the app shell: no separate download is needed.
// BEGIN GENERATED FISH PREVIEWS (tools/prepare_phone_images.py)
const fishPreviews = {
  belman: "fish/mobile/preview_belman.png",
  blacktail: "fish/mobile/preview_blacktail.png",
  carpenter: "fish/mobile/preview_carpenter.png",
  dageraad: "fish/mobile/preview_dageraad.png",
  dusky_kob: "fish/mobile/preview_dusky_kob.png",
  galjoen: "fish/mobile/preview_galjoen.png",
  garrick: "fish/mobile/preview_garrick.png",
  geelbek: "fish/mobile/preview_geelbek.png",
  haai: "fish/mobile/preview_haai.png",
  hake: "fish/mobile/preview_hake.png",
  kabeljo: "fish/mobile/preview_kabeljo.png",
  mackerel: "fish/mobile/preview_mackerel.png",
  miss_lucy: "fish/mobile/preview_miss_lucy.png",
  musselcracker: "fish/mobile/preview_musselcracker.png",
  red_roman: "fish/mobile/preview_red_roman.png",
  red_steenbras: "fish/mobile/preview_red_steenbras.png",
  santer: "fish/mobile/preview_santer.png",
  scotsman: "fish/mobile/preview_scotsman.png",
  sea_barbel: "fish/mobile/preview_sea_barbel.png",
  shad: "fish/mobile/preview_shad.png",
  spotted_grunter: "fish/mobile/preview_spotted_grunter.png",
  white_musselcracker: "fish/mobile/preview_white_musselcracker.png",
  white_steenbras: "fish/mobile/preview_white_steenbras.png",
  yellowbelly: "fish/mobile/preview_yellowbelly.png",
  yellowtail: "fish/mobile/preview_yellowtail.png",
  zebra: "fish/mobile/preview_zebra.png",
};
// END GENERATED FISH PREVIEWS
function fishImage(id, large = false) {
  return species[id]
    ? `<img class="${large ? "fish-portrait" : "fish-thumb"}" src="${fishPreviews[id]}" alt="${
      esc(species[id][0])
    } illustration" data-species="${esc(id)}" loading="${large ? "eager" : "lazy"}" decoding="async" width="${large ? 320 : 64}" height="${
      large ? 220 : 46
    }">`
    : "";
}
function upgradeFishPortrait(id) {
  const portrait = $("detail-body").querySelector(".fish-portrait");
  if (!portrait || !species[id]) return;
  const full = new Image();
  // Keep the embedded preview visible until the sharper full image has decoded.
  full.onload = () => {
    if (portrait.isConnected) portrait.src = full.src;
  };
  full.src = new URL(
    `fish/mobile/${id}.${fishPreviews[id]?.endsWith(".png") ? "png" : "jpg"}`,
    document.baseURI,
  ).href;
}
let client,
  session,
  catches = [],
  trips = [],
  map,
  markers,
  mapSignature = null,
  visible = [],
  loadGeneration = 0,
  conditionsGeneration = 0,
  lastRefreshAt = 0;
let dayPalette = new Map();
function message(text, error = false, kind = "load") {
  $("status").classList.remove("is-loading");
  $("status").dataset.kind = kind;
  $("status").textContent = text;
  $("status").classList.toggle("error", error);
}
function loginMessage(text, error = false) {
  $("login-status").textContent = text;
  $("login-status").classList.toggle("error", error);
}
function resetPrivateView() {
  resetDayPhotos();
  resetInsights();
  loadGeneration++;
  conditionsGeneration++;
  dayRatingEpoch++;
  dayRatingRows.clear();
  dayRatingLoad = "loading";
  catches = [];
  trips = [];
  visible = [];
  dayPalette.clear();
  sessionSpotLabels.clear();
  focusedSpot = null;
  spotLayer = null;
  mapSummaryLayer = null;
  mapViewMode = "catches";
  densityLayer = null;
  densityModel = null;
  densityRadius = 500;
  $("density-enabled").checked = true;
  $("density-controls").hidden = true;
  if (map) map.remove();
  map = null;
  markers = null;
  mapSignature = null;
  $("map").replaceChildren();
  for (
    const id of [
      "totals",
      "days",
      "detail-body",
      "legend",
      "map-view-summary",
      "trip-summary",
      "spot-productivity",
      "trip-status",
    ]
  ) $(id).replaceChildren();
  for (const id of ["catch-count", "species-count", "day-count"]) {
    $(id).textContent = "0";
  }
  $("details").close();
  $("journal").hidden = true;
  $("login").hidden = false;
  $("signout").hidden = true;
  $("password").value = "";
  $("refresh").disabled = false;
  $("app-loading").hidden = true;
  $("login-form").removeAttribute("aria-busy");
  lastRefreshAt = 0;
}
async function setSession(next) {
  // Supabase may emit SIGNED_IN again on focus. Do not rebuild the journal.
  if (next && session?.user.id === next.user.id) {
    session = next;
    return;
  }
  if (!next) {
    session = null;
    resetPrivateView();
    return;
  }
  if (config.ownerId && next.user.id !== config.ownerId) {
    session = null;
    resetPrivateView();
    await client.auth.signOut({ scope: "local" });
    loginMessage("This account is not the owner of this fishing journal.", true);
    return;
  }
  session = next;
  $("login").hidden = true;
  $("app-loading").hidden = false;
  $("password").value = "";
  await refreshJournal();
  if (session?.user.id !== next.user.id) return;
  $("app-loading").hidden = true;
  $("journal").hidden = false;
  $("signout").hidden = false;
  route();
  requestAnimationFrame(() => {
    map?.invalidateSize({ pan: false });
    fitMap();
  });
}
// Deduplicate by archive identity, never coordinates: several real catches may share a spot.
function uniqueRecords(rows) {
  const seen = new Set();
  return rows.filter((row) => {
    const key = row.archive_id ||
      (row.catch_id
        ? `${row.device_id}:${row.catch_id}`
        : row.watch_trip_id
        ? `${row.device_id}:${row.watch_trip_id}`
        : row);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
// Both record types share pagination and refresh lifecycle, but fail independently.
async function readRecords(
  table,
  columns,
  timeColumn,
  kind,
  owner,
  generation,
) {
  const all = [];
  const pageSize = 500;
  for (let offset = 0;; offset += pageSize) {
    const { data, error } = await client.from(table).select(columns)
      .eq("record_kind", kind).eq("owner_id", owner)
      .order(timeColumn, { ascending: false }).order("archive_id", {
        ascending: false,
      })
      .range(offset, offset + pageSize - 1);
    if (generation !== loadGeneration || !session) return null;
    if (error) throw error;
    all.push(...data);
    if (data.length < pageSize) return uniqueRecords(all);
  }
}
async function refreshJournal() {
  if (!session || $("refresh").disabled) return;
  const generation = ++loadGeneration;
  const owner = session.user.id;
  void refreshDayRatings(owner, generation);
  void loadDayPhotos({ refresh: true });
  $("refresh").disabled = true;
  message("Refreshing…");
  $("status").classList.add("is-loading");
  try {
    const [catchResult, tripResult] = await Promise.allSettled([
      readRecords(
        "fishing_catches",
        "archive_id,device_id,watch_trip_id,catch_id,species_id,recorded_label,caught_at,gps_at,latitude,longitude,gps_quality,position_method,tackle_method,received_at,fishing_mode,raw_payload",
        "caught_at",
        "catch",
        owner,
        generation,
      ),
      readRecords(
        "fishing_trips",
        "archive_id,device_id,watch_trip_id,started_at,ended_at,fishing_seconds,travelling_seconds,unclassified_seconds,raw_payload,fishing_mode,fishing_sessions(archive_id,session_number,started_at,ended_at,fishing_seconds,catch_count,no_bite_count,species_counts,angler_seconds,line_seconds,latitude,longitude,location_source,spot_archive_id,fishing_spots(archive_id,name,latitude,longitude,created_at))",
        "started_at",
        "trip",
        owner,
        generation,
      ),
    ]);
    if (generation !== loadGeneration || !session) return;
    if (catchResult.status === "fulfilled") {
      catches = catchResult.value;
      dayPalette = new Map(
        [...new Set(catches.map((c) => dayKey(c.caught_at)))].sort().map((
          day,
          i,
        ) => [day, dayColours[i % dayColours.length]]),
      );
    }
    if (tripResult.status === "fulfilled") {
      trips = tripResult.value.filter((t) => t.ended_at);
    }
    render();
    if (catchResult.status === "rejected") {
      message(
        "Catches could not refresh. Previously loaded records remain available. Try Refresh when connected.",
        true,
      );
    } else if ($("status").dataset.kind !== "filter") message("");
    $("trip-status").textContent = tripResult.status === "rejected"
      ? "Trips could not refresh. Previously loaded trips remain available. Try Refresh when connected."
      : trips.length
      ? ""
      : "No completed trips uploaded yet. Start and end a trip on your watch, then leave the app open to sync.";
    if (
      catchResult.status === "fulfilled" && tripResult.status === "fulfilled"
    ) {
      $("updated").textContent = `Updated ${timeLabel(new Date())}`;
      lastRefreshAt = Date.now();
    }
  } finally {
    if (generation === loadGeneration) {
      $("refresh").disabled = false;
      $("status").classList.remove("is-loading");
    }
  }
}

function filtered() {
  return catches.filter((c) => {
    const day = dayKey(c.caught_at);
    return matchesFishingMode(c) && (!$("species").value || c.species_id === $("species").value) &&
      (!$("from").value || day >= $("from").value) &&
      (!$("to").value || day <= $("to").value);
  });
}
function colourOf(c) {
  return species[c.species_id]?.[1] || "#11543e";
}
function render() {
  visible = filtered();
  $("filter-summary").textContent = `${species[$("species").value]?.[0] || "All species"} · ${
    $("from").value || $("to").value
      ? `${$("from").value || "Start"} to ${$("to").value || "End"}`
      : "All dates"
  }`;
  $("filter-species-info").hidden = !$("species").value;
  $("catch-count").textContent = visible.length;
  $("species-count").textContent = new Set(visible.map((c) => c.species_id)).size;
  $("day-count").textContent = new Set(visible.map((c) => dayKey(c.caught_at))).size;
  $("empty").hidden = !(desktopViews.matches ? selectedPages() : [selectedPages().at(-1)]).some((
    key,
  ) => (key === "totals" || (key === "map" && mapViewMode === "catches"))) || visible.length > 0;
  $("empty").textContent = catches.length
    ? "No catches match these filters."
    : "No catches yet. Save one on your watch and sync it to see it here.";
  if ($("from").value && $("to").value && $("from").value > $("to").value) {
    message("The start date must be before the end date.", true, "filter");
  } else if ($("status").dataset.kind === "filter") message("");
  renderTotals();
  renderTrips();
  if (!$("journal").hidden && !$("map-page").hidden) renderMap();
  if (!$("journal").hidden && !$("insights-page").hidden) renderInsights();
}

function durationLabel(seconds) {
  const whole = Math.max(0, Math.round(seconds));
  if (whole < 60) return `${whole}s`;
  const minutes = Math.floor(whole / 60);
  if (minutes < 60) return `${minutes}m`;
  return `${Math.floor(minutes / 60)}h${minutes % 60 ? ` ${minutes % 60}m` : ""}`;
}

function catchDistance(a, b) {
  if (
    ![a.latitude, a.longitude, b.latitude, b.longitude].every(Number.isFinite)
  ) return null;
  const radians = (value) => value * Math.PI / 180;
  const angle = Math.sin(radians(b.latitude - a.latitude) / 2) ** 2 +
    Math.cos(radians(a.latitude)) * Math.cos(radians(b.latitude)) *
      Math.sin(radians(b.longitude - a.longitude) / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(Math.min(1, Math.max(0, angle))));
}
function tripMetrics(t) {
  const total = Math.max(
    0,
    (new Date(t.ended_at) - new Date(t.started_at)) / 1000,
  );
  const segments = t.raw_payload?.activity_segments || [];
  const fishing = t.fishing_seconds ?? 0;
  const travelling = t.travelling_seconds ?? 0;
  const all = catches.filter((c) =>
    c.device_id === t.device_id && c.watch_trip_id === t.watch_trip_id &&
    recordFishingMode(c) === recordFishingMode(t)
  ).sort((a, b) =>
    new Date(a.caught_at) - new Date(b.caught_at) ||
    a.catch_id.localeCompare(b.catch_id, undefined, { numeric: true })
  );
  const selected = all.filter((c) => !$("species").value || c.species_id === $("species").value);
  const fishingCatches =
    selected.filter((c) =>
      segments.some((s) =>
        s.mode === "fishing" && new Date(c.caught_at) / 1000 >= s.started_at &&
        (new Date(c.caught_at) / 1000 < s.ended_at ||
          (s.ended_at === new Date(t.ended_at) / 1000 &&
            new Date(c.caught_at) / 1000 === s.ended_at))
      )
    ).length;
  let sessions = 0, lastFishingEnd = null, anglerHours = 0, lineHours = 0, knownEffort = true;
  const settings = [...(t.raw_payload?.effort_settings || [])].sort((a, b) => a.at - b.at);
  for (const segment of segments) {
    if (segment.mode !== "fishing" || segment.ended_at <= segment.started_at) continue;
    if (lastFishingEnd !== segment.started_at) sessions++;
    lastFishingEnd = segment.ended_at;
    const boundaries = [
      segment.started_at,
      ...settings.filter((e) => e.at > segment.started_at && e.at < segment.ended_at).map((e) =>
        e.at
      ),
      segment.ended_at,
    ];
    for (let i = 1; i < boundaries.length; i++) {
      const effort = settings.filter((e) => e.at <= boundaries[i - 1]).at(-1);
      if (!effort || !Number.isFinite(effort.anglers) || !Number.isFinite(effort.active_lines)) {
        knownEffort = false;
        continue;
      }
      const hours = (boundaries[i] - boundaries[i - 1]) / 3600;
      anglerHours += hours * effort.anglers;
      lineHours += hours * effort.active_lines;
    }
  }
  let distance = 0, validPairs = 0;
  for (let i = 1; i < all.length; i++) {
    const km = catchDistance(all[i - 1], all[i]);
    if (km !== null) {
      distance += km;
      validPairs++;
    }
  }
  return {
    total,
    fishing,
    travelling,
    unclassified: t.unclassified_seconds ??
      Math.max(0, total - fishing - travelling),
    count: selected.length,
    fishingCatches,
    sessions,
    automatic: t.raw_payload?.movement_algorithm === "watch-movement-v1",
    anglerRate: knownEffort && anglerHours > 0 ? fishingCatches / anglerHours : null,
    lineRate: knownEffort && lineHours > 0 ? fishingCatches / lineHours : null,
    rate: fishing > 0 ? fishingCatches / (fishing / 3600) : null,
    distance: validPairs ? distance : null,
    averageDistance: validPairs ? distance / validPairs : null,
  };
}
// Keep saved intervals and unknown gaps distinct; never infer fishing across a gap.
const tripReasonLabels = {
  gps_gap: "GPS signal / quality gap",
  app_resume_gap: "App restart / recording gap",
  app_inactive: "App stopped",
  pre_departure: "Waiting near the start",
  launch_return: "Returned near the start",
  intermediate_speed: "Between speed thresholds",
  segment_capacity: "Activity log full",
  legacy_trip_resume: "Older trip resumed",
};
function tripIntervals(t) {
  const start = Date.parse(t.started_at) / 1000, end = Date.parse(t.ended_at) / 1000;
  let cursor = start;
  const result = [];
  for (
    const s of [...(t.raw_payload?.activity_segments || [])].sort((a, b) =>
      a.started_at - b.started_at
    )
  ) {
    if (!Number.isFinite(s.started_at) || !Number.isFinite(s.ended_at)) continue;
    const a = Math.max(cursor, s.started_at), b = Math.min(end, s.ended_at);
    if (b <= a) continue;
    if (a > cursor) {
      result.push({
        mode: "unclassified",
        started_at: cursor,
        ended_at: a,
        reason: "missing_interval",
      });
    }
    result.push({
      ...s,
      started_at: a,
      ended_at: b,
      mode: ["fishing", "travelling"].includes(s.mode) ? s.mode : "unclassified",
    });
    cursor = b;
  }
  if (cursor < end) {
    result.push({
      mode: "unclassified",
      started_at: cursor,
      ended_at: end,
      reason: "missing_interval",
    });
  }
  return result;
}
function tripVisuals(t, m) {
  const intervals = tripIntervals(t), reasons = {};
  const label = (mode) =>
    mode === "fishing" ? "Fishing estimate" : mode === "travelling" ? "Travelling" : "Unclassified";
  const clock = (seconds) => timeLabel(new Date(seconds * 1000));
  const start = Date.parse(t.started_at) / 1000;
  const timeline = intervals.map((s) => {
    const title = `${clock(s.started_at)}–${clock(s.ended_at)} · ${label(s.mode)} · ${
      durationLabel(s.ended_at - s.started_at)
    } · ${tripReasonLabels[s.reason] || "Recorded interval"}`;
    if (s.mode === "unclassified") {
      reasons[s.reason || "unknown"] = (reasons[s.reason || "unknown"] || 0) + s.ended_at -
        s.started_at;
    }
    return `<button type="button" class="trip-band ${s.mode}" style="width:${
      m.total > 0 ? (s.ended_at - s.started_at) / m.total * 100 : 0
    }%" title="${esc(title)}" aria-label="${esc(title)}" aria-pressed="false" data-trip-interval="${
      esc(title)
    }"></button>`;
  }).join("");
  const bins = (t.raw_payload?.movement?.bins || []).filter((b) =>
    Array.isArray(b) && b.length === 10 && b.every(Number.isFinite) && b[6] > 0
  );
  const maxSpeed = Math.max(20, ...bins.map((b) => b[4] * .036));
  const x = (seconds) => 38 + seconds / Math.max(1, m.total) * 640;
  const y = (speed) => 112 - speed / maxSpeed * 90;
  const params = t.raw_payload?.movement_parameters;
  const speedChart = bins.length
    ? `<figure class="trip-speed"><figcaption>Speed <span class="muted">km/h</span></figcaption><svg viewBox="0 0 700 140" role="img" aria-label="GPS speed ranges over this trip. Blank areas have no saved speed samples.">
    ${
      [0, params?.slow_kmh, params?.fast_kmh].filter(Number.isFinite).map((v) =>
        `<path d="M38 ${y(v)}H678" class="speed-guide"/><text x="2" y="${y(v) + 4}">${v}</text>`
      ).join("")
    }
    ${
      bins.map((b) =>
        `<path class="speed-range" d="M${x((b[1] + b[2]) / 2)} ${y(b[3] * .036)}V${
          y(b[4] * .036)
        }"><title>${esc(clock(start + b[1]))}–${esc(clock(start + b[2]))}: ${
          (b[3] * .036).toFixed(1)
        }–${(b[4] * .036).toFixed(1)} km/h; ${
          b[6]
        } samples</title></path><circle class="speed-average" cx="${x((b[1] + b[2]) / 2)}" cy="${
          y(b[5] / b[6] * .036)
        }" r="3"/>`
      ).join("")
    }
    <text x="38" y="134">${
      esc(timeLabel(t.started_at))
    }</text><text x="678" y="134" text-anchor="end">${
      esc(timeLabel(t.ended_at))
    }</text><text x="678" y="15" text-anchor="end">Peak ${
      (Math.max(...bins.map((b) => b[4] * .036))).toFixed(1)
    } km/h</text></svg></figure>`
    : '<p class="small muted">No GPS speed history.</p>';
  const reasonList = Object.entries(reasons).sort((a, b) => b[1] - a[1]);
  const feedback = [];
  if (reasons.app_resume_gap || reasons.app_inactive) {
    feedback.push(
      "Recording was interrupted. Keep the watch app open for the whole trip; speed settings cannot recover time while it was stopped.",
    );
  }
  if (reasons.gps_gap) {
    feedback.push(
      "GPS gaps occurred. Outdoors, keep a clear view of the sky. If you know you are fishing, use Correct last activity on the updated watch build: your label holds for ten minutes even without GPS. Unobserved time stays unknown.",
    );
  }
  if (reasons.pre_departure || reasons.launch_return) {
    feedback.push("Time near the starting point is deliberately excluded from automatic fishing.");
  }
  if (m.automatic) {
    feedback.push(
      "Low speed is a fishing estimate: a car stop or time indoors can look similar. Use a watch activity correction when needed.",
    );
  }
  return `<div class="trip-visuals"><p class="trip-chart-title">Activity</p><div class="trip-timeline" role="group" aria-label="Activity timeline from ${
    esc(timeLabel(t.started_at))
  } to ${
    esc(timeLabel(t.ended_at))
  }; details follow below">${timeline}</div><p class="trip-selection" role="status"></p><div class="trip-time-axis"><span>${
    esc(timeLabel(t.started_at))
  }</span><span>${esc(timeLabel(t.ended_at))}</span></div>
    <dl class="trip-time-totals">${
    [["fishing", "Fishing estimate", m.fishing], ["travelling", "Travelling", m.travelling], [
      "unclassified",
      "Unclassified",
      m.unclassified,
    ]].map(([mode, name, value]) =>
      `<div><dt><i class="${mode}"></i>${name}</dt><dd>${durationLabel(value)} <small>${
        m.total ? Math.round(value / m.total * 100) : 0
      }%</small></dd></div>`
    ).join("")
  }</dl>
    <div class="trip-recording-health"><div><strong>${
    m.total ? Math.round((m.fishing + m.travelling) / m.total * 100) : 0
  }% classified</strong><span class="small muted">Recorded coverage</span></div><div class="trip-coverage-track"><span style="width:${
    Math.min(100, m.total ? (m.fishing + m.travelling) / m.total * 100 : 0)
  }%"></span></div>${
    reasonList.length
      ? `<p class="small">Largest gap: <strong>${
        esc(tripReasonLabels[reasonList[0][0]] || "No classification recorded")
      }</strong> · ${durationLabel(reasonList[0][1])}</p><div class="trip-reason-chart">${
        reasonList.map(([reason, seconds]) =>
          `<div><span>${
            esc(tripReasonLabels[reason] || "No classification recorded")
          }</span><span class="trip-reason-track"><i style="width:${
            seconds / Math.max(1, ...reasonList.map((r) => r[1])) * 100
          }%"></i></span><strong>${durationLabel(seconds)}</strong></div>`
        ).join("")
      }</div>`
      : '<p class="small">No unclassified intervals recorded.</p>'
  }</div>
    ${speedChart}<details class="trip-diagnostics"><summary>Recording feedback &amp; activity log</summary><p>${
    m.total ? Math.round((m.fishing + m.travelling) / m.total * 100) : 0
  }% of trip time classified. This measures classification coverage, not accuracy.</p>
    ${
    reasonList.length
      ? `<h4>Why time is unclassified</h4><dl class="trip-reasons">${
        reasonList.map(([reason, seconds]) =>
          `<div><dt>${esc(tripReasonLabels[reason] || "No classification recorded")}</dt><dd>${
            durationLabel(seconds)
          }</dd></div>`
        ).join("")
      }</dl>`
      : ""
  }
    ${feedback.map((text) => `<p class="small">${esc(text)}</p>`).join("")}
    ${
    params
      ? `<p class="small muted">Saved settings: below ${esc(params.slow_kmh)} km/h for ${
        esc(params.fishing_seconds)
      }s → fishing estimate; above ${esc(params.fast_kmh)} km/h for ${
        esc(params.travel_seconds)
      }s → travel. Sampling every ${esc(params.sample_seconds)}s; GPS gap limit ${
        esc(params.gap_seconds)
      }s. Median smoothing also delays transitions.</p>`
      : ""
  }
    <ol class="trip-activity-log">${
    intervals.map((s) =>
      `<li><span>${esc(clock(s.started_at))}–${esc(clock(s.ended_at))}</span><strong>${
        label(s.mode)
      }</strong><span>${durationLabel(s.ended_at - s.started_at)} · ${
        esc(
          tripReasonLabels[s.reason] ||
            (s.classification_source === "manual" ? "Watch correction" : "Recorded activity"),
        )
      }</span></li>`
    ).join("")
  }</ol></details></div>`;
}
$("trip-rows").addEventListener("click", (event) => {
  const button = event.target.closest("[data-trip-interval]");
  if (!button) return;
  const panel = button.closest(".trip-visuals");
  panel.querySelectorAll("[data-trip-interval]").forEach((b) =>
    b.setAttribute("aria-pressed", String(b === button))
  );
  panel.querySelector(".trip-selection").textContent = button.dataset.tripInterval;
});
let sessionSpotLabels = new Map();
function storedSessions(t) {
  return [...(t.fishing_sessions || [])].filter((s) => s.fishing_seconds > 0).sort((a, b) =>
    a.session_number - b.session_number
  );
}
function sessionCatchCount(s) {
  const selected = $("species").value;
  return selected ? Number(s.species_counts?.[selected] || 0) : Number(s.catch_count || 0);
}
function sessionRate(s) {
  return sessionCatchCount(s) * 3600 / s.fishing_seconds;
}
function sessionSpotLabel(s) {
  return s.spot_archive_id
    ? sessionSpotLabels.get(s.spot_archive_id) || "Recorded spot"
    : "Location unavailable";
}
function spotPosition(s) {
  const anchor = s.fishing_spots;
  return anchor && Number.isFinite(anchor.latitude) && Number.isFinite(anchor.longitude)
    ? anchor
    : s;
}
function mapSpotAttributes(s) {
  const p = spotPosition(s);
  return `data-map-lat="${p.latitude}" data-map-lon="${p.longitude}" data-map-label="${
    esc(sessionSpotLabel(s))
  }"`;
}
function spotCoordinatesHTML(s) {
  const p = spotPosition(s);
  if (!Number.isFinite(p.latitude) || !Number.isFinite(p.longitude)) return "";
  return `<button type="button" class="spot-coordinates" ${mapSpotAttributes(s)} aria-label="Open ${
    esc(sessionSpotLabel(s))
  } at ${p.latitude.toFixed(5)}, ${p.longitude.toFixed(5)} on map">${p.latitude.toFixed(5)}, ${
    p.longitude.toFixed(5)
  }</button>`;
}
function sessionLocationHTML(s) {
  const p = spotPosition(s);
  if (!Number.isFinite(p.latitude) || !Number.isFinite(p.longitude)) {
    return '<span class="muted">No location saved</span>';
  }
  return `<button type="button" class="location-action" ${
    mapSpotAttributes(s)
  }><span aria-hidden="true">⌖</span> View on map →</button>`;
}
let focusedSpot = null;
let spotLayer = null;
function openSpotOnMap(latitude, longitude, label) {
  if (
    !session || !Number.isFinite(latitude) || !Number.isFinite(longitude) ||
    Math.abs(latitude) > 90 || Math.abs(longitude) > 180
  ) return;
  setMapView("spots");
  focusedSpot = { latitude, longitude, label };
  const pages = desktopViews.matches ? selectedPages() : [];
  if (!pages.includes("map")) {
    if (pages.length === 2) pages.splice(0, 1);
    pages.push("map");
  }
  location.hash = pages.join(",");
  route();
  requestAnimationFrame(() => {
    if (!focusedSpot || !map) return;
    map.invalidateSize({ pan: false });
    if (spotLayer) map.removeLayer(spotLayer);
    spotLayer = L.circle([latitude, longitude], {
      radius: 20,
      color: "#285c4d",
      weight: 3,
      fillColor: "#285c4d",
      fillOpacity: .15,
    }).addTo(map);
    map.setView([latitude, longitude], 18, { animate: false });
    spotLayer.bindPopup(
      `<strong>${esc(label)}</strong><br>${latitude.toFixed(5)}, ${
        longitude.toFixed(5)
      }<br>20 m spot radius`,
    ).openPopup();
    $("map-page").scrollIntoView({ block: "start", behavior: "instant" });
  });
}
function sessionProductivityHTML(t) {
  const sessions = storedSessions(t);
  if (!sessions.length) {
    return '<section class="session-productivity"><h4>Fishing sessions</h4><p class="small muted">No recorded fishing sessions.</p></section>';
  }
  const highest = Math.max(1, ...sessions.map(sessionRate));
  return `<section class="session-productivity"><div class="session-section-heading"><h4>Sessions</h4><span class="small muted">${sessions.length} sessions</span></div><div class="session-cards">${
    sessions.map((s) => {
      const count = sessionCatchCount(s), rate = sessionRate(s);
      const entries = Object.entries(s.species_counts || {}).filter(([id]) =>
        !$("species").value || id === $("species").value
      );
      return `<article class="session-card"><header><div><h5>Session ${s.session_number}</h5><span class="small muted">${
        esc(timeLabel(s.started_at))
      }–${esc(timeLabel(s.ended_at))} · ${
        durationLabel(s.fishing_seconds)
      }</span></div><span class="session-spot-label">${
        esc(sessionSpotLabel(s))
      }</span></header><div class="session-rate"><strong>${
        rate.toFixed(1)
      }</strong><span>catches / hour</span><b>${count} ${
        count === 1 ? "catch" : "catches"
      }</b></div><div class="session-rate-track" aria-hidden="true"><i style="width:${
        rate / highest * 100
      }%"></i></div><p class="small session-species">${
        entries.length
          ? entries.map(([id, n]) => `${esc(species[id]?.[0] || id)} × ${n}`).join(" · ")
          : "No catches"
      }</p><div class="session-location">${sessionLocationHTML(s)}</div>${
        s.angler_seconds > 0 || s.line_seconds > 0 || s.no_bite_count
          ? `<details class="session-extra"><summary>Effort</summary><p class="small muted session-effort">${
            s.angler_seconds > 0
              ? (count * 3600 / s.angler_seconds).toFixed(1) + " / angler-hour"
              : "Angler effort unavailable"
          } · ${
            s.line_seconds > 0
              ? (count * 3600 / s.line_seconds).toFixed(1) + " / line-hour"
              : "Line effort unavailable"
          }${
            s.no_bite_count ? " · " + s.no_bite_count + " no-bite observations (not catches)" : ""
          }</p></details>`
          : ""
      }</article>`;
    }).join("")
  }</div></section>`;
}
// The cover reflects real catches in the current spot/date/species selection.
function leadingSpotSpecies(counts) {
  return Object.entries(counts || {}).filter(([id, count]) =>
    Object.hasOwn(species, id) && Number.isFinite(count) && count > 0
  )
    .sort(([a, ac], [b, bc]) =>
      bc - ac || species[a][0].localeCompare(species[b][0]) || a.localeCompare(b)
    );
}
function spotCoverHTML(counts) {
  const leaders = leadingSpotSpecies(counts);
  if (!leaders.length) {
    return `<div class="spot-cover" aria-hidden="true"><svg viewBox="0 0 300 120"><path d="M0 92q20-9 40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0M0 105q20-7 40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0M0 76l45-34 30 22 38-49 49 52 27-25 47 34 64-19M71 64l13-10 13 5M113 15l-8 23 16-4 13 12M235 76l20-9M225 23a9 9 0 1 0 18 0 9 9 0 1 0-18 0"/></svg></div>`;
  }
  const [id, count] = leaders[0];
  const tied = leaders.length > 1 && leaders[1][1] === count;
  const extension = fishPreviews[id]?.endsWith(".png") ? "png" : "jpg";
  return `<div class="spot-cover spot-cover-fish"><button type="button" class="spot-fish-link" data-profile="${
    esc(id)
  }" aria-label="Read about ${esc(species[id][0])}"><img class="spot-fish" src="fish/mobile/${
    esc(id)
  }.${extension}" alt="${
    esc(species[id][0])
  } illustration" width="640" height="240" loading="lazy"><span class="spot-fish-caption">${
    tied ? "Joint most caught" : "Most caught"
  } · ${esc(species[id][0])}</span></button></div>`;
}
function collectSpotProductivity(rows) {
  const spots = new Map();
  let unlocated = 0;
  for (const { trip } of rows) {
    for (const s of storedSessions(trip)) {
      if (!s.spot_archive_id) {
        unlocated++;
        continue;
      }
      if (!spots.has(s.spot_archive_id)) {
        spots.set(s.spot_archive_id, {
          session: s,
          count: 0,
          seconds: 0,
          sessions: 0,
          anglerSeconds: 0,
          lineSeconds: 0,
          knownAnglers: true,
          knownLines: true,
          lastVisit: s.ended_at || s.started_at,
          speciesCounts: {},
        });
      }
      const spot = spots.get(s.spot_archive_id);
      spot.count += sessionCatchCount(s);
      for (const [id, count] of Object.entries(s.species_counts || {})) {
        if (
          Object.hasOwn(species, id) && Number.isFinite(count) && count > 0 &&
          (!$("species").value || $("species").value === id)
        ) {
          spot.speciesCounts[id] = (spot.speciesCounts[id] || 0) + count;
        }
      }
      spot.seconds += s.fishing_seconds;
      spot.sessions++;
      const visit = s.ended_at || s.started_at;
      if (Date.parse(visit) > Date.parse(spot.lastVisit)) spot.lastVisit = visit;
      if (s.angler_seconds === null || s.angler_seconds === undefined) spot.knownAnglers = false;
      else spot.anglerSeconds += s.angler_seconds;
      if (s.line_seconds === null || s.line_seconds === undefined) spot.knownLines = false;
      else spot.lineSeconds += s.line_seconds;
    }
  }
  const ranked = [...spots.values()].sort((a, b) =>
    b.count / b.seconds - a.count / a.seconds || b.seconds - a.seconds
  );
  return { ranked, unlocated };
}
function showSpotRename(id) {
  if (!session) return;
  const saved = trips.flatMap(storedSessions).find((s) => s.spot_archive_id === id)?.fishing_spots;
  if (!saved) return;
  const owner = session.user.id, generation = ++conditionsGeneration;
  $("detail-label").textContent = "Rename spot";
  $("details").dataset.view = "spot-name";
  $("detail-body").innerHTML =
    `<form id="spot-name-form" class="spot-name-form"><label for="spot-name">Spot name</label><input id="spot-name" name="name" type="text" maxlength="80" autocomplete="off" value="${
      esc(saved.name || "")
    }" placeholder="${
      esc(sessionSpotLabels.get(id))
    }"><p class="small muted">Leave blank to use the original spot number.</p><div class="spot-name-actions"><button type="submit">Save name</button><button type="button" class="quiet" id="cancel-spot-name">Cancel</button></div><p id="spot-name-status" class="small" role="status"></p></form>`;
  if (!$("details").open) $("details").showModal();
  $("details").scrollTop = 0;
  const form = $("spot-name-form"), input = $("spot-name"), status = $("spot-name-status");
  const current = () =>
    generation === conditionsGeneration && session?.user.id === owner && form.isConnected &&
    $("details").open;
  $("cancel-spot-name").onclick = () => $("details").close();
  input.focus();
  form.onsubmit = async (event) => {
    event.preventDefault();
    if (!current() || form.dataset.saving) return;
    const name = input.value.trim() || null;
    if (name && [...name].length > 80) {
      status.textContent = "Use 80 characters or fewer.";
      return;
    }
    form.dataset.saving = "true";
    form.querySelector('[type="submit"]').disabled = true;
    status.textContent = "Saving…";
    try {
      const { data, error } = await client.from("fishing_spots").update({ name }).eq(
        "archive_id",
        id,
      ).eq("owner_id", owner).select("archive_id,name").single();
      if (error || !data || data.archive_id !== id) throw Error("save failed");
      if (session?.user.id !== owner) return;
      for (const trip of trips) {
        for (const s of storedSessions(trip)) {
          if (s.spot_archive_id === id && s.fishing_spots) s.fishing_spots.name = data.name;
        }
      }
      if (
        focusedSpot && focusedSpot.latitude === saved.latitude &&
        focusedSpot.longitude === saved.longitude
      ) {
        if (spotLayer) {
          map.removeLayer(spotLayer);
          spotLayer = null;
        }
        focusedSpot = null;
      }
      render();
      if (current()) $("details").close();
    } catch {
      if (current()) status.textContent = "Could not save the name. Please try again.";
    } finally {
      if (current()) {
        delete form.dataset.saving;
        form.querySelector('[type="submit"]').disabled = false;
      }
    }
  };
}
document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-rename-spot]");
  if (button) showSpotRename(button.dataset.renameSpot);
});
document.addEventListener("contextmenu", (event) => {
  const title = event.target.closest(".spot-title");
  if (!title || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  const card = title.closest("[data-spot-id]");
  if (!card || !session) return;
  event.preventDefault();
  showSpotRename(card.dataset.spotId);
});
function renderSpotProductivity(rows) {
  const expanded = disclosureState($("spot-productivity"));
  const { ranked, unlocated } = collectSpotProductivity(rows);
  const maximum = Math.max(1, ...ranked.map((s) => s.count * 3600 / s.seconds));
  $("spot-productivity").innerHTML =
    `<p class="small muted spot-list-note">Ranked by catches per fishing hour · includes zero-catch sessions</p>${
      ranked.length
        ? `<div class="spot-productivity-list">${
          ranked.map((spot) =>
            `<article class="spot-productivity-card" data-spot-id="${
              esc(spot.session.spot_archive_id)
            }">${
              spotCoverHTML(spot.speciesCounts)
            }<div><button type="button" class="spot-title" title="View on map · Right-click to rename" ${
              mapSpotAttributes(spot.session)
            }>${esc(sessionSpotLabel(spot.session))}</button>${
              spotCoordinatesHTML(spot.session)
            }</div><div class="spot-productivity-rate"><strong>${
              (spot.count * 3600 / spot.seconds).toFixed(1)
            }</strong><span>catches / fishing hour</span><span class="spot-last-visit">Last visit ${
              esc(dateLabel(spot.lastVisit))
            }</span></div><details class="spot-details" data-disclosure="spot:${
              esc(spot.session.spot_archive_id)
            }"><summary>Spot details</summary><div class="spot-detail-content"><p class="spot-effort-summary">${spot.sessions} ${
              spot.sessions === 1 ? "session" : "sessions"
            } · ${durationLabel(spot.seconds)} fishing · ${spot.count} ${
              spot.count === 1 ? "catch" : "catches"
            }</p><button type="button" class="quiet spot-rename-touch" data-rename-spot="${
              esc(spot.session.spot_archive_id)
            }">Rename spot</button><dl class="spot-species-counts">${
              leadingSpotSpecies(spot.speciesCounts).map(([id, count]) =>
                `<div><dt><button type="button" class="fish-name-link" data-profile="${esc(id)}">${
                  esc(species[id][0])
                }</button></dt><dd>${count} ${count === 1 ? "catch" : "catches"}</dd></div>`
              ).join("")
            }</dl><div class="session-rate-track"><i style="width:${
              spot.count * 3600 / spot.seconds / maximum * 100
            }%"></i></div><div class="session-location">${sessionLocationHTML(spot.session)}</div>${
              (spot.knownAnglers && spot.anglerSeconds > 0) ||
                (spot.knownLines && spot.lineSeconds > 0)
                ? `<details class="spot-extra"><summary>Effort</summary><p class="small muted">${
                  spot.knownAnglers && spot.anglerSeconds > 0
                    ? (spot.count * 3600 / spot.anglerSeconds).toFixed(1) + " / angler-hour"
                    : "Angler effort unavailable"
                } · ${
                  spot.knownLines && spot.lineSeconds > 0
                    ? (spot.count * 3600 / spot.lineSeconds).toFixed(1) + " / line-hour"
                    : "Line effort unavailable"
                }</p></details>`
                : ""
            }</div></details></article>`
          ).join("")
        }</div>`
        : '<p class="small muted">No located fishing sessions match these dates and fishing style.</p>'
    }${
      unlocated
        ? `<p class="small muted">${unlocated} session${
          unlocated === 1 ? "" : "s"
        } without a location remain in the trip records and are excluded from spot rates.</p>`
        : ""
    }`;
  restoreDisclosures($("spot-productivity"), expanded);
}
function disclosureState(container) {
  return new Map(
    [...container.querySelectorAll("details[data-disclosure]")].map(
      (d) => [d.dataset.disclosure, d.open],
    ),
  );
}
function restoreDisclosures(container, state) {
  container.querySelectorAll("details[data-disclosure]").forEach((d) => {
    if (state.has(d.dataset.disclosure)) d.open = state.get(d.dataset.disclosure);
  });
}
function tripCardHTML(t, m) {
  const key = t.archive_id || t.device_id + ":" + t.watch_trip_id;
  const sessions = storedSessions(t);
  return `<tr><td colspan="8"><article class="trip-card"><details class="trip-record" data-disclosure="${
    esc(key)
  }:card"><summary class="trip-card-summary"><span><strong>${
    esc(dateLabel(t.started_at))
  }</strong><span class="small muted">${esc(fishingModeLabels[recordFishingMode(t)])} · ${
    esc(timeLabel(t.started_at))
  }–${esc(timeLabel(t.ended_at))}</span></span><span class="record-metrics"><span><b>${
    m.rate === null ? "—" : m.rate.toFixed(1)
  }</b> catches / fishing hour</span><span><b>${
    durationLabel(m.fishing)
  }</b> fishing</span></span></summary><p class="record-total"><strong>${
    durationLabel(m.total)
  }</strong> total trip</p>
    <dl class="trip-at-a-glance"><div><dt>Fishing estimate</dt><dd>${
    durationLabel(m.fishing)
  }</dd></div><div><dt>Travelling</dt><dd>${
    durationLabel(m.travelling)
  }</dd></div><div><dt>Unclassified</dt><dd>${
    durationLabel(m.unclassified)
  }</dd></div><div><dt>Catches / fishing hour</dt><dd>${
    m.rate === null ? "—" : m.rate.toFixed(1)
  }</dd></div></dl>
    <div class="trip-time-strip" role="img" aria-label="Fishing ${
    esc(durationLabel(m.fishing))
  }, travelling ${esc(durationLabel(m.travelling))}, unclassified ${
    esc(durationLabel(m.unclassified))
  }">${
    [["fishing", m.fishing], ["travelling", m.travelling], ["unclassified", m.unclassified]].map((
      [mode, value],
    ) => `<span class="${mode}" style="width:${m.total > 0 ? value / m.total * 100 : 0}%"></span>`)
      .join("")
  }</div>
    <div class="trip-time-key" aria-hidden="true">${
    [["fishing", "Fishing", m.fishing], ["travelling", "Travelling", m.travelling], [
      "unclassified",
      "Unclassified",
      m.unclassified,
    ]].map(([mode, name, value]) =>
      `<span><i class="${mode}"></i>${name} <b>${
        m.total ? Math.round(value / m.total * 100) : 0
      }%</b></span>`
    ).join("")
  }</div>
    <div class="trip-outcomes"><span><strong>${m.count}</strong> catches</span><span><strong>${m.sessions}</strong> sessions</span></div>
    <details class="trip-disclosure" data-disclosure="${
    esc(key)
  }:sessions"><summary><span>Fishing sessions</span><span class="disclosure-count">${sessions.length} saved</span></summary>${
    sessionProductivityHTML(t)
  }</details>
    <details class="trip-disclosure" data-disclosure="${
    esc(key)
  }:recording"><summary><span>Activity timeline &amp; GPS</span><span class="disclosure-count">${
    m.total ? Math.round((m.fishing + m.travelling) / m.total * 100) : 0
  }% classified</span></summary><div class="recording-extra"><div class="trip-outcomes"><span><strong>${m.count}</strong> catches</span><span><strong>${m.sessions}</strong> fishing sessions</span>${
    m.anglerRate === null ? "" : `<span>${m.anglerRate.toFixed(1)} / angler-hour</span>`
  }${m.lineRate === null ? "" : `<span>${m.lineRate.toFixed(1)} / line-hour</span>`}<span>${
    m.distance === null
      ? "No catch distance"
      : m.distance.toFixed(2) + " km between catches · " + m.averageDistance.toFixed(2) +
        " km average"
  }</span></div></div>${
    tripVisuals(t, m).replace(
      '<details class="trip-diagnostics">',
      `<details class="trip-diagnostics" data-disclosure="${esc(key)}:feedback">`,
    )
  }</details>
  </details></article></td></tr>`;
}
function renderTrips() {
  const expanded = disclosureState($("trip-rows"));
  const summaryExpanded = disclosureState($("trip-summary"));
  const locations = new Map();
  for (const trip of trips) {
    for (const s of storedSessions(trip)) {
      if (s.spot_archive_id) {
        const spot = s.fishing_spots;
        locations.set(s.spot_archive_id, {
          id: s.spot_archive_id,
          created: spot?.created_at || s.started_at,
          name: spot?.name,
        });
      }
    }
  }
  sessionSpotLabels = new Map(
    [...locations.values()].sort((a, b) =>
      a.created.localeCompare(b.created) || a.id.localeCompare(b.id)
    ).map((s, i) => [s.id, s.name || "Spot " + (i + 1)]),
  );
  const eligible = diaryTripRows(false);
  const rows = eligible.filter(({ metrics }) => !$("species").value || metrics.count > 0);
  renderSpotProductivity(eligible);
  const totals = rows.reduce(
    (sum, { metrics: m }) => ({
      total: sum.total + m.total,
      fishing: sum.fishing + m.fishing,
      travelling: sum.travelling + m.travelling,
      count: sum.count + m.count,
      sessions: sum.sessions + m.sessions,
      unknown: sum.unknown + m.unclassified,
    }),
    { total: 0, fishing: 0, travelling: 0, count: 0, sessions: 0, unknown: 0 },
  );
  const headline = [["Trips", rows.length], ["Fishing effort", durationLabel(totals.fishing)], [
    "Travelling",
    durationLabel(totals.travelling),
  ], ["Catches", totals.count]];
  const remaining = [["Total trip time", durationLabel(totals.total)], [
    "Fishing sessions",
    totals.sessions,
  ], ["Unclassified time", durationLabel(totals.unknown)]];
  $("trip-summary").innerHTML = `<div class="trip-summary-main">${
    headline.map(([label, value]) => `<div><span>${label}</span><strong>${value}</strong></div>`)
      .join("")
  }</div><details class="trip-summary-more" data-disclosure="trip-totals"><summary>Full trip totals <span>${
    durationLabel(totals.unknown)
  } unclassified</span></summary><dl>${
    remaining.map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join("")
  }</dl></details>`;
  restoreDisclosures($("trip-summary"), summaryExpanded);
  renderDays(rows);
  restoreDisclosures($("trip-rows"), expanded);
}
let mapViewMode = "catches";
let mapSummaryLayer = null;
let densityLayer = null;
let densityRadius = 500;
let densityModel = null;
function densityRadiusLabel(radius) {
  return radius >= 1000
    ? `${(radius / 1000).toFixed(radius % 1000 ? 1 : 0)} km`
    : `${Math.round(radius)} m`;
}
function makeDensityLayer(getModel = () => densityModel) {
  return new (L.Layer.extend({
    onAdd(target) {
      this.canvas = L.DomUtil.create("canvas", "species-density-canvas");
      this.canvas.setAttribute("aria-hidden", "true");
      target.getPane("overlayPane").prepend(this.canvas);
      this.draw = () => {
        if (this.frame) cancelAnimationFrame(this.frame);
        this.frame = requestAnimationFrame(() => {
          this.frame = null;
          this.paint(target);
        });
      };
      this.hide = () => {
        this.canvas.hidden = true;
      };
      target.on("moveend zoomend resize", this.draw);
      target.on("zoomstart", this.hide);
      this.draw();
    },
    onRemove(target) {
      target.off("moveend zoomend resize", this.draw);
      target.off("zoomstart", this.hide);
      if (this.frame) cancelAnimationFrame(this.frame);
      this.canvas.remove();
    },
    paint(target) {
      const model = getModel();
      if (!model || !this.canvas.isConnected) return;
      const size = target.getSize(), cell = Math.max(1, Math.sqrt(size.x * size.y / 240000));
      const width = Math.max(1, Math.ceil(size.x / cell)),
        height = Math.max(1, Math.ceil(size.y / cell));
      const zoom = target.getZoom(), centre = target.getCenter().lng;
      const points = model.points.map((p) => {
        const lng = p.longitude + 360 * Math.round((centre - p.longitude) / 360);
        const xy = target.latLngToContainerPoint([p.latitude, lng]);
        const metresPerPixel = 2 * Math.PI * 6371008.8 *
          Math.cos(Math.min(85, Math.abs(p.latitude)) * Math.PI / 180) / (256 * 2 ** zoom);
        return {
          x: xy.x / cell,
          y: xy.y / cell,
          sigma: model.radius / metresPerPixel / cell,
          weight: p.weight,
        };
      });
      const grid = document.createElement("canvas");
      grid.width = width;
      grid.height = height;
      const context = grid.getContext("2d");
      context.putImageData(
        new ImageData(
          FishingDensity.raster(points, width, height, model.peak),
          width,
          height,
        ),
        0,
        0,
      );
      const ratio = Math.min(2, window.devicePixelRatio || 1);
      this.canvas.width = Math.max(1, Math.round(size.x * ratio));
      this.canvas.height = Math.max(1, Math.round(size.y * ratio));
      this.canvas.style.width = `${size.x}px`;
      this.canvas.style.height = `${size.y}px`;
      L.DomUtil.setPosition(this.canvas, target.containerPointToLayerPoint([0, 0]));
      this.canvas.getContext("2d").drawImage(grid, 0, 0, this.canvas.width, this.canvas.height);
      this.canvas.hidden = false;
    },
  }))();
}
function renderSpeciesDensity() {
  const id = $("species").value;
  const selected = uniqueRecords(visible).filter((c) => !id || c.species_id === id);
  const points = FishingDensity.locations(selected);
  const count = points.reduce((sum, p) => sum + p.weight, 0), excluded = selected.length - count;
  const automatic = FishingDensity.bandwidth(points), radius = densityRadius || automatic;
  $("density-radius-label").textContent = (densityRadius ? "" : "Auto · ") +
    densityRadiusLabel(radius);
  $("density-radius").value = String(
    Math.max(0, Math.min(100, Math.log(radius / 25) / Math.log(2000) * 100)),
  );
  $("density-auto").disabled = densityRadius === null;
  const signature = JSON.stringify([
    "species",
    id,
    radius,
    $("density-enabled").checked,
    selected.map((c) => [c.archive_id || c.catch_id, c.latitude, c.longitude]),
  ]);
  if (signature === mapSignature) return;
  mapSignature = signature;
  map.closePopup();
  mapSummaryLayer.clearLayers();
  if (densityLayer) {
    map.removeLayer(densityLayer);
    densityLayer = null;
  }
  densityModel = points.length
    ? { points, radius, peak: FishingDensity.peak(points, radius) }
    : null;
  const dates = new Set(
    selected.filter((c) => Number.isFinite(c.latitude) && Number.isFinite(c.longitude)).map((c) =>
      dayKey(c.caught_at)
    ),
  ).size;
  const limited = count < 20 || points.length < 5 || dates < 3;
  $("map-view-summary").textContent = `${id ? species[id][0] : "All fish"} · ${count} located ${
    count === 1 ? "catch" : "catches"
  }${excluded ? ` · ${excluded} without usable coordinates` : ""}${
    count && limited ? " · Limited data" : ""
  }${!count ? " · No located catches for these filters" : ""}`;
  for (const c of selected) {
    if (!FishingDensity.locations([c]).length) continue;
    const marker = L.circleMarker([c.latitude, c.longitude], {
      radius: $("density-enabled").checked ? 1.25 : 3,
      opacity: $("density-enabled").checked ? .3 : 1,
      color: "#344e47",
      weight: 1,
      fillColor: "#fffaf0",
      fillOpacity: $("density-enabled").checked ? .15 : .7,
    });
    marker.bindTooltip(esc(`${nameOf(c)} · ${dateLabel(c.caught_at)}`));
    marker.on("click", () => showDetail(c));
    mapSummaryLayer.addLayer(marker);
  }
  if (count && $("density-enabled").checked) {
    densityLayer = makeDensityLayer();
    map.addLayer(densityLayer);
  }
  $("legend").innerHTML = `${
    count && $("density-enabled").checked
      ? '<div class="density-scale"><span>Lower</span><i></i><span>Higher concentration</span></div>'
      : count
      ? "<span>Density overlay hidden · dots mark catches</span>"
      : "<span>No density to estimate for this selection.</span>"
  }<details class="density-method"><summary>About this estimate</summary><p>Gaussian smoothing of recorded ${
    esc(id ? species[id][0] : "all-species")
  } catches using a ${
    densityRadiusLabel(radius)
  } bandwidth. Each catch has equal weight. Colours compare concentration within this filtered selection; they are not catch probabilities or confidence levels and are not adjusted for fishing effort.</p><p>With few catches, locations or fishing days, patterns are preliminary. Smoothing can extend onto land; no habitat or coast mask is applied. ${
    points.length === 1
      ? "A single location uses a 250 m automatic starting radius."
      : "Automatic smoothing combines a Scott-style estimate with local spacing, bounded to 50 m–25 km."
  }</p></details>`;
}
$("density-species").addEventListener("change", () => {
  $("species").value = $("density-species").value;
  render();
  fitMap();
});
$("density-enabled").addEventListener("change", () => renderMap());
$("density-radius").addEventListener("input", () => {
  densityRadius = Math.round(25 * 2000 ** (Number($("density-radius").value) / 100));
  renderMap();
});
$("density-auto").addEventListener("click", () => {
  densityRadius = null;
  renderMap();
});

function updateMapControls() {
  document.querySelectorAll("[data-map-view]").forEach((button) =>
    button.setAttribute("aria-pressed", String(button.dataset.mapView === mapViewMode))
  );
  $("density-controls").hidden = mapViewMode !== "species";
  if ($("density-species").dataset.options !== $("species").innerHTML) {
    $("density-species").innerHTML = $("species").innerHTML;
    $("density-species").dataset.options = $("species").innerHTML;
  }
  $("density-species").value = $("species").value;
  if ($("density-species").options.length) {
    $("density-species").options[0].textContent = "All fish";
  }
  $("fit").textContent = mapViewMode === "species"
    ? "Fit catches"
    : "Fit " + mapViewMode;
  if (selectedPages().includes("map") && !selectedPages().includes("totals")) {
    $("empty").hidden = mapViewMode !== "catches" || visible.length > 0;
  }
  $("map").setAttribute(
    "aria-label",
    {
      catches: "Map of catch locations",
      spots: "Map of saved fishing spots",
      days: "Map of fishing days",
      species: "Species catch density map",
    }[mapViewMode],
  );
}
function setMapView(mode, fit = false) {
  if (!["catches", "spots", "days", "species"].includes(mode)) return;
  if (mode !== mapViewMode && spotLayer && map) {
    map.removeLayer(spotLayer);
    spotLayer = null;
    focusedSpot = null;
  }
  mapViewMode = mode;
  updateMapControls();
  if (session && !$("journal").hidden && !$("map-page").hidden) renderMap();
  if (fit) fitMap();
  if (mode !== "catches" && !selectedPages().includes("totals")) $("empty").hidden = true;
}
function renderMap() {
  initMap();
  if (!markers) return;
  updateMapControls();
  if (mapViewMode !== "species" && densityLayer) {
    map.removeLayer(densityLayer);
    densityLayer = null;
    densityModel = null;
  }
  if (mapViewMode === "catches") {
    if (mapSummaryLayer) map.removeLayer(mapSummaryLayer);
    if (!map.hasLayer(markers)) map.addLayer(markers);
    renderCatchMap();
  } else {
    map.removeLayer(markers);
    if (!mapSummaryLayer) mapSummaryLayer = L.featureGroup();
    if (!map.hasLayer(mapSummaryLayer)) map.addLayer(mapSummaryLayer);
    if (mapViewMode === "species") renderSpeciesDensity();
    else renderMapGroups();
  }
}
function renderMapGroups() {
  let entries;
  if (mapViewMode === "spots") {
    entries = collectSpotProductivity(diaryTripRows(false)).ranked.map((spot) => {
      const position = spotPosition(spot.session);
      return {
        id: spot.session.spot_archive_id,
        label: sessionSpotLabel(spot.session),
        latitude: position.latitude,
        longitude: position.longitude,
        spot,
      };
    }).filter((entry) => Number.isFinite(entry.latitude) && Number.isFinite(entry.longitude));
  } else {
    const days = new Map();
    for (const c of uniqueRecords(visible)) {
      if (!Number.isFinite(c.latitude) || !Number.isFinite(c.longitude)) continue;
      const day = dayKey(c.caught_at);
      if (!days.has(day)) days.set(day, []);
      days.get(day).push(c);
    }
    entries = [...days].sort(([a], [b]) => b.localeCompare(a)).map(([day, records]) => {
      records.sort((a, b) => Date.parse(a.caught_at) - Date.parse(b.caught_at));
      return {
        id: day,
        label: dateLabel(records[0].caught_at),
        latitude: records[0].latitude,
        longitude: records[0].longitude,
        records,
      };
    });
  }
  $("map-view-summary").textContent = mapViewMode === "spots"
    ? `${entries.length} saved ${
      entries.length === 1 ? "spot" : "spots"
    } · names match the Spots page`
    : `${entries.length} ${entries.length === 1 ? "day" : "days"} · each pin marks its first catch`;
  if (
    mapViewMode === "spots" && focusedSpot &&
    !entries.some((entry) =>
      entry.latitude === focusedSpot.latitude && entry.longitude === focusedSpot.longitude
    )
  ) {
    if (spotLayer) map.removeLayer(spotLayer);
    spotLayer = null;
    focusedSpot = null;
  }
  const signature = JSON.stringify([mapViewMode, entries]);
  if (signature === mapSignature) return;
  mapSignature = signature;
  map.closePopup();
  mapSummaryLayer.clearLayers();
  for (const entry of entries) {
    const colour = entry.records ? (dayPalette.get(entry.id) || "#456b60") : "#456b60";
    const icon = L.divIcon({
      className: `map-summary-pin map-${mapViewMode}-pin`,
      html: entry.records
        ? '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="6" width="16" height="15" rx="2"/><path d="M8 3v6m8-6v6M4 11h16"/></svg>'
        : "",
      iconSize: entry.records ? [26, 26] : [18, 18],
      iconAnchor: entry.records ? [13, 13] : [9, 9],
    });
    const marker = L.marker([entry.latitude, entry.longitude], {
      title: entry.label,
      alt: entry.label,
      icon,
      keyboard: true,
    });
    marker.mapEntry = entry;
    marker.bindTooltip(esc(entry.label), {
      permanent: true,
      direction: "top",
      offset: [0, -12],
      className: "map-entry-label",
    });
    if (entry.spot) {
      const spot = entry.spot;
      marker.bindPopup(
        `<strong>${esc(entry.label)}</strong><p>${spot.count} ${
          spot.count === 1 ? "catch" : "catches"
        } · ${durationLabel(spot.seconds)} fishing<br>${entry.latitude.toFixed(5)}, ${
          entry.longitude.toFixed(5)
        }<br>20 m spot radius</p><button type="button" class="quiet" data-spot-card="${
          esc(entry.id)
        }">Open spot details</button>`,
      );
    } else {
      marker.bindPopup(
        `<strong>${esc(entry.label)}</strong><p>${entry.records.length} ${
          entry.records.length === 1 ? "catch" : "catches"
        }<br>Pin at the first catch location.</p><button type="button" class="quiet" data-map-day="${
          esc(entry.id)
        }">Show this day’s catches</button>`,
      );
    }
    marker.on("add", () => marker.getElement()?.style.setProperty("--map-pin-colour", colour));
    mapSummaryLayer.addLayer(marker);
  }
  $("legend").innerHTML =
    entries.map((entry) =>
      entry.spot
        ? `<button type="button" class="fish-name-link" ${mapSpotAttributes(entry.spot.session)}>${
          esc(entry.label)
        }</button>`
        : `<button type="button" class="fish-name-link" data-map-day="${esc(entry.id)}">${
          esc(entry.label)
        }</button>`
    ).join("") || "<span>No matching locations.</span>";
}
function openSpotCard(id) {
  const pages = desktopViews.matches ? selectedPages().filter((key) => key !== "spots") : [];
  location.hash = [...pages.slice(-1), "spots"].join(",");
  route();
  requestAnimationFrame(() => {
    const card = [...document.querySelectorAll("[data-spot-id]")].find((node) =>
      node.dataset.spotId === id
    );
    if (!card) return;
    document.querySelectorAll(".spot-map-selected").forEach((node) =>
      node.classList.remove("spot-map-selected")
    );
    card.classList.add("spot-map-selected");
    card.querySelector(".spot-details").open = true;
    card.scrollIntoView({ block: "center", behavior: "instant" });
  });
}
document.querySelectorAll("[data-map-view]").forEach((button) =>
  button.addEventListener("click", () => setMapView(button.dataset.mapView, true))
);
document.addEventListener("click", (event) => {
  const spot = event.target.closest("[data-spot-card]");
  if (spot) {
    openSpotCard(spot.dataset.spotCard);
    return;
  }
  const day = event.target.closest("[data-map-day]");
  if (day) {
    $("from").value = day.dataset.mapDay;
    $("to").value = day.dataset.mapDay;
    render();
    setMapView("catches", true);
  }
});
function initMap() {
  if (map || $("map-page").hidden) return;
  if (!window.L || !L.markerClusterGroup) {
    $("map").textContent =
      "The map could not load. Your catches are still available in Species and Days.";
    return;
  }
  map = L.map("map", {
    doubleClickZoom: true,
    scrollWheelZoom: false,
    inertia: false,
    zoomAnimation: !matchMedia("(prefers-reduced-motion: reduce)").matches,
    zoomSnap: 0,
    zoomDelta: .5,
    fadeAnimation: !matchMedia("(prefers-reduced-motion: reduce)").matches,
    markerZoomAnimation: false,
    bounceAtZoomLimits: false,
    touchZoom: true,
  }).setView([-34.08, 22.97], 8);
  limitMapToSouthAfrica(map);
  setupMapGestures(map);
  const osmCredit =
    '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
  const tileStatus = document.createElement("div");
  tileStatus.className = "map-loading";
  tileStatus.setAttribute("role", "status");
  tileStatus.textContent = "Loading map…";
  tileStatus.hidden = true;
  map.getContainer().append(tileStatus);
  let tileTimer;
  const tiles = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    noWrap: true,
    attribution: osmCredit,
  });
  tiles.on("loading", () => {
    clearTimeout(tileTimer);
    tileStatus.hidden = false;
    tileTimer = setTimeout(() => {
      tileStatus.hidden = true;
    }, 12000);
  });
  tiles.on("load", () => {
    clearTimeout(tileTimer);
    tileStatus.hidden = true;
  });
  map.on("unload", () => clearTimeout(tileTimer));
  tiles.addTo(map);
  L.control.scale({ imperial: false, position: "bottomleft" }).addTo(map);
  markers = L.markerClusterGroup({
    maxClusterRadius: 40,
    spiderfyOnMaxZoom: true,
    spiderfyOnEveryZoom: true,
    animate: false,
    zoomToBoundsOnClick: false,
    showCoverageOnHover: false,
  }).addTo(map);
  map.on("zoomend", updateLabels);
}
function updateLabels() {
  if (!map || !markers || mapViewMode !== "catches") return;
  const show = map.getZoom() >= 13;
  markers.eachLayer((marker) => {
    if (show && !marker.getTooltip()) {
      marker.bindTooltip(marker.catchLabel, {
        permanent: true,
        interactive: false,
        direction: "top",
        offset: [0, -14],
      });
    } else if (!show && marker.getTooltip()) marker.unbindTooltip();
  });
}
function renderCatchMap() {
  const records = uniqueRecords(visible).filter((c) =>
    Number.isFinite(c.latitude) && Number.isFinite(c.longitude)
  );
  $("map-view-summary").textContent = `${records.length} ${
    records.length === 1 ? "catch" : "catches"
  } · numbered circles group nearby catches`;
  const signature = JSON.stringify([
    "catches",
    records.map(
      (c) => [
        c.archive_id || c.catch_id,
        c.latitude,
        c.longitude,
        c.species_id,
        c.caught_at,
        colourOf(c),
      ],
    ),
  ]);
  // Background refreshes must not rebuild an unchanged layer or collapse a spider spread.
  if (signature === mapSignature) return;
  mapSignature = signature;
  map.closePopup();
  markers.clearLayers();
  const legend = new Map();
  for (const c of records) {
    const colour = colourOf(c);
    const label = `${nameOf(c)} · ${dateLabel(c.caught_at)} · ${timeLabel(c.caught_at)}`;
    const marker = L.marker([c.latitude, c.longitude], {
      title: label,
      alt: label,
      bubblingMouseEvents: false,
      keyboard: true,
      icon: L.divIcon({
        className: "catch-pin",
        html: "",
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      }),
    });
    marker.catchLabel = esc(label);
    marker.catchRecord = c;
    marker.on("add", () => {
      if (marker.getElement()) {
        marker.getElement().style.backgroundColor = colour;
      }
    });
    marker.on("click", (event) => {
      if (event.originalEvent) L.DomEvent.stopPropagation(event.originalEvent);
      map.closePopup();
      showDetail(c);
    });
    markers.addLayer(marker);
    legend.set(
      nameOf(c),
      colour,
    );
  }
  $("legend").innerHTML = [...legend].map(([name, colour]) =>
    `<button type="button" class="fish-name-link" data-profile="${
      esc(visible.find((c) => nameOf(c) === name)?.species_id || "")
    }"><i class="dot" style="background:${colour}"></i>${esc(name)}</button>`
  ).join("");
  updateLabels();
}
function fitMap() {
  const layer = mapViewMode === "catches" ? markers : mapSummaryLayer;
  if (!map || !layer || !layer.getLayers().length) return;
  map.invalidateSize({ pan: false });
  const bounds = layer.getBounds();
  if (mapViewMode === "species" && densityModel) {
    for (const p of densityModel.points) {
      bounds.extend(L.latLng(p.latitude, p.longitude).toBounds(densityModel.radius * 8));
    }
  }
  map.fitBounds(bounds, {
    padding: [55, 55],
    maxZoom: mapViewMode === "spots" ? 18 : 14,
    animate: false,
  });
}

const speciesScientific = {
  kabeljo: "Argyrosomus inodorus",
  red_roman: "Chrysoblephus laticeps",
  red_steenbras: "Petrus rupestris",
  miss_lucy: "Chrysoblephus gibbiceps",
  geelbek: "Atractoscion aequidens",
  haai: "Selachimorpha (sharks)",
  carpenter: "Argyrozona argyrozona",
  santer: "Cheimerius nufar",
  yellowbelly: "Epinephelus marginatus",
  musselcracker: "Cymatoceps nasutus",
  hake: "Merluccius capensis",
  yellowtail: "Seriola lalandi",
  dageraad: "Chrysoblephus cristiceps",
  scotsman: "Polysteganus praeorbitalis",
  sea_barbel: "Galeichthys feliceps",
  mackerel: "Scomber colias",
  blacktail: "Diplodus capensis",
  belman: "Umbrina robinsoni",
  galjoen: "Dichistius capensis",
  shad: "Pomatomus saltatrix",
  dusky_kob: "Argyrosomus japonicus",
  spotted_grunter: "Pomadasys commersonnii",
  white_steenbras: "Lithognathus lithognathus",
  garrick: "Lichia amia",
  zebra: "Diplodus hottentotus",
  white_musselcracker: "Sparodon durbanensis",
};
// Editorial reference profiles; independent of catch records and recommendation rules.
const fishProfiles = {
  "kabeljo": [
    "A coastline split in two",
    "Silver kob off Namibia are genetically separate from their South African relatives: the cold Benguela region forms a barrier between the populations. Their nursery is also different from what many anglers expect—young fish favour shallow sandy or muddy bays before moving offshore as they grow.",
    "https://saambr.org.za/wp-content/uploads/2023/03/ORI-Fish-Fact-Silver-Kob-ZC-LB.pdf",
    "ORI Silver kob factsheet",
  ],
  "red_roman": [
    "A change of sex—and personality",
    "A Red Roman can change from a social female on the open reef into a solitary, cave-dwelling male that defends a territory. This transition typically happens around seven to nine years old. The familiar territorial reef resident is one stage of a much more changeable life.",
    "https://speciesstatus.sanbi.org/taxa/detail/2905/",
    "SANBI species account",
  ],
  "red_steenbras": [
    "The atomic clock inside a fish",
    "Red steenbras turned out to live decades longer than early estimates suggested. Scientists used the radiocarbon signature left by nuclear testing to check growth layers in their ear stones, supporting an age of about 55 years. One tagged fish also reappeared after 22 years at liberty.",
    "https://doi.org/10.2989/1814232X.2018.1520148",
    "Andrews and colleagues, 2018",
  ],
  "miss_lucy": [
    "A menu that changes with age",
    "Young Miss Lucy favour softer prey, but larger fish eat more hard-bodied food such as sea snails. Adults also hunt brittle stars and worms among the reef. Despite their resident habits, red stumpnose can form shoals—finding a pair does not mean the species always lives in twos.",
    "https://speciesstatus.sanbi.org/taxa/detail/02954/",
    "SANBI species account",
  ],
  "geelbek": [
    "The night shift has a return ticket",
    "Geelbek make a seasonal round trip: adults travel from the Western Cape towards KwaZulu-Natal, form large night-time spawning gatherings over offshore reefs in spring, then head back south in summer. Their conspicuous yellow colour is inside the mouth and gill covers, rather than along the body.",
    "https://saambr.org.za/wp-content/uploads/2023/03/ORI-Fish-Fact-Sheet-Geelbek.pdf",
    "ORI species factsheet",
  ],
  "haai": [
    "Teeth that keep coming",
    "Sharks have skeletons made of cartilage rather than bone, and replace teeth throughout their lives. Tiny tooth-like scales cover their skin. Their senses include detecting weak electrical fields from other animals. This group includes bottom-dwelling hunters, travelling predators and plankton feeders—not one shared way of life.",
    "https://www.floridamuseum.ufl.edu/discover-fish/sharks/shark-biology/",
    "Florida Museum shark biology",
  ],
  "carpenter": [
    "The colours that disappear",
    "A living carpenter carries alternating red and iridescent blue stripes that fade after death, so a landed fish can look much plainer than it did underwater. Behind that delicate colour pattern sit four long canine teeth in each jaw: this reef fish is equipped to hunt baitfish and squid.",
    "https://saambr.org.za/wp-content/uploads/2023/03/ORI-Fish-Fact-Carpenter-ZC-LB.pdf",
    "ORI species factsheet",
  ],
  "santer": [
    "A traveller becomes a landlord",
    "Tagging shows santer travelling more than ten kilometres between reef complexes, yet breeding males switch to defending a patch of reef and performing elaborate courtship displays. Cold-water upwelling can also bring them into shallower water. A productive santer mark may host passing travellers, rather than permanent residents.",
    "https://saambr.org.za/wp-content/uploads/2023/03/ORI-Fish-Fact-Sheet-Santer.pdf",
    "ORI species factsheet",
  ],
  "yellowbelly": [
    "A resident far from its breeding grounds",
    "Yellowbelly rockcod caught in the Eastern and Western Cape are generally smaller and reproductively inactive. In southern Africa, breeding is associated with warmer reefs in KwaZulu-Natal and southern Mozambique; larger fish also tend to move deeper. A familiar Cape cave can hold residents without being where those fish reproduce.",
    "https://saambr.org.za/wp-content/uploads/2023/03/ORI-Fish-Fact-Sheet-Yellowbelly-Rockcod.pdf",
    "ORI species factsheet",
  ],
  "musselcracker": [
    "A very slow change of life",
    "Black musselcracker females take roughly ten years to mature, and a change to male often comes around eighteen years old. Some live about 45 years. Their powerful teeth crush hard-shelled reef prey, so the impressive jaw belongs to an animal whose adult life develops on a remarkably slow timetable.",
    "https://saambr.org.za/wp-content/uploads/2023/07/ORI-Fish-Fact-Black-musselcracker-ZC-LB-2.pdf",
    "ORI species factsheet",
  ],
  "hake": [
    "A nursery short of oxygen",
    "Very young shallow-water Cape hake are sometimes found in oxygen-poor inshore water, including off the Orange River. Researchers suggest that tolerating these conditions may shelter them from predators. As they grow, their diet shifts towards fish—including small deep-water hake—and they rise through the water column at night to feed.",
    "https://saambr.org.za/wp-content/uploads/2023/03/ORI-Fish-Fact-Sheet-Shallow-Water-Hake-FINAL.pdf",
    "ORI species factsheet",
  ],
  "yellowtail": [
    "A floating childhood",
    "Young Cape yellowtail often gather around floating objects and drifting kelp offshore. Adults become highly mobile hunters; some follow sardines up the east coast in winter. The same species that shelters beside a drifting raft when young can later range between offshore reefs in large, fast-moving shoals.",
    "https://saambr.org.za/wp-content/uploads/2023/03/ORI-Fish-Fact-Cape-Yellowtail-ZC-LB.pdf",
    "ORI species factsheet",
  ],
  "dageraad": [
    "A slow start, then a change",
    "A female Dageraad may take seven to eight years to mature, then change to a male at roughly eleven. That means the largest fish can play a different breeding role from smaller adults. This South African reef resident has been aged to 22 years, with some fish moving between reefs.",
    "https://saambr.org.za/wp-content/uploads/2023/03/ORI-Fish-Fact-Dageraad-ZC-LB.pdf",
    "ORI Dageraad factsheet",
  ],
  "scotsman": [
    "A reef resident with a long-distance chapter",
    "A young Scotsman can stay close to one shallow reef, yet tagged adults have travelled more than 300 kilometres northward and into deeper water, possibly to breed. A familiar resident can become a long-distance traveller as it grows, with more breeding activity recorded farther north.",
    "https://speciesstatus.sanbi.org/taxa/detail/2913/",
    "SANBI Scotsman species account",
  ],
  "sea_barbel": [
    "A nursery carried in his mouth",
    "The male See Baber carries the eggs and young in his mouth. The large eggs take roughly 75–80 days to hatch, and brooding males move into estuaries where they can remain for three to four months. What looks like an ordinary bottom-feeding catfish may be carrying an entire nursery.",
    "https://biodiversityadvisor.sanbi.org/search/detail/79625",
    "SANBI White seacatfish account",
  ],
  "mackerel": [
    "Fast growth, hidden in a tiny earstone",
    "Scientists aged Atlantic chub mackerel by reading growth marks in whole earstones. In one Northwest Atlantic study, most of the increase in length happened early: modelled growth slowed markedly after about two years. Fish of similar lengths still had overlapping ages — a reminder that the size of a mackerel cannot tell you its birthday. These results describe that study population, rather than a measured growth rate for our local fish.",
    "https://journal.nafo.int/Volumes/Articles/ID/637/Age-and-growth-of-Atlantic-chub-mackerel-iScomber-coliasi-in-the-Northwest-Atlantic",
    "Daley & Leaf, 2019",
  ],
  "blacktail": [
    "A change of role on the reef",
    "Many blacktail first mature as males, and some later become females. That familiar little fish with the black tail spot is also a long-term local: tagging shows strong residency, so an older fish may spend years around the same stretch of rocky shoreline.",
    "https://saambr.org.za/wp-content/uploads/2023/03/ORI-Fish-Fact-Sheet-Blacktail.pdf",
    "ORI / SAAMBR species account",
  ],
  "belman": [
    "The fish with a home cave",
    "A Belman may repeatedly return to a rocky overhang above the sand. Tagging shows little coastal movement, and divers have observed them staying around home caves. Beneath the small downturned mouth is a short chin barbel — the little beard behind its Afrikaans name, Baardman.",
    "https://saambr.org.za/wp-content/uploads/2023/07/ORI-Fish-Fact-Baardman-ZC-LB-2.pdf",
    "ORI / SAAMBR species account",
  ],
  "galjoen": [
    "Homebodies and wanderers",
    "Tagging reveals two very different movement patterns in galjoen: most stay local, while a small minority travel widely. Researchers still cannot say whether a fish keeps one lifestyle for life or switches between the two. A familiar gully can therefore hold residents and occasionally receive a passing wanderer.",
    "https://saambr.org.za/wp-content/uploads/2023/03/ORI-Fish-Fact-Sheet-Galjoen.pdf",
    "ORI / SAAMBR species account",
  ],
  "shad": [
    "Not every elf joins the run",
    "Many adult shad follow the seasonal route from Cape waters towards KwaZulu-Natal, with spawning activity following their arrival. But some remain in the Western Cape year-round. A local shad catch does not always mean that the whole migrating population has arrived.",
    "https://saambr.org.za/wp-content/uploads/2023/03/ORI-Fish-Fact-Sheet-Elf-1.pdf",
    "ORI / SAAMBR species account",
  ],
  "dusky_kob": [
    "The nursery before the giant",
    "A large dusky kob begins life tied to an estuary nursery. Young fish and subadults tend to stay within particular estuaries and nearby surf, while some mature adults make a long journey towards KwaZulu-Natal to spawn. The giant you meet on the beach may have a much longer local history than its size suggests.",
    "https://saambr.org.za/wp-content/uploads/2023/03/ORI-Fish-Fact-Sheet-Dusky-Kob.pdf",
    "ORI / SAAMBR species account",
  ],
  "spotted_grunter": [
    "An estuary regular with a sea journey",
    "Spotted grunter can be strongly attached to one estuary even though they leave for the sea to spawn. Young fish have an unusually precise meal: they can nip the siphon tips of buried bivalves, as well as taking small crustaceans and worms.",
    "https://saambr.org.za/wp-content/uploads/2023/03/ORI-Fish-Fact-Sheet-Spotted-Grunter-1.pdf",
    "ORI / SAAMBR species account",
  ],
  "white_steenbras": [
    "The night shift on the sandbank",
    "Young white steenbras may spend their first two to three years in an estuary. Studies describe them using shallow banks to feed at night, then changing habitat as they grow. That beach fish has already passed through a small, sheltered nursery world.",
    "https://www.oritag.org.za/Content/UserContent/documents/Southern_African_Marine_Linefish_Species_Profiles.pdf#page=251",
    "ORI / SAAMBR species account",
  ],
  "garrick": [
    "The return journey starts as a drifting egg",
    "Adult garrick migrate north to spawn, but the return south begins before their offspring can swim against a current: eggs and larvae drift southward inshore of the Agulhas Current. Cape estuaries then act as nurseries, where young garrick remain local but move actively within the system.",
    "https://saambr.org.za/wp-content/uploads/2023/03/ORI-Fish-Fact-Sheet-Leervis.pdf",
    "ORI / SAAMBR species account",
  ],
  "zebra": [
    "A striped fish older than it looks",
    "Zebra can reach 33 years, yet mature at roughly six. Unlike several other seabreams, no sex change has been recorded for this species. Its striped appearance hides a slow-growing local resident that can spend decades on the same reef system.",
    "https://saambr.org.za/wp-content/uploads/2023/03/ORI-Fish-Fact-Zebra-ZC-LB.pdf",
    "ORI / SAAMBR species account",
  ],
  "white_musselcracker": [
    "From algae to armoured prey",
    "A young White Musselcracker starts in tidal pools and shallow water, eating small invertebrates and green algae. Larger fish tackle a very different menu: big shellfish, crustaceans and red bait. That shift in food goes with a change in habitat, as growing fish use deeper reefs while still returning inshore to feed.",
    "https://www.tandfonline.com/doi/abs/10.2989/02577619109504638",
    "Buxton & Clarke, 1991",
  ],
};
const fishReference = {
  "kabeljo": [
    "50 cm from a boat at sea between Cape Agulhas and the Umtamvuna River; 40 cm in KZN. Shore/estuaries east of Cape Agulhas: 60 cm. West of Cape Agulhas: 50 cm.",
    "28",
    "Small schooling fish, shrimp and squid.",
    "Mobile; generally inshore in summer and farther offshore in winter. Juveniles use shallow sandy or muddy bays.",
    "https://saambr.org.za/wp-content/uploads/2023/03/ORI-Fish-Fact-Silver-Kob-ZC-LB.pdf",
  ],
  "red_roman": [
    "30 cm",
    "19",
    "Brittle stars, basket stars, squid, cuttlefish, crustaceans and worms.",
    "Strong reef residency, usually within a home range less than 100 m long. Males defend territories.",
    "https://saambr.org.za/wp-content/uploads/2023/03/ORI-Fish-Fact-Roman-ZC-LB.pdf",
  ],
  "red_steenbras": [
    "60 cm. Closed season: 1 October–30 November; size alone does not make a catch legal.",
    "55",
    "Mainly smaller reef fish.",
    "Young fish can remain on local reefs; older fish move offshore and may migrate along the coast.",
    "https://www.oritag.org.za/Content/UserContent/documents/Southern_African_Marine_Linefish_Species_Profiles.pdf",
  ],
  "miss_lucy": [
    "30 cm",
    "48",
    "Brittle stars, sea snails, worms, crabs, sea urchins and octopus.",
    "Generally resident on reefs, with seasonal aggregations; juveniles are found shallower than adults.",
    "https://speciesstatus.sanbi.org/taxa/detail/02954/",
  ],
  "geelbek": [
    "60 cm",
    "9",
    "Adults: sardines, mackerel and horse mackerel. Juveniles: small shrimps and anchovies.",
    "Seasonal shoaling migration from the Western Cape towards KZN to breed, returning south in summer.",
    "https://saambr.org.za/wp-content/uploads/2023/03/ORI-Fish-Fact-Sheet-Geelbek.pdf",
  ],
  "haai": [
    "Varies by species and area. Identify the shark and check species-specific protection, size, bag and permit rules.",
    "Varies",
    "Depending on species: fish, squid, crustaceans, other animals or plankton.",
    "Some remain around reefs or seabeds; others travel long distances offshore. Behaviour depends on species.",
    "https://www.floridamuseum.ufl.edu/discover-fish/sharks/faq/",
  ],
  "carpenter": [
    "35 cm",
    "30",
    "Adults: anchovies, sardines and squid. Young fish: crabs, small crustaceans and worms.",
    "Mostly resident above prominent reefs; a minority disperse along the coast. Young fish occupy shallower reefs.",
    "https://saambr.org.za/wp-content/uploads/2023/03/ORI-Fish-Fact-Carpenter-ZC-LB.pdf",
  ],
  "santer": [
    "30 cm",
    "22",
    "Small fish, squid, octopus, crabs and shrimps.",
    "Loose shoals move between reef complexes, sometimes more than 10 km. Cold upwelling can bring fish shallower.",
    "https://saambr.org.za/wp-content/uploads/2023/03/ORI-Fish-Fact-Sheet-Santer.pdf",
  ],
  "yellowbelly": [
    "60 cm",
    "16",
    "Crustaceans, fish and squid.",
    "Highly resident reef fish. Larger fish tend to move deeper; breeding is associated with KZN and southern Mozambique.",
    "https://saambr.org.za/wp-content/uploads/2023/03/ORI-Fish-Fact-Sheet-Yellowbelly-Rockcod.pdf",
  ],
  "musselcracker": [
    "50 cm",
    "45",
    "Hard-shelled reef animals, including molluscs, crustaceans and echinoderms.",
    "Juveniles are strongly resident. Some adults move north towards the Transkei and KZN, probably to spawn.",
    "https://saambr.org.za/wp-content/uploads/2023/07/ORI-Fish-Fact-Black-musselcracker-ZC-LB-2.pdf",
  ],
  "hake": [
    "No minimum size listed for hake in the cited recreational summary.",
    "13",
    "Small fish, including other hake; also squid and crustaceans. Young fish eat krill and amphipods.",
    "Moves into deeper water with age and rises through the water column at night to feed.",
    "https://saambr.org.za/wp-content/uploads/2023/03/ORI-Fish-Fact-Sheet-Shallow-Water-Hake-FINAL.pdf",
  ],
  "yellowtail": [
    "No minimum size listed in the cited recreational summary.",
    "21",
    "Sardines, horse mackerel, anchovies, mackerel, squid and small crustaceans.",
    "Highly mobile shoals move between offshore reefs. Some follow sardines up the east coast in winter; juveniles shelter around floating objects.",
    "https://saambr.org.za/wp-content/uploads/2023/03/ORI-Fish-Fact-Cape-Yellowtail-ZC-LB.pdf",
  ],
  "dageraad": [
    "40 cm. Daily bag limit: 1 per person.",
    "22",
    "Crustaceans, molluscs and reef-associated worms.",
    "Fairly resident on offshore reefs; some movement between reefs. Juveniles occupy shallower reefs.",
    "https://saambr.org.za/wp-content/uploads/2023/03/ORI-Fish-Fact-Dageraad-ZC-LB.pdf",
  ],
  "scotsman": [
    "40 cm. Daily bag limit: 1 per person.",
    "13",
    "Small reef fish, squid and other bottom-dwelling cephalopods and crustaceans.",
    "Juveniles are fairly resident on shallow reefs; adults can move north more than 300 km and into deeper water, possibly to breed.",
    "https://speciesstatus.sanbi.org/taxa/detail/2913/",
  ],
  "sea_barbel": [
    "No species-specific minimum listed in the ORI summary. The general unlisted-species bag limit is 10 per person per day, subject to the overall bag limit and local rules.",
    "18+",
    "Crabs and other bottom-dwelling crustaceans, worms, molluscs, squid and fish.",
    "Adults forage over sand and mud; brooding males enter estuaries between September and March and may remain for 3–4 months.",
    "https://biodiversityadvisor.sanbi.org/search/detail/79625",
  ],
  "mackerel": [
    "No minimum listed in the ORI recreational summary (listed there under the older name Scomber japonicus).",
    "7",
    "Small planktonic crustaceans, including copepods, and other tiny aquatic animals.",
    "A mobile shoaling fish of the open water above the continental shelf. Schools shift with feeding conditions; a catch marks a passing school rather than a resident reef fish.",
    "https://www.fisheries.noaa.gov/species/atlantic-chub-mackerel",
  ],
  "blacktail": [
    "20 cm · daily bag limit 5",
    "21",
    "Seaweed, mussels, limpets, worms, sea urchins and red bait.",
    "Highly resident around shallow rocky shores and gullies.",
    "https://saambr.org.za/wp-content/uploads/2023/03/ORI-Fish-Fact-Sheet-Blacktail.pdf",
  ],
  "belman": [
    "40 cm · daily bag limit 5",
    "21",
    "Bottom-dwelling worms, crustaceans and molluscs.",
    "Resident around reefs, overhangs and sand edges; limited coastal movement.",
    "https://saambr.org.za/wp-content/uploads/2023/07/ORI-Fish-Fact-Baardman-ZC-LB-2.pdf",
  ],
  "galjoen": [
    "35 cm · daily bag limit 2 · closed 15 October–end February",
    "21",
    "Molluscs, especially mussels picked from submerged rocks.",
    "Mostly resident in broken surf over rock and sand; a small proportion roam widely.",
    "https://saambr.org.za/wp-content/uploads/2023/03/ORI-Fish-Fact-Sheet-Galjoen.pdf",
  ],
  "shad": [
    "30 cm · daily bag limit 4 · closed 1 October–30 November",
    "10",
    "Small fish such as anchovies and sardines; also squid and crustaceans.",
    "Mobile shoals; many migrate north in winter and return towards Cape waters later.",
    "https://saambr.org.za/wp-content/uploads/2023/03/ORI-Fish-Fact-Sheet-Elf-1.pdf",
  ],
  "dusky_kob": [
    "60 cm for shore/estuaries east of Cape Agulhas · daily bag limit 1 · only 1 kob over 110 cm",
    "42",
    "Fish, prawns and other crustaceans, and squid.",
    "Young fish are estuary and surf-zone residents; some adults migrate north to spawning grounds.",
    "https://saambr.org.za/wp-content/uploads/2023/03/ORI-Fish-Fact-Sheet-Dusky-Kob.pdf",
  ],
  "spotted_grunter": [
    "40 cm · daily bag limit 5",
    "16",
    "Sand and mud prawns, molluscs and worms; juveniles also eat bivalve siphon tips.",
    "Largely resident in an estuary, with seaward spawning movements.",
    "https://saambr.org.za/wp-content/uploads/2023/03/ORI-Fish-Fact-Sheet-Spotted-Grunter-1.pdf",
  ],
  "white_steenbras": [
    "60 cm · daily bag limit 1",
    "25–30",
    "Worms, crustaceans and sand-dwelling shellfish.",
    "Estuary nurseries first, then the surf zone; larger fish can range farther along the coast.",
    "https://www.oritag.org.za/Content/UserContent/documents/Southern_African_Marine_Linefish_Species_Profiles.pdf#page=251",
  ],
  "garrick": [
    "70 cm · daily bag limit 2",
    "10+",
    "Sardines, mullet, shad and strepies; juveniles also take crustaceans.",
    "Adults migrate to KwaZulu-Natal in winter and return to Cape waters after spawning.",
    "https://saambr.org.za/wp-content/uploads/2023/03/ORI-Fish-Fact-Sheet-Leervis.pdf",
  ],
  "zebra": [
    "30 cm · daily bag limit 5",
    "33",
    "Worms and amphipods; also small crustaceans, urchins and molluscs.",
    "Highly resident on rocky reefs, with juveniles in pools, gullies and estuary mouths.",
    "https://saambr.org.za/wp-content/uploads/2023/03/ORI-Fish-Fact-Zebra-ZC-LB.pdf",
  ],
  "white_musselcracker": [
    "60 cm · daily bag limit 2",
    "31+",
    "Shellfish, crustaceans and red bait; juveniles eat small invertebrates and green algae.",
    "Juveniles use tidal pools and shallow reefs. Larger fish also use deeper reefs down to about 30 m, returning inshore to feed.",
    "https://www.tandfonline.com/doi/abs/10.2989/02577619109504638",
  ],
};
const fishAgeNotes = {
  "kabeljo": "Namibian record; 25 years reported in South Africa.",
  "red_roman": "Maximum reported in the SANBI species account.",
  "red_steenbras": "Estimated using ear-stone growth layers, supported by radiocarbon dating.",
  "miss_lucy": "Maximum reported for a male red stumpnose.",
  "geelbek": "Maximum reported in the ORI species factsheet.",
  "haai":
    "No single age applies to all sharks. Lifespan depends on species; this catch category does not identify one.",
  "carpenter": "Maximum reported in the ORI species factsheet.",
  "santer": "Maximum reported in the ORI species factsheet.",
  "yellowbelly": "South African aged specimens; a regional record, not a global maximum.",
  "musselcracker": "Maximum reported in the ORI species factsheet.",
  "hake": "Shallow-water Cape hake, as identified in this journal.",
  "yellowtail": "Maximum reported by ORI; most do not reach this age.",
  "dageraad": "Maximum reported for Dageraad in the ORI species factsheet.",
  "scotsman":
    "Recorded at 72 cm fork length in the SANBI account; larger specimens suggest this is not the species’ lifespan ceiling.",
  "sea_barbel":
    "More than 18 years reported for a female in the Eastern Cape in the ORI species profiles, citing Tilney (1990).",
  "mackerel":
    "Oldest fish aged in the 2016–2017 Northwest Atlantic study: 7 years. This is a study maximum, not a South African or worldwide longevity record.",
  "blacktail": "Maximum 21 years reported by ORI.",
  "belman": "Maximum 21 years reported by ORI.",
  "galjoen": "Maximum 21 years reported by ORI.",
  "shad": "Maximum 10 years reported by ORI for southern African shad.",
  "dusky_kob": "Maximum 42 years reported by ORI.",
  "spotted_grunter": "Maximum 16 years reported by ORI.",
  "white_steenbras":
    "ORI reports a maximum recorded age of 25–30 years for Western and Eastern Cape fish, citing Bennett (1993).",
  "garrick":
    "ORI reports at least 10 years; this is a documented lower bound, not a firm longevity ceiling.",
  "zebra": "Maximum 33 years reported by ORI.",
  "white_musselcracker":
    "At least 31 years in the Eastern Cape study, aged from sectioned earstones. A documented minimum longevity, not a firm lifespan ceiling.",
};
function fishReferenceHTML(id) {
  const r = fishReference[id];
  if (!r) return "";
  const icons = {
    age:
      '<circle cx="32" cy="32" r="25"/><circle cx="32" cy="32" r="17"/><circle cx="32" cy="32" r="9"/><path d="M32 7v8m25 17h-8M32 57v-8M7 32h8"/>',
    size: '<path d="M8 22h48v20H8zM16 22v10m8-10v6m8-6v10m8-10v6m8-6v10"/>',
    diet:
      '<path d="M7 32c12-19 31-19 42 0-11 19-30 19-42 0Zm42 0 9-12v24z"/><circle cx="20" cy="29" r="2"/>',
    movement: '<path d="M7 22h42m-9-9 9 9-9 9M57 44H15m9-9-9 9 9 9"/>',
  };
  const art = (key) =>
    `<svg class="fish-reference-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${
      icons[key]
    }</svg>`;
  const ageSource = id === "mackerel"
    ? fishProfiles[id][2]
    : id === "sea_barbel"
    ? "https://www.oritag.org.za/Content/UserContent/documents/Southern_African_Marine_Linefish_Species_Profiles.pdf"
    : id === "red_steenbras"
    ? fishProfiles[id][2]
    : id === "red_roman"
    ? "https://speciesstatus.sanbi.org/taxa/detail/2905/"
    : r[4];
  return `<div class="fish-reference"><dl class="fish-reference-cards"><div class="fish-reference-card fish-age-card">${
    art("age")
  }<dt>${
    id === "haai" ? "Lifespan across sharks" : "Oldest recorded specimen"
  }</dt><dd><strong class="fish-age-number${id === "haai" ? " fish-age-varies" : ""}">${
    esc(r[1])
  }</strong>${
    id === "haai" ? "" : '<span class="fish-age-unit">years</span>'
  }<p class="fish-card-caption">${
    esc(fishAgeNotes[id])
  }</p></dd></div><div class="fish-reference-card">${art("size")}<dt>Minimum legal size</dt><dd>${
    esc(r[0])
  }</dd><span class="fish-card-caption">South African recreational fishing · total length</span></div><div class="fish-reference-card">${
    art("diet")
  }<dt>On the menu</dt><dd>${esc(r[2])}</dd></div><div class="fish-reference-card">${
    art("movement")
  }<dt>Life on the move</dt><dd>${
    esc(r[3])
  }</dd></div></dl><details class="reference-notes"><summary>References &amp; notes</summary><p class="small muted">Ages are documented maxima in the cited sources, not typical lifespans or the age of your catch. Regional and captive records are labelled. Size is only one rule: seasons, bag limits, protected areas and permit conditions also apply.</p><p class="small"><a href="${
    esc(ageSource)
  }" target="_blank" rel="noopener noreferrer">Age source</a> · <a href="https://www.oritag.org.za/Content/UserContent/documents/Linefishing-regs-for-the-smart-phone-interactive.pdf" target="_blank" rel="noopener noreferrer">Size rules</a> · <a href="${
    esc(r[4])
  }" target="_blank" rel="noopener noreferrer">Diet &amp; movement</a></p><p class="small muted">References consulted 18 October 2026; check current rules before fishing.</p></details></div>`;
}
function fishProfileHTML(id) {
  const p = fishProfiles[id];
  if (!p) return "";
  const note = id === "dusky_kob"
    ? "Dusky kob (Argyrosomus japonicus) is separate from the silver kob saved as Kabeljou in your offshore list."
    : id === "mackerel"
    ? "Makriel / Atlantic chub mackerel. The supplied illustration and older South African references use Scomber japonicus; current regional references identify the local fish as Scomber colias (SAIAB, Western Indian Ocean Fishes)."
    : id === "hake"
    ? "This profile describes shallow-water Cape hake. The journal label alone does not distinguish the two Cape hake species."
    : id === "haai"
    ? "Shark is a broad catch category, not a species identification. Selachimorpha includes multiple families. The illustration is representative; it does not identify your catch."
    : "";
  const reference = fishReferenceHTML(id).replace(
    "</details>",
    `${
      id === "white_musselcracker"
        ? '<p class="small muted">Supplied identification illustration · <a href="https://kayakfish.co.za/" target="_blank" rel="noopener noreferrer">KayakFish source</a></p>'
        : shoreOnlySpecies.has(id) || id === "red_roman"
        ? '<p class="small muted">Original illustration: <a href="https://pescado.co.za/" target="_blank" rel="noopener noreferrer">PESCADO</a></p>'
        : ""
    }${note ? `<p class="small muted">${esc(note)}</p>` : ""}<a class="small" href="${
      esc(p[2])
    }" target="_blank" rel="noopener noreferrer">${esc(p[3])} ↗</a></details>`,
  );
  return `<section class="fish-profile"><h3>${esc(p[0])}</h3><p class="fish-fact-story">${
    esc(p[1])
  }</p>${reference}</section>`;
}
function showSpeciesProfile(id) {
  if (!fishProfiles[id]) return;
  conditionsGeneration++;
  $("detail-label").textContent = "Species guide";
  $("details").dataset.view = "species";
  $("detail-body").innerHTML = `${fishImage(id, true)}<h2>${esc(species[id][0])}</h2>${
    scientificCaption(id)
  }${fishProfileHTML(id)}`;
  upgradeFishPortrait(id);
  if (!$("details").open) $("details").showModal();
  $("details").scrollTop = 0;
  $("detail-body").scrollTop = 0;
}
const speciesTaxonomyNotes = {};
function scientificCaption(id) {
  if (!speciesScientific[id]) return "";
  return `<span class="species-scientific">${esc(speciesScientific[id])}</span>${
    speciesTaxonomyNotes[id]
      ? `<span class="species-taxonomy-note">${esc(speciesTaxonomyNotes[id])}</span>`
      : ""
  }`;
}
let totalsSignature = "";
function renderTotals() {
  const counts = new Map(modeSpeciesIds().map((id) => [id, 0]));
  for (const c of visible) {
    counts.set(c.species_id, (counts.get(c.species_id) || 0) + 1);
  }
  const rows = [...counts].sort((a, b) =>
    b[1] - a[1] ||
    (species[a[0]]?.[0] || a[0]).localeCompare(species[b[0]]?.[0] || b[0])
  );
  const signature = JSON.stringify([visible.length, rows]);
  if (signature === totalsSignature && $("totals").childElementCount) return;
  totalsSignature = signature;
  const max = Math.max(1, ...rows.map((row) => row[1]));
  $("totals").innerHTML = rows.map(([id, count]) =>
    `<tr class="species-row" style="--species-colour:${
      species[id]?.[1] || "#11543e"
    }"><td><button type="button" class="species-profile-button" data-profile="${
      esc(id)
    }" aria-label="Read about ${esc(species[id]?.[0] || id)}"><span class="species-cell">${
      fishImage(id)
    }<span>${
      esc(species[id]?.[0] || id)
    }</span></span></button></td><td><strong>${count}</strong></td><td>${
      visible.length && count > 0 && count / visible.length * 100 < 1 ? "<1" : visible.length ? Math.round(count / visible.length * 100) : 0
    }%</td></tr><tr class="species-bar-row" aria-hidden="true" style="--species-colour:${
      species[id]?.[1] || "#11543e"
    }"><td colspan="3"><span class="species-visual-track"><span style="width:${
      count / max * 100
    }%"></span></span></td></tr>`
  ).join("");
}
function diaryTripRows(filterSpecies = true) {
  return trips.filter(matchesFishingMode).map((trip) => ({ trip, metrics: tripMetrics(trip) }))
    .filter(({ trip, metrics }) => {
      const day = dayKey(trip.started_at);
      return (!$("from").value || day >= $("from").value) &&
        (!$("to").value || day <= $("to").value) &&
        (!filterSpecies || !$("species").value || metrics.count > 0);
    });
}
function renderDays(tripRows = diaryTripRows()) {
  dayPhotoObserver?.disconnect();
  void loadDayPhotos();
  const expanded = disclosureState($("days"));
  const groups = new Map();
  for (const c of visible) {
    const key = dayKey(c.caught_at);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(c);
  }
  for (const { trip } of tripRows) {
    const key = dayKey(trip.started_at);
    if (!groups.has(key)) groups.set(key, []);
  }
  $("days").replaceChildren();
  for (const [key, rows] of [...groups].sort(([a], [b]) => b.localeCompare(a))) {
    const dayTrips = tripRows.filter(({ trip }) => dayKey(trip.started_at) === key);
    const fishing = dayTrips.reduce((sum, { metrics }) => sum + metrics.fishing, 0);
    const tripCatches = dayTrips.reduce((sum, { metrics }) => sum + metrics.count, 0);
    const productivity = fishing > 0 ? tripCatches * 3600 / fishing : null;
    const reference = rows[0] || { caught_at: dayTrips[0].trip.started_at };
    const section = document.createElement("section");
    section.className = "day-card";
    const totals = new Map();
    for (const c of rows) {
      totals.set(nameOf(c), (totals.get(nameOf(c)) || 0) + 1);
    }
    section.innerHTML = `<details class="day-record" data-disclosure="day-card:${
      esc(key)
    }"><summary class="day-card-summary"><img class="day-photo-thumb" alt="" width="60" height="60" hidden><strong>${esc(dateLabel(reference.caught_at))}${
      dayRatingBadge(key, fishingMode)
    }</strong><span class="record-metrics"><span title="Based on completed trips starting on this date"><b>${
      productivity === null ? "—" : productivity.toFixed(1)
    }</b> catches / fishing hour</span><span><b>${rows.length}</b> catches</span></span></summary><div class="day-record-body"><div class="day-summary">${
      [...totals].map(([name, count]) =>
        `<button type="button" class="fish-name-link" data-profile="${
          esc(rows.find((c) => nameOf(c) === name)?.species_id || "")
        }">${esc(name)} · ${count}</button>`
      )
        .join("")
    }</div></div></details>`;
    const body = section.querySelector(".day-record-body");
    body.prepend(createDayPhotoPanel(key));
    const weather = document.createElement("button");
    weather.className = "quiet day-weather";
    weather.textContent = "View day conditions";
    weather.onclick = () => showDayConditions(rows);
    weather.disabled = !rows.length;
    if (!rows.length) weather.title = "Conditions are available with saved catches.";
    const rate = document.createElement("button");
    rate.type = "button";
    rate.className = "quiet day-rate";
    rate.textContent = "Rate this day";
    rate.onclick = () => showDayObservations(reference);
    const actions = document.createElement("div");
    actions.className = "day-actions";
    actions.append(weather, rate);
    body.append(actions);
    const effort = document.createElement("p");
    effort.className = "small muted";
    effort.textContent = `${dayTrips.length} ${dayTrips.length === 1 ? "trip" : "trips"} · ${
      durationLabel(fishing)
    } fishing · ${totals.size} species`;
    body.append(effort);
    if (dayTrips.length) {
      const records = document.createElement("div");
      records.className = "diary-trips";
      records.innerHTML = `<table><caption class="sr-only">Trips for this date</caption><tbody>${
        dayTrips.map(({ trip, metrics }) => tripCardHTML(trip, metrics)).join("")
      }</tbody></table>`;
      body.append(records);
    } else {
      const note = document.createElement("p");
      note.className = "small muted";
      note.textContent = "Catches saved without a completed trip. Fishing effort is unavailable.";
      body.append(note);
    }
    const list = document.createElement("details");
    list.className = "day-catch-list";
    list.dataset.disclosure = "day:" + key;
    list.open = false;
    list.innerHTML = `<summary><span>Catch list</span><span>${rows.length} saved</span></summary>`;
    body.append(list);
    for (const c of rows) {
      const button = document.createElement("button");
      button.className = "catch-row";
      button.innerHTML = `<span>${fishImage(c.species_id)}<i class="dot" style="background:${
        species[c.species_id]?.[1] || "#11543e"
      }"></i>${esc(nameOf(c))}</span><time datetime="${esc(c.caught_at)}">${
        esc(timeLabel(c.caught_at))
      }</time>`;
      button.onclick = () => showDetail(c);
      list.append(button);
    }
    $("days").append(section);
  }
  if (!groups.size) {
    $("days").innerHTML = '<p class="empty">No fishing records match these filters.</p>';
  }
  restoreDisclosures($("days"), expanded);
  paintDayPhotos();
}
const dayFeelMetrics = [
  {
    key: "enjoyment",
    label: "How was the day?",
    low: "Not much fun",
    high: "An unforgettable day",
    words: ["A tough day", "Could be better", "Enjoyed it", "A great day", "Absolutely brilliant"],
    note: "Your enjoyment, regardless of how many fish you caught.",
  },
  {
    key: "water_clarity",
    label: "Water clarity",
    low: "Very murky",
    high: "Crystal clear",
    words: ["Very murky", "Cloudy", "Mixed clarity", "Clear", "Crystal clear"],
    note: "Overall impression across the water you fished; not measured visibility.",
  },
  {
    key: "sea_comfort",
    label: "Sea comfort",
    low: "Very uncomfortable",
    high: "Glassy & comfortable",
    words: ["Very uncomfortable", "Choppy", "Manageable", "Comfortable", "Glassy & comfortable"],
    note: "How comfortable the sea felt, not a wave-height measurement.",
  },
  {
    key: "current_strength",
    label: "Current strength",
    low: "Still water",
    high: "Ripping current",
    words: ["Still or barely moving", "Weak", "Moderate", "Strong", "Very strong"],
    note: "Perceived water movement, not boat speed or a measured current.",
  },
  {
    key: "bite_activity",
    label: "Bite activity",
    low: "Nothing touching",
    high: "Non-stop bites",
    words: ["No bites", "Very quiet", "Occasional bites", "Regular bites", "Non-stop bites"],
    note: "Include bites that did not result in a landed fish.",
  },
  {
    key: "bait_presence",
    label: "Baitfish activity",
    low: "None seen",
    high: "Bait everywhere",
    words: ["None seen", "A little", "Some bait around", "Plenty of bait", "Bait everywhere"],
    note: "Baitfish you noticed at the surface or on the fish finder. Unseen does not mean absent.",
  },
];
function journalArt(key) {
  const fish =
    '<path d="M5 12c7-9 18-9 25 0-7 9-18 9-25 0Zm25 0 8-6v12l-8-6Z"/><circle cx="12" cy="10" r="1" fill="currentColor" stroke="none"/>';
  const art = {
    enjoyment:
      '<circle cx="24" cy="24" r="10" fill="#d9bb72" stroke="none"/><circle cx="24" cy="24" r="9"/><path d="M24 5v5m0 28v5M5 24h5m28 0h5M11 11l4 4m18 18 4 4M11 37l4-4m18-18 4-4"/>',
    water_clarity:
      '<path d="M24 5c-5 8-14 17-14 25a14 14 0 0 0 28 0c0-8-9-17-14-25Z" fill="#cbdccf"/><path d="M16 30c0 5 3 8 7 9m5-20 4 6"/>',
    sea_comfort:
      '<path d="M5 29q5-6 10 0t10 0 10 0 10 0M5 38q5-6 10 0t10 0 10 0 10 0M13 16h23l-5 7H19Z"/><path d="M24 7v9m-6-6h12"/>',
    current_strength:
      '<path d="M5 13h31m-6-6 6 6-6 6M12 25h31m-6-6 6 6-6 6M5 37h24m-6-6 6 6-6 6"/>',
    bite_activity:
      '<path d="M29 5v24a9 9 0 0 1-18 0v-7l5 5M25 5h8"/><circle cx="29" cy="10" r="2" fill="#d9bb72" stroke="none"/><path d="m37 20 5-3m-4 11h6"/>',
    pressure:
      '<path d="M10 36a18 18 0 1 1 28 0"/><path d="M14 33h20M24 13v4m-12 5 4 2m20-2-4 2M24 30l8-8"/><circle cx="24" cy="30" r="3" fill="#d9bb72"/>',
    temperature:
      '<path d="M20 29V10a5 5 0 0 1 10 0v19a10 10 0 1 1-10 0Z"/><path d="M25 16v18m11-20h5m-5 8h5"/><circle cx="25" cy="36" r="4" fill="#d9bb72" stroke="none"/>',
    rain:
      '<path d="M12 27a8 8 0 1 1 1-16 11 11 0 0 1 21 2 7 7 0 1 1 3 14Z" fill="#e1e8df"/><path d="m15 33-3 7m13-7-3 7m13-7-3 7"/>',
    refresh: '<path d="M35 13a15 15 0 1 0 4 18M27 13h9V4"/>',
    bait_presence: '<g transform="translate(1 6) scale(.75)">' + fish +
      '</g><g transform="translate(15 20) scale(.7)">' + fish +
      '</g><g transform="translate(1 32) scale(.55)">' + fish + "</g>",
  };
  return `<svg class="rating-art" viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${
    art[key] || ""
  }</svg>`;
}
// Completion is based on the latest saved revision for this date and fishing style.
let dayRatingRows = new Map();
let dayRatingLoad = "loading";
let dayRatingEpoch = 0;
let dayRatingVersion = 0;
function dayRatingKey(date, mode) {
  return `${date}:${mode}`;
}
function dayRatingBadge(date, mode) {
  const cached = dayRatingRows.get(dayRatingKey(date, mode));
  const row = cached?._missing ? null : cached;
  const count = row
    ? dayFeelMetrics.filter((metric) =>
      Number.isInteger(row[metric.key]) && row[metric.key] >= 0 && row[metric.key] <= 10
    ).length
    : 0;
  const complete = count === dayFeelMetrics.length;
  const state = complete
    ? "done"
    : row
    ? "partial"
    : cached?._missing || dayRatingLoad === "ready"
    ? "pending"
    : dayRatingLoad;
  const label = complete
    ? "Rating done"
    : row
    ? `Partly rated · ${count}/${dayFeelMetrics.length}`
    : state === "pending"
    ? "Not rated yet"
    : state === "error"
    ? "Rating unavailable"
    : "Checking rating…";
  const icon = complete ? '<path d="m3 8 3 3 7-8"/>' : '<circle cx="8" cy="8" r="5.5"/>';
  return `<span class="day-rating-status is-${state}" data-rating-date="${
    esc(date)
  }" data-rating-mode="${esc(mode)}" title="${
    esc(fishingModeLabels[mode])
  }: ${count} of ${dayFeelMetrics.length} scores saved"><svg viewBox="0 0 16 16" aria-hidden="true">${icon}</svg>${
    esc(label)
  }</span>`;
}
function paintDayRatingBadges() {
  if (session && !$("insights-page").hidden) renderInsightsRatings();
  document.querySelectorAll("[data-rating-date]").forEach((badge) => {
    badge.outerHTML = dayRatingBadge(badge.dataset.ratingDate, badge.dataset.ratingMode);
  });
}
function rememberDayRating(row, date, mode) {
  const key = dayRatingKey(date, mode);
  dayRatingRows.set(key, {
    ...(row || {}),
    observation_date: date,
    fishing_mode: mode,
    _localVersion: ++dayRatingVersion,
    _missing: !row,
  });
  paintDayRatingBadges();
}
async function refreshDayRatings(owner, generation) {
  const version = dayRatingVersion;
  dayRatingLoad = "loading";
  paintDayRatingBadges();
  const latest = new Map();
  try {
    for (let offset = 0;; offset += 500) {
      const { data, error } = await client.from("fishing_day_observations").select(
        "id,observation_date,fishing_mode,recorded_at,enjoyment,water_clarity,sea_comfort,current_strength,bite_activity,bait_presence",
      )
        .eq("owner_id", owner).order("recorded_at", { ascending: false }).order("id", {
          ascending: false,
        }).range(offset, offset + 499);
      if (generation !== loadGeneration || session?.user.id !== owner) return;
      if (error) throw error;
      for (const row of data || []) {
        if (!row.observation_date || !Object.hasOwn(fishingModeLabels, row.fishing_mode)) continue;
        const key = dayRatingKey(row.observation_date, row.fishing_mode);
        if (!latest.has(key)) latest.set(key, row);
      }
      if (!data || data.length < 500) break;
    }
    for (const [key, row] of dayRatingRows) if (row._localVersion > version) latest.set(key, row);
    dayRatingRows = latest;
    dayRatingLoad = "ready";
  } catch {
    if (generation !== loadGeneration || session?.user.id !== owner) return;
    dayRatingLoad = "error";
  }
  paintDayRatingBadges();
}
function dayFeelWord(metric, value) {
  return metric.words[Math.min(4, Math.floor(value / 2.5))];
}
function dayObservationFormHTML(c, mode) {
  return `<section class="day-observations"><h2>${
    esc(dateLabel(c.caught_at))
  }</h2><p class="muted">${
    esc(fishingModeLabels[mode])
  }</p><form id="day-observation-form"><fieldset id="day-observation-fields" disabled>${
    dayFeelMetrics.map((m) =>
      `<section class="day-feel-card is-unrated" data-feel-card="${m.key}"><div class="day-feel-heading"><span class="day-feel-icon" aria-hidden="true">${
        journalArt(m.key)
      }</span><label for="day-feel-${m.key}">${m.label}</label><output for="day-feel-${m.key}" id="day-feel-value-${m.key}" aria-live="polite">Not rated</output></div><input type="range" min="0" max="10" step="1" value="5" id="day-feel-${m.key}" name="${m.key}" data-rated="false" aria-describedby="day-feel-note-${m.key}" aria-valuetext="Not rated"><div class="day-feel-ends"><span>${m.low}</span><span>${m.high}</span></div><div class="day-feel-bottom"><p id="day-feel-note-${m.key}" class="sr-only">${m.note}</p><button type="button" class="feel-clear" data-clear-feel="${m.key}" disabled>Clear rating</button></div></section>`
    ).join("")
  }<label class="day-notes-label">Anything else about the day?<textarea name="notes" rows="3" maxlength="1000" placeholder="Water changed after lunch, lots of birds, bait worked better…"></textarea></label><button type="submit" class="primary" id="save-day-observations">Save day ratings</button></fieldset><p id="day-observation-status" class="small muted" role="status">Loading your saved day observations…</p></form></section>`;
}
async function showDayObservations(c) {
  $("detail-label").textContent = "Day notes & ratings";
  $("details").dataset.view = "day-notes";
  const generation = ++conditionsGeneration, mode = fishingMode, date = dayKey(c.caught_at);
  const ratingEpoch = dayRatingEpoch, ratingOwner = session?.user.id;
  $("detail-body").innerHTML = dayObservationFormHTML(c, mode);
  if (!$("details").open) $("details").showModal();
  $("details").scrollTop = 0;
  const form = $("day-observation-form"),
    fields = $("day-observation-fields"),
    status = $("day-observation-status");
  const current = () =>
    generation === conditionsGeneration && session && $("details").open && form.isConnected;
  const paint = (metric, value) => {
    const input = form.elements[metric.key], rated = value !== null;
    input.dataset.rated = String(rated);
    input.value = rated ? value : 5;
    const word = rated ? dayFeelWord(metric, value) : "Not rated";
    input.setAttribute("aria-valuetext", rated ? `${value} out of 10 · ${word}` : "Not rated");
    const card = input.closest(".day-feel-card");
    card.classList.toggle("is-unrated", !rated);
    card.style.setProperty("--feel-fill", `${rated ? value * 10 : 0}%`);
    if (metric.key === "water_clarity") {
      card.style.setProperty("--feel-water", rated ? `hsl(${30 + value * 16} 28% 93%)` : "#f6f5ef");
    }
    $("day-feel-value-" + metric.key).textContent = rated ? `${value}/10 · ${word}` : "Not rated";
    form.querySelector(`[data-clear-feel="${metric.key}"]`).disabled = !rated;
  };
  for (const metric of dayFeelMetrics) {
    form.elements[metric.key].oninput = (event) => paint(metric, Number(event.currentTarget.value));
    // Tapping the existing midpoint should record 5 even without moving the thumb.
    form.elements[metric.key].onclick = (event) => paint(metric, Number(event.currentTarget.value));
    form.querySelector(`[data-clear-feel="${metric.key}"]`).onclick = () => paint(metric, null);
  }
  let writeId = null, lastSignature = null;
  const readPayload = () => {
    const payload = {
      observation_date: date,
      timezone: config.timezone,
      fishing_mode: mode,
      scale_version: "day-feel-v1",
      notes: form.elements.notes.value.trim() || null,
    };
    for (const m of dayFeelMetrics) {
      payload[m.key] = form.elements[m.key].dataset.rated === "true"
        ? Number(form.elements[m.key].value)
        : null;
    }
    return payload;
  };
  form.onsubmit = async (event) => {
    event.preventDefault();
    if (!current() || fields.disabled) return;
    const payload = readPayload();
    if (!dayFeelMetrics.some((m) => payload[m.key] !== null) && !payload.notes) {
      status.textContent = "Move at least one slider or add a note before saving.";
      return;
    }
    if (!form.reportValidity()) return;
    const signature = JSON.stringify(payload);
    if (signature !== lastSignature || !writeId) {
      writeId = crypto.randomUUID();
      lastSignature = signature;
    }
    fields.disabled = true;
    status.textContent = "Saving your day observations…";
    try {
      let { error } = await client.from("fishing_day_observations").insert({
        id: writeId,
        ...payload,
      });
      if (error?.code === "23505") {
        const existing = await client.from("fishing_day_observations").select("id").eq(
          "id",
          writeId,
        ).limit(1);
        if (!existing.error && existing.data?.some((row) => row.id === writeId)) error = null;
      }
      if (error) throw error;
      if (dayRatingEpoch === ratingEpoch && session?.user.id === ratingOwner) {
        rememberDayRating({ id: writeId, ...payload }, date, mode);
      }
      if (current()) {
        status.textContent = "Saved for this day. Earlier versions are kept in your history.";
      }
    } catch {
      if (current()) {
        status.textContent =
          "Could not save. Your ratings are still here; reconnect and try again.";
      }
    } finally {
      if (current()) fields.disabled = false;
    }
  };
  try {
    const { data, error } = await client.from("fishing_day_observations").select("*").eq(
      "observation_date",
      date,
    ).eq("fishing_mode", mode).order("recorded_at", { ascending: false }).order("id", {
      ascending: false,
    }).limit(1);
    if (!current()) return;
    if (error) throw error;
    const saved = data?.[0];
    rememberDayRating(saved, date, mode);
    for (const m of dayFeelMetrics) {
      paint(m, Number.isInteger(saved?.[m.key]) ? saved[m.key] : null);
    }
    form.elements.notes.value = saved?.notes || "";
    if (saved) {
      writeId = saved.id;
      lastSignature = JSON.stringify(readPayload());
    }
    status.textContent = saved
      ? "Your saved ratings are loaded. Change any slider to add a new version."
      : "No ratings saved yet. Only sliders you use will be recorded.";
    fields.disabled = false;
  } catch {
    if (current()) {
      status.innerHTML =
        'Saved ratings could not be loaded. <button type="button" id="retry-day-observations" class="quiet">Try again</button>';
    }
    if (current()) $("retry-day-observations").onclick = () => showDayObservations(c);
  }
}
// Catch setup is captured on the watch; never infer it from GPS or the page filter.
const catchSetupLabels = {
  position_method: { anchored: "Anchored", drifting: "Drifting" },
  tackle_method: { bait: "Bait", jigging: "Jigging" },
};
function catchSetup(c) {
  const raw = c.raw_payload || {};
  const method = (key) => {
    const value = c[key] ?? raw[key];
    if (value != null) {
      return Object.hasOwn(catchSetupLabels[key], value)
        ? catchSetupLabels[key][value]
        : "Unrecognised setting";
    }
    return Object.hasOwn(raw, key) ? "Not set on watch" : "Not recorded";
  };
  const mode = c.fishing_mode ?? raw.fishing_mode;
  const legacy = mode == null || (mode === "offshore" && c.raw_payload && !raw.fishing_mode);
  return {
    style: legacy ? "Offshore (legacy default)" : fishingModeLabels[mode] || "Unrecognised setting",
    position: method("position_method"),
    tackle: method("tackle_method"),
  };
}
function field(label, value) {
  return `<div><dt>${esc(label)}</dt><dd>${esc(value ?? "Not recorded")}</dd></div>`;
}
const conditionLabels = {
  sea_surface_temperature: "Sea surface temperature",
  temperature_2m: "Air temperature",
  wind_speed_10m: "Wind speed",
  wind_direction_10m: "Wind direction",
  wind_gusts_10m: "Wind gusts",
  pressure_msl: "Barometric pressure (sea level)",
  pressure_change_3h: "Pressure change over 3 hours",
  cloud_cover: "Cloud cover",
  precipitation: "Rain",
  relative_humidity_2m: "Humidity",
  visibility: "Visibility",
  ocean_current_velocity: "Current speed",
  ocean_current_direction: "Current direction",
  wave_height: "Significant wave height",
  wave_direction: "Wave direction",
  wave_period: "Wave period",
  wave_peak_period: "Wave peak period",
  swell_wave_height: "Swell height",
  swell_wave_direction: "Swell direction",
  swell_wave_period: "Swell period",
  swell_wave_peak_period: "Swell peak period",
  estimated_depth_m: "Estimated seabed depth (GEBCO; metres)",
  depth_source: "Estimated depth source",
  depth_resolution_arc_seconds: "Bathymetry grid spacing (arc seconds)",
  sea_level_height_msl: "Sea level including tides",
  tidal_stage: "Tidal stage",
  lunar_tidal_cycle: "Lunar tidal cycle",
  water_clarity: "Water clarity",
  water_temperature: "Measured water temperature",
  current_strength: "Observed current",
  notes: "Notes",
};
function moonGraphic(phase, southern = false) {
  const fraction = ((phase % 1) + 1) % 1;
  const edge = [], terminator = [], direction = fraction <= .5 ? 1 : -1;
  for (let step = 0; step <= 48; step++) {
    const y = -1 + step / 24, radius = Math.sqrt(Math.max(0, 1 - y * y));
    edge.push(`${(60 + direction * radius * 44).toFixed(2)},${(60 + y * 44).toFixed(2)}`);
    terminator.unshift(
      `${(60 + direction * Math.cos(fraction * 2 * Math.PI) * radius * 44).toFixed(2)},${
        (60 + y * 44).toFixed(2)
      }`,
    );
  }
  return `<svg class="moon-art" viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="53" fill="#ffffff08"/><g${
    southern ? ' transform="rotate(180 60 60)"' : ""
  }><circle cx="60" cy="60" r="44" fill="#293b4c"/><polygon points="${
    edge.concat(terminator).join(" ")
  }" fill="#f6edce"/><circle cx="60" cy="60" r="44" fill="none" stroke="#fff" stroke-opacity=".18"/></g><circle cx="12" cy="25" r="1.5" fill="#f6edce"/><circle cx="106" cy="91" r="2" fill="#f6edce"/><path d="M101 18v8m-4-4h8" stroke="#f6edce" stroke-width="1.5"/></svg>`;
}
function skyFor(p) {
  if (typeof p.precipitation === "number" && p.precipitation > 0) {
    return { kind: "rain", label: "Raining", note: `${p.precipitation} mm precipitation` };
  }
  if (typeof p.visibility === "number" && p.visibility < 1000) {
    return { kind: "mist", label: "Foggy", note: "Visibility below 1 km" };
  }
  if (typeof p.visibility === "number" && p.visibility < 5000 && p.relative_humidity_2m >= 90) {
    return { kind: "mist", label: "Misty", note: "Low visibility and high humidity" };
  }
  if (typeof p.cloud_cover !== "number") return null;
  const night = p.sources?.weather?.values?.is_day === 0 || p.is_day === 0;
  return {
    kind: p.cloud_cover >= 80 ? "cloud" : p.cloud_cover >= 20 ? "partly" : night ? "night" : "sun",
    label: p.cloud_cover >= 80
      ? "Overcast"
      : p.cloud_cover >= 20
      ? "Partly cloudy"
      : night
      ? "Clear night"
      : "Clear sky",
    note: `${p.cloud_cover}% cloud cover`,
  };
}
function weatherGraphic(kind) {
  const sun =
    '<circle cx="46" cy="43" r="18" fill="#efbd55"/><g stroke="#efbd55" stroke-width="3.5" stroke-linecap="round"><path d="M46 12v-5m0 72v-5M15 43h-5m72 0h-5M24 21l-4-4m48 48 4 4M24 65l-4 4m48-48 4-4"/></g>';
  const cloud =
    '<path d="M29 76c-14 0-19-18-8-26 1-18 27-24 36-9 14-8 29 1 29 13 22 0 25 31 3 31H34" fill="#c7d9df"/><path d="M29 76h60" stroke="#b3cbd3" stroke-width="3" stroke-linecap="round"/>';
  const rain =
    '<g stroke="#5793b4" stroke-width="4" stroke-linecap="round"><path d="m37 94-4 9m25-9-4 9m25-9-4 9"/></g>';
  const mist =
    '<g stroke="#8ca9b2" stroke-width="4" stroke-linecap="round"><path d="M20 90h66M32 101h69M14 110h60"/></g>';
  return `<svg class="weather-art" viewBox="0 0 120 120" aria-hidden="true">${
    kind === "night"
      ? '<path d="M73 23a32 32 0 1 0 22 51A34 34 0 0 1 73 23" fill="#7c92b9"/>'
      : kind === "sun"
      ? sun
      : kind === "partly"
      ? sun + cloud
      : cloud
  }${kind === "rain" ? rain : kind === "mist" ? mist : ""}</svg>`;
}
function temperatureCard(p, units, key = "temperature_2m") {
  const value = p[key], unit = units?.[key];
  if (typeof value !== "number" || !Number.isFinite(value)) return "";
  const water = key !== "temperature_2m";
  const label = {
    temperature_2m: "Air temperature",
    water_temperature: "Water temperature · measured",
    sea_surface_temperature: "Water temperature · sea surface",
  }[key];
  const note = key === "sea_surface_temperature"
    ? "Model estimate at the surface, not fishing depth"
    : key === "water_temperature"
    ? "Your recorded measurement"
    : "";
  const celsius = unit === "°C" || unit === "C";
  const position = Math.max(0, Math.min(100, (value + 10) / 50 * 100));
  return `<div class="temperature-card${
    water ? " water-temperature-card" : ""
  }"><span class="visual-label">${label}</span><strong class="temperature-value">${
    esc(value)
  }<small>${esc(unit || "")}</small></strong>${
    celsius
      ? `<div class="temperature-scale" aria-label="${esc(label)} ${
        esc(value)
      } degrees Celsius"><span style="left:${position}%"></span></div><div class="temperature-range"><span>−10°</span><span>15°</span><span>40°</span></div>`
      : ""
  }${note ? `<p class="small muted">${note}</p>` : ""}</div>`;
}
function waterTemperatureCard(p, units) {
  const finite = (value) => typeof value === "number" && Number.isFinite(value);
  const key = finite(p.water_temperature) ? "water_temperature" : "sea_surface_temperature";
  if (finite(p[key])) return temperatureCard(p, units, key);
  return '<div class="temperature-card water-temperature-card"><span class="visual-label">Water temperature</span><strong class="temperature-value">—</strong><p class="small muted">Unavailable</p></div>';
}
function windDirectionCard(p) {
  const valid = typeof p.wind_direction_10m === "number" && Number.isFinite(p.wind_direction_10m);
  const degrees = valid ? ((p.wind_direction_10m % 360) + 360) % 360 : null;
  const compass = valid ? compassPoint(degrees) : "";
  return `<div class="pressure-card wind-direction-card"><span class="visual-label">Wind direction</span><strong class="temperature-value">${
    valid ? `${compass}<small>${Math.round(degrees) % 360}°</small>` : "—"
  }</strong><p class="small muted">${
    valid ? "Direction the wind is blowing from" : "Unavailable"
  }</p></div>`;
}
function pressureCard(p, units) {
  const valid = (value) => typeof value === "number" && Number.isFinite(value);
  const value = valid(p.pressure_msl)
    ? `${esc(p.pressure_msl)}<small>${esc(units?.pressure_msl || "hPa")}</small>`
    : "—";
  const change = valid(p.pressure_change_3h)
    ? ` · ${p.pressure_change_3h > 0 ? "+" : ""}${esc(p.pressure_change_3h)} ${
      esc(units?.pressure_change_3h || "hPa")
    } over 3 hours`
    : "";
  return `<div class="pressure-card"><span class="visual-label">Barometric pressure</span><strong class="temperature-value">${value}</strong><p class="small muted">${
    valid(p.pressure_msl) ? `Sea-level pressure${change}` : "Unavailable"
  }</p></div>`;
}
function conditionVisuals(p, units) {
  const phase = p.moon_phase_fraction, sky = skyFor(p);
  const moon = typeof phase === "number" && Number.isFinite(phase)
    ? `<div class="moon-card">${
      moonGraphic(phase, p.catch_location?.latitude < 0)
    }<span class="visual-label">${esc(p.moon_phase)}</span><strong>${
      esc(p.moon_illumination)
    }% illuminated</strong><small>Calculated moon phase</small></div>`
    : "";
  const weather = sky
    ? `<div class="weather-card">${
      weatherGraphic(sky.kind)
    }<span class="visual-label">Weather at catch</span><strong>${sky.label}</strong><small>${
      esc(sky.note)
    } · estimated</small></div>`
    : "";
  const temperature = temperatureCard(p, units) + waterTemperatureCard(p, units) +
    pressureCard(p, units) + windDirectionCard(p);
  return moon || weather || temperature
    ? `<div class="condition-visuals">${moon}${weather}${temperature}</div>`
    : "";
}

function fishingScore(p) {
  // Normalize the existing four-component model from its original saved inputs.
  // This is a conditions index, not a calibrated probability of a bite.
  if (
    ![p.moon_phase_fraction, p.wind_speed_10m, p.cloud_cover, p.pressure_change_3h].every((value) =>
      typeof value === "number" && Number.isFinite(value)
    )
  ) return null;
  const total = Math.abs(Math.cos(p.moon_phase_fraction * 2 * Math.PI)) +
    (p.wind_speed_10m < 25 ? 1 : 0) +
    (p.cloud_cover >= 40 ? 1 : 0) +
    (Math.abs(p.pressure_change_3h) <= 2 ? 1 : 0);
  return Math.round(total / 4 * 100);
}
function fishingRating(score) {
  return score === null ? null : Math.min(3, Math.floor(score / 25));
}
function fishingScoreCard(p) {
  if (!p.bite_estimate) return "";
  const score = fishingScore(p);
  const rating = fishingRating(score);
  const fish =
    `<svg class="score-fish-art" viewBox="0 0 140 90" aria-hidden="true"><path d="M100 44 131 23 125 46 131 68 100 52" fill="#537e70"/><path d="m48 33 22-22 17 25M48 59l22 17 10-15" fill="#789c87"/><path d="M11 46C34 16 82 15 112 46 82 77 34 76 11 46Z" fill="#245c48"/><path d="M13 47c33 6 64 7 94 0-24 25-69 29-94 0" fill="#89af94"/><path d="M44 29c10 11 10 23 0 34" fill="none" stroke="#d7e4cd" stroke-width="2"/><path d="m59 46 19-5-9 14" fill="#bdd0ad"/><circle cx="29" cy="40" r="4" fill="#ecdcab"/><circle cx="29" cy="40" r="2" fill="#123a2c"/><path d="m14 48 9 2M84 32l9 6m-17-9 9 6" stroke="#c4d7bd" stroke-width="1.5" stroke-linecap="round"/></svg>`;
  return `<section class="fishing-score" aria-label="Fishing conditions score"><div class="score-school" aria-label="${
    rating === null ? "Fish rating unavailable" : rating + " out of 3 fish"
  }"><div class="score-fish-icons" aria-hidden="true">${
    [1, 2, 3].map((n) =>
      `<span class="score-fish-slot${
        rating === null || n > rating ? " is-inactive" : ""
      }">${fish}</span>`
    ).join("")
  }</div><span class="score-rating">${
    rating === null ? "— / 3" : rating + " / 3"
  }</span></div><div class="score-content"><div class="score-heading"><span class="score-caption">Fishing conditions</span><strong class="score-value">${
    score === null ? "—" : score + "<small>%</small>"
  }</strong></div><span class="score-verdict">${
    esc(p.bite_estimate.label || "Conditions estimate")
  }</span>${
    score === null
      ? '<p class="small muted">Score unavailable: missing saved inputs.</p>'
      : `<div class="score-track" role="meter" aria-label="Conditions score" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${score}"><span style="width:${score}%"></span></div>`
  }</div></section><p class="score-note">Estimated conditions</p>`;
}

function waterClarityCard(data) {
  const observation = data?.find((snapshot) =>
    snapshot.provider === "Angler observation" &&
    ["Clear", "Slightly cloudy", "Murky"].includes(snapshot.raw_payload?.water_clarity)
  );
  return `<div class="pressure-card water-clarity-card"><span class="visual-label">Water clarity</span><strong class="temperature-value">${
    observation ? esc(observation.raw_payload.water_clarity) : "Not recorded"
  }</strong><p class="small muted">${observation ? "Observed" : ""}</p></div>`;
}
function measurementCards(p, units = {}) {
  const groups = [
    ["Weather", [
      "temperature_2m",
      "wind_speed_10m",
      "wind_direction_10m",
      "wind_gusts_10m",
      "pressure_msl",
      "pressure_change_3h",
      "cloud_cover",
      "precipitation",
      "relative_humidity_2m",
      "visibility",
    ]],
    ["Ocean", [
      "sea_surface_temperature",
      "ocean_current_velocity",
      "ocean_current_direction",
      "wave_height",
      "wave_direction",
      "wave_period",
      "wave_peak_period",
      "swell_wave_height",
      "swell_wave_direction",
      "swell_wave_period",
      "swell_wave_peak_period",
      "sea_level_height_msl",
      "tidal_stage",
      "lunar_tidal_cycle",
      "estimated_depth_m",
      "depth_source",
      "depth_resolution_arc_seconds",
    ]],
    ["Your observations", ["water_clarity", "water_temperature", "current_strength", "notes"]],
  ];
  return groups.map(([title, keys]) => {
    const fields = keys.filter((key) => typeof p[key] === "string" || Number.isFinite(p[key]));
    if (!fields.length) return "";
    return `<section class="measurement-group"><h4>${title}</h4><dl class="measurement-cards">${
      fields.map((key) =>
        field(
          conditionLabels[key],
          typeof p[key] === "number"
            ? `${Math.round(p[key] * 100) / 100}${units[key] ? " " + units[key] : ""}`
            : p[key],
        )
      ).join("")
    }</dl></section>`;
  }).join("") || '<p class="muted">No measurements were supplied for this snapshot.</p>';
}
function conditionsHTML(data) {
  if (!data?.length) {
    return waterClarityCard(data) +
      '<p class="muted">Conditions are awaiting collection. Use Refresh catch weather to try now.</p>';
  }
  const displayed = data.some((s) => s.model_version === "fishing-history-v2")
    ? data.filter((s) => s.model_version !== "fishing-context-v1")
    : data;
  return waterClarityCard(data) + displayed.map((snapshot) => {
    const p = snapshot.raw_payload || {};
    const visuals = conditionVisuals(p, snapshot.units);
    const fish = fishingScoreCard(p);
    const missing = snapshot.model_version === "fishing-context-v1"
      ? ["sea_surface_temperature", "ocean_current_velocity", "tidal_stage"].filter((key) =>
        !(key in p)
      ).map((key) => field(conditionLabels[key], "Unavailable at this location / time")).join("")
      : "";
    if (snapshot.provider === "Angler observation") {
      return `<section class="saved-observation"><h4>Your saved observations</h4>${
        measurementCards(p, snapshot.units)
      }${p.tidal_stage ? `<p>${esc(p.tidal_stage)}</p>` : ""}</section>`;
    }
    return `<p class="small muted">${esc(snapshot.provider)}${
      snapshot.sample_at
        ? " · " + esc(dateLabel(snapshot.sample_at)) + " " + esc(timeLabel(snapshot.sample_at))
        : ""
    }</p>${visuals}${fish}<details class="condition-measurements"><summary>All measurements</summary>${
      measurementCards(p, snapshot.units)
    }${missing ? `<dl class="detail-grid">${missing}</dl>` : ""}</details>${
      p.status === "partial"
        ? '<p class="small muted">Some provider data is unavailable. Collection will retry automatically.</p>'
        : ""
    }`;
  }).join("") +
    '<details class="reference-notes"><summary>Data sources</summary><p>Model estimates for the catch time and location. Sea temperature is at the surface; currents and tides may differ locally. <a href="https://open-meteo.com/" target="_blank" rel="noopener">Open-Meteo &amp; contributing models ↗</a></p></details>';
}
function compassPoint(degrees) {
  return [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ][Math.round(((degrees % 360) + 360) % 360 / 22.5) % 16];
}
function historyContextHTML(context) {
  if (!context?.features?.windows) {
    return '<section class="condition-history" aria-label="Previous 72 hours"><p class="muted">History is not available yet. Use Refresh catch weather below to check for saved history.</p></section>';
  }
  const number = (value) => Number.isFinite(value) ? esc(Math.round(value * 10) / 10) : "—";
  const periods = [3, 6, 12, 24, 48, 72];
  const panels = periods.map((hours) => {
    const w = context.features.windows[hours] || {};
    const metric = (label, value, unit, symbol, note) =>
      `<div class="history-metric"><span class="history-symbol" aria-hidden="true">${
        journalArt(
          { "≋": "current_strength", "☂": "rain", "↕": "pressure", "≈": "temperature" }[symbol],
        )
      }</span><span>${label}</span><strong>${number(value)}<small>${
        Number.isFinite(value) ? " " + unit : ""
      }</small></strong><small>${note}</small></div>`;
    const change = (value) =>
      !Number.isFinite(value)
        ? "No change estimate"
        : value > 0
        ? "↑ Rising"
        : value < 0
        ? "↓ Falling"
        : "→ Steady";
    const direction = Number.isFinite(w.wind_direction_10m?.mean_degrees)
      ? ` · ${compassPoint(w.wind_direction_10m.mean_degrees)}`
      : "";
    return `<div class="history-period" data-history-panel="${hours}"${
      hours === 24 ? "" : " hidden"
    }><p class="history-window-label">The ${hours} hours leading up to this catch</p><div class="history-metrics">${
      metric("Average wind", w.wind_speed_10m?.mean, "km/h", "≋", "Modelled wind" + direction)
    }${
      metric(
        "Total rain",
        w.precipitation?.total_mm,
        "mm",
        "☂",
        w.precipitation?.total_is_partial
          ? "Partial rainfall coverage *"
          : "Accumulated over this window",
      )
    }${
      metric("Pressure change", w.pressure_msl?.change, "hPa", "↕", change(w.pressure_msl?.change))
    }${
      metric(
        "Sea temperature change",
        w.sea_surface_temperature?.change,
        "°C",
        "≈",
        change(w.sea_surface_temperature?.change),
      )
    }</div></div>`;
  }).join("");
  const rows = periods.map((h) => {
    const w = context.features.windows[h] || {};
    return `<tr><th>${h} h</th><td>${number(w.wind_speed_10m?.mean)}</td><td>${
      number(w.precipitation?.total_mm)
    }${w.precipitation?.total_is_partial ? "*" : ""}</td><td>${
      number(w.pressure_msl?.change)
    }</td><td>${number(w.sea_surface_temperature?.change)}</td></tr>`;
  }).join("");
  return `<section class="condition-history" aria-label="Previous 72 hours"><div class="history-periods" role="group" aria-label="Hours before catch">${
    periods.map((h) =>
      `<button type="button" data-history-hours="${h}" aria-pressed="${h === 24}">${h}h</button>`
    ).join("")
  }</div><div class="history-results" aria-live="polite">${panels}</div><details class="history-table"><summary>Compare all periods</summary><div class="history-table-scroll"><table><thead><tr><th>Before catch</th><th>Wind km/h</th><th>Rain mm</th><th>Pressure Δ hPa</th><th>Sea temp Δ °C</th></tr></thead><tbody>${rows}</tbody></table></div></details>${
    context.status === "partial"
      ? '<p class="small muted">Some historical measurements are missing.</p>'
      : ""
  }</section>`;
}
function addConditionActions(c, generation) {
  const container = $("conditions");
  container.insertAdjacentHTML(
    "beforeend",
    '<div class="condition-actions"><button type="button" id="collect-conditions" class="condition-action"><span aria-hidden="true">' +
      journalArt("refresh") +
      '</span><span><strong>Refresh catch weather</strong><small>For this catch’s time and location</small></span></button></div><p id="condition-status" role="status" class="small muted"></p><details class="history-disclosure"><summary>Weather before the catch <span class="small muted">Up to 72 hours</span></summary><div id="condition-history-slot"><p class="small muted">Checking previous 72 hours…</p></div></details>',
  );
  $("collect-conditions").onclick = async () => {
    const button = $("collect-conditions");
    button.disabled = true;
    button.setAttribute("aria-busy", "true");
    $("condition-status").textContent = "Checking weather and 72-hour history for this catch…";
    try {
      const { data, error } = await client.functions.invoke("fishing-conditions", {
        body: { catch_archive_id: c.archive_id },
      });
      if (error || !data?.stored) throw error || Error("Collection unavailable");
      if (generation === conditionsGeneration && session && $("details").open) {
        const scroll = $("details").scrollTop;
        await showDetail(c);
        if (generation + 1 === conditionsGeneration && $("condition-status")) {
          $("condition-status").textContent = data.cached
            ? "Saved conditions are up to date. No new measurements were added."
            : "Weather and history updated for this catch.";
          $("details").scrollTop = scroll;
        }
      }
    } catch (error) {
      if (generation === conditionsGeneration && $("condition-status")) {
        const status = error?.context?.status;
        $("condition-status").textContent = status === 401
          ? "Your sign-in has expired. Sign in again to update weather."
          : !navigator.onLine
          ? "You are offline. Reconnect and try Refresh catch weather again."
          : "Weather could not be updated. Your saved conditions are still available; try again shortly.";
      }
    } finally {
      if (button.isConnected) {
        button.disabled = false;
        button.removeAttribute("aria-busy");
      }
    }
  };
}
async function showDayConditions(rows) {
  $("detail-label").textContent = "Day conditions";
  $("details").dataset.view = "day-conditions";
  const generation = ++conditionsGeneration;
  $("detail-body").innerHTML = `<h2>${
    esc(dateLabel(rows[0].caught_at))
  }</h2><p class="muted">Conditions at each catch location and time.</p><div id="day-conditions">Loading saved conditions…</div>`;
  if (!$("details").open) $("details").showModal();
  try {
    const snapshots = [];
    // Bound requests for long days; preserve each catch's location and timestamp.
    for (let start = 0; start < rows.length; start += 50) {
      const { data, error } = await client.from("fishing_condition_snapshots").select(
        "catch_archive_id,provider,model_version,sample_at,retrieved_at,units,raw_payload",
      ).in("catch_archive_id", rows.slice(start, start + 50).map((c) => c.archive_id)).order(
        "retrieved_at",
        { ascending: false },
      );
      if (error) throw error;
      snapshots.push(...data);
    }
    if (generation !== conditionsGeneration || !session || !$("details").open) return;
    $("day-conditions").replaceChildren();
    for (const c of rows) {
      const entry = document.createElement("section");
      entry.className = "day-condition-entry";
      entry.innerHTML = `<h3>${
        esc(timeLabel(c.caught_at))
      } · <button type="button" class="fish-name-link" data-profile="${esc(c.species_id)}">${
        esc(nameOf(c))
      }</button></h3>${
        conditionsHTML(snapshots.filter((s) => s.catch_archive_id === c.archive_id))
      }`;
      const button = document.createElement("button");
      button.className = "quiet";
      button.textContent = "Open catch / record conditions";
      button.onclick = () => showDetail(c);
      entry.append(button);
      $("day-conditions").append(entry);
    }
  } catch {
    if (generation === conditionsGeneration && $("day-conditions")) {
      $("day-conditions").textContent = "Day conditions could not be loaded. Try again.";
    }
  }
}

async function showDetail(c) {
  $("detail-label").textContent = "Catch details";
  $("details").dataset.view = "catch";
  const generation = ++conditionsGeneration;
  const setup = catchSetup(c);
  const gpsDelay = Math.round(
    (new Date(c.gps_at) - new Date(c.caught_at)) / 1000,
  );
  $("detail-body").innerHTML = `${fishImage(c.species_id, true)}<h2>${esc(nameOf(c))}</h2>${
    scientificCaption(c.species_id)
  }<p class="muted">${esc(dateLabel(c.caught_at))} · ${
    esc(timeLabel(c.caught_at))
  }</p><dl class="detail-grid catch-primary">${
    field(
      "Fish length",
      Number.isInteger(c.raw_payload?.length_cm) ? `${c.raw_payload.length_cm} cm` : null,
    )
  }${field("Fishing style", setup.style)}${field("Boat movement", setup.position)}${
    field("Tackle", setup.tackle)
  }</dl><details class="record-details"><summary>Location &amp; GPS record</summary><dl class="detail-grid">${
    field("Latitude", c.latitude.toFixed(6))
  }${field("Longitude", c.longitude.toFixed(6))}${
    field("GPS fix", c.gps_quality === 4 ? "Good" : "Usable")
  }${field("Fix relative to catch", `${gpsDelay}s`)}</dl><p class="record-id muted">Catch ID: ${
    esc(c.catch_id)
  }</p></details><div id="conditions" class="condition"><h3>Conditions</h3><p class="muted">Checking saved conditions…</p></div>`;
  upgradeFishPortrait(c.species_id);
  if (!$("details").open) $("details").showModal();
  $("details").scrollTop = 0;
  $("detail-body").scrollTop = 0;
  try {
    const { data, error } = await client.from("fishing_condition_snapshots")
      .select("provider,model_version,sample_at,retrieved_at,units,raw_payload").eq(
        "catch_archive_id",
        c.archive_id,
      ).order("retrieved_at", { ascending: false }).limit(10);
    if (generation !== conditionsGeneration || !session || !$("details").open) {
      return;
    }
    if (error) throw error;
    $("conditions").innerHTML = "<h3>Conditions</h3>" + conditionsHTML(data);
    addConditionActions(c, generation);
    try {
      const history = await client.from("fishing_environment_features").select(
        "features,astronomy,quality,status",
      ).eq("catch_archive_id", c.archive_id).eq("feature_version", "fishing-history-v2").limit(1);
      if (generation === conditionsGeneration && session && $("details").open) {
        $("condition-history-slot").innerHTML = history.error
          ? '<p class="muted">History could not be loaded. Try Refresh catch weather again.</p>'
          : historyContextHTML(history.data?.[0]);
      }
    } catch {
      if (generation === conditionsGeneration && $("condition-history-slot")) {
        $("condition-history-slot").textContent =
          "History could not be loaded. Try Refresh catch weather again.";
      }
    }
  } catch {
    if (generation === conditionsGeneration && $("conditions")) {
      $("conditions").innerHTML =
        '<h3>Conditions</h3><p class="muted">Conditions could not be loaded. Your catch is still saved.</p>';
      addConditionActions(c, generation);
      $("condition-history-slot").innerHTML = historyContextHTML(null);
    }
  }
}
document.querySelector(".skip-link").addEventListener("click", (event) => {
  event.preventDefault();
  $("main-content").focus();
  $("main-content").scrollIntoView({ block: "start", behavior: "instant" });
});
const viewKeys = ["home", "map", "totals", "diary", "spots", "insights"];
const viewNames = {
  home: "Home",
  map: "Map",
  totals: "Species",
  diary: "Days",
  spots: "Spots",
  insights: "Insights",
};
const desktopViews = matchMedia("(min-width: 951px) and (hover: hover) and (pointer: fine)");
function selectedPages() {
  const pages = [
    ...new Set(
      location.hash.slice(1).split(",").map((key) =>
        key === "days" || key === "trips" ? "diary" : key
      ).filter((key) => viewKeys.includes(key)),
    ),
  ];
  return pages.length > 2 ? [pages[0], pages.at(-1)] : pages.length ? pages : ["home"];
}
function route() {
  const requested = selectedPages();
  const page = requested[requested.length - 1];
  const pages = desktopViews.matches ? requested : [page];
  document.body.classList.toggle("multiple-views", pages.length > 1);
  document.body.classList.toggle("map-left", pages.length === 2 && pages[0] === "map");
  document.body.classList.toggle("map-right", pages.length === 2 && pages[1] === "map");
  document.body.classList.toggle("home-only", pages.length === 1 && pages[0] === "home");
  for (const key of viewKeys) {
    const section = $(`${key}-page`);
    section.hidden = !pages.includes(key);
    section.dataset.viewLabel = viewNames[key];
    section.style.order = desktopViews.matches ? String(pages.indexOf(key) + 1) : "";
    const tab = document.querySelector(`.tabs [data-page="${key}"]`);
    tab.dataset.selected = String(pages.includes(key));
    tab.setAttribute("aria-current", page === key ? "page" : "false");
  }
  document.body.dataset.page = page;
  $("page-title").textContent = pages.map((key) => viewNames[key]).join(" + ");
  $("empty").hidden =
    !pages.some((key) => (key === "totals" || (key === "map" && mapViewMode === "catches"))) ||
    visible.length > 0;
  document.title = $("page-title").textContent + " · Catch and Conditions";
  if (pages.includes("insights") && session && !$("journal").hidden) renderInsights();
  if (pages.includes("map") && session && !$("journal").hidden) {
    renderMap();
    requestAnimationFrame(() => map?.invalidateSize({ pan: false }));
  }
}
// Reserve the measured account bar height so the pinned page tabs never cover it.
const accountBar = document.querySelector(".masthead");
const accountBarSize = new ResizeObserver(() => {
  document.documentElement.style.setProperty(
    "--account-bar-height",
    `${accountBar.getBoundingClientRect().height}px`,
  );
});
accountBarSize.observe(accountBar);
desktopViews.addEventListener("change", route);
document.querySelectorAll(".tabs [data-page]").forEach((tab) => {
  tab.addEventListener("click", (event) => {
    if (!desktopViews.matches || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
    if (event.detail > 1) return;
    const key = tab.dataset.page;
    let pages = selectedPages();
    pages = pages.includes(key)
      ? (pages.length > 1 ? pages.filter((page) => page !== key) : [key])
      : pages.length === 2
      ? [pages[0], key]
      : [...pages, key];
    location.hash = pages.join(",");
    route();
  });
  tab.addEventListener("dblclick", (event) => {
    if (!desktopViews.matches) return;
    event.preventDefault();
    location.hash = tab.dataset.page;
    route();
  });
});
document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-map-lat]");
  if (!target) return;
  openSpotOnMap(
    Number(target.dataset.mapLat),
    Number(target.dataset.mapLon),
    target.dataset.mapLabel,
  );
});
updateModeControls();
document.querySelectorAll("button[data-fishing-mode]").forEach((button) => {
  button.addEventListener("click", () => setFishingMode(button.dataset.fishingMode));
});
for (const id of ["species", "from", "to"]) {
  $(id).addEventListener("change", render);
}
$("filter-species-info").onclick = () => {
  if ($("species").value) showSpeciesProfile($("species").value);
};
$("clear").onclick = () => {
  for (const id of ["species", "from", "to"]) $(id).value = "";
  render();
};
$("fit").onclick = fitMap;
$("refresh").onclick = refreshJournal;
document.addEventListener("click", (event) => {
  const period = event.target.closest("[data-history-hours]");
  if (period) {
    const section = period.closest(".condition-history");
    section.querySelectorAll("[data-history-hours]").forEach((button) =>
      button.setAttribute("aria-pressed", String(button === period))
    );
    section.querySelectorAll("[data-history-panel]").forEach((panel) =>
      panel.hidden = panel.dataset.historyPanel !== period.dataset.historyHours
    );
    return;
  }
  const button = event.target.closest("[data-profile]");
  if (button) showSpeciesProfile(button.dataset.profile);
});
$("close-detail").onclick = () => $("details").close();
$("details").addEventListener("close", () => {
  // A queued close event from an earlier view must not invalidate a reopened catch.
  if (!$("details").open) conditionsGeneration++;
});
window.addEventListener("hashchange", () => {
  route();
  window.scrollTo({ top: 0, behavior: "instant" });
});
window.addEventListener("online", () => {
  if (session) refreshJournal();
});
function refreshWhenVisible() {
  if (
    session && !document.hidden && !$("refresh").disabled &&
    Date.now() - lastRefreshAt > 15000
  ) refreshJournal();
}
window.addEventListener("focus", refreshWhenVisible);
document.addEventListener("visibilitychange", refreshWhenVisible);
setInterval(refreshWhenVisible, 60000);
$("signout").onclick = async () => {
  $("signout").disabled = true;
  try {
    const { error } = await client.auth.signOut({ scope: "local" });
    if (error) throw error;
    session = null;
    resetPrivateView();
    loginMessage("Signed out.");
  } catch {
    message("Could not sign out. Please try again.", true);
  } finally {
    $("signout").disabled = false;
  }
};
$("login-form").onsubmit = async (event) => {
  event.preventDefault();
  if (!client) return;
  if ($("login-button").disabled) return;
  $("login-button").disabled = true;
  $("login-form").setAttribute("aria-busy", "true");
  loginMessage("Signing in…");
  try {
    const { data, error } = await client.auth.signInWithPassword({
      email: $("email").value.trim(),
      password: $("password").value,
    });
    if (error) throw error;
    if (data?.session) await setSession(data.session);
  } catch (error) {
    loginMessage(
      error.message || "Could not sign in. Check your connection.",
      true,
    );
  } finally {
    $("login-button").disabled = false;
    $("login-form").removeAttribute("aria-busy");
    $("password").value = "";
  }
};
async function start() {
  $("filter-panel").open = false;
  if (!window.supabase) {
    loginMessage(
      "The sign-in library could not load. Refresh and try again.",
      true,
    );
    $("login-button").disabled = true;
    return;
  }
  const key = config.publishableKey;
  let allowed = typeof key === "string" && key.startsWith("sb_publishable_");
  if (!allowed && typeof key === "string" && key.split(".").length === 3) {
    try {
      allowed = JSON.parse(
        atob(key.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
      ).role === "anon";
    } catch {
      allowed = false;
    }
  }
  if (!allowed) {
    loginMessage(
      "One setup step remains: add your Supabase publishable key to config.js.",
    );
    $("login-button").disabled = true;
    return;
  }
  // Supabase restores this browser’s saved session and refreshes expired tokens.
  client = window.supabase.createClient(config.supabaseUrl, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
    global: {
      fetch: async (url, options = {}) => {
        const controller = new AbortController();
        const abort = () => controller.abort();
        if (options.signal?.aborted) controller.abort();
        else options.signal?.addEventListener("abort", abort, { once: true });
        const timeout = setTimeout(abort, 20000);
        try {
          return await fetch(url, { ...options, signal: controller.signal });
        } finally {
          clearTimeout(timeout);
          options.signal?.removeEventListener("abort", abort);
        }
      },
    },
  });
  const authClient = client;
  authClient.auth.onAuthStateChange((event, next) => {
    if (client !== authClient) return;
    // Leave the auth callback before making further Supabase requests.
    if (["SIGNED_IN", "SIGNED_OUT", "INITIAL_SESSION"].includes(event)) {
      setTimeout(() => {
        if (client === authClient) setSession(next);
      }, 0);
    }
    if (event === "TOKEN_REFRESHED") session = next;
  });
}

function setupHomeAlbum() {
  const book = $("home-album");
  if (!book) return;
  const pages = [...book.querySelectorAll("[data-album-page]")];
  let index = 0, gesture = null, timer = null, visible = false;
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  function schedule() {
    clearTimeout(timer);
    $("album-position").setAttribute("aria-live", "off");
    if (visible && !document.hidden) {
      timer = setTimeout(() => {
        turn((index + 1) % pages.length);
        schedule();
      }, 5000);
    }
  }
  function manual(next) {
    turn(next);
    schedule();
  }
  new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    schedule();
  }, { threshold: .25 }).observe(book);
  document.addEventListener("visibilitychange", schedule);
  function turn(next) {
    const target = Math.max(0, Math.min(pages.length - 1, next));
    book.querySelector(".album-ghost")?.remove();
    if (target !== index && !motion.matches) {
      const outgoing = pages[index].cloneNode(true);
      outgoing.removeAttribute("data-album-page");
      outgoing.removeAttribute("role");
      outgoing.removeAttribute("aria-label");
      outgoing.setAttribute("aria-hidden", "true");
      outgoing.classList.add("album-ghost");
      outgoing.inert = true;
      book.querySelector(".album-pages").append(outgoing);
      setTimeout(() => outgoing.remove(), 1200);
    }
    index = target;
    pages.forEach((page, i) => {
      page.hidden = i !== index;
      page.setAttribute("role", "group");
      page.setAttribute("aria-roledescription", "slide");
      page.setAttribute("aria-label", `${i + 1} of ${pages.length}`);
    });
    pages[index].querySelector("img").loading = "eager";
    $("album-prev").disabled = index === 0;
    $("album-next").disabled = index === pages.length - 1;
    $("album-position").textContent = `Photo ${index + 1} of ${pages.length}`;
  }
  $("album-prev").onclick = () => manual(index - 1);
  $("album-next").onclick = () => manual(index + 1);
  book.addEventListener("keydown", (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const next =
      { ArrowLeft: index - 1, ArrowRight: index + 1, Home: 0, End: pages.length - 1 }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    manual(next);
  });
  book.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "touch" || event.pointerType === "pen") {
      gesture = { id: event.pointerId, x: event.clientX, y: event.clientY };
    }
  });
  book.addEventListener("pointerup", (event) => {
    if (!gesture || gesture.id !== event.pointerId) return;
    const dx = event.clientX - gesture.x, dy = event.clientY - gesture.y;
    gesture = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) manual(index + (dx < 0 ? 1 : -1));
  });
  book.addEventListener("pointercancel", () => {
    gesture = null;
  });
  book.querySelectorAll("img").forEach((img) => img.draggable = false);
  turn(0);
  schedule();
}
setupInsights();
setupHomeAlbum();
start();
if ("serviceWorker" in navigator && location.protocol !== "file:") {
  // Updates apply on the next opening; never interrupt a login or unsaved form.
  navigator.serviceWorker.register("./sw.js", { updateViaCache: "none" })
    .then((registration) => registration.update()).catch(() => {});
}

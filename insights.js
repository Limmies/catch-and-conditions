"use strict";
(() => {
  const metrics = {
    species: { label: "Species" },
    day: { label: "Fishing date" },
    spot: { label: "Spot" },
    sea: { label: "Sea surface temperature", unit: "°C", step: 2 },
    pressure: { label: "Barometric pressure", unit: "hPa", step: 5 },
    moon: { label: "Moon phase" },
    illumination: { label: "Moon illumination", unit: "%", step: 10 },
    current: { label: "Current speed", unit: "km/h", step: .5 },
    length: { label: "Fish length", unit: "cm", step: 10 },
  };
  const phases = [
    "New moon",
    "Waxing crescent",
    "First quarter",
    "Waxing gibbous",
    "Full moon",
    "Waning gibbous",
    "Last quarter",
    "Waning crescent",
  ];
  function snapshotsFor(rows, caughtAt) {
    const latest = new Map();
    for (
      const s of [...rows].sort((a, b) =>
        String(b.retrieved_at).localeCompare(String(a.retrieved_at)) ||
        String(b.id).localeCompare(String(a.id))
      )
    ) {
      if (
        s.provider === "Angler observation" || !s.sample_at ||
        Math.abs(Date.parse(s.sample_at) - Date.parse(caughtAt)) > 3600000 ||
        !Number.isFinite(Date.parse(s.sample_at))
      ) continue;
      const key = s.provider + "|" + s.model_version;
      if (!latest.has(key)) latest.set(key, s);
    }
    const all = [...latest.values()];
    return all.some((s) => s.model_version === "fishing-history-v2")
      ? all.filter((s) => s.model_version !== "fishing-context-v1")
      : all;
  }
  function value(c, key, snapshots = []) {
    if (key === "length") {
      return Number.isFinite(c.raw_payload?.length_cm) && c.raw_payload.length_cm > 0
        ? c.raw_payload.length_cm
        : null;
    }
    const field = {
      sea: "sea_surface_temperature",
      pressure: "pressure_msl",
      moon: "moon_phase_fraction",
      illumination: "moon_illumination",
      current: "ocean_current_velocity",
    }[key];
    for (const s of snapshotsFor(snapshots, c.caught_at)) {
      let v = s.raw_payload?.[field];
      if (!Number.isFinite(v)) continue;
      const measuredAt = s.raw_payload?.field_sample_times?.[field] ||
        (["moon", "illumination"].includes(key) ? s.raw_payload?.catch_at : null) || s.sample_at;
      if (
        !Number.isFinite(Date.parse(measuredAt)) ||
        Math.abs(Date.parse(measuredAt) - Date.parse(c.caught_at)) > 3600000
      ) continue;
      const unit = String(s.units?.[field] || "").toLowerCase().trim();
      if (key === "sea" && !["°c", "c", "celsius"].includes(unit)) continue;
      if (key === "pressure") {
        if (unit === "pa") v /= 100;
        else if (!["hpa", "mbar"].includes(unit)) continue;
      }
      if (key === "current") {
        if (["m/s", "m s-1"].includes(unit)) v *= 3.6;
        else if (["kn", "knots", "kt"].includes(unit)) v *= 1.852;
        else if (unit !== "km/h") continue;
      }
      if (key === "moon" && (v < 0 || v > 1)) continue;
      if (key === "illumination" && (v < 0 || v > 100 || (unit && unit !== "%"))) continue;
      if (
        key === "sea" && (v < -3 || v > 50) || key === "pressure" && (v < 800 || v > 1100) ||
        key === "current" && (v < 0 || v > 50)
      ) continue;
      return v;
    }
    return null;
  }
  function groups(rows, key, getValue, stepOverride) {
    const grouped = new Map(), step = stepOverride || metrics[key]?.step;
    for (const c of rows) {
      const v = getValue(c, key);
      if (v === null || v === undefined || v === "") continue;
      const bin = key === "moon"
        ? Math.round(v * 8) % 8
        : step
        ? Math.floor((key === "illumination" ? Math.min(v, 100 - 1e-9) : v) / step)
        : v;
      if (!grouped.has(bin)) grouped.set(bin, []);
      grouped.get(bin).push(c);
    }
    let keys = [...grouped.keys()].sort((a, b) =>
      typeof a === "number" ? a - b : String(a).localeCompare(String(b))
    );
    if (key === "moon") keys = Array.from({ length: 8 }, (_, i) => i);
    if (key === "illumination" && grouped.size) {
      keys = Array.from({ length: Math.ceil(100 / step) }, (_, i) => i);
    }
    if (step && keys.length) {
      const min = key === "current" ? 0 : keys[0], max = keys.at(-1);
      if (max - min <= 1000) keys = Array.from({ length: max - min + 1 }, (_, i) => min + i);
    }
    return keys.map((k) => ({
      key: k,
      label: key === "moon"
        ? phases[k]
        : step
        ? `${Number((k * step).toFixed(2))}–${
          key === "illumination" && (k + 1) * step >= 100 ? "" : "<"
        }${Number(((k + 1) * step).toFixed(2))} ${metrics[key].unit}`
        : String(k),
      rows: grouped.get(k) || [],
    }));
  }
  function ratings(rows, { mode = "all", from = "", to = "", dates = null } = {}) {
    const latest = new Map();
    for (
      const row of [...rows].sort((a, b) =>
        (b._localVersion || 0) - (a._localVersion || 0) ||
        String(b.recorded_at || "").localeCompare(String(a.recorded_at || "")) ||
        String(b.id || "").localeCompare(String(a.id || ""))
      )
    ) {
      const day = row.observation_date, style = row.fishing_mode;
      if (
        row._missing || !/^\d{4}-\d{2}-\d{2}$/.test(day || "") ||
        !["all", "offshore", "shore"].includes(style)
      ) continue;
      if (
        mode !== "all" && style !== mode || from && day < from || to && day > to ||
        dates && !dates.has(day)
      ) continue;
      const key = day + ":" + style;
      if (!latest.has(key)) latest.set(key, row);
    }
    return [...latest.values()].sort((a, b) =>
      a.observation_date.localeCompare(b.observation_date) ||
      a.fishing_mode.localeCompare(b.fishing_mode)
    );
  }
  globalThis.JournalInsights = Object.freeze({
    metrics,
    phases,
    value,
    groups,
    snapshotsFor,
    ratings,
  });
})();

let insightsMap = null, insightsHeat = null, insightsPoints = null, insightsModel = null;
let insightsSnapshots = new Map(),
  insightsFetchGeneration = -1,
  insightsRequest = 0,
  insightsState = "idle",
  insightsRadius = null;
function resetInsights() {
  insightsRequest++;
  insightsFetchGeneration = -1;
  insightsSnapshots.clear();
  insightsState = "idle";
  insightsModel = null;
  insightsRadius = null;
  if (insightsMap) insightsMap.remove();
  insightsMap = null;
  insightsHeat = null;
  insightsPoints = null;
  for (
    const id of [
      "insights-overview",
      "insights-ratings",
      "insights-ratings-status",
      "insights-conditions",
      "insights-comparison",
      "insights-spot-species",
      "insights-density-summary",
      "insights-map",
    ]
  ) $(id)?.replaceChildren();
  if ($("insights-density-species")) $("insights-density-species").replaceChildren();
}
async function loadInsightsConditions() {
  if (!session || insightsFetchGeneration === loadGeneration) return;
  const generation = loadGeneration, request = ++insightsRequest, owner = session.user.id;
  insightsFetchGeneration = generation;
  insightsState = "loading";
  insightsSnapshots = new Map();
  const current = () =>
    request === insightsRequest && generation === loadGeneration && session?.user.id === owner;
  try {
    const ids = [...new Set(catches.map((c) => c.archive_id).filter(Boolean))], all = [];
    for (let i = 0; i < ids.length; i += 100) {
      for (let offset = 0;; offset += 500) {
        const { data, error } = await client.from("fishing_condition_snapshots").select(
          "id,catch_archive_id,provider,model_version,sample_at,retrieved_at,units,raw_payload",
        ).in("catch_archive_id", ids.slice(i, i + 100)).order("retrieved_at", { ascending: false })
          .order("id", { ascending: false }).range(offset, offset + 499);
        if (!current()) return;
        if (error || !Array.isArray(data)) throw Error("Unavailable");
        all.push(...data);
        if (data.length < 500) break;
      }
    }
    if (!current()) return;
    for (const row of all) {
      if (!insightsSnapshots.has(row.catch_archive_id)) {
        insightsSnapshots.set(row.catch_archive_id, []);
      }
      insightsSnapshots.get(row.catch_archive_id).push(row);
    }
    insightsState = "ready";
  } catch {
    if (current()) insightsState = "error";
  }
  if (current() && !$("insights-page").hidden) renderInsights();
}
function insightValue(c, key) {
  if (key === "species") return species[c.species_id]?.[0] || c.species_id;
  if (key === "day") return dayKey(c.caught_at);
  return JournalInsights.value(c, key, insightsSnapshots.get(c.archive_id) || []);
}
function insightTable(rows, heading = "Value", key = heading) {
  return `<details class="insight-data" data-disclosure="insight:${
    esc(key)
  }"><summary>View all data · ${rows.length} ${
    rows.length === 1 ? "row" : "rows"
  }</summary><div class="table-wrap"><table><thead><tr><th>${
    esc(heading)
  }</th><th>Value</th><th>Sample</th></tr></thead><tbody>${
    rows.map((r) =>
      `<tr><td>${esc(r.label)}</td><td>${esc(r.value)}</td><td>${esc(r.sample || "")}</td></tr>`
    ).join("")
  }</tbody></table></div></details>`;
}
function insightInterpretation(message) {
  return `<aside class="insight-interpretation"><h4>What this shows</h4><p>${esc(message)}</p></aside>`;
}
function insightSummary(rows, unit = "catches", title = "") {
  const valid = rows.filter((r) => Number.isFinite(r.value));
  if (!valid.length) return insightInterpretation("There are not enough usable records in these filters to describe a pattern yet.");
  const max = Math.max(...valid.map((r) => r.value)), top = valid.filter((r) => r.value === max);
  const amount = Number.isInteger(max) ? String(max) : max.toFixed(2);
  const displayUnit = unit === "catches" && max === 1 ? "catch" : unit;
  const peak = top.length === valid.length && valid.length > 1
    ? `All ${valid.length} categories have ${amount} ${displayUnit}.`
    : `${top.slice(0, 3).map((r) => r.label).join("; ")}${top.length > 3 ? ` and ${top.length - 3} other categories` : ""} ${top.length > 1 ? "are tied for the highest value" : "has the highest value"}: ${amount} ${displayUnit}.`;
  const context = unit === "catches / fishing hour"
    ? "This accounts for recorded fishing hours, including zero-catch sessions. Small samples and differences in conditions can change spot rankings."
    : unit === "catches"
    ? "Recorded catch totals; differences in fishing time can affect the comparison."
    : "This describes the saved measurements, not a prediction.";
  const condition = /temperature|pressure|current|moon/i.test(title)
    ? " Conditions are catch-time values, not rising or falling trends."
    : "";
  return insightInterpretation(`${peak} ${context}${condition}`);
}
function insightRatingSummary(rows, key) {
  if (!rows.length) return insightInterpretation("No saved scores are available for this rating in the selected fishing events.");
  const scopes = [...new Set(rows.map((r) => r.fishing_mode))];
  return insightInterpretation(scopes.map((scope) => {
    const values = rows.filter((r) => r.fishing_mode === scope).map((r) => r[key]);
    return `${fishingModeLabels[scope]} averages ${(values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)}/10 across ${values.length} saved scores, ranging from ${Math.min(...values)} to ${Math.max(...values)}.`;
  }).join(" ") + " Personal scores for separate fishing events; not a measure of catch rate.");
}
function insightBars(title, rows, note = "", unit = "catches") {
  const maximum = Math.max(1, ...rows.map((r) => r.value)), shown = rows.slice(0, 12);
  return `<article class="insight-card"><h3>${esc(title)}</h3><p class="insight-caption">${
    esc(note)
  }</p>${
    rows.length
      ? `<div class="insight-bars">${
        shown.map((r) =>
          `<div class="insight-bar-row"><span>${
            esc(r.label)
          }</span><div class="insight-bar-track"><i style="width:${
            Math.max(0, r.value / maximum * 100)
          }%"></i></div><strong>${
            Number.isInteger(r.value) ? r.value : r.value.toFixed(2)
          }</strong>${r.sample ? `<small>${esc(r.sample)}</small>` : ""}</div>`
        ).join("")
      }</div><p class="small muted">${esc(unit)} · scale starts at zero${
        rows.length > 12 ? ` · showing 12 of ${rows.length}; all rows below` : ""
      }</p>${insightTable(rows, "Value", title)}`
      : '<p class="insight-empty">No usable records for these filters.</p>'
  }${insightSummary(rows, unit, title)}</article>`;
}
let insightSteps = { sea: 1, pressure: 2, illumination: 10, current: 1 };
function insightAxisLines(label) {
  const lines = []; let line = "";
  for (const word of String(label).split(/\s+/)) {
    if (line && (line + " " + word).length > 14) { lines.push(line); line = word; }
    else line += (line ? " " : "") + word;
  }
  if (line) lines.push(line);
  return lines.slice(0, 3).map((text) => text.length > 18 ? text.slice(0, 17) + "…" : text);
}
function insightPlot(title, rows, note = "", unit = "catches", kind = "dots", xLabel = "") {
  if (!rows.length) return insightBars(title, [], note, unit);
  const numeric = kind === "line",
    width = Math.max(
      numeric ? 520 : 360,
      numeric ? Math.min(620, rows.length * 36 + 100) : rows.length * 90 + 80,
    ),
    height = numeric ? 300 : 320;
  const left = numeric ? 55 : 50,
    right = width - 30,
    top = 30,
    bottom = numeric ? 225 : 215,
    max = Math.max(1, ...rows.map((r) => r.value));
  const px = (i) =>
      numeric ? (rows.length === 1 ? (left + right) / 2 : left + i * (right - left) / (rows.length - 1)) : left + (i + .5) * (right - left) / rows.length,
    py = (v) => bottom - v / max * (bottom - top);
  const ticks = [...new Set(Array.from({ length: 5 }, (_, i) => Math.round(max * i / 4)))],
    labelEvery = Math.max(1, Math.ceil(rows.length / (innerWidth <= 650 ? 4 : 9)));
  const line = numeric && rows.length > 1
    ? `<path class="insight-line" d="${
      rows.map((r, i) => (i ? "L" : "M") + px(i) + "," + py(r.value)).join(" ")
    }"/>`
    : "";
  const chart = `<div class="insight-plot-scroll" tabindex="0" aria-label="Scrollable ${
    esc(title)
  }"><svg class="insight-plot ${
    numeric ? "insight-line-plot" : kind === "bars" ? "insight-bar-plot" : "insight-dot-plot"
  }" viewBox="0 0 ${width} ${height}" style="min-width:${
    numeric || rows.length <= 3 ? 0 : width
  }px" role="img" aria-label="${esc(title)}"><g class="insight-gridlines">${
    ticks.map((v) =>
      `<path d="M${left},${py(v)}H${right}"/><text x="${left - 9}" y="${
        py(v) + 4
      }" text-anchor="end">${Number.isInteger(v) ? v : v.toFixed(1)}</text>`
    ).join("")
  }</g><path d="M${left},${top}V${bottom}H${right}" fill="none" stroke="#a99d81"/>${line}${
    rows.map((r, i) =>
      `${kind === "bars" ? `<rect x="${px(i) - 23}" y="${py(r.value)}" width="46" height="${bottom - py(r.value)}" rx="3" fill="${esc(r.colour || "#297a88")}"><title>${esc(r.label)}: ${r.value} catches</title></rect><text class="insight-axis-label" x="${px(i)}" y="${py(r.value)-9}" text-anchor="middle">${r.value}</text>` : `<circle class="insight-dot" style="fill:${esc(r.colour || "var(--insight-accent, #297a88)")}" cx="${px(i)}" cy="${py(r.value)}" r="${
        numeric ? 4 : 5
      }"><title>${esc(r.label)}: ${r.value} ${esc(unit)}${
        r.sample ? " · " + esc(r.sample) : ""
      }</title></circle>`}${
        !numeric || i % labelEvery === 0 || i === rows.length - 1
          ? numeric ? `<text class="insight-axis-label" x="${px(i)}" y="${bottom + 20}" text-anchor="${i === rows.length - 1 ? "end" : i === 0 ? "start" : "middle"}">${esc(r.axisLabel ?? r.label)}</text>`
          : `<text class="insight-axis-label" text-anchor="middle"><title>${esc(r.label)}</title>${insightAxisLines(r.label).map((text, line) => `<tspan x="${px(i)}" y="${bottom + 22 + line * 16}">${esc(text)}</tspan>`).join("")}</text>`
          : ""
      }`
    ).join("")
  }<text class="insight-axis-title" x="${left}" y="16">${
    esc(unit)
  }</text><text class="insight-axis-title" x="${(left + right) / 2}" y="${
    height - 8
  }" text-anchor="middle">${esc(xLabel)}</text></svg></div>`;
  return `<article class="insight-card"><h3>${esc(title)}</h3><p class="insight-caption">${
    esc(note)
  }</p>${chart}<p class="small muted">${
    numeric
      ? "Points are catch totals per interval; straight lines connect them without smoothing."
      : kind === "bars" ? "Each upright bar shows the recorded catch total for one species." : "One dot per category shows its total; category order does not imply a trend."
  }</p>${numeric || rows.length <= 3 ? "" : '<p class="insight-chart-hint">Swipe the chart sideways to see every category.</p>'}${insightTable(rows, "Interval / category", title)}${insightSummary(rows, unit, title)}</article>`;
}
function insightBinnedRows(rows, key) {
  const grouped = JournalInsights.groups(rows, key, insightValue, insightSteps[key]);
  const used = grouped.reduce((n, g) => n + g.rows.length, 0);
  return {
    used,
    values: used
      ? grouped.map((g) => ({
        label: g.label,
        axisLabel: key === "illumination" && (g.key + 1) * (insightSteps[key] || 10) >= 100
          ? `${g.key * (insightSteps[key] || 10)}–100`
          : JournalInsights.metrics[key].step
          ? String(
            Number((g.key * (insightSteps[key] || JournalInsights.metrics[key].step)).toFixed(2)),
          )
          : g.label,
        value: g.rows.length,
      }))
      : [],
  };
}
function insightConditionChart(rows, key) {
  const { used, values } = insightBinnedRows(rows, key);
  const metric = JournalInsights.metrics[key];
  const measurements = rows.map((c) => insightValue(c, key)).filter((v) => v !== null);
  const coverage = measurements.length ? `${new Set(measurements).size} distinct saved values, from ${Math.min(...measurements).toFixed(2)} to ${Math.max(...measurements).toFixed(2)} ${metric.unit}; grouped into intervals, not one point per catch.` : "No usable measurements are saved for these filters.";
  return insightPlot(
    `Catches × ${metric.label.toLowerCase()}`,
    values,
    `${used} of ${rows.length} catches with usable saved ${
      key === "illumination" ? "astronomy" : "model conditions"
    } · ${rows.length - used} unavailable · ${insightSteps[key]} ${metric.unit} intervals. ${coverage}`,
    "catches",
    "line",
    `${metric.label} (${metric.unit}) · intervals`,
  );
}
function renderInsights() {
  if (!session || $("insights-page").hidden) return;
  const expanded = disclosureState($("insights-page"));
  const selector = $("insights-density-species");
  if (!selector.options.length || selector.dataset.options !== $("species").innerHTML) {
    selector.innerHTML = $("species").innerHTML;
    selector.dataset.options = $("species").innerHTML;
    selector.options[0].textContent = "All fish";
  }
  selector.value = $("species").value;
  void loadInsightsConditions();
  const rows = uniqueRecords(visible);
  const speciesCounts = new Map();
  for (const c of rows) speciesCounts.set(c.species_id, (speciesCounts.get(c.species_id) || 0) + 1);
  const speciesRows = [...speciesCounts].sort((a, b) => b[1] - a[1]).map(([id, value]) => ({label: species[id]?.[0] || id, value, colour: species[id]?.[1]}));
  const { ranked } = collectSpotProductivity(diaryTripRows(false));
  const spotCounts = ranked.slice().sort((a, b) => b.count - a.count).map((s) => ({
    label: sessionSpotLabel(s.session),
    value: s.count,
    sample: `${s.sessions} ${s.sessions === 1 ? "session" : "sessions"}`,
  }));
  const spotRates = ranked.filter((s) => s.seconds > 0).map((s) => ({
    label: sessionSpotLabel(s.session),
    value: s.count * 3600 / s.seconds,
    sample: `${s.count} catches · ${(s.seconds / 3600).toFixed(2)} h · ${s.sessions} ${
      s.sessions === 1 ? "session" : "sessions"
    }`,
  }));
  $("insights-overview").innerHTML = insightPlot("Catches by species", speciesRows, `${rows.length} filtered catches`, "catches", "bars", "Species") + insightPlot("Catches by spot", spotCounts, "Stored fishing sessions with known spots") +
    insightBars(
      "Productivity by spot",
      spotRates,
      "Total catches ÷ classified fishing hours, including zero-catch sessions",
      "catches / fishing hour",
    );
  const matrix = ranked.flatMap((s) =>
    Object.entries(s.speciesCounts).filter(([id]) =>
      !$("species").value || id === $("species").value
    ).filter(([, count]) => count > 0).map(([id, count]) => ({
      label: `${sessionSpotLabel(s.session)} · ${species[id]?.[0] || id}`,
      value: count,
      sample: `${s.sessions} ${s.sessions === 1 ? "session" : "sessions"}`,
    }))
  ).sort((a, b) => b.value - a.value);
  $("insights-spot-species").innerHTML = insightBars(
    "Which species, which spot?",
    matrix,
    "Species breakdown from stored sessions. Catch totals can differ from catches without a recorded session.",
  );
  $("insights-condition-status").textContent = insightsState === "loading"
    ? "Loading saved catch conditions…"
    : insightsState === "error"
    ? "Saved conditions could not load. Other charts remain available."
    : `Saved catch-time conditions · ${
      rows.filter((c) => insightsSnapshots.has(c.archive_id)).length
    } of ${rows.length} filtered catches have snapshots; each chart reports usable coverage.`;
  $("insights-retry").hidden = insightsState !== "error";
  $("insights-conditions").innerHTML = ["sea", "pressure", "illumination", "current"].map((key) =>
    insightConditionChart(rows, key)
  ).join("");
  renderInsightsRatings();
  renderInsightsComparison(rows, ranked);
  renderInsightsMap(rows);
  restoreDisclosures($("insights-page"), expanded);
}
function renderInsightsComparison(rows, ranked) {
  const x = $("insights-x").value, metric = JournalInsights.metrics[x];
  if (x === "spot") {
    $("insights-comparison").innerHTML = insightPlot("Catches by spot", ranked.map((s) => ({
      label: sessionSpotLabel(s.session), value: s.count,
      sample: `${s.sessions} ${s.sessions === 1 ? "session" : "sessions"}`,
    })), "Recorded catches linked to fishing spots");
    return;
  }
  const { used, values } = insightBinnedRows(rows, x);
  $("insights-comparison").innerHTML = insightPlot(
    `Catches × ${metric.label.toLowerCase()}`, values,
    `${used} of ${rows.length} catches with usable data`, "catches",
    metric.step ? "line" : x === "species" ? "bars" : "dots", metric.label,
  );
}
function renderInsightsMap(rows) {
  if (!window.L || !window.FishingDensity) {
    $("insights-map").textContent = "The density map could not load. Your charts remain available.";
    return;
  }
  if (!insightsMap) {
    insightsMap = L.map("insights-map", { zoomAnimation: false, fadeAnimation: false, scrollWheelZoom: false, touchZoom: true, bounceAtZoomLimits: false }).setView([
      -34.08,
      22.97,
    ], 8);
    limitMapToSouthAfrica(insightsMap);
    setupMapGestures(insightsMap);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      noWrap: true,
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(insightsMap);
    insightsPoints = L.featureGroup().addTo(insightsMap);
  }
  const id = $("species").value,
    points = FishingDensity.locations(rows),
    radius = insightsRadius || FishingDensity.bandwidth(points);
  $("insights-radius-label").textContent = (insightsRadius ? "" : "Auto · ") +
    densityRadiusLabel(radius);
  $("insights-radius").value = String(
    Math.max(0, Math.min(100, Math.log(radius / 25) / Math.log(2000) * 100)),
  );
  $("insights-auto").disabled = insightsRadius === null;
  const signature = JSON.stringify([
    id,
    points,
    radius,
    $("insights-density-enabled").checked,
    rows.map((c) => [c.archive_id, c.caught_at]),
  ]);
  requestAnimationFrame(() => insightsMap?.invalidateSize({ pan: false }));
  if (insightsMap.insightsSignature === signature) return;
  insightsMap.insightsSignature = signature;
  const sourceSignature = JSON.stringify([id, points]);
  const sourceChanged = insightsMap.insightsSource !== sourceSignature;
  insightsMap.insightsSource = sourceSignature;
  if (insightsHeat) {
    insightsMap.removeLayer(insightsHeat);
    insightsHeat = null;
  }
  insightsPoints.clearLayers();
  insightsModel = points.length
    ? { points, radius, peak: FishingDensity.peak(points, radius) }
    : null;
  const count = points.reduce((n, p) => n + p.weight, 0);
  $("insights-density-scale").hidden = !count || !$("insights-density-enabled").checked;
  $("insights-density-summary").textContent = !count
    ? "No located catches for these filters."
    : `${id ? species[id][0] : "All fish"} · ${count} located catches${
      count < 20 || points.length < 5 || new Set(rows.map((c) => dayKey(c.caught_at))).size < 3
        ? " · Limited data"
        : ""
    } · Recorded concentration, not catch probability`;
  for (const p of points) {
    L.circleMarker([p.latitude, p.longitude], {
      radius: $("insights-density-enabled").checked ? 1.25 : 3,
      color: "#344e47",
      weight: 1,
      fillOpacity: .3,
    }).addTo(insightsPoints);
  }
  if (insightsModel && $("insights-density-enabled").checked) {
    insightsHeat = makeDensityLayer(() => insightsModel);
    insightsHeat.addTo(insightsMap);
  }
  if (points.length && sourceChanged) {
    const bounds = insightsPoints.getBounds();
    for (const p of points) bounds.extend(L.latLng(p.latitude, p.longitude).toBounds(radius * 8));
    insightsMap.fitBounds(bounds, { padding: [35, 35], maxZoom: 14, animate: false });
  }
}
function setupInsights() {
  document.querySelectorAll("[data-insight-step]").forEach((select) =>
    select.addEventListener("change", () => {
      insightSteps[select.dataset.insightStep] = Number(select.value);
      renderInsights();
    })
  );
  $("insights-x").innerHTML = Object.entries(JournalInsights.metrics).map(([id, m]) =>
    `<option value="${id}">${esc(m.label)}</option>`
  ).join("");
  $("insights-x").value = "day";
  $("insights-x").addEventListener("change", () => renderInsightsComparison(
    uniqueRecords(visible), collectSpotProductivity(diaryTripRows(false)).ranked,
  ));
  $("insights-retry").onclick = () => {
    insightsFetchGeneration = -1;
    renderInsights();
  };
  $("insights-density-species").onchange = () => {
    $("species").value = $("insights-density-species").value;
    render();
  };
  $("insights-density-enabled").onchange = () => renderInsightsMap(uniqueRecords(visible));
  $("insights-radius").oninput = () => {
    insightsRadius = Math.round(25 * 2000 ** (Number($("insights-radius").value) / 100));
    renderInsightsMap(uniqueRecords(visible));
  };
  $("insights-auto").onclick = () => {
    insightsRadius = null;
    renderInsightsMap(uniqueRecords(visible));
  };
  $("insights-fit").onclick = () => {
    if (insightsMap) {
      insightsMap.insightsSignature = null;
      insightsMap.insightsSource = null;
      renderInsightsMap(uniqueRecords(visible));
    }
  };
}
// Entry points shared with the journal's classic script.
globalThis.resetInsights = resetInsights;
globalThis.setupInsights = setupInsights;

function renderInsightsRatings() {
  if (!session || $("insights-page").hidden) return;
  const target = $("insights-ratings"), expanded = disclosureState(target);
  const eligible = new Set(visible.map((c) => dayKey(c.caught_at)));
  for (const { trip } of diaryTripRows(true)) eligible.add(dayKey(trip.started_at));
  const rows = JournalInsights.ratings([...dayRatingRows.values()], {
    mode: fishingMode, from: $("from").value, to: $("to").value,
    dates: $("species").value ? eligible : null,
  });
  $("insights-ratings-status").textContent = dayRatingLoad === "loading"
    ? "Refreshing saved ratings…" : dayRatingLoad === "error"
    ? "Could not refresh ratings. Showing available saved scores." : "One bar per saved rating, grouped by fishing event. All bars use the same 0–10 scale; days between trips are skipped.";
  const colours = { all: species.miss_lucy[1], offshore: species.carpenter[1], shore: species.red_roman[1] };
  target.innerHTML = dayFeelMetrics.filter((metric) => ["enjoyment", "bite_activity"].includes(metric.key)).map((metric) => {
    const used = rows.filter((r) => Number.isFinite(r[metric.key]) && r[metric.key] >= 0 && r[metric.key] <= 10);
    const dates = [...new Set(used.map((r) => r.observation_date))];
    const table = used.map((r) => ({ label: r.observation_date, value: r[metric.key] + " / 10", sample: fishingModeLabels[r.fishing_mode] }));
    return `<article class="insight-card"><h3>${esc(metric.key === "enjoyment" ? "Enjoyment" : metric.label)}</h3>
      <p class="insight-caption">${used.length} saved scores across ${dates.length} fishing events · ${esc(metric.note)}</p>
      ${used.length ? `<div class="rating-scale" aria-hidden="true"><span>0</span><span>5</span><span>10</span></div><div class="rating-day-list">${dates.map((date, eventIndex) => {
        const label = new Date(date + "T12:00:00Z").toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric", timeZone:"UTC" });
        return `<div class="rating-day"><h4><span class="rating-event-label">Fishing day ${eventIndex + 1}</span>${esc(label)}</h4>${used.filter((r) => r.observation_date === date).map((r) =>
          `<div class="rating-score-row" style="--rating-colour:${colours[r.fishing_mode]}"><span class="rating-mode">${esc(fishingModeLabels[r.fishing_mode])}</span><div class="rating-score-track" role="img" aria-label="${esc(label)} · ${esc(fishingModeLabels[r.fishing_mode])}: ${r[metric.key]} out of 10"><i style="width:${r[metric.key] * 10}%"></i></div><strong>${r[metric.key]}<small> / 10</small></strong></div>`
        ).join("")}</div>`;
      }).join("")}</div>` : '<p class="insight-empty">No saved scores for these filters.</p>'}
      ${used.length ? insightTable(table, "Fishing event date", "rating:" + metric.key) : ""}${insightRatingSummary(used, metric.key)}</article>`;
  }).join("");
  restoreDisclosures(target, expanded);
}

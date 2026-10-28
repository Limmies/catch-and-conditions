"use strict";
(() => {
  const metrics = {
    species: { label: "Species" },
    day: { label: "Fishing date" },
    spot: { label: "Spot" },
    sea: { label: "Sea surface temperature", unit: "°C", step: 2 },
    pressure: { label: "Barometric pressure", unit: "hPa", step: 5 },
    moon: { label: "Moon phase" },
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
      current: "ocean_current_velocity",
    }[key];
    for (const s of snapshotsFor(snapshots, c.caught_at)) {
      let v = s.raw_payload?.[field];
      if (!Number.isFinite(v)) continue;
      const measuredAt = s.raw_payload?.field_sample_times?.[field] ||
        (key === "moon" ? s.raw_payload?.catch_at : null) || s.sample_at;
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
      if (
        key === "sea" && (v < -3 || v > 50) || key === "pressure" && (v < 800 || v > 1100) ||
        key === "current" && (v < 0 || v > 50)
      ) continue;
      return v;
    }
    return null;
  }
  function groups(rows, key, getValue) {
    const grouped = new Map(), step = metrics[key]?.step;
    for (const c of rows) {
      const v = getValue(c, key);
      if (v === null || v === undefined || v === "") continue;
      const bin = key === "moon" ? Math.round(v * 8) % 8 : step ? Math.floor(v / step) : v;
      if (!grouped.has(bin)) grouped.set(bin, []);
      grouped.get(bin).push(c);
    }
    let keys = [...grouped.keys()].sort((a, b) =>
      typeof a === "number" ? a - b : String(a).localeCompare(String(b))
    );
    if (key === "moon") keys = Array.from({ length: 8 }, (_, i) => i);
    if (step && keys.length) {
      const min = keys[0], max = keys.at(-1);
      if (max - min <= 100) keys = Array.from({ length: max - min + 1 }, (_, i) => min + i);
    }
    return keys.map((k) => ({
      key: k,
      label: key === "moon"
        ? phases[k]
        : step
        ? `${Number((k * step).toFixed(2))}–<${Number(((k + 1) * step).toFixed(2))} ${
          metrics[key].unit
        }`
        : String(k),
      rows: grouped.get(k) || [],
    }));
  }
  globalThis.JournalInsights = Object.freeze({ metrics, phases, value, groups, snapshotsFor });
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
  }</article>`;
}
function insightConditionChart(rows, key) {
  const groups = JournalInsights.groups(rows, key, insightValue),
    used = groups.reduce((n, g) => n + g.rows.length, 0);
  return insightBars(
    `Catches × ${JournalInsights.metrics[key].label.toLowerCase()}`,
    used ? groups.map((g) => ({ label: g.label, value: g.rows.length })) : [],
    `${used} of ${rows.length} catches with usable saved ${
      key === "moon" ? "astronomy" : "model conditions"
    } · ${rows.length - used} unavailable`,
  );
}
function renderInsights() {
  if (!session || $("insights-page").hidden) return;
  const expanded = disclosureState($("insights-page"));
  void loadInsightsConditions();
  const rows = uniqueRecords(visible), counts = new Map();
  for (const c of rows) counts.set(c.species_id, (counts.get(c.species_id) || 0) + 1);
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
  $("insights-overview").innerHTML = insightBars(
    "Species caught",
    [...counts].sort((a, b) => b[1] - a[1]).map(([id, count]) => ({
      label: species[id]?.[0] || id,
      value: count,
    })),
    `${rows.length} catches · ${new Set(rows.map((c) => dayKey(c.caught_at))).size} fishing days`,
  ) + insightBars("Catches by spot", spotCounts, "Stored fishing sessions with known spots") +
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
  $("insights-conditions").innerHTML = ["sea", "pressure", "moon", "current"].map((key) =>
    insightConditionChart(rows, key)
  ).join("");
  renderInsightsComparison(rows, ranked);
  renderInsightsMap(rows);
  restoreDisclosures($("insights-page"), expanded);
}
function renderInsightsComparison(rows, ranked) {
  const x = $("insights-x").value,
    y = $("insights-y").value,
    xLabel = JournalInsights.metrics[x].label;
  if (y === "rate") {
    $("insights-comparison").innerHTML = x === "spot"
      ? insightBars(
        "Productivity by spot",
        ranked.filter((s) => s.seconds > 0).map((s) => ({
          label: sessionSpotLabel(s.session),
          value: s.count * 3600 / s.seconds,
          sample: `${s.count} catches · ${(s.seconds / 3600).toFixed(2)} h`,
        })),
        "Stored session effort",
        "catches / fishing hour",
      )
      : '<p class="insight-empty">Choose Spot to compare catches per fishing hour. Condition-specific fishing effort is not yet available, so a condition catch rate would be misleading.</p>';
    return;
  }
  if (x === "spot") {
    $("insights-comparison").innerHTML = y === "count"
      ? insightBars(
        "Catches by spot",
        ranked.map((s) => ({
          label: sessionSpotLabel(s.session),
          value: s.count,
          sample: `${s.sessions} ${s.sessions === 1 ? "session" : "sessions"}`,
        })),
      )
      : '<p class="insight-empty">Spot measurements need an unambiguous catch-to-session link. Use total catches or catches per fishing hour here.</p>';
    return;
  }
  if (y === "count") {
    const grouped = JournalInsights.groups(rows, x, insightValue),
      used = grouped.reduce((n, g) => n + g.rows.length, 0);
    $("insights-comparison").innerHTML = insightBars(
      `Catches × ${xLabel.toLowerCase()}`,
      used ? grouped.map((g) => ({ label: g.label, value: g.rows.length })) : [],
      `${used} of ${rows.length} catches included; missing values excluded`,
    );
    return;
  }
  const pairs = rows.map((c) => ({ c, x: insightValue(c, x), y: insightValue(c, y) })).filter((p) =>
    p.x !== null && p.y !== null
  );
  const yMetric = JournalInsights.metrics[y];
  if (["species", "day", "moon"].includes(x)) {
    const groups = JournalInsights.groups(pairs.map((p) => p.c), x, insightValue);
    $("insights-comparison").innerHTML = insightBars(
      `Mean ${yMetric.label.toLowerCase()} × ${xLabel.toLowerCase()}`,
      groups.filter((g) => g.rows.length).map((g) => ({
        label: g.label,
        value: g.rows.reduce((sum, c) => sum + insightValue(c, y), 0) / g.rows.length,
        sample: `n=${g.rows.length}`,
      })),
      `${pairs.length} of ${rows.length} catches with both values · means, not fishing success`,
      yMetric.unit,
    );
    return;
  }
  if (!pairs.length) {
    $("insights-comparison").innerHTML =
      '<p class="insight-empty">No catches have both selected measurements. Missing values are excluded, never treated as zero.</p>';
    return;
  }
  const xs = pairs.map((p) => p.x),
    ys = pairs.map((p) => p.y),
    minX = Math.min(...xs),
    maxX = Math.max(...xs),
    minY = Math.min(...ys),
    maxY = Math.max(...ys);
  const px = (v) => 55 + (v - minX) / (maxX - minX || 1) * 490,
    py = (v) => 200 - (v - minY) / (maxY - minY || 1) * 160;
  $("insights-comparison").innerHTML = `<article class="insight-card"><h3>${esc(yMetric.label)} × ${
    esc(xLabel.toLowerCase())
  }</h3><p class="insight-caption">${pairs.length} of ${rows.length} catches with both values · each dot is one catch</p><svg class="insight-scatter" viewBox="0 0 600 260" role="img" aria-label="${
    esc(yMetric.label + " versus " + xLabel)
  }"><path d="M55 30v170h490" fill="none" stroke="#a99d81"/>${
    pairs.map((p) =>
      `<circle cx="${px(p.x)}" cy="${py(p.y)}" r="4" fill="#487565" fill-opacity=".55"><title>${
        esc(insightValue(p.c, "species"))
      }: ${p.x.toFixed(2)}, ${p.y.toFixed(2)}</title></circle>`
    ).join("")
  }<g fill="#5e6d61" font-size="12"><text x="55" y="220">${
    minX.toFixed(1)
  }</text><text x="510" y="220">${maxX.toFixed(1)}</text><text x="5" y="45">${
    maxY.toFixed(1)
  }</text><text x="5" y="200">${minY.toFixed(1)}</text><text x="55" y="245">${esc(xLabel)} (${
    esc(JournalInsights.metrics[x].unit || "")
  })</text><text x="55" y="18">${esc(yMetric.label)} (${
    esc(yMetric.unit)
  })</text></g></svg><p class="small muted">Observed association only. Repeated catches from the same session are not independent experiments.</p>${
    insightTable(
      pairs.map((p) => ({
        label: dateLabel(p.c.caught_at) + " · " + insightValue(p.c, "species"),
        value: `${p.x.toFixed(2)} / ${p.y.toFixed(2)}`,
        sample: "one catch",
      })),
      `${xLabel} / ${yMetric.label}`,
    )
  }</article>`;
}
function renderInsightsMap(rows) {
  if (!window.L || !window.FishingDensity) {
    $("insights-map").textContent = "The density map could not load. Your charts remain available.";
    return;
  }
  $("insights-density-species").innerHTML = $("species").innerHTML;
  $("insights-density-species").options[0].textContent = "Choose a species";
  $("insights-density-species").value = $("species").value;
  if (!insightsMap) {
    insightsMap = L.map("insights-map", { zoomAnimation: false, fadeAnimation: false }).setView([
      -34.08,
      22.97,
    ], 8);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(insightsMap);
    insightsPoints = L.featureGroup().addTo(insightsMap);
  }
  const id = $("species").value,
    points = FishingDensity.locations(id ? rows : []),
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
  $("insights-density-summary").textContent = !id
    ? "Choose one species for the density map."
    : !count
    ? "No located catches for these filters."
    : `${species[id][0]} · ${count} located catches${
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
  $("insights-x").innerHTML = Object.entries(JournalInsights.metrics).map(([id, m]) =>
    `<option value="${id}">${esc(m.label)}</option>`
  ).join("");
  $("insights-y").innerHTML =
    '<option value="count">Total catches</option><option value="rate">Catches per fishing hour</option>' +
    ["length", "sea", "pressure", "current"].map((id) =>
      `<option value="${id}">${esc(JournalInsights.metrics[id].label)}</option>`
    ).join("");
  for (const id of ["insights-x", "insights-y"]) {
    $(id).addEventListener("change", () =>
      renderInsightsComparison(
        uniqueRecords(visible),
        collectSpotProductivity(diaryTripRows(false)).ranked,
      ));
  }
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

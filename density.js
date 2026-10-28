"use strict";
// Geographic Gaussian KDE. All calculations stay in the browser.
(() => {
  const earth = 6371008.8, radians = Math.PI / 180;
  function distance(a, b) {
    const lat = (b.latitude - a.latitude) * radians;
    const lon = (b.longitude - a.longitude) * radians;
    const v = Math.sin(lat / 2) ** 2 + Math.cos(a.latitude * radians) *
        Math.cos(b.latitude * radians) * Math.sin(lon / 2) ** 2;
    return 2 * earth * Math.asin(Math.sqrt(Math.max(0, Math.min(1, v))));
  }
  function locations(records) {
    const points = new Map();
    for (const row of records) {
      if (
        !Number.isFinite(row.latitude) || !Number.isFinite(row.longitude) ||
        Math.abs(row.latitude) > 90 || Math.abs(row.longitude) > 180
      ) continue;
      const key = `${row.latitude},${row.longitude}`;
      if (!points.has(key)) {
        points.set(key, { latitude: row.latitude, longitude: row.longitude, weight: 0 });
      }
      points.get(key).weight++;
    }
    return [...points.values()];
  }
  const median = (values) => {
    const sorted = [...values].sort((a, b) => a - b), i = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[i] : (sorted[i - 1] + sorted[i]) / 2;
  };
  function sample(points, maximum = 256) {
    return points.length <= maximum
      ? points
      : Array.from({ length: maximum }, (_, i) => points[Math.floor(i * points.length / maximum)]);
  }
  function bandwidth(points) {
    // One location cannot identify a spatial scale; use an explicit 250m fallback.
    if (points.length < 2) return 250;
    const n = points.reduce((sum, p) => sum + p.weight, 0);
    const origin = points[0], cos = Math.cos(origin.latitude * radians);
    const projected = points.map((p) => ({
      x: earth * cos * ((p.longitude - origin.longitude + 540) % 360 - 180) * radians,
      y: earth * (p.latitude - origin.latitude) * radians,
      weight: p.weight,
    }));
    const x = projected.reduce((s, p) => s + p.x * p.weight, 0) / n,
      y = projected.reduce((s, p) => s + p.y * p.weight, 0) / n;
    const variance =
      projected.reduce((s, p) => s + p.weight * ((p.x - x) ** 2 + (p.y - y) ** 2), 0) /
      Math.max(1, n - 1) / 2;
    const scott = Math.sqrt(variance) * n ** (-1 / 6);
    // Limit smoothing across remote fishing areas using typical local spacing.
    const nearest = sample(points).map((p) => {
      let best = Infinity;
      for (const q of points) if (q !== p) best = Math.min(best, distance(p, q));
      return best;
    });
    return Math.round(Math.max(50, Math.min(25000, scott, 2 * median(nearest))) / 25) * 25;
  }
  function kernelSum(points, at, radius) {
    if (!(radius > 0)) return 0;
    let sum = 0;
    for (const p of points) {
      const d = distance(p, at) / radius;
      if (d <= 4) sum += p.weight * Math.exp(-d * d / 2);
    }
    return sum;
  }
  function density(points, at, radius) {
    return radius > 0 ? kernelSum(points, at, radius) * 1e6 / (2 * Math.PI * radius * radius) : 0;
  }
  function peak(points, radius) {
    // Stable across pan/zoom: estimate the scale at observed positions, not viewport pixels.
    return Math.max(1, ...sample(points).map((p) => kernelSum(points, p, radius)));
  }
  function raster(points, width, height, scale) {
    const values = new Float32Array(width * height);
    // Aggregate subpixel source locations; multiplicity is retained.
    const bins = new Map();
    for (const p of points) {
      const key = `${Math.round(p.x)},${Math.round(p.y)},${Math.round(p.sigma * 10)}`;
      if (!bins.has(key)) bins.set(key, { ...p, weight: 0 });
      bins.get(key).weight += p.weight;
    }
    for (const p of bins.values()) {
      const sigma = Math.max(.15, p.sigma), reach = 4 * sigma;
      const left = Math.max(0, Math.floor(p.x - reach)),
        right = Math.min(width - 1, Math.ceil(p.x + reach));
      const top = Math.max(0, Math.floor(p.y - reach)),
        bottom = Math.min(height - 1, Math.ceil(p.y + reach));
      const xs = [];
      for (let x = left; x <= right; x++) xs.push(Math.exp(-.5 * (((x + .5 - p.x) / sigma) ** 2)));
      for (let y = top; y <= bottom; y++) {
        const weight = p.weight * Math.exp(-.5 * (((y + .5 - p.y) / sigma) ** 2));
        for (let x = left; x <= right; x++) values[y * width + x] += weight * xs[x - left];
      }
    }
    const rgba = new Uint8ClampedArray(width * height * 4);
    const colours = [[91, 143, 143], [218, 184, 94], [151, 65, 51]];
    for (let i = 0; i < values.length; i++) {
      const fraction = Math.min(1, values[i] / Math.max(1, scale));
      if (fraction < .01) continue;
      const t = Math.sqrt(fraction), part = t < .5 ? 0 : 1, mix = part === 0 ? t * 2 : (t - .5) * 2;
      for (let c = 0; c < 3; c++) {
        rgba[i * 4 + c] = colours[part][c] * (1 - mix) + colours[part + 1][c] * mix;
      }
      rgba[i * 4 + 3] = Math.round(185 * Math.min(1, fraction / .12));
    }
    return rgba;
  }
  globalThis.FishingDensity = Object.freeze({
    distance,
    locations,
    bandwidth,
    kernelSum,
    density,
    peak,
    raster,
  });
})();

// Keep the widest map view at South Africa's extent on each screen size.
function limitMapToSouthAfrica(target) {
  const bounds = L.latLngBounds([[-35.5, 16], [-21.5, 33.5]]);
  const centreAtLimit = () => {
    if (target.getZoom() <= target.getMinZoom()) target.panTo(bounds.getCenter(), { animate: false });
  };
  const updateLimit = () => {
    const size = target.getSize();
    if (size.x <= 0 || size.y <= 0) return;
    target.setMinZoom(target.getBoundsZoom(bounds, false, [24, 24]));
    centreAtLimit();
  };
  target.setMinZoom(4);
  target.on("resize", updateLimit);
  target.on("zoomend", centreAtLimit);
  updateLimit();
}

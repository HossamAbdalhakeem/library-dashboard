#!/usr/bin/env node
/**
 * Lightweight DAST: assert security headers on a running app URL.
 *
 * Usage:
 *   NUXT_PUBLIC_SITE_URL=https://example.com node scripts/security-dast.mjs
 *   node scripts/security-dast.mjs http://localhost:8000
 */

const target =
  process.argv[2] ||
  process.env.NUXT_PUBLIC_SITE_URL ||
  process.env.SECURITY_DAST_URL ||
  "";

if (!target) {
  console.error(
    "security:dast — set NUXT_PUBLIC_SITE_URL or pass a URL argument.",
  );
  process.exit(1);
}

let origin;
try {
  origin = new URL(target).origin;
} catch {
  console.error(`security:dast — invalid URL: ${target}`);
  process.exit(1);
}

const isLocalHttp =
  origin.startsWith("http://localhost") || origin.startsWith("http://127.0.0.1");

const required = [
  {
    name: "content-security-policy",
    test: (v) => typeof v === "string" && v.includes("default-src"),
  },
  {
    name: "x-content-type-options",
    test: (v) => String(v || "").toLowerCase() === "nosniff",
  },
  {
    name: "referrer-policy",
    test: (v) => typeof v === "string" && v.length > 0,
  },
];

// Prefer CSP frame-ancestors; fall back to X-Frame-Options
const frameChecks = [
  {
    name: "content-security-policy",
    test: (v) =>
      typeof v === "string" &&
      (/frame-ancestors[^;]*'none'/i.test(v) ||
        /frame-ancestors[^;]*none/i.test(v)),
    optionalIf: "x-frame-options",
  },
  {
    name: "x-frame-options",
    test: (v) => /deny|sameorigin/i.test(String(v || "")),
    optionalIf: "content-security-policy",
  },
];

if (!isLocalHttp) {
  required.push({
    name: "strict-transport-security",
    test: (v) => typeof v === "string" && /max-age=\d+/i.test(v),
  });
}

const getHeader = (headers, name) => {
  if (typeof headers.get === "function") return headers.get(name);
  const key = Object.keys(headers || {}).find(
    (k) => k.toLowerCase() === name.toLowerCase(),
  );
  return key ? headers[key] : null;
};

const main = async () => {
  console.log(`security:dast — checking ${origin}`);

  let res;
  try {
    res = await fetch(origin, {
      method: "GET",
      redirect: "follow",
      headers: { Accept: "text/html" },
    });
  } catch (error) {
    console.error(`security:dast — request failed: ${error.message}`);
    process.exit(1);
  }

  const failures = [];

  for (const check of required) {
    const value = getHeader(res.headers, check.name);
    if (!check.test(value)) {
      failures.push(`${check.name}: missing or invalid (got: ${value ?? "null"})`);
    }
  }

  const csp = getHeader(res.headers, "content-security-policy");
  const xfo = getHeader(res.headers, "x-frame-options");
  const frameOk =
    (typeof csp === "string" && /frame-ancestors/i.test(csp)) ||
    /deny|sameorigin/i.test(String(xfo || ""));
  if (!frameOk) {
    failures.push(
      "frame protection: need CSP frame-ancestors or X-Frame-Options",
    );
  }

  // silence unused for lint clarity if tree-shaken
  void frameChecks;

  if (failures.length) {
    console.error("security:dast — FAILED");
    for (const line of failures) console.error(`  - ${line}`);
    process.exit(1);
  }

  console.log("security:dast — OK");
  console.log(`  status: ${res.status}`);
  console.log(`  csp: present`);
  console.log(`  x-content-type-options: nosniff`);
  if (!isLocalHttp) console.log(`  hsts: present`);
};

main();

import fs from "node:fs";
import path from "node:path";

/** Load `.env` / `.env.local` into process.env without overriding existing keys. */
export function loadEnvFiles() {
  for (const file of [".env.local", ".env"]) {
    const full = path.join(process.cwd(), file);
    if (!fs.existsSync(full)) continue;

    const text = fs.readFileSync(full, "utf8");
    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  }
}

loadEnvFiles();

export type RoleKey = "admin" | "employee" | "employee2" | "cs";

export type RoleCredentials = {
  email: string;
  password: string;
};

const required = (key: string): string => {
  const value = String(process.env[key] || "").trim();
  if (!value) {
    throw new Error(
      `Missing ${key}. Set it in .env / .env.local (see .env.example) before running Playwright.`,
    );
  }
  return value;
};

const optionalPair = (
  emailKey: string,
  passwordKey: string,
): RoleCredentials | null => {
  const email = String(process.env[emailKey] || "").trim();
  const password = String(process.env[passwordKey] || "").trim();
  if (!email || !password) return null;
  return { email, password };
};

export const e2eEnv = {
  apiBaseUrl: () =>
    String(process.env.NUXT_ENV_BASE_URL || "http://localhost:3000").replace(
      /\/$/,
      "",
    ),
  baseUrl: () =>
    String(process.env.E2E_BASE_URL || "http://localhost:8000").replace(
      /\/$/,
      "",
    ),
  studentSearch: () =>
    String(process.env.E2E_STUDENT_SEARCH || "").trim() || null,
  productSearch: () =>
    String(process.env.E2E_PRODUCT_SEARCH || "").trim() || null,
  outOfStockProductSearch: () =>
    String(process.env.E2E_PRODUCT_OUT_OF_STOCK_SEARCH || "").trim() || null,
  credentials(role: RoleKey): RoleCredentials {
    if (role === "admin") {
      return {
        email: required("E2E_ADMIN_EMAIL"),
        password: required("E2E_ADMIN_PASSWORD"),
      };
    }
    if (role === "cs") {
      return {
        email: required("E2E_CS_EMAIL"),
        password: required("E2E_CS_PASSWORD"),
      };
    }
    if (role === "employee2") {
      const pair = optionalPair(
        "E2E_EMPLOYEE2_EMAIL",
        "E2E_EMPLOYEE2_PASSWORD",
      );
      if (!pair) {
        throw new Error(
          "Missing E2E_EMPLOYEE2_EMAIL / E2E_EMPLOYEE2_PASSWORD for cross-branch isolation.",
        );
      }
      return pair;
    }
    return {
      email: required("E2E_EMPLOYEE_EMAIL"),
      password: required("E2E_EMPLOYEE_PASSWORD"),
    };
  },
  hasCredentials(role: RoleKey): boolean {
    try {
      this.credentials(role);
      return true;
    } catch {
      return false;
    }
  },
};

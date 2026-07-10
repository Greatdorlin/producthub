import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline";

type PromptOptions = {
  defaultValue?: string;
  choices?: string[];
};

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question: string, options: PromptOptions = {}) {
  const suffix = options.defaultValue ? ` (${options.defaultValue})` : "";

  return new Promise<string>((resolve) => {
    rl.question(`${question}${suffix}: `, (answer) => {
      const value = answer.trim() || options.defaultValue || "";

      if (options.choices?.length && !options.choices.includes(value)) {
        console.log(`Choose one of: ${options.choices.join(", ")}`);
        resolve(ask(question, options));
        return;
      }

      resolve(value);
    });
  });
}

function yesNo(value: string) {
  return value.trim().toLowerCase().startsWith("y");
}

function upsertEnvFile(values: Record<string, string>) {
  const envPath = ".env.local";
  const existing = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";
  const lines = existing
    .split(/\r?\n/)
    .filter((line) => line.trim() && !Object.keys(values).some((key) => line.startsWith(`${key}=`)));
  const next = [
    ...lines,
    ...Object.entries(values).map(([key, value]) => `${key}=${value}`),
  ].join("\n");

  writeFileSync(envPath, `${next}\n`);
}

function run(command: string, args: string[]) {
  const result = spawnSync(command, args, { stdio: "inherit", shell: true });

  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed.`);
  }
}

async function main() {
  const industryTemplate = await ask("Industry template", {
    defaultValue: "generic",
    choices: [
      "generic",
      "education",
      "real-estate",
      "events",
      "professional-services",
      "retail",
      "hospitality",
      "healthcare",
    ],
  });
  const brandName = await ask("Brand name", { defaultValue: "ProductHub" });
  const defaultCurrency = await ask("Default currency", {
    defaultValue: industryTemplate === "generic" ? "USD" : "NGN",
  });
  const enableAffiliateRole = yesNo(await ask("Enable affiliate role? y/n", { defaultValue: "n" }));
  const enableMfa = yesNo(await ask("Enable MFA by default? y/n", { defaultValue: "y" }));
  const databaseProvider = await ask("Database provider hint", { defaultValue: "postgres" });
  const databaseUrl = await ask("DATABASE_URL");
  const authSecret = await ask("AUTH_SECRET");
  const appUrl = await ask("APP_URL", { defaultValue: "http://localhost:3000" });

  upsertEnvFile({
    DATABASE_PROVIDER: databaseProvider,
    DATABASE_URL: databaseUrl,
    AUTH_SECRET: authSecret,
    APP_URL: appUrl,
    BRAND_NAME: brandName,
    BRAND_TAGLINE: "Product Documentation Workspace",
    DEFAULT_CURRENCY: defaultCurrency.toUpperCase(),
    INDUSTRY_TEMPLATE: industryTemplate,
    ENABLE_AFFILIATE_ROLE: String(enableAffiliateRole),
    ENABLE_MFA: String(enableMfa),
    ENABLE_EXPIRY: "true",
    ENABLE_SALES_TRACKING: "true",
  });

  run("npm", ["run", "db:migrate"]);

  if (yesNo(await ask("Seed sample data? y/n", { defaultValue: "y" }))) {
    run("npm", ["run", "db:seed"]);
  }

  rl.close();
}

main().catch((error) => {
  rl.close();
  console.error(error);
  process.exit(1);
});

import de from "../locales/de.json";
import en from "../locales/en.json";
import ru from "../locales/ru.json";

function flattenKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === "object") {
      return flattenKeys(value as Record<string, unknown>, path);
    }
    return [path];
  });
}

describe("locale files", () => {
  const enKeys = flattenKeys(en).sort();

  it.each([
    ["de", de],
    ["ru", ru],
  ])("%s has exactly the same keys as en", (_code, locale) => {
    expect(flattenKeys(locale).sort()).toEqual(enKeys);
  });
});

const PREFIX = "chipGemSort_";

export const storageManager = {
  get<T>(
    key: string,
    options: { fallback?: T | null; silent?: boolean } = {}
  ): T | null {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      if (raw == null) return options.fallback ?? null;
      return JSON.parse(raw) as T;
    } catch {
      return options.fallback ?? null;
    }
  },
  set(key: string, value: unknown, _options?: { silent?: boolean }): void {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch (_e) {}
  },
};

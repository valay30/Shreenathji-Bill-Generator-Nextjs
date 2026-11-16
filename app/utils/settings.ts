// app/utils/settings.ts

export interface AppSettings {
  dairyName: string;
  tagline: string;
  contactPhone: string;
  address: string;
  defaultPricePerLiter: number;
  upiId: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  dairyName: "ABC Dairy",
  tagline: "Fresh Milk Delivery Service",
  contactPhone: "",
  address: "",
  defaultPricePerLiter: 50,
  upiId: "abcdairy@upi",
};

export const SETTINGS_STORAGE_KEY = "dairy_app_settings";

export function getStoredSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) {
      const oldUpi = localStorage.getItem("upi_id");
      return {
        ...DEFAULT_SETTINGS,
        ...(oldUpi ? { upiId: oldUpi } : {}),
      };
    }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: AppSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  localStorage.setItem("upi_id", settings.upiId);
}

/**
 * Fetch settings from the cloud database (Supabase).
 * Automatically updates localStorage cache if successful.
 */
export async function fetchRemoteSettings(): Promise<AppSettings> {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const res = await fetch("/api/settings");
    if (!res.ok) {
      return getStoredSettings();
    }
    const data: AppSettings = await res.json();
    if (data && data.dairyName) {
      saveStoredSettings(data);
      return data;
    }
  } catch {
    // Graceful fallback to local cache
  }
  return getStoredSettings();
}

/**
 * Persists settings to both local browser storage and Supabase cloud database.
 */
export async function saveRemoteSettings(settings: AppSettings): Promise<boolean> {
  // Always update local cache first for instant feedback
  saveStoredSettings(settings);

  try {
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    return res.ok;
  } catch (err) {
    console.warn("Could not save settings to cloud database:", err);
    return false;
  }
}

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

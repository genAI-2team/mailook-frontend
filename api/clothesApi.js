import api from "@/api/client";
import { authHeaders } from "@/api/authToken";

export async function getClothes(signal) {
  return await api.get("/api/clothes", { baseURL: "", signal });
}

export async function getClothesPhoto(clothesId, signal) {
  const query = new URLSearchParams({ photoId: String(clothesId) });
  const response = await fetch(`/api/clothes?${query}`, { headers: authHeaders(), signal });
  if (!response.ok || !response.headers.get("content-type")?.startsWith("image/")) return null;
  return await response.blob();
}

export async function createClothes(clothesData, image) {
  const form = new FormData();
  form.append("image", image);
  form.append("data", new Blob([JSON.stringify(clothesData)], { type: "application/json" }));
  return await api.post("/api/clothes", form, { baseURL: "" });
}

export async function getStorageLocations(signal) {
  return await api.get("/api/storage-locations", { baseURL: "", signal });
}

export async function createStorageLocation(name) {
  return await api.post("/api/storage-locations", { name }, { baseURL: "" });
}

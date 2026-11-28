import api from "@/api/client";

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

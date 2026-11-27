import api from "@/api/client";

export async function createClothes(clothesData) {
  return await api.post("/api/clothes", clothesData, { baseURL: "" });
}

export async function createClothesBatch(clothesData) {
  return await api.post("/api/clothes/batch", clothesData, { baseURL: "" });
}

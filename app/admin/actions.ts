"use server";

import { revalidatePath } from "next/cache";

import { FeedbackReport, getLocalStore, saveLocalStore } from "@/lib/feedback-store";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

export async function resolveFeedback(id: string, currentData: FeedbackReport) {
  const updatedData = { ...currentData, status: "resolved" as const };

  if (!redisUrl || !redisToken) {
    console.warn("No Upstash Redis URL/Token found for resolveFeedback. Using local fallback.");
    const store = getLocalStore();
    store.set(id, updatedData);
    saveLocalStore(store);
    revalidatePath("/admin");
    return { success: true };
  }

  try {
    const res = await fetch(`${redisUrl}/hset/pulse-arena:feedback/${id}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${redisToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(JSON.stringify(updatedData)),
    });

    if (!res.ok) throw new Error("Failed to resolve feedback");
    
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to resolve feedback" };
  }
}

export async function deleteFeedback(id: string) {
  if (!redisUrl || !redisToken) {
    console.warn("No Upstash Redis URL/Token found for deleteFeedback. Using local fallback.");
    const store = getLocalStore();
    store.delete(id);
    saveLocalStore(store);
    revalidatePath("/admin");
    return { success: true };
  }

  try {
    const res = await fetch(`${redisUrl}/hdel/pulse-arena:feedback/${id}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${redisToken}`,
      },
    });

    if (!res.ok) throw new Error("Failed to delete feedback");

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to delete feedback" };
  }
}

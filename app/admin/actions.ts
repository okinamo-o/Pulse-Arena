"use server";

import { revalidatePath } from "next/cache";

import { FeedbackReport } from "@/app/api/feedback/route";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

export async function resolveFeedback(id: string, currentData: FeedbackReport) {
  if (!redisUrl || !redisToken) {
    console.warn("No Upstash Redis URL/Token found for resolveFeedback");
    return { error: "Action failed: Upstash Redis is not configured. Please add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to your .env file to enable management features." };
  }

  const updatedData = { ...currentData, status: "resolved" };

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
    console.warn("No Upstash Redis URL/Token found for deleteFeedback");
    return { error: "Action failed: Upstash Redis is not configured. Please add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to your .env file to enable management features." };
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

"use server";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getComponentEntries() {
  const session = await getSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  const entries = await prisma.componentEntry.findMany({
    where: {
      userId: session.userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      prompt: true,
      description: true,
      projectId: true,
      createdAt: true,
    },
  });

  return entries;
}

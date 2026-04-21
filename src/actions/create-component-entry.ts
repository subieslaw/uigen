"use server";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface CreateComponentEntryInput {
  prompt: string;
  description: string;
  files: Record<string, string>;
  projectId?: string;
}

export async function createComponentEntry(input: CreateComponentEntryInput) {
  const session = await getSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  const entry = await prisma.componentEntry.create({
    data: {
      userId: session.userId,
      projectId: input.projectId ?? null,
      prompt: input.prompt,
      description: input.description,
      files: JSON.stringify(input.files),
    },
  });

  return entry;
}

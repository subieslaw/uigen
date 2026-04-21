import type { VirtualFileSystem } from "@/lib/file-system";

export interface HandleGenerationFinishParams {
  response: any;
  projectId: string | undefined;
  messages: Array<{ role: string; content: any }>;
  fileSystem: VirtualFileSystem;
  generateDescription: (prompt: string, files: Map<string, string>) => Promise<string>;
  saveEntry: (input: {
    prompt: string;
    description: string;
    files: Record<string, string>;
    projectId?: string;
    userId: string;
  }) => Promise<any>;
  getSession: () => Promise<{ userId: string; email?: string } | null>;
}

export async function handleGenerationFinish({
  projectId,
  messages,
  fileSystem,
  generateDescription,
  saveEntry,
  getSession,
}: HandleGenerationFinishParams): Promise<void> {
  const allFiles = fileSystem.getAllFiles();
  if (allFiles.size === 0) {
    return;
  }

  const session = await getSession();
  if (!session) {
    return;
  }

  // Find the last user message
  let lastUserPrompt = "";
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "user") {
      const content = messages[i].content;
      if (typeof content === "string") {
        lastUserPrompt = content;
      } else if (Array.isArray(content)) {
        lastUserPrompt = content
          .filter((p: any) => p.type === "text")
          .map((p: any) => p.text)
          .join(" ");
      }
      break;
    }
  }

  const description = await generateDescription(lastUserPrompt, allFiles);

  const filesRecord: Record<string, string> = {};
  for (const [path, content] of allFiles) {
    filesRecord[path] = content;
  }

  await saveEntry({
    prompt: lastUserPrompt,
    description,
    files: filesRecord,
    projectId,
    userId: session.userId,
  });
}

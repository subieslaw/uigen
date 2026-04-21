import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildZipFromFiles } from "@/lib/utils/archive";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ entryId: string }> }
) {
  const { entryId } = await params;

  const session = await getSession();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const entry = await prisma.componentEntry.findUnique({
    where: { id: entryId },
  });
  if (!entry) {
    return new Response("Not Found", { status: 404 });
  }

  if (entry.userId !== session.userId) {
    return new Response("Forbidden", { status: 403 });
  }

  const zipBytes = await buildZipFromFiles(JSON.parse(entry.files));

  return new Response(zipBytes, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="component-${entryId}.zip"`,
    },
  });
}

export const maxDuration = 30;

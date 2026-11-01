import prisma from "./prisma";

export async function syncScheduledArticles(): Promise<void> {
  try {
    const now = new Date();
    await prisma.article.updateMany({
      where: {
        status: "SCHEDULED",
        scheduledAt: {
          lte: now,
        },
      },
      data: {
        status: "PUBLISHED",
        publishedAt: now,
      },
    });
  } catch (error) {
    console.error("Error syncing scheduled articles:", error);
  }
}

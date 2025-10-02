import db from "@repo/db";

export async function getNameFromUserId(userId: string): Promise<string> {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });
    return user?.name || "Unknown User";
  } catch (error) {
    console.error("Error fetching user name:", error);
    return "Unknown User";
  }
}



import db from "@repo/db";

/**
 * Retrieve user's display name from database
 * 
 * @param userId - The unique identifier of the user
 * @returns User's name if found, "Unknown User" otherwise
 */
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

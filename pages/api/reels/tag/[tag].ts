import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { tag } = req.query;

  if (req.method === "GET") {
    try {
      const reels = await prisma.reel.findMany({
        where: { tags: { has: String(tag) } },
        include: { creator: true },
      });

      res.status(200).json({ reels });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reels by tag", error });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}

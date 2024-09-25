import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (req.method === "GET") {
    try {
      const reel = await prisma.reel.findUnique({
        where: { id: String(id) },
        select: { tags: true },
      });

      if (!reel) {
        return res.status(404).json({ message: "Reel not found" });
      }

      res.status(200).json({ tags: reel.tags });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tags", error });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}

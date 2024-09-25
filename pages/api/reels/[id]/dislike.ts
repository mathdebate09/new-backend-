import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (req.method === "POST") {
    try {
      const reel = await prisma.reel.update({
        where: { id: String(id) },
        data: {
          dislikes: {
            increment: 1,
          },
        },
      });

      res.status(200).json({ message: "Reel disliked successfully", reel });
    } catch (error) {
      res.status(500).json({ message: "Failed to dislike reel", error });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
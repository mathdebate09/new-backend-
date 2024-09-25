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
        include: { creator: true },
      });

      if (!reel) {
        return res.status(404).json({ message: "Reel not found" });
      }

      res.status(200).json(reel);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reel", error });
    }
  } else if (req.method === "PATCH") {
    const { title, tags, description } = req.body;

    try {
      const reel = await prisma.reel.update({
        where: { id: String(id) },
        data: {
          title,
          tags,
          description,
        },
      });

      res.status(200).json({ message: "Reel updated successfully", reel });
    } catch (error) {
      res.status(500).json({ message: "Failed to update reel", error });
    }
  } else if (req.method === "DELETE") {
    try {
      const reel = await prisma.reel.delete({
        where: { id: String(id) },
      });

      res.status(200).json({ message: "Reel deleted successfully", reel });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete reel", error });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}

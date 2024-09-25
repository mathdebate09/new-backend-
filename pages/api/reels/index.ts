import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const { page = 1, limit = 10, tag, title, userId } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    try {
      const reels = await prisma.reel.findMany({
        where: {
          title: title
            ? { contains: String(title), mode: "insensitive" }
            : undefined,
          tags: tag ? { has: String(tag) } : undefined,
          creatorId: userId ? String(userId) : undefined,
        },
        skip,
        take: Number(limit),
        include: { creator: true },
      });

      res.status(200).json({ reels });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reels", error });
    }
  } else if (req.method === "POST") {
    const { title, tags, videoLink, description, creatorId } = req.body;

    try {
      const reel = await prisma.reel.create({
        data: {
          title,
          tags,
          videoLink,
          description,
          creator: { connect: { id: creatorId } },
        },
      });

      res.status(201).json({ message: "Reel created successfully", reel });
    } catch (error) {
      res.status(500).json({ message: "Failed to create reel", error });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}

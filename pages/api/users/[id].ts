import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query; 

  if (req.method === "GET") {
    try {
      const user = await prisma.user.findUnique({ where: { id: String(id) } });
      if (!user) return res.status(404).json({ error: "User not found" });
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user", error });
    }
  } else if (req.method === "PATCH") {
    const { name, username, profileImage } = req.body;
    try {
      const updatedUser = await prisma.user.update({
        where: { id: String(id) },
        data: { name, username, image: profileImage },
      });
      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Error updating user", error });
    }
  } else if (req.method === "DELETE") {
    try {
      await prisma.user.delete({ where: { id: String(id) } });
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Error deleting user", error });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

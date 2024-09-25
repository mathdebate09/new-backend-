import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const HTTP_OK = 200;
const HTTP_SERVER_ERROR = 500;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  const { user } = req.body;

  if (req.method === "POST") {
    try {
      const updatedUser = await prisma.user.update({
        where: { id: user },
        data: {
          bookmarkedCrates: {
            connect: [{ id: String(id) }],
          },
        },
      });
      res.status(HTTP_OK).json(updatedUser);
    } catch (error) {
      res
        .status(HTTP_SERVER_ERROR)
        .json({ message: "Error bookmarking crate", error });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

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

  if (req.method === "POST") {
    try {
      const { user } = req.body;
      const hasUserVoted = await prisma.vote.findFirst({
        where: {
          userId: String(user),
          crateId: String(id),
        },
      });
      if (hasUserVoted) {
        await prisma.vote.delete({
          where: {
            id: hasUserVoted.id,
          },
        });
      }
      const vote = await prisma.vote.create({
        data: {
          type: "UP",
          user: { connect: { id: String(user) } },
          crate: { connect: { id: String(id) } },
        },
      });
      const crate = await prisma.crate.update({
        where: { id: String(id) },
        data: {
          upvotes: {
            increment: hasUserVoted ? (hasUserVoted.type === "UP" ? 0 : 1) : 1,
          },
          downvotes: {
            increment: hasUserVoted && hasUserVoted.type === "DOWN" ? -1 : 0,
          },
        },
      });
      res.status(HTTP_OK).json({ crate, vote });
    } catch (error) {
      res
        .status(HTTP_SERVER_ERROR)
        .json({ message: "Error upvoting crate", error });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

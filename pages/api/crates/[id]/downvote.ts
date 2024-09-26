import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import Cors from "cors";

const prisma = new PrismaClient();

const HTTP_OK = 200;
const HTTP_SERVER_ERROR = 500;

// Initialize the cors middleware
const cors = Cors({
  methods: ['POST', 'GET', 'OPTIONS', 'HEAD'],
  origin: ['http://localhost:5173', 'https://sickfreak.club'],
});

// Helper function to run middleware
function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: (req: NextApiRequest, res: NextApiResponse, next: (err: unknown) => void) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    fn(req, res, (err: unknown) => {
      if (err) {
        return reject(err);
      }
      return resolve();
    });
  });
}
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

    // Run CORS middleware
    await runMiddleware(req, res, cors);
    
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
          type: "DOWN",
          user: { connect: { id: String(user) } },
          crate: { connect: { id: String(id) } },
        },
      });
      const crate = await prisma.crate.update({
        where: { id: String(id) },
        data: {
          upvotes: {
            increment: hasUserVoted && hasUserVoted.type === "UP" ? -1 : 0,
          },
          downvotes: {
            increment: hasUserVoted
              ? hasUserVoted.type === "DOWN"
                ? 0
                : 1
              : 1,
          },
        },
      });
      res.status(HTTP_OK).json({ crate, vote });
    } catch (error) {
      res
        .status(HTTP_SERVER_ERROR)
        .json({ message: "Error downvoting crate", error });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

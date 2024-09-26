import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import Cors from "cors";

const prisma = new PrismaClient();

const cors = Cors({
  methods: ['POST', 'OPTIONS', 'HEAD'],
  origin: ['http://localhost:5173', 'https://sickfreak.club'],
});

function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: Function) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await runMiddleware(req, res, cors);

  if (req.method === "POST") {
    const { walletAddress } = req.body;

    try {
      const user = await prisma.user.findUnique({
        where: { walletAddress },
      });

      if (user) {
        res.status(200).json({ success: true, creatorId: user.id });
      } else {
        res.status(404).json({ success: false, message: "User not found" });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: "Error logging in", error });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
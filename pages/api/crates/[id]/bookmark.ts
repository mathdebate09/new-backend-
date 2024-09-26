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

import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import Cors from "cors";

const prisma = new PrismaClient();

const HTTP_OK = 200;
const HTTP_NO_CONTENT = 204;
const HTTP_NOT_FOUND = 404;
const HTTP_SERVER_ERROR = 500;
const HTTP_METHOD_NOT_ALLOWED = 405;
// Initialize the cors middleware
const cors = Cors({
  methods: ["POST", "GET", "OPTIONS", "HEAD"],
  origin: ["http://localhost:5173", "https://sickfreak.club" , "http://localhost:3000"],
});

// Helper function to run middleware
function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: (
    req: NextApiRequest,
    res: NextApiResponse,
    next: (err: unknown) => void
  ) => void
): Promise<void> {
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

  if (req.method === "GET") {
    try {
      const crate = await prisma.crate.findUnique({
        where: { id: String(id) },
        include: { creator: true },
      });
      if (!crate)
        return res.status(HTTP_NOT_FOUND).json({ error: "Crate not found" });
      const tokens = await prisma.token.findMany({
        where: { crateId: crate.id },
      });
      if (!tokens)
        return res.status(HTTP_NOT_FOUND).json({ error: "Tokens not found" });
      res.status(HTTP_OK).json({ ...crate, tokens });
    } catch (error) {
      res
        .status(HTTP_SERVER_ERROR)
        .json({ message: "Error fetching crate", error });
    }
  } else if (req.method === "PATCH") {
    const { name, tokens, totalCost, picture } = req.body;
    try {
      const updatedCrate = await prisma.crate.update({
        where: { id: String(id) },
        data: { name, totalCost, image: picture },
      });
      const updatedTokens = await Promise.all(
        tokens.map(
          async (token: {
            symbol: string;
            name: string;
            quantity: number;
            id: string;
          }) => {
            const { symbol, name, quantity } = token;
            console.log(name, symbol, quantity);
            return await prisma.token.update({
              where: { id: token.id, crateId: String(id) },
              data: { name, symbol, quantity },
            });
          }
        )
      );
      res.status(HTTP_OK).json({ ...updatedCrate, tokens: updatedTokens });
    } catch (error) {
      res
        .status(HTTP_SERVER_ERROR)
        .json({ message: "Error updating crate", error });
    }
  } else if (req.method === "DELETE") {
    try {
      const Crate = await prisma.crate.delete({
        where: { id: String(id) },
      });
      console.log(Crate);
      res.status(HTTP_NO_CONTENT).end();
    } catch (error) {
      res
        .status(HTTP_SERVER_ERROR)
        .json({ message: "Error deleting crate", error });
    }
  } else {
    res.status(HTTP_METHOD_NOT_ALLOWED).json({ message: "Method not allowed" });
  }
}

import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import Cors from "cors";

const prisma = new PrismaClient();

const HTTP_OK = 200;
const HTTP_CREATED = 201;
const HTTP_SERVER_ERROR = 500;
const HTTP_METHOD_NOT_ALLOWED = 405;

// Initialize the cors middleware
const cors = Cors({
  methods: ['POST', 'GET', 'OPTIONS', 'HEAD'],
  origin: ['http://localhost:5173', 'https://sickfreak.club' , "http://localhost:3000", "https://sickgraphs.vercel.app"],
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

  if (req.method === "GET") {
    try {
      const crates = await prisma.crate.findMany({
        include: {
          tokens: true,
          creator: true,
        },
      });
      res.status(HTTP_OK).json(crates);
    } catch (error) {
      res
        .status(HTTP_SERVER_ERROR)
        .json({ message: "Error fetching crates", error });
    }
  } else if (req.method === "POST") {
    const { name, tokens, totalCost, creatorId, picture } = req.body;

    try {
      const newCrate = await prisma.crate.create({
        data: {
          name,
          image: picture,
          totalCost,
          creator: { connect: { id: creatorId } }
        },
      });

      const createdTokens = await Promise.all(
        tokens.map(
          (token: { symbol: string; name: string; quantity: number; coingeckoId: string }) =>
            prisma.token.create({
              data: {
                symbol: token.symbol,
                name: token.name,
                quantity: token.quantity,
                coingeckoId: token.coingeckoId,
                crateId: newCrate.id,
              },
            })
        )
      );

      await prisma.crate.update({
        where: { id: newCrate.id },
        data: {
          tokens: {
            connect: createdTokens.map((token) => ({ id: token.id })),
          },
        },
      });

      res.status(HTTP_CREATED).json(newCrate);
    } catch (error) {
      res
        .status(HTTP_SERVER_ERROR)
        .json({ message: "Error creating crate", error });
    }
  } else {
    res
      .status(HTTP_METHOD_NOT_ALLOWED)
      .json({ message: "Method not allowed", error: "Invalid request method" });
  }
}

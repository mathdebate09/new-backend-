import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import Cors from "cors";


const prisma = new PrismaClient();

// Initialize the cors middleware
const cors = Cors({
  methods: ['POST', 'GET', 'HEAD'],
  origin: 'http://localhost:5173', 
});


// Helper function to run middleware
function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: (req: NextApiRequest, res: NextApiResponse, next: (err?: any) => void) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    fn(req, res, (err: any) => {
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
    // Fetch all users
    try {
      const users = await prisma.user.findMany();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: "Error fetching users", error });
    }
  } else if (req.method === "POST") {
    // Create a new user
    const { name, email, username, profileImage, walletAddress } = req.body;
    try {
      const newUser = await prisma.user.create({
        data: { name, email, username, image: profileImage, walletAddress },
      });
      res.status(201).json(newUser);
    } catch (error) {
      res.status(500).json({ message: "Error creating user", error });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

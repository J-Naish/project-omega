import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import chatRoutes from "./routes/chat";

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/chat", chatRoutes);

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Hello from Express TypeScript server!" });
});

app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

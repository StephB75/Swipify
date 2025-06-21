import dotenv from "dotenv"
import express from "express"
import cors from "cors"

// get routes
import { scrape } from "./routers/scrape-route";
import { example } from "./routers/route-example";

dotenv.config();

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

const app = express();

app.use(express.json({ limit: "100mb" })); // increase payload size limit as needed
app.use(cors()); // allow all origins



// use routes
app.use("/scrape", scrape);
app.use("/example", example);

app.get("/", (req, res) => {
  res.status(200).json({ status: "im up" });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

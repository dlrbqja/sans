import express from "express";
import memosRouter from "./routes/memos.js";
import 'dsmhs-screener';

import path from "path";
import { fileURLToPath } from "url";
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "../public")));

app.use(express.json());
app.use("/memos", memosRouter);

app.listen(3000, () => {
  console.log("Server on 3000");
});



import express from "express";
import * as dotenv from "dotenv";
import { main } from "./model";
dotenv.config();

const app = express();
const PORT = process.env.PORT || "8080";

app.get("/", async (req, res) => {
  const text = String(req.query.text);
  const purpose = String(req.query.purpose);
  console.log(purpose, text);
  if (purpose.length === 0 || text.length === 0)
    return res.send("목적과 텍스트를 입력하세요.");
  try {
    const result = await main(purpose, text);
    return res.json(result);
  } catch (err) {
    console.log(err);
  }
});

app.listen(PORT, () => console.log("connect"));

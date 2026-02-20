import express from "express";
import fs from "fs";
import multer from "multer";
import { env } from "../env.js";

const filesRouter = express.Router();

fs.mkdirSync("public", { recursive: true });

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, "public/");
  },
  filename: function (_req, file, cb) {
    const ext = file.originalname
      .split(".")
      .filter(Boolean) // removes empty extensions (e.g. `filename...txt`)
      .slice(1)
      .join(".");
    cb(null, Date.now() + "." + ext);
  },
});
const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"));
  }
};

const upload = multer({
  storage: storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

filesRouter.post("/", (req, res) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      return res.status(400).send({ error: err.message });
    }
    const filePath = env.SERVER_URL + "/" + req.file?.path.replace(/\\/g, "/");
    console.log("File uploaded:", filePath);
    res.status(200).send({ url: filePath });
  });
});

export { filesRouter };

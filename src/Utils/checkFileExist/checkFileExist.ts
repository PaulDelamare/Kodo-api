import { RequestHandler } from "express";
import path from "path";
import fs from "fs";

export const checkFileExists: RequestHandler = (req, res, next) => {
     // eslint-disable-next-line no-undef
     const filePath = path.join(__dirname, "..", "..", "..", "uploads/public", req.path);
     if (fs.existsSync(filePath)) {
          next();
     } else {
          res.redirect("https://kodo.evift.fr/404");
     }
}

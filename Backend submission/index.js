import express from "express";
import mongoose from "mongoose";
import { nanoid } from "nanoid";
import loggingMiddleware from "./login.js";   
import Url from "./models/Url.js";              


mongoose.connect("mongodb://127.0.0.1:27017/urlShortener", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log(" MongoDB connected"))
  .catch((err) => console.error(" DB Connection Error:", err));


const app = express();
app.use(express.json());
app.use(loggingMiddleware);  


function validateCustomCode(code) {
  const regex = /^[a-zA-Z0-9_-]{3,20}$/;
  return regex.test(code);
}

function validateUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}



app.post("/shorten", async (req, res) => {
  try {
    const { originalUrl, customCode, validityMinutes } = req.body;

    if (!validateUrl(originalUrl)) {
      return res.status(400).json({ error: "Invalid URL format" });
    }

    const minutes = validityMinutes && validityMinutes > 0 ? validityMinutes : 30;
    const expiresAt = new Date(Date.now() + minutes * 60 * 1000);

    let shortCode;

    if (customCode) {
      if (!validateCustomCode(customCode)) {
        return res.status(400).json({
          error: "Invalid shortcode (3-20 chars, only letters, numbers, - , _)",
        });
      }
      const exists = await Url.findOne({ shortCode: customCode });
      if (exists) {
        return res.status(409).json({ error: "Custom shortcode already taken" });
      }
      shortCode = customCode;
    } else {
      shortCode = nanoid(8);
    }

    const newUrl = new Url({ originalUrl, shortCode, expiresAt });
    await newUrl.save();

    res.json({
      shortUrl: `${req.protocol}://${req.get("host")}/${shortCode}`,
      expiresAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});


app.get("/:shortCode", async (req, res) => {
  try {
    const { shortCode } = req.params;
    const urlDoc = await Url.findOne({ shortCode });

    if (!urlDoc) return res.status(404).json({ error: "Shortcode not found" });
    if (new Date() > urlDoc.expiresAt) {
      return res.status(410).json({ error: "Link expired" });
    }

    res.redirect(urlDoc.originalUrl);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});



const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));

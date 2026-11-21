
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    status: "online",
    message: "Link Bypass API aktif"
  });
});

app.post("/api/bypass", async (req, res) => {
  const { url } = req.body;

  try {
    if (!url) {
      return res.status(400).json({
        success: false,
        message: "Masukkan link terlebih dahulu"
      });
    }

    const parsed = new URL(url);

    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new Error("URL tidak valid");
    }

    const response = await axios.get(parsed.href, {
      maxRedirects: 10,
      timeout: 15000,
      validateStatus: () => true
    });

    res.json({
      success: true,
      originalUrl: parsed.href,
      resultUrl: response.request.res.responseUrl || parsed.href
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Gagal memproses link"
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});

  

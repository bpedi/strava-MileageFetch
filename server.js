const express = require("express");
const axios = require("axios");
const app = express();

const CLIENT_ID = "167734";
const CLIENT_SECRET = "f4e86440a5d39c23f1ac70a8c3c97a599a5332ce";
let refreshToken = "2f3364220c8cfcfb1fa25e7bcda323552119fd30";
let accessToken = "d5fab88bc501305b9036eb78c5ecd70e89f2f15e";
let athleteId = "160300263";

// Automatically refresh token every hour
async function refreshAccessToken() {
  try {
    const res = await axios.post("https://www.strava.com/oauth/token", null, {
      params: {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      },
    });

    accessToken = res.data.access_token;
    refreshToken = res.data.refresh_token; // update if it rotates
    console.log("🔄 Token refreshed");
  } catch (err) {
    console.error("❌ Error refreshing token:", err.response?.data || err.message);
  }
}

setInterval(refreshAccessToken, 1000 * 60 * 60); // refresh every hour
refreshAccessToken(); // initial fetch

app.get("/", async (req, res) => {
  if (!accessToken) {
    return res.send("Access token not ready.");
  }

  try {
    const stats = await axios.get(
      `https://www.strava.com/api/v3/athletes/${athleteId}/stats`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const meters = stats.data.ytd_run_totals.distance;
    const miles = (meters / 1609.34).toFixed(1);

    res.send(`
      <html>
        <head>
          <style>
            body { font-family: sans-serif; font-size: 24px; margin: 0; display: flex; align-items: center; justify-content: center; height: 100vh; }
          </style>
        </head>
        <body>
          <p>You’ve run <strong>${miles}</strong> miles this year.</p>
        </body>
      </html>
    `);
  } catch (err) {
    res.send("Failed to fetch stats.");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Listening on port ${PORT}`));

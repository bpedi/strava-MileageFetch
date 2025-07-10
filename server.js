require('dotenv').config();
const express = require("express");
const axios = require("axios");

const app = express();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
let refreshToken = process.env.REFRESH_TOKEN;
let accessToken = "";
let athleteId = process.env.ATHLETE_ID;

// Refresh the access token from Strava
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
    refreshToken = res.data.refresh_token; // update if rotated
    console.log("✅ Access token refreshed");
  } catch (err) {
    console.error("❌ Token refresh error:", err.response?.data || err.message);
  }
}

// Refresh token every hour
setInterval(refreshAccessToken, 1000 * 60 * 60);
refreshAccessToken(); // refresh at start

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
            body {
              font-family: sans-serif;
              font-size: 24px;
              margin: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
            }
          </style>
        </head>
        <body>
          <p>You’ve run <strong>${miles}</strong> miles this year.</p>
        </body>
      </html>
    `);
  } catch (err) {
    console.error("❌ Failed to fetch athlete stats:", err.message);
    res.send("Failed to fetch stats.");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`));

const express = require("express");
const axios = require("axios");

const app = express();

// Read from environment variables
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
let refreshToken = process.env.REFRESH_TOKEN;
let accessToken = "d5fab88bc501305b9036eb78c5ecd70e89f2f15e";
let athleteId = process.env.ATHLETE_ID;

// Automatically refresh access token
async function refreshAccessToken() {
  try {
    const response = await axios.post("https://www.strava.com/oauth/token", null, {
      params: {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      },
    });

    accessToken = response.data.access_token;
    refreshToken = response.data.refresh_token; // may rotate
    console.log("✅ Access token refreshed");
  } catch (error) {
    console.error("❌ Error refreshing token:", error.response?.data || error.message);
  }
}

// Initial token refresh and refresh hourly
refreshAccessToken();
setInterval(refreshAccessToken, 1000 * 60 * 60); // every hour

// Serve mileage on root route
app.get("/", async (req, res) => {
  if (!accessToken) {
    return res.send("Access token not yet available. Try again shortly.");
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
              background: #f7f7f7;
            }
          </style>
        </head>
        <body>
          <p>You’ve run <strong>${miles}</strong> miles this year.</p>
        </body>
      </html>
    `);
  } catch (err) {
    console.error("❌ Failed to fetch stats:", err.message);
    res.send("Could not fetch stats from Strava.");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));

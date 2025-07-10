const express = require("express");
const axios = require("axios");

const app = express();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
let refreshToken = process.env.REFRESH_TOKEN;
let accessToken = "d5fab88bc501305b9036eb78c5ecd70e89f2f15e";
let athleteId = process.env.ATHLETE_ID;

// Refresh access token from Strava
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
    refreshToken = response.data.refresh_token;
    console.log("✅ Access token refreshed");
  } catch (error) {
    console.error("❌ Error refreshing token:", error.response?.data || error.message);
  }
}

refreshAccessToken();
setInterval(refreshAccessToken, 1000 * 60 * 60); // refresh hourly

// Root route — clean output for Wix iframe
app.get("/", async (req, res) => {
  if (!accessToken) {
    return res.send("Loading...");
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
            @font-face {
              font-family: 'SF Pro Display';
              font-weight: 600;
              src: local('SF Pro Display Semibold'),
                   local('SFProDisplay-Semibold');
            }
            body {
              margin: 0;
              background: transparent;
              color: #6E6E6E;
              font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
              font-weight: 600;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              font-size: 64px;
            }
          </style>
        </head>
        <body>
          ${miles} mi
        </body>
      </html>
    `);
  } catch (err) {
    console.error("❌ Failed to fetch stats:", err.message);
    res.send("Error");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));

# Yearly Running Mileage Widget for Portfolio

For my engineering portfolio, I wanted a clean way to showcase how many miles I've run this year. Unfortunately, Strava’s built-in sharing tools and widgets didn’t match the look and feel of my website.

To solve this, I created a simple JavaScript backend service that automatically fetches my year-to-date running mileage from the Strava API. The service is hosted on [Render](https://render.com) and embedded into my Wix portfolio site via an iframe for seamless integration.

---

## How it works

- The backend service authenticates with Strava’s API using OAuth tokens and refreshes the access token hourly.
- It fetches the latest year-to-date running mileage.
- It serves a minimal HTML page styled to match my site, displaying the mileage centered with my chosen font and colors.
- The page is embedded into my portfolio via an iframe.

**Note:** The Render service experiences a cold start of about 30 seconds if idle, but since I only update my mileage once daily, this is not a concern.

---

## How to use this yourself

1. **Create a Strava API app:**

   - Go to https://www.strava.com/settings/api and create a new application.
   - Save your Client ID, Client Secret, and generate an initial refresh token.

2. **Deploy the backend on Render:**

   - Fork or clone this GitHub repository.
   - Create a new Web Service on Render and connect your repo.
   - Use the following settings:
     - Environment: Node
     - Build command: `npm install`
     - Start command: `npm start`
   - Add these environment variables in Render’s dashboard with your Strava app credentials:
     - `CLIENT_ID`
     - `CLIENT_SECRET`
     - `REFRESH_TOKEN`
     - `ATHLETE_ID`

3. **Embed in your website:**

   - Add an iframe pointing to your Render service URL.
   - Adjust width and height to fit your design.

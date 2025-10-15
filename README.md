# AI Second Brain - WhatsApp Personal Assistant

This project is a full-stack application for a private, AI-powered personal assistant. It features a React-based web UI and a Node.js backend that connects to WhatsApp, acting as a reliable "second brain".

This application is structured as a unified monorepo and is designed to be deployed as a single service on a platform like [Render](https://render.com/).

## Features

-   **Monorepo Structure**: A clean separation of the React frontend (`client`) and Node.js backend (`server`).
-   **Production Build Step**: Uses Vite to build the frontend into optimized static assets for production.
-   **WhatsApp Integration**: Uses `whatsapp-web.js` to connect to a dedicated WhatsApp account.
-   **AI-Powered Conversations**: Leverages the Google Gemini API for natural language understanding and responses.
-   **Smarter Memory (RAG)**: Implements a Vector Database (`ChromaDB`) to store and retrieve notes based on *semantic meaning*.
-   **Proactive Daily Digest**: A scheduled job sends a daily summary to your phone.
-   **Secure and Private**: The bot will *only* respond to a single, pre-authorized phone number.

---

## Deployment Guide

Follow these steps carefully to get your assistant online.

### Prerequisites

1.  **Node.js**: Ensure you have Node.js (v18 or newer) installed.
2.  **Two WhatsApp Numbers**: A dedicated number for the bot and your personal number for interaction.
3.  **Google Gemini API Key**: Get a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
4.  **GitHub & Render Accounts**.

---

### Step 1: Prepare Your Repository

1.  **Set up the project** on your local machine with the new `client` and `server` folders.
2.  **Upload the entire project structure** to a new GitHub repository.

---

### Step 2: Local Setup & First Run

You must run the assistant locally once to authenticate with WhatsApp. This creates a session file that keeps you logged in.

1.  **Install All Dependencies**: From the project's **root directory**, run:
    ```bash
    npm install
    ```
    This will install dependencies for both the `client` and `server`.

2.  **Create `.env` file**: In the **`server/` directory**, create a file named `.env`.

    **File: `server/.env`**
    ```env
    # Your Google Gemini API Key
    GOOGLE_API_KEY="YOUR_GEMINI_API_KEY"

    # Your PERSONAL WhatsApp number (the one you will message FROM).
    # Just the country code and number, no '+' or symbols.
    # Example: 918639889101
    AUTHORIZED_NUMBER="YOUR_PERSONAL_PHONE_NUMBER"
    ```

3.  **Run the Server Locally**: From the project's **root** directory, run:
    ```bash
    npm start
    ```

4.  **Link WhatsApp**: A QR code will appear in your terminal. **Using the phone with the BOT's number**, open WhatsApp (`Settings > Linked Devices > Link a Device`) and scan the code.

5.  Once you see "Client is ready!", a `session_data` folder is created in the root directory. You can now stop the server (`CTRL + C`).

---

### Step 3: Deploy to Render

1.  **Commit and Push All Your Code**: Make sure you commit the `session_data` folder to avoid re-scanning on the first deploy.
    ```bash
    git add .
    git commit -m "feat: initial setup and authentication"
    git push
    ```

2.  Go to your [Render Dashboard](https://dashboard.render.com) and create a **New Web Service**.

3.  Connect the repository.

4.  **IMPORTANT**: Configure the service with the following settings:
    -   **Name**: `ai-second-brain` (or anything you like)
    -   **Root Directory**: **LEAVE THIS BLANK**.
    -   **Environment**: `Node`
    -   **Build Command**: `npm install && npm run build`
    -   **Start Command**: `npm start`
    -   **Instance Type**: **Free**

5.  Click **"Advanced Settings"**.
    -   Go to the **Environment Variables** section.
    -   **Add Environment Variables**:
        -   **Key**: `GOOGLE_API_KEY`, **Value**: `paste_your_google_api_key`
        -   **Key**: `AUTHORIZED_NUMBER`, **Value**: `paste_your_personal_phone_number`
        -   **Key**: `NODE_VERSION`, **Value**: `18.17.1`

6.  Click **"Create Web Service"**.

---

### Step 4: Keep Your Assistant Awake (Crucial for Free Tier)

Render's free services sleep after 15 minutes of inactivity. Use a free service like **UptimeRobot** to prevent this, which preserves your WhatsApp session and memory.

1.  **Get Your Service URL**: On your Render dashboard, copy the URL for your new service (e.g., `https://ai-second-brain.onrender.com`).

2.  **Sign up for UptimeRobot**: Create a free account at [UptimeRobot](https://uptimerobot.com/).

3.  **Create a New Monitor**:
    -   **Monitor Type**: `HTTP(s)`
    -   **Friendly Name**: `AI Brain`
    -   **URL (or IP)**: Paste your Render service URL. **Important**: Add `/api/whatsapp/status` to the end.
        -   Example: `https://ai-second-brain.onrender.com/api/whatsapp/status`
    -   **Monitoring Interval**: `5 minutes`.
    -   Click **"Create Monitor"**.

---

### Step 5: Interact With Your Assistant

You're all set! Go to your Render URL (e.g., `https://ai-second-brain.onrender.com`) to view the UI and manage settings.

**Using your personal phone**, send a message to the **bot's phone number** in WhatsApp.

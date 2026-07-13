# 🌌 CodeOrbit

**CodeOrbit** is a centralized progress-tracking platform designed for competitive programmers and software engineering students. It connects directly with external coding profiles (**LeetCode** and **Codeforces**) to fetch problem-solving history, track daily coding activity, and calculate a comprehensive **AI-driven Interview Readiness Score** to guide students toward landing top tech roles.

---

## 🎯 Purpose & Core Objective

Students preparing for technical interviews often struggle to know:
1. *Am I ready for interviews?*
2. *Where are the gaps in my Data Structures and Algorithms (DSA) knowledge?*
3. *How does my competitive programming (Codeforces) speed compare with my software engineering (LeetCode) conceptual depth?*

CodeOrbit solves this by aggregating cross-platform data, analyzing problem difficulties and topic tags, and diagnosing preparation readiness in real time with an automated assessment engine.

---

## 👥 Core User Experience (How it Works)

### 1. Unified Registration & Integration
Users register a secure profile and link their **LeetCode** and **Codeforces** usernames. They can optionally list their future plans and weak topics.

### 2. Platform Stats & Performance Tracking
Once linked, the dashboard updates to show:
* **Codeforces Metrics**: Current rating, peak (max) rating, competitive programming rank, and total solved problems count, along with a historical rating trend line chart.
* **LeetCode Metrics**: Solved counts categorized by difficulty (Easy, Medium, Hard), current contest rating, contests attended, global ranking, and percentile standing.

### 3. AI Interview Readiness Diagnostic
The core intelligence engine analyzes the student's history to output:
* **Readiness Score & Level**: A percentile score (0–100%) and a readiness rating (e.g., *Beginner*, *Intermediate*, *Interview Ready*).
* **Topic Mastery Heatmap**: A breakdown of solved counts across 24 critical DSA topics (like Arrays, Trees, Dynamic Programming, Graphs, Backtracking) showing a percentage mastery for each topic.
* **Actionable Recommendations**: AI-generated feedback detailing which advanced topics require focus and how to adjust contest participation.
* **Consistency Tracking**: A GitHub-style heat calendar mapping user activity and profile updates over the past 30 days.

### 4. Global Leaderboard
Fosters community and peer motivation by ranking all registered CodeOrbit users based on a combined score derived from their ratings across both platforms.

---

## 🏗 System Architecture & Data Flow

CodeOrbit is built on a full-stack JavaScript architecture (**Node.js/Express** + **React** + **MongoDB**):

```
                       +-------------------+
                       |   React Client    |
                       +---------+---------+
                                 |  Requests
                                 v
                       +---------+---------+
                       |   Express API     |
                       +----+----+----+----+
                            |    |    |
       +--------------------+    |    +--------------------+
       | Write/Read              | Fetch Data              | Fetch Data
       v                         v                         v
+------+------+           +------+------+           +------+------+
|   MongoDB   |           |  LeetCode   |           | Codeforces  |
|  Database   |           | GraphQL API |           | Official API|
+-------------+           +-------------+           +-------------+
```

### 1. Data Fetching & Caching Strategy
* **Direct Crawling**: The backend queries the Codeforces User Info API and the LeetCode GraphQL endpoint to pull live data.
* **The API Cap Challenge**: Due to public API rate limits and page constraints, LeetCode's public endpoint limits solved problem history to the **20 most recently solved slugs**.
* **Smart Estimation Engine**: To match the user's actual solved totals (e.g., 397 problems), the engine uses a round-robin fallback. It calculates the remaining solved counts (`Total Solved - 20 Recently Solved`) and distributes them logically across categories matching the difficulty level (e.g., Easy distributed to Arrays/Strings, Hard to DP/Graphs) to calculate a representative topic mastery score.
* **Caching Layer**: Fetched problem data is cached in the `LeetCodeProblem` MongoDB collection to prevent duplicate network calls.

### 2. Stats Synchronization (`cron/updateStats.js`)
A background cron job runs automatically in the background to scrape and update profile stats for all users once every hour, logging historical snap-points into `StatHistory` to build progress line-graphs.

---

## 🛠 Technical Stack

* **Frontend**: React (Vite/CRA), Chart.js (`react-chartjs-2`), Vanilla CSS (Custom dark/light themes).
* **Backend**: Node.js, Express.js.
* **Database**: MongoDB (Atlas) using Mongoose ODM.
* **Authentication**: JSON Web Tokens (JWT) & bcrypt passwords encryption.

---

## 💻 How to Run the Project

Follow these steps to run the CodeOrbit dashboard locally:

### 1. Run the Backend Server
1. Open a terminal and navigate to the `/server` folder.
2. Create a `.env` file by copying the template file:
   * **On Windows (PowerShell)**: `Copy-Item .env.example .env`
   * **On macOS/Linux**: `cp .env.example .env`
   
   Open the `.env` file and fill in your actual database credentials and keys:
   ```env
   MONGO_URI=mongodb+srv://<db_username>:<db_password>@<your_mongodb_cluster_url>/codeorbit?retryWrites=true&w=majority
   JWT_SECRET=your_jwt_secret_key_here
   PORT=5000
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   npm start
   ```
   *The server will start listening on `http://localhost:5000`.*

### 2. Run the Frontend Client
1. Open a second terminal window and navigate to the `/client` folder.
2. Install the frontend dependencies:
   ```bash
   npm install
   ```
3. Launch the development server:
   ```bash
   npm start
   ```
   *The frontend client will open in your default browser at `http://localhost:3000`.*

const StatHistory = require("../models/StatHistory");
const cron = require("node-cron");
const axios = require("axios");
const User = require("../models/User");

cron.schedule("0 * * * *", async () => {
    console.log("🔄 Running stats update...");

    const users = await User.find();

    for (const user of users) {
        try {
            let cfRating = 0;
            let cfMaxRating = 0;

            let lcRating = 0;
            let lcSolved = 0;
            let lcContests = 0;
            let cfRank = "unrated";

            let lcEasy = 0;
            let lcMedium = 0;
            let lcHard = 0;

            let lcGlobalRanking = 0;
            let lcTopPercentage = 0;

            // Codeforces
            if (user.codeforcesUsername) {
                const cfRes = await axios.get(
                    `http://localhost:5000/codeforces/${user.codeforcesUsername}`
                );

                cfRating = cfRes.data.rating || 0;
                cfRank = cfRes.data.rank || "unrated";
                cfMaxRating = cfRes.data.maxRating || 0;
            }

            // LeetCode
            if (user.leetcodeUsername) {
                const lcRes = await axios.get(
                    `http://localhost:5000/leetcode/${user.leetcodeUsername}`
                );
                lcEasy = lcRes.data.easy || 0;
                lcMedium = lcRes.data.medium || 0;
                lcHard = lcRes.data.hard || 0;

                lcGlobalRanking = lcRes.data.globalRanking || 0;
                lcTopPercentage = lcRes.data.topPercentage || 0;
                lcRating = lcRes.data.rating || 0;
                lcSolved = lcRes.data.total || 0;
                lcContests = lcRes.data.contests || 0;
            }

            await User.findByIdAndUpdate(user._id, {
                cfRating,
                cfMaxRating,
                cfRank,

                lcRating,
                lcSolved,
                lcContests,

                lcEasy,
                lcMedium,
                lcHard,

                lcGlobalRanking,
                lcTopPercentage,

                lastUpdated: new Date()
            });
            await StatHistory.create({
  userId: user._id,
  cfRating,
  lcRating,
  timestamp: new Date()
});

            console.log(`✅ Updated ${user.name}`);
        } catch (err) {
            console.log(`❌ Failed for ${user.name}`);
        }
    }
});

console.log("⏰ Cron Job Started");
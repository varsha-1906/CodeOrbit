const StatHistory = require("../models/StatHistory");
const cron = require("node-cron");
const axios = require("axios");
const User = require("../models/User");
const LeetCodeProblem = require("../models/LeetCodeProblem");

cron.schedule("0 * * * *", async () => {
    console.log("🔄 Running stats update...");

    const users = await User.find();

    for (const user of users) {
        try {
            let cfRating = user.cfRating || 0;
            let cfMaxRating = user.cfMaxRating || 0;
            let cfRank = user.cfRank || "unrated";
            let cfSolved = user.cfSolved || 0;

            let lcRating = user.lcRating || 0;
            let lcSolved = user.lcSolved || 0;
            let lcContests = user.lcContests || 0;
            let lcEasy = user.lcEasy || 0;
            let lcMedium = user.lcMedium || 0;
            let lcHard = user.lcHard || 0;
            let lcGlobalRanking = user.lcGlobalRanking || 0;
            let lcTopPercentage = user.lcTopPercentage || 0;

            // 1. Fetch Codeforces General Info
            if (user.codeforcesUsername) {
                try {
                    const cfRes = await axios.get(
                        `http://localhost:5000/codeforces/${user.codeforcesUsername}`
                    );
                    cfRating = cfRes.data.rating || 0;
                    cfRank = cfRes.data.rank || "unrated";
                    cfMaxRating = cfRes.data.maxRating || 0;
                } catch (err) {
                    console.log(`⚠️ Failed CF Info fetch for ${user.name}: ${err.message}`);
                }

                // 2. Fetch Codeforces Status (Submissions) to get Solved Count
                try {
                    const cfStatusRes = await axios.get(
                        `https://codeforces.com/api/user.status?handle=${user.codeforcesUsername}`
                    );
                    if (cfStatusRes.data && cfStatusRes.data.status === "OK") {
                        const solvedSet = new Set();
                        cfStatusRes.data.result.forEach(sub => {
                            if (sub.verdict === "OK" && sub.problem) {
                                solvedSet.add(`${sub.problem.contestId}-${sub.problem.index}`);
                            }
                        });
                        cfSolved = solvedSet.size;
                    }
                } catch (err) {
                    console.log(`⚠️ Failed CF Submissions fetch for ${user.name}: ${err.message}`);
                }
            }

            // 3. Fetch LeetCode General Info
            let solvedSlugs = [];
            if (user.leetcodeUsername) {
                try {
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
                } catch (err) {
                    console.log(`⚠️ Failed LC Info fetch for ${user.name}: ${err.message}`);
                }

                // 4. Fetch LeetCode Solved Slugs list
                try {
                    const solvedRes = await axios.get(
                        `https://leetcode-api-pied.vercel.app/user/${user.leetcodeUsername}/solved`
                    );
                    if (solvedRes.data && solvedRes.data.solved_slugs) {
                        solvedSlugs = solvedRes.data.solved_slugs;
                    }
                } catch (err) {
                    console.log(`⚠️ Failed LC Solved Slugs fetch for ${user.name}: ${err.message}`);
                }
            }

            // 5. Update User Database document
            await User.findByIdAndUpdate(user._id, {
                cfRating,
                cfSolved,
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

            // 6. Create StatHistory entry
            await StatHistory.create({
                userId: user._id,
                cfRating,
                lcRating,
                lcSolved,
                cfSolved,
                timestamp: new Date()
            });

            // 7. Background pre-cache LeetCode problems in MongoDB
            if (solvedSlugs.length > 0) {
                const existingProblems = await LeetCodeProblem.find({
                    titleSlug: { $in: solvedSlugs }
                });
                const cachedSlugs = new Set(existingProblems.map(p => p.titleSlug));
                const missingSlugs = solvedSlugs.filter(slug => !cachedSlugs.has(slug));

                // Process up to 15 missing problems per cron run to avoid rate limits
                const batch = missingSlugs.slice(0, 15);
                for (const slug of batch) {
                    try {
                        const probRes = await axios.get(`https://leetcode-api-pied.vercel.app/problem/${slug}`);
                        if (probRes.data && probRes.data.title) {
                            const tags = (probRes.data.topicTags || []).map(t => t.name || t);
                            await LeetCodeProblem.create({
                                titleSlug: slug,
                                title: probRes.data.title,
                                difficulty: probRes.data.difficulty || "Easy",
                                topicTags: tags,
                                isPaidOnly: probRes.data.isPaidOnly || false,
                                likes: probRes.data.likes || 0,
                                dislikes: probRes.data.dislikes || 0,
                                lastUpdated: new Date()
                            });
                        }
                    } catch (e) {
                        // Suppress individual errors to allow loop continuation
                    }
                }
            }

            console.log(`✅ Updated ${user.name}`);
        } catch (err) {
            console.log(`❌ Failed for ${user.name}: ${err.message}`);
        }
    }
});

console.log("⏰ Cron Job Started");
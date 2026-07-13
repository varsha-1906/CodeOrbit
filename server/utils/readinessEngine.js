const config = require("../config/readinessConfig");

/**
 * Normalizes raw LeetCode and Codeforces tag names to our config keys.
 * 
 * @param {string} rawTag - Raw tag string from APIs.
 * @returns {string|null} Matched config topic key.
 */
function mapTagToConfigKey(rawTag) {
  if (!rawTag) return null;
  const tag = rawTag.toLowerCase().trim();

  if (tag === "array" || tag === "arrays" || tag === "matrix" || tag === "prefix sum" || tag === "simulation" || tag === "sorting") {
    return "Arrays";
  }
  if (tag === "string" || tag === "strings") {
    return "Strings";
  }
  if (tag === "hash table" || tag === "hash map" || tag === "hashmap" || tag === "map" || tag === "ordered set") {
    return "Hash Map";
  }
  if (tag === "two pointers" || tag === "two-pointers" || tag === "sliding window" || tag === "two pointers") {
    return "Two Pointers";
  }
  if (tag === "binary search" || tag === "binary-search") {
    return "Binary Search";
  }
  if (tag === "stack" || tag === "monotonic stack") {
    return "Stack";
  }
  if (tag === "queue" || tag === "monotonic queue" || tag === "priority queue") {
    return "Queue";
  }
  if (tag === "heap" || tag === "heap (priority queue)") {
    return "Heap";
  }
  if (tag === "linked list" || tag === "linked-list") {
    return "Linked List";
  }
  if (tag === "tree" || tag === "trees" || tag === "binary tree") {
    return "Trees";
  }
  if (tag === "bst" || tag === "binary search tree") {
    return "BST";
  }
  if (tag === "graph" || tag === "graphs" || tag === "graph theory" || tag === "shortest path" || tag === "topological sort") {
    return "Graphs";
  }
  if (tag === "bfs" || tag === "breadth-first search" || tag === "breadth-first-search") {
    return "BFS";
  }
  if (tag === "dfs" || tag === "depth-first search" || tag === "depth-first-search") {
    return "DFS";
  }
  if (tag === "dynamic programming" || tag === "dynamic-programming" || tag === "dp" || tag === "memoization" || tag === "knapsack") {
    return "Dynamic Programming";
  }
  if (tag === "backtracking") {
    return "Backtracking";
  }
  if (tag === "greedy") {
    return "Greedy";
  }
  if (tag === "trie") {
    return "Trie";
  }
  if (tag === "union find" || tag === "union-find" || tag === "disjoint set") {
    return "Union Find";
  }
  if (tag === "segment tree" || tag === "segment-tree") {
    return "Segment Tree";
  }
  if (tag === "fenwick tree" || tag === "binary indexed tree" || tag === "fenwick-tree") {
    return "Fenwick Tree";
  }
  if (tag === "bitmask" || tag === "bit manipulation" || tag === "bit-manipulation" || tag === "bitmask dp") {
    return "Bitmask";
  }
  if (tag === "geometry" || tag === "math") {
    return "Geometry";
  }
  if (tag === "network flow" || tag === "network-flow" || tag === "max flow" || tag === "bipartite matching") {
    return "Network Flow";
  }

  return null;
}

/**
 * Map Codeforces rating to LeetCode equivalent difficulty level.
 */
function mapCfRatingToDifficulty(rating) {
  if (!rating || rating < 1200) return "Easy";
  if (rating < 1900) return "Medium";
  return "Hard";
}

/**
 * Calculates the advanced AI Interview Readiness Score and diagnostic payload.
 */
function calculateInterviewReadiness(user, history = [], fetchedData = {}) {
  // Extract inputs
  const cfRating = user.cfRating || 0;
  const cfMaxRating = user.cfMaxRating || 0;
  const lcRating = user.lcRating || 0;
  const lcSolved = user.lcSolved || 0;
  const lcEasy = user.lcEasy || 0;
  const lcMedium = user.lcMedium || 0;
  const lcHard = user.lcHard || 0;
  const lcContests = user.lcContests || 0;

  // Destructure fetched raw API data with fallbacks
  const {
    leetcodeSolvedProblems = [],
    leetcodeCalendar = {},
    leetcodeContests = {},
    codeforcesSolvedProblems = [],
    codeforcesContests = []
  } = fetchedData;

  // Ensure history is sorted by timestamp ascending
  const sortedHistory = [...history].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  // ==========================================
  // Step 1, 2, 3, 4: Topic Mastery Calculation
  // ==========================================
  const topics = Object.keys(config.topicWeights);
  const topicSolvedCounts = {};
  topics.forEach(t => {
    topicSolvedCounts[t] = { Easy: 0, Medium: 0, Hard: 0 };
  });

  let categorizedEasy = 0;
  let categorizedMedium = 0;
  let categorizedHard = 0;

  // Process real LeetCode solved problems
  if (leetcodeSolvedProblems && leetcodeSolvedProblems.length > 0) {
    leetcodeSolvedProblems.forEach(prob => {
      const difficulty = prob.difficulty || "Easy";
      if (difficulty === "Easy") categorizedEasy++;
      else if (difficulty === "Medium") categorizedMedium++;
      else if (difficulty === "Hard") categorizedHard++;

      const tags = prob.topicTags || [];
      tags.forEach(tag => {
        const configKey = mapTagToConfigKey(tag);
        if (configKey && topicSolvedCounts[configKey]) {
          topicSolvedCounts[configKey][difficulty]++;
        }
      });
    });
  }

  // Process real Codeforces solved problems
  if (codeforcesSolvedProblems && codeforcesSolvedProblems.length > 0) {
    codeforcesSolvedProblems.forEach(prob => {
      const difficulty = mapCfRatingToDifficulty(prob.rating);
      const tags = prob.tags || [];
      tags.forEach(tag => {
        const configKey = mapTagToConfigKey(tag);
        if (configKey && topicSolvedCounts[configKey]) {
          topicSolvedCounts[configKey][difficulty]++;
        }
      });
    });
  }

  // Distribute remaining (un-categorized/uncached) LeetCode solved problems to align with actual totals
  const remainingEasy = Math.max(0, lcEasy - categorizedEasy);
  const remainingMedium = Math.max(0, lcMedium - categorizedMedium);
  const remainingHard = Math.max(0, lcHard - categorizedHard);

  if (remainingEasy > 0) {
    const easyTopics = ["Arrays", "Strings", "Linked List", "Hash Map", "Stack", "Queue", "Two Pointers"];
    let idx = 0;
    for (let i = 0; i < remainingEasy; i++) {
      const topic = easyTopics[idx % easyTopics.length];
      topicSolvedCounts[topic].Easy++;
      idx++;
    }
  }

  if (remainingMedium > 0) {
    const mediumTopics = [
      "Binary Search", "Trees", "BST", "DFS", "BFS", "Stack", "Queue",
      "Dynamic Programming", "Greedy", "Heap", "Two Pointers", "Hash Map"
    ];
    let idx = 0;
    for (let i = 0; i < remainingMedium; i++) {
      const topic = mediumTopics[idx % mediumTopics.length];
      topicSolvedCounts[topic].Medium++;
      idx++;
    }
  }

  if (remainingHard > 0) {
    const hardTopics = [
      "Dynamic Programming", "Graphs", "Backtracking", "Trie", "Union Find",
      "Segment Tree", "Fenwick Tree", "Bitmask", "Geometry", "Network Flow"
    ];
    let idx = 0;
    for (let i = 0; i < remainingHard; i++) {
      const topic = hardTopics[idx % hardTopics.length];
      topicSolvedCounts[topic].Hard++;
      idx++;
    }
  }

  // Compute Topic Mastery Scores
  const topicMastery = {};
  const topicScores = {};
  let totalTopicMasterySum = 0;

  topics.forEach(topic => {
    const counts = topicSolvedCounts[topic];
    const weight = config.topicWeights[topic] || 3;

    // Formula: Topic Score = Topic Weight * Difficulty Weight
    const score =
      counts.Easy * weight * config.difficultyWeights.Easy +
      counts.Medium * weight * config.difficultyWeights.Medium +
      counts.Hard * weight * config.difficultyWeights.Hard;

    const expectedMax = config.expectedMaxTopicScores[topic] || 100;
    const masteryPercent = Math.round(Math.min((score / expectedMax) * 100, 100));

    topicMastery[topic] = masteryPercent;
    topicScores[topic] = score;
    totalTopicMasterySum += masteryPercent;
  });

  const avgTopicMastery = Math.round(totalTopicMasterySum / topics.length);

  // ==========================================
  // Step 5: Problem Difficulty Coverage
  // ==========================================
  const easyCoverage = Math.min((lcEasy / config.difficultyTargets.Easy) * 100, 100);
  const mediumCoverage = Math.min((lcMedium / config.difficultyTargets.Medium) * 100, 100);
  const hardCoverage = Math.min((lcHard / config.difficultyTargets.Hard) * 100, 100);
  const problemDifficultyScore = Math.round(
    0.2 * easyCoverage + 0.4 * mediumCoverage + 0.4 * hardCoverage
  );

  // ==========================================
  // Step 6: Codeforces Score
  // ==========================================
  const cfRatingNormalized = Math.min((cfRating / config.codeforcesTargets.targetRating) * 100, 100);
  const cfMaxRatingNormalized = Math.min((cfMaxRating / config.codeforcesTargets.targetMaxRating) * 100, 100);

  // Contest participation
  const cfContestCount = codeforcesContests && codeforcesContests.length > 0
    ? codeforcesContests.length
    : (cfRating > 0 ? Math.max(5, Math.floor((cfRating - 800) / 25)) : 0);
  const cfContestNormalized = Math.min((cfContestCount / config.codeforcesTargets.targetContests) * 100, 100);

  // Growth (current vs first contest rating)
  let cfGrowth = 0;
  if (codeforcesContests && codeforcesContests.length >= 2) {
    const firstContest = codeforcesContests[0].newRating || 800;
    cfGrowth = Math.max(0, cfRating - firstContest);
  } else if (sortedHistory.length >= 2) {
    const firstVal = sortedHistory[0].cfRating || 0;
    const lastVal = sortedHistory[sortedHistory.length - 1].cfRating || 0;
    cfGrowth = Math.max(0, lastVal - firstVal);
  }
  const cfGrowthNormalized = Math.min((cfGrowth / config.codeforcesTargets.targetGrowth) * 100, 100);

  const codeforcesScore = user.codeforcesUsername ? Math.round(
    0.40 * cfRatingNormalized +
    0.20 * cfMaxRatingNormalized +
    0.20 * cfContestNormalized +
    0.20 * cfGrowthNormalized
  ) : 0;

  // ==========================================
  // Step 7: Consistency Score
  // ==========================================
  const now = new Date();
  const oneDay = 24 * 60 * 60 * 1000;

  const activeDates = new Set();

  // Parse LeetCode submission calendar
  if (leetcodeCalendar && leetcodeCalendar.submissionCalendar) {
    Object.keys(leetcodeCalendar.submissionCalendar).forEach(ts => {
      const date = new Date(parseInt(ts) * 1000);
      activeDates.add(date.toDateString());
    });
  } else {
    // Fallback to history dates
    sortedHistory.forEach(h => {
      if (h.timestamp) {
        activeDates.add(new Date(h.timestamp).toDateString());
      }
    });
  }

  // Parse Codeforces solved problem timestamps
  if (codeforcesSolvedProblems && codeforcesSolvedProblems.length > 0) {
    codeforcesSolvedProblems.forEach(sub => {
      if (sub.timestamp) {
        const date = new Date(sub.timestamp * 1000);
        activeDates.add(date.toDateString());
      }
    });
  }

  // Calculate weekly activity (days active in last 7 days)
  let weeklyActive = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(now.getTime() - i * oneDay);
    if (activeDates.has(d.toDateString())) weeklyActive++;
  }

  // Calculate monthly activity (days active in last 30 days)
  let monthlyActive = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date(now.getTime() - i * oneDay);
    if (activeDates.has(d.toDateString())) monthlyActive++;
  }

  // Calculate current streak
  let currentStreak = leetcodeCalendar.streak || 0;
  if (currentStreak === 0) {
    let streakCheck = new Date(now);
    const activeToday = activeDates.has(streakCheck.toDateString());
    const activeYesterday = activeDates.has(new Date(now.getTime() - oneDay).toDateString());

    if (activeToday || activeYesterday) {
      if (!activeToday) streakCheck = new Date(now.getTime() - oneDay);
      while (activeDates.has(streakCheck.toDateString())) {
        currentStreak++;
        streakCheck = new Date(streakCheck.getTime() - oneDay);
      }
    }
  }

  // Apply minimal fallbacks
  const finalWeekly = Math.max(1, weeklyActive);
  const finalMonthly = Math.max(2, monthlyActive);
  const finalStreak = Math.max(1, currentStreak);

  const weeklyScore = Math.min((finalWeekly / config.consistencyTargets.targetWeeklyDays) * 100, 100);
  const monthlyScore = Math.min((finalMonthly / config.consistencyTargets.targetMonthlyDays) * 100, 100);
  const streakScore = Math.min((finalStreak / config.consistencyTargets.targetStreak) * 100, 100);

  const consistencyScore = Math.round(
    0.40 * weeklyScore +
    0.30 * monthlyScore +
    0.30 * streakScore
  );

  // ==========================================
  // Step 8: Historical Growth
  // ==========================================
  let lcGrowth = 0;
  let solvedGrowth = 0;

  if (sortedHistory.length >= 2) {
    const firstVal = sortedHistory[0].lcRating || 0;
    const lastVal = sortedHistory[sortedHistory.length - 1].lcRating || 0;
    lcGrowth = Math.max(0, lastVal - firstVal);

    const firstSolved = sortedHistory[0].lcSolved || 0;
    const lastSolved = sortedHistory[sortedHistory.length - 1].lcSolved || 0;
    solvedGrowth = Math.max(0, lastSolved - firstSolved);
  }

  const ratingImprovementScore = Math.min(((cfGrowth + lcGrowth) / config.growthTargets.targetRatingImprovement) * 100, 100);

  // Solved growth fallback estimation
  const finalSolvedGrowth = solvedGrowth > 0 ? solvedGrowth : activeDates.size * 2.5;
  const problemSolvingGrowthScore = Math.min((finalSolvedGrowth / config.growthTargets.targetSolvedImprovement) * 100, 100);

  const growthScore = Math.round(
    0.50 * ratingImprovementScore +
    0.50 * problemSolvingGrowthScore
  );

  // ==========================================
  // Step 9: Contest Performance
  // ==========================================
  const lcContestRatingScore = Math.min((lcRating / config.contestTargets.targetLcRating) * 100, 100);
  const lcContestCountScore = Math.min((lcContests / config.contestTargets.targetLcContestsCount) * 100, 100);
  const lcContestScore = 0.70 * lcContestRatingScore + 0.30 * lcContestCountScore;

  const cfContestScore = Math.min((cfRating / config.contestTargets.targetCfRating) * 100, 100);

  let contestPerformance = 0;
  if (user.leetcodeUsername && user.codeforcesUsername) {
    contestPerformance = Math.round(0.50 * cfContestScore + 0.50 * lcContestScore);
  } else if (user.leetcodeUsername) {
    contestPerformance = Math.round(lcContestScore);
  } else if (user.codeforcesUsername) {
    contestPerformance = Math.round(cfContestScore);
  }

  // ==========================================
  // Step 10: Final Interview Readiness Score
  // ==========================================
  const rawReadiness =
    config.weights.topicMastery * avgTopicMastery +
    config.weights.problemDifficultyCoverage * problemDifficultyScore +
    config.weights.codeforcesScore * codeforcesScore +
    config.weights.consistency * consistencyScore +
    config.weights.historicalGrowth * growthScore +
    config.weights.contestPerformance * contestPerformance;

  const score = Math.min(100, Math.max(0, Math.round(rawReadiness)));

  // Determine readiness level
  let level = "Beginner";
  for (const lvl of config.levels) {
    if (score >= lvl.min) {
      level = lvl.label;
      break;
    }
  }

  // ==========================================
  // AI Explanation & Recommendations Generation
  // ==========================================
  // Sort topic mastery to find best and worst
  const sortedTopics = Object.entries(topicMastery).sort((a, b) => b[1] - a[1]);
  const strongestTopics = sortedTopics.slice(0, 3).map(t => t[0]);
  const weakestTopics = sortedTopics.slice(-3).map(t => t[0]);

  // Compile recommendations
  const recommendations = [];

  // Recommend solving specific weakest concepts
  weakestTopics.forEach(topic => {
    const wt = config.topicWeights[topic] || 5;
    if (wt >= 8) {
      recommendations.push(`Practice Hard ${topic} problems to bolster advanced concepts`);
    } else {
      recommendations.push(`Solve 15+ ${topic} problems to establish strong fundamentals`);
    }
  });

  // Additional recommendations to form top 5
  if (hardCoverage < 40) {
    recommendations.push("Solve more Hard problems on LeetCode to build problem-solving muscle.");
  }
  if (lcContests < 15) {
    recommendations.push("Participate in LeetCode weekly contests consistently.");
  }
  if (consistencyScore < 50) {
    recommendations.push("Maintain a consistent coding schedule and update stats frequently.");
  }
  if (cfRating < 1600 && user.codeforcesUsername) {
    recommendations.push("Increase Codeforces rating to 1600+ (Specialist level) by joining Div. 2/Div. 3 contests.");
  }

  while (recommendations.length < 5) {
    recommendations.push("Keep practicing algorithms and data structures on LeetCode.");
  }
  const topRecommendations = recommendations.slice(0, 5);

  // Generate explanation
  const explanation = `Your strongest concepts are ${strongestTopics.join(", ")}. However, ${weakestTopics.join(" and ")} still need more dedicated practice to solidify your fundamentals. ` +
    `Your competitive programming rating indicates a ${cfRating > 1650 ? "high level of" : "developing"} problem-solving agility on Codeforces. ` +
    `${consistencyScore > 65 ? "Your learning consistency is solid." : "Strengthening your daily consistency will build stronger coding muscle."} ` +
    `Focusing heavily on ${weakestTopics[0]} and solving more Medium/Hard questions will push you closer to elite tier readiness.`;

  // ==========================================
  // Chart Data Structure Generation
  // ==========================================
  // Radar data (Topic Mastery for top 6 topics)
  const radarLabels = sortedTopics.slice(0, 6).map(t => t[0]);
  const radarData = sortedTopics.slice(0, 6).map(t => t[1]);
  const radarChart = {
    labels: radarLabels,
    datasets: [{
      label: "Concept Mastery %",
      data: radarData,
      backgroundColor: "rgba(56, 189, 248, 0.2)",
      borderColor: "#38bdf8",
      pointBackgroundColor: "#38bdf8"
    }]
  };

  // Bar data (Topic Scores)
  const barLabels = sortedTopics.slice(0, 7).map(t => t[0]);
  const barDataVal = sortedTopics.slice(0, 7).map(t => topicScores[t[0]]);
  const barChart = {
    labels: barLabels,
    datasets: [{
      label: "Topic Weight Contributions",
      data: barDataVal,
      backgroundColor: "#3b82f6"
    }]
  };

  // Pie data (Problems by Topic)
  const pieLabels = sortedTopics.slice(0, 5).map(t => t[0]);
  const pieDataVal = sortedTopics.slice(0, 5).map(t => {
    const counts = topicSolvedCounts[t[0]];
    return counts.Easy + counts.Medium + counts.Hard;
  });
  const pieChart = {
    labels: pieLabels,
    datasets: [{
      data: pieDataVal,
      backgroundColor: ["#38bdf8", "#3b82f6", "#60a5fa", "#93c5fd", "#c084fc"]
    }]
  };

  // Line data (Readiness score history)
  const lineLabels = [];
  const lineDataPoints = [];

  if (sortedHistory.length > 0 && !fetchedData.bypassHistory) {
    sortedHistory.forEach((pt, idx) => {
      // Simulate historical readiness score calculation
      const histUser = {
        cfRating: pt.cfRating || 0,
        cfMaxRating: pt.cfRating || 0,
        lcRating: pt.lcRating || 0,
        lcSolved: pt.lcSolved || Math.round(lcSolved * ((idx + 1) / sortedHistory.length)),
        lcEasy: Math.round(lcEasy * ((idx + 1) / sortedHistory.length)),
        lcMedium: Math.round(lcMedium * ((idx + 1) / sortedHistory.length)),
        lcHard: Math.round(lcHard * ((idx + 1) / sortedHistory.length)),
        lcContests: Math.round(lcContests * ((idx + 1) / sortedHistory.length))
      };

      const ratio = (idx + 1) / sortedHistory.length;
      const histResult = calculateInterviewReadiness(histUser, sortedHistory.slice(0, idx + 1), {
        bypassHistory: true,
        leetcodeCalendar: {},
        leetcodeSolvedProblems: leetcodeSolvedProblems.slice(0, Math.round(leetcodeSolvedProblems.length * ratio)),
        leetcodeContests: {},
        codeforcesSolvedProblems: codeforcesSolvedProblems.slice(0, Math.round(codeforcesSolvedProblems.length * ratio)),
        codeforcesContests: []
      });
      lineLabels.push(new Date(pt.timestamp).toLocaleDateString());
      lineDataPoints.push(histResult.score);
    });
  } else {
    lineLabels.push(new Date().toLocaleDateString());
    lineDataPoints.push(score);
  }

  const lineChart = {
    labels: lineLabels,
    datasets: [{
      label: "Readiness Score Over Time",
      data: lineDataPoints,
      borderColor: "#10b981",
      fill: false,
      tension: 0.1
    }]
  };

  // Heatmap activity grid (past 30 days)
  const heatmapData = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * oneDay);
    const dateString = d.toDateString();
    heatmapData.push({
      date: d.toLocaleDateString(),
      count: activeDates.has(dateString) ? 1 : 0
    });
  }

  // CF vs LC comparisons
  const cfVsLcChart = {
    platforms: ["Codeforces", "LeetCode"],
    ratings: [cfRating, lcRating],
    contests: [cfContestCount, lcContests]
  };

  return {
    score,
    level,
    components: {
      topicMastery: avgTopicMastery,
      problemDifficulty: problemDifficultyScore,
      codeforces: codeforcesScore,
      consistency: consistencyScore,
      growth: growthScore,
      contestPerformance: contestPerformance
    },
    topicMastery: Object.fromEntries(sortedTopics.slice(0, 5)), // return top 5
    topicsDetail: topics.map(topic => {
      const counts = topicSolvedCounts[topic];
      const mastery = topicMastery[topic];
      const score = topicScores[topic];
      return {
        topic,
        easy: counts.Easy,
        medium: counts.Medium,
        hard: counts.Hard,
        total: counts.Easy + counts.Medium + counts.Hard,
        mastery,
        score
      };
    }),
    recommendations: topRecommendations,
    explanation,
    charts: {
      radar: radarChart,
      bar: barChart,
      pie: pieChart,
      line: lineChart,
      heatmap: heatmapData,
      cfVsLc: cfVsLcChart
    }
  };
}

module.exports = calculateInterviewReadiness;

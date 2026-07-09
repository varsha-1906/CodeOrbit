module.exports = {
  // Step 2: Topic Difficulty Weights
  topicWeights: {
    "Arrays": 2,
    "Strings": 3,
    "Hash Map": 3,
    "Two Pointers": 3,
    "Binary Search": 5,
    "Stack": 4,
    "Queue": 4,
    "Heap": 6,
    "Linked List": 4,
    "Trees": 8,
    "BST": 8,
    "Graphs": 10,
    "BFS": 9,
    "DFS": 9,
    "Dynamic Programming": 10,
    "Backtracking": 8,
    "Greedy": 6,
    "Trie": 7,
    "Union Find": 8,
    "Segment Tree": 10,
    "Fenwick Tree": 10,
    "Bitmask": 9,
    "Geometry": 9,
    "Network Flow": 10
  },

  // Problem Difficulty Weights (Step 3)
  difficultyWeights: {
    "Easy": 1,
    "Medium": 2,
    "Hard": 3
  },

  // Expected Maximum Scores (Step 4 normalization targets)
  // Represents full mastery scores for calculations
  expectedMaxTopicScores: {
    "Arrays": 120,
    "Strings": 90,
    "Hash Map": 90,
    "Two Pointers": 90,
    "Binary Search": 100,
    "Stack": 80,
    "Queue": 80,
    "Heap": 90,
    "Linked List": 80,
    "Trees": 160,
    "BST": 160,
    "Graphs": 200,
    "BFS": 180,
    "DFS": 180,
    "Dynamic Programming": 250,
    "Backtracking": 160,
    "Greedy": 120,
    "Trie": 105,
    "Union Find": 120,
    "Segment Tree": 150,
    "Fenwick Tree": 150,
    "Bitmask": 135,
    "Geometry": 135,
    "Network Flow": 150
  },

  // Problem Difficulty Coverage Target Counts (Step 5)
  difficultyTargets: {
    "Easy": 200,
    "Medium": 300,
    "Hard": 100
  },

  // Codeforces score settings (Step 6)
  codeforcesTargets: {
    targetRating: 2000,
    targetMaxRating: 2200,
    targetContests: 40,
    targetGrowth: 300
  },

  // Consistency settings (Step 7)
  consistencyTargets: {
    targetWeeklyDays: 5,
    targetMonthlyDays: 15,
    targetStreak: 15
  },

  // Historical Growth targets (Step 8)
  growthTargets: {
    targetRatingImprovement: 300,
    targetSolvedImprovement: 200
  },

  // Contest performance targets (Step 9)
  contestTargets: {
    targetLcRating: 2200,
    targetLcContestsCount: 30,
    targetCfRating: 2000
  },

  // Final weights (Step 10)
  weights: {
    topicMastery: 0.35,
    problemDifficultyCoverage: 0.15,
    codeforcesScore: 0.20,
    consistency: 0.10,
    historicalGrowth: 0.10,
    contestPerformance: 0.10
  },

  // Readiness Levels
  levels: [
    { min: 96, label: "Elite Candidate" },
    { min: 86, label: "Strong Candidate" },
    { min: 71, label: "Interview Ready" },
    { min: 51, label: "Developing" },
    { min: 31, label: "Learning" },
    { min: 0, label: "Beginner" }
  ]
};

export const modeConfigs = {
    campaign: {
        key: "campaign",
        kicker: "Banana Run Mode",
        title: "10 levels. One life. No skips.",
        description: "Start at level 1 and survive the full sequence. Every stage gets faster, harsher, and more competitive.",
        rewardMultiplier: 1,
        pointsPerAnswer: 5,
        levels: [
            { level: 1, time: 120, requiredScore: 20, maxWrong: 5 },
            { level: 2, time: 100, requiredScore: 35, maxWrong: 4 },
            { level: 3, time: 85, requiredScore: 50, maxWrong: 4 },
            { level: 4, time: 80, requiredScore: 70, maxWrong: 3 },
            { level: 5, time: 70, requiredScore: 90, maxWrong: 3 },
            { level: 6, time: 60, requiredScore: 120, maxWrong: 3 },
            { level: 7, time: 50, requiredScore: 150, maxWrong: 2 },
            { level: 8, time: 40, requiredScore: 180, maxWrong: 2 },
            { level: 9, time: 30, requiredScore: 220, maxWrong: 2 },
            { level: 10, time: 20, requiredScore: 300, maxWrong: 1 }
        ]
    },
    practice: {
        key: "practice",
        kicker: "Practice Mode",
        title: "Relaxed pacing. Build streaks and learn the flow.",
        description: "A softer run for warming up. Longer timers, more mistakes allowed, and easier score targets.",
        rewardMultiplier: 0.75,
        pointsPerAnswer: 4,
        levels: [
            { level: 1, time: 140, requiredScore: 16, maxWrong: 8 },
            { level: 2, time: 130, requiredScore: 30, maxWrong: 7 },
            { level: 3, time: 115, requiredScore: 45, maxWrong: 6 },
            { level: 4, time: 95, requiredScore: 60, maxWrong: 5 },
            { level: 5, time: 80, requiredScore: 80, maxWrong: 4 }
        ]
    },
    sprint: {
        key: "sprint",
        kicker: "Sprint Mode",
        title: "Short clock. Fast scoring. No wasted moves.",
        description: "Push for fast points under pressure. Great for leaderboard hunting and daily mission bursts.",
        rewardMultiplier: 1.4,
        pointsPerAnswer: 7,
        levels: [
            { level: 1, time: 50, requiredScore: 28, maxWrong: 4 },
            { level: 2, time: 45, requiredScore: 49, maxWrong: 3 },
            { level: 3, time: 40, requiredScore: 70, maxWrong: 3 },
            { level: 4, time: 35, requiredScore: 98, maxWrong: 2 },
            { level: 5, time: 30, requiredScore: 126, maxWrong: 2 }
        ]
    },
    one_life: {
        key: "one_life",
        kicker: "One Life Mode",
        title: "Single mistake pressure from the first level.",
        description: "High-risk, high-reward. Every correct answer matters because every level gives you just one mistake.",
        rewardMultiplier: 1.8,
        pointsPerAnswer: 8,
        levels: [
            { level: 1, time: 90, requiredScore: 24, maxWrong: 1 },
            { level: 2, time: 80, requiredScore: 48, maxWrong: 1 },
            { level: 3, time: 70, requiredScore: 72, maxWrong: 1 },
            { level: 4, time: 60, requiredScore: 96, maxWrong: 1 },
            { level: 5, time: 50, requiredScore: 128, maxWrong: 1 },
            { level: 6, time: 40, requiredScore: 160, maxWrong: 1 }
        ]
    }
};

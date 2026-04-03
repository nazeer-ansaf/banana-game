const STORAGE_PREFIX = "bananaGameProgress";
const XP_PER_RANK = 250;

const achievementDefinitions = [
    {
        key: "first_run",
        name: "First Steps",
        description: "Complete your first run in any mode.",
        metric: state => state.totalRuns,
        goal: 1,
        xp: 40,
        coins: 20
    },
    {
        key: "first_win",
        name: "Garden Winner",
        description: "Win your first full run.",
        metric: state => state.wins,
        goal: 1,
        xp: 80,
        coins: 50
    },
    {
        key: "score_200",
        name: "Score Chaser",
        description: "Reach a run score of 200 or higher.",
        metric: state => state.bestScore,
        goal: 200,
        xp: 120,
        coins: 70
    },
    {
        key: "streak_10",
        name: "Combo Crafter",
        description: "Build a 10-answer streak.",
        metric: state => state.longestStreak,
        goal: 10,
        xp: 100,
        coins: 60
    },
    {
        key: "level_10",
        name: "Peak Banana",
        description: "Reach level 10 in any run.",
        metric: state => state.bestLevel,
        goal: 10,
        xp: 140,
        coins: 90
    },
    {
        key: "wins_5",
        name: "Champion Habit",
        description: "Win 5 runs.",
        metric: state => state.wins,
        goal: 5,
        xp: 180,
        coins: 120
    }
];

const missionDefinitions = [
    {
        key: "daily_correct",
        name: "Warm-Up",
        description: "Answer 5 puzzles correctly today.",
        goal: 5,
        rewardXp: 50,
        rewardCoins: 30,
        progress: run => run.correctAnswers
    },
    {
        key: "daily_score",
        name: "Score Rush",
        description: "Earn 120 score across runs today.",
        goal: 120,
        rewardXp: 70,
        rewardCoins: 45,
        progress: run => run.score
    },
    {
        key: "daily_win",
        name: "Closer",
        description: "Win one run today.",
        goal: 1,
        rewardXp: 100,
        rewardCoins: 60,
        progress: run => (run.result === "won" ? 1 : 0)
    }
];

function buildStorageKey(userId) {
    return `${STORAGE_PREFIX}:${userId}`;
}

function getTodayKey() {
    return new Date().toISOString().slice(0, 10);
}

function createEmptyDailyState() {
    return {
        date: getTodayKey(),
        missions: missionDefinitions.reduce((accumulator, mission) => {
            accumulator[mission.key] = {
                progress: 0,
                claimed: false
            };
            return accumulator;
        }, {})
    };
}

function createDefaultState(user) {
    return {
        userId: user?.id ?? null,
        username: user?.username ?? "Player",
        xp: 0,
        coins: 0,
        totalRuns: 0,
        wins: 0,
        bestScore: 0,
        bestLevel: 0,
        totalCorrect: 0,
        totalWrong: 0,
        longestStreak: 0,
        lastMode: "campaign",
        achievements: {},
        recentRuns: [],
        daily: createEmptyDailyState()
    };
}

function ensureDailyState(state) {
    if (!state.daily || state.daily.date !== getTodayKey()) {
        state.daily = createEmptyDailyState();
    }

    missionDefinitions.forEach(mission => {
        if (!state.daily.missions[mission.key]) {
            state.daily.missions[mission.key] = {
                progress: 0,
                claimed: false
            };
        }
    });

    return state;
}

function persistState(state) {
    if (!state.userId) {
        return;
    }

    localStorage.setItem(buildStorageKey(state.userId), JSON.stringify(state));
}

async function fetchRemoteProfile(userId) {
    const response = await fetch(`player_data.php?user_id=${encodeURIComponent(userId)}`);
    if (!response.ok) {
        throw new Error("Profile request failed");
    }

    const data = await response.json();
    if (data.status !== "success") {
        throw new Error(data.message || "Profile request failed");
    }

    return data;
}

function mergeState(localState, remoteData, user) {
    const merged = createDefaultState(user);
    const remoteProfile = remoteData?.profile ?? {};
    const remoteAchievementMap = {};

    (remoteData?.achievements ?? []).forEach(entry => {
        if (entry?.key) {
            remoteAchievementMap[entry.key] = entry.unlocked_at || true;
        }
    });

    merged.xp = Math.max(localState.xp || 0, remoteProfile.xp || 0);
    merged.coins = Math.max(localState.coins || 0, remoteProfile.coins || 0);
    merged.totalRuns = Math.max(localState.totalRuns || 0, remoteProfile.total_runs || 0);
    merged.wins = Math.max(localState.wins || 0, remoteProfile.wins || 0);
    merged.bestScore = Math.max(localState.bestScore || 0, remoteProfile.best_score || 0);
    merged.bestLevel = Math.max(localState.bestLevel || 0, remoteProfile.best_level || 0);
    merged.totalCorrect = Math.max(localState.totalCorrect || 0, remoteProfile.total_correct || 0);
    merged.totalWrong = Math.max(localState.totalWrong || 0, remoteProfile.total_wrong || 0);
    merged.longestStreak = Math.max(localState.longestStreak || 0, remoteProfile.longest_streak || 0);
    merged.lastMode = remoteProfile.last_mode || localState.lastMode || "campaign";
    merged.achievements = {
        ...(localState.achievements || {}),
        ...remoteAchievementMap
    };
    merged.recentRuns = Array.isArray(remoteData?.recent_runs) ? remoteData.recent_runs : localState.recentRuns || [];
    merged.daily = localState.daily || createEmptyDailyState();

    return ensureDailyState(merged);
}

function getRankInfo(xp) {
    const rank = Math.floor(xp / XP_PER_RANK) + 1;
    const current = xp % XP_PER_RANK;
    const next = XP_PER_RANK;
    return { rank, current, next };
}

function getAchievementDefinition(key) {
    return achievementDefinitions.find(achievement => achievement.key === key);
}

function updateMissionProgress(state, runSummary) {
    const completedMissions = [];

    missionDefinitions.forEach(mission => {
        const missionState = state.daily.missions[mission.key];
        if (!missionState) {
            return;
        }

        missionState.progress = Math.min(
            mission.goal,
            missionState.progress + mission.progress(runSummary)
        );

        if (missionState.progress >= mission.goal && !missionState.claimed) {
            missionState.claimed = true;
            state.xp += mission.rewardXp;
            state.coins += mission.rewardCoins;
            completedMissions.push(mission);
        }
    });

    return completedMissions;
}

function unlockAchievements(state) {
    const newlyUnlocked = [];

    achievementDefinitions.forEach(achievement => {
        if (state.achievements[achievement.key]) {
            return;
        }

        if (achievement.metric(state) >= achievement.goal) {
            state.achievements[achievement.key] = new Date().toISOString();
            state.xp += achievement.xp;
            state.coins += achievement.coins;
            newlyUnlocked.push(achievement);
        }
    });

    return newlyUnlocked;
}

export async function loadPlayerProgress(user) {
    if (!user?.id) {
        return createDefaultState(user);
    }

    const localStateRaw = localStorage.getItem(buildStorageKey(user.id));
    const localState = localStateRaw ? JSON.parse(localStateRaw) : createDefaultState(user);

    try {
        const remoteData = await fetchRemoteProfile(user.id);
        const mergedState = mergeState(localState, remoteData, user);
        persistState(mergedState);
        return mergedState;
    } catch (error) {
        console.warn("Falling back to local player progress", error);
        const safeState = ensureDailyState({
            ...createDefaultState(user),
            ...localState,
            userId: user.id,
            username: user.username
        });
        persistState(safeState);
        return safeState;
    }
}

export function applyRunProgress(state, runSummary) {
    ensureDailyState(state);

    const rewardMultiplier = runSummary.rewardMultiplier || 1;
    const baseXp = runSummary.result === "won" ? 100 : runSummary.result === "stopped" ? 45 : 30;
    const runXpGain = Math.round(
        (baseXp + runSummary.highestLevel * 18 + runSummary.correctAnswers * 5) * rewardMultiplier
    );
    const runCoinsGain = Math.round(
        (12 + Math.floor(runSummary.score / 8) + runSummary.highestLevel * 3) * rewardMultiplier
    );

    state.xp += runXpGain;
    state.coins += runCoinsGain;
    state.totalRuns += 1;
    state.wins += runSummary.result === "won" ? 1 : 0;
    state.bestScore = Math.max(state.bestScore, runSummary.score);
    state.bestLevel = Math.max(state.bestLevel, runSummary.highestLevel);
    state.totalCorrect += runSummary.correctAnswers;
    state.totalWrong += runSummary.totalWrong;
    state.longestStreak = Math.max(state.longestStreak, runSummary.longestStreak);
    state.lastMode = runSummary.mode;
    state.recentRuns = [
        {
            mode: runSummary.mode,
            score: runSummary.score,
            highest_level: runSummary.highestLevel,
            total_correct: runSummary.correctAnswers,
            total_wrong: runSummary.totalWrong,
            longest_streak: runSummary.longestStreak,
            result: runSummary.result,
            created_at: new Date().toISOString()
        },
        ...(state.recentRuns || [])
    ].slice(0, 5);

    const completedMissions = updateMissionProgress(state, runSummary);
    const unlockedAchievements = unlockAchievements(state);
    const missionXpGain = completedMissions.reduce((total, mission) => total + mission.rewardXp, 0);
    const missionCoinsGain = completedMissions.reduce((total, mission) => total + mission.rewardCoins, 0);
    const achievementXpGain = unlockedAchievements.reduce((total, achievement) => total + achievement.xp, 0);
    const achievementCoinsGain = unlockedAchievements.reduce((total, achievement) => total + achievement.coins, 0);

    persistState(state);

    return {
        xpGain: runXpGain + missionXpGain + achievementXpGain,
        coinsGain: runCoinsGain + missionCoinsGain + achievementCoinsGain,
        completedMissions,
        unlockedAchievements,
        unlockedAchievementKeys: unlockedAchievements.map(achievement => achievement.key)
    };
}

export function renderPlayerHub(state) {
    const rankInfo = getRankInfo(state.xp);
    const winRate = state.totalRuns > 0
        ? `${Math.round((state.wins / state.totalRuns) * 100)}%`
        : "0%";
    const achievementCount = Object.keys(state.achievements || {}).length;

    setText("profile-rank", `Rank ${rankInfo.rank}`);
    setText("profile-xp", `${state.xp} XP`);
    setText("profile-coin-count", String(state.coins));
    setText("profile-best-score", String(state.bestScore));
    setText("profile-best-level", String(state.bestLevel));
    setText("profile-run-count", String(state.totalRuns));
    setText("profile-win-rate", winRate);
    setText("profile-streak", String(state.longestStreak));
    setText("profile-last-mode", formatModeLabel(state.lastMode));
    setText("achievement-total", `${achievementCount} unlocked`);
    setText("xp-progress-label", `${rankInfo.current} / ${rankInfo.next} to next rank`);

    const xpProgress = document.getElementById("xp-progress-fill");
    if (xpProgress) {
        xpProgress.style.width = `${(rankInfo.current / rankInfo.next) * 100}%`;
    }

    renderMissionList(state);
    renderAchievementList(state);
    renderRecentRuns(state);
}

function renderMissionList(state) {
    const missionList = document.getElementById("daily-missions-list");
    if (!missionList) {
        return;
    }

    missionList.innerHTML = "";

    missionDefinitions.forEach(mission => {
        const missionState = state.daily.missions[mission.key];
        const item = document.createElement("li");
        item.className = `mission-item${missionState.claimed ? " completed" : ""}`;

        const progressPercent = Math.min((missionState.progress / mission.goal) * 100, 100);
        item.innerHTML = `
            <div class="mission-copy">
                <strong>${mission.name}</strong>
                <span>${mission.description}</span>
            </div>
            <div class="mission-meta">
                <small>${missionState.progress} / ${mission.goal}</small>
                <small>+${mission.rewardXp} XP, +${mission.rewardCoins} coins</small>
            </div>
            <div class="mission-progress">
                <span style="width: ${progressPercent}%"></span>
            </div>
        `;

        missionList.appendChild(item);
    });
}

function renderAchievementList(state) {
    const achievementList = document.getElementById("achievement-list");
    if (!achievementList) {
        return;
    }

    achievementList.innerHTML = "";

    achievementDefinitions.forEach(achievement => {
        const unlocked = Boolean(state.achievements[achievement.key]);
        const item = document.createElement("article");
        item.className = `achievement-card${unlocked ? " unlocked" : ""}`;
        item.innerHTML = `
            <strong>${achievement.name}</strong>
            <span>${achievement.description}</span>
        `;
        achievementList.appendChild(item);
    });
}

function renderRecentRuns(state) {
    const recentRunsList = document.getElementById("recent-runs-list");
    if (!recentRunsList) {
        return;
    }

    recentRunsList.innerHTML = "";

    if (!state.recentRuns?.length) {
        recentRunsList.innerHTML = `<li class="recent-run-empty">No runs yet. Start a mode to build your history.</li>`;
        return;
    }

    state.recentRuns.forEach(run => {
        const item = document.createElement("li");
        item.className = "recent-run-item";
        item.innerHTML = `
            <span>${formatModeLabel(run.mode)}</span>
            <strong>${run.score} score</strong>
            <small>${run.result} at level ${run.highest_level}</small>
        `;
        recentRunsList.appendChild(item);
    });
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

export function buildProgressSummary(summary) {
    const parts = [
        `+${summary.xpGain} XP`,
        `+${summary.coinsGain} coins`
    ];

    if (summary.completedMissions.length > 0) {
        parts.push(`${summary.completedMissions.length} mission cleared`);
    }

    if (summary.unlockedAchievements.length > 0) {
        parts.push(`${summary.unlockedAchievements.length} achievement unlocked`);
    }

    return parts.join(" | ");
}

export function formatModeLabel(mode) {
    const labels = {
        campaign: "Campaign",
        practice: "Practice",
        sprint: "Sprint",
        one_life: "One Life"
    };

    return labels[mode] || "Campaign";
}

export function getAchievementPayload(state) {
    return Object.keys(state.achievements || {});
}

export function describeAchievements(keys) {
    return keys
        .map(key => getAchievementDefinition(key)?.name)
        .filter(Boolean)
        .join(", ");
}

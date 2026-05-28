const Storage = (() => {
  const KEY = 'verbGame_state';
  const SETTINGS_KEY = 'verbGame_settings';

  const defaults = {
    verbIndex: 0,
    verbsSeen: [],
    verbsMastered: [],
    wrongAnswers: [],
    challengesDone: 0,
    streakDays: 0,
    lastPlayDate: null,
  };

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? { ...defaults, ...JSON.parse(raw) } : { ...defaults };
    } catch {
      return { ...defaults };
    }
  }

  function save(state) {
    localStorage.setItem(KEY, JSON.stringify(state));
  }

  function reset() {
    localStorage.removeItem(KEY);
  }

  function loadSettings() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      return raw ? JSON.parse(raw) : { giphyKey: '', darkMode: true };
    } catch {
      return { giphyKey: '', darkMode: true };
    }
  }

  function saveSettings(s) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  }

  function updateStreak(state) {
    const today = new Date().toDateString();
    if (state.lastPlayDate === today) return state;
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    state.streakDays = state.lastPlayDate === yesterday ? (state.streakDays || 0) + 1 : 1;
    state.lastPlayDate = today;
    return state;
  }

  return { load, save, reset, loadSettings, saveSettings, updateStreak };
})();

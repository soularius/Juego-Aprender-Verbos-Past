const Giphy = (() => {
  // v2 cache key — breaks old single-URL entries forcing fresh fetches
  const CACHE_KEY = k => `gif2_${k}`;
  const CACHE_TTL = 7 * 24 * 60 * 60 * 1000;

  // Per-verb sequential index (in-memory, never repeats until full cycle)
  const _idx = {};

  const VERB_EMOJIS = {
    be:'🧍', become:'🦋', begin:'🚀', break:'💥', bring:'🎁',
    build:'🏗️', buy:'🛒', can:'💪', catch:'🤲', choose:'🎯',
    come:'🚶', cost:'💰', cut:'✂️', do:'✅', draw:'🎨',
    drink:'🥤', drive:'🚗', eat:'🍽️', fall:'🍂', feel:'❤️',
    find:'🔍', fly:'✈️', forget:'😶‍🌫️', get:'📦', give:'🤝',
    go:'🏃', grow:'🌱', have:'🤗', hear:'👂', hit:'🥊',
    keep:'🔒', know:'🧠', leave:'🚪', lend:'🤲', lie:'😴',
    lose:'😰', make:'🔨', mean:'💬', meet:'🤝', pay:'💳',
    put:'📌', read:'📖', ride:'🚴', ring:'📞', run:'🏃',
    say:'💬', see:'👀', sell:'🏷️', send:'📧', show:'🎬',
    sing:'🎵', sit:'🪑', sleep:'😴', speak:'🗣️', spend:'💸',
    stand:'🧍', swim:'🏊', take:'🤚', teach:'👩‍🏫', tell:'📢',
    think:'🤔', throw:'🥏', understand:'💡', wake:'⏰',
    wear:'👗', win:'🏆', write:'✍️',
    colors_past:'🎨', adjectives_past:'✨', uncertainty:'🤔', some_any:'🍽️',
    celebrate:'🎉', oops:'😬',
  };

  async function getGif(verbKey) {
    const cacheKey = CACHE_KEY(verbKey);
    let urls = null;

    try {
      const raw = localStorage.getItem(cacheKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Only use new format (array); ignore any old single-url entries
        if (parsed.urls && parsed.urls.length > 0 && Date.now() < parsed.expires) {
          urls = parsed.urls;
        }
      }
    } catch { /* ignore */ }

    if (!urls) {
      const settings = Storage.loadSettings();
      const apiKey = settings.giphyKey || 'HfTleooj70xS5MgVIseVSBfMkQjFoDdt';
      try {
        const res = await fetch(
          `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(verbKey)}&limit=10&rating=g&lang=en`
        );
        if (!res.ok) return null;
        const data = await res.json();
        const gifs = data.data || [];
        if (gifs.length === 0) return null;

        urls = gifs
          .map(g => g?.images?.fixed_height?.url || g?.images?.original?.url)
          .filter(Boolean)
          .slice(0, 10);

        if (urls.length === 0) return null;
        localStorage.setItem(cacheKey, JSON.stringify({ urls, expires: Date.now() + CACHE_TTL }));
      } catch {
        return null;
      }
    }

    // Sequential — guarantees a different URL every call until the array wraps
    const i = (_idx[verbKey] ?? 0) % urls.length;
    _idx[verbKey] = i + 1;
    return urls[i];
  }

  // Dedicated celebration GIF for correct-answer feedback
  function getCelebrationGif() {
    return getGif('celebrate');
  }

  // Dedicated oops GIF for wrong-answer feedback
  function getWrongGif() {
    return getGif('oops');
  }

  // Reset the sequential counter for a verb (call when starting a new verb)
  function resetIndex(verbKey) {
    delete _idx[verbKey];
  }

  function getEmoji(verbKey) {
    return VERB_EMOJIS[verbKey] || '📝';
  }

  function clearCache() {
    Object.keys(localStorage)
      .filter(k => k.startsWith('gif_') || k.startsWith('gif2_'))
      .forEach(k => localStorage.removeItem(k));
    Object.keys(_idx).forEach(k => delete _idx[k]);
  }

  return { getGif, getCelebrationGif, getWrongGif, resetIndex, getEmoji, clearCache };
})();

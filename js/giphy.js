const Giphy = (() => {
  const CACHE_TTL = 7 * 24 * 60 * 60 * 1000;

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
  };

  async function getGif(verbKey) {
    const cacheKey = `gif_${verbKey}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { url, expires } = JSON.parse(cached);
        if (Date.now() < expires) return url;
      }
    } catch { /* ignore */ }

    const settings = Storage.loadSettings();
    const apiKey = settings.giphyKey || 'HfTleooj70xS5MgVIseVSBfMkQjFoDdt';

    try {
      const url = `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(verbKey)}&limit=8&rating=g&lang=en`;
      const res = await fetch(url);
      if (!res.ok) return null;
      const data = await res.json();
      const gifs = data.data;
      if (!gifs || gifs.length === 0) return null;
      const pick = gifs[Math.floor(Math.random() * Math.min(gifs.length, 5))];
      const gifUrl = pick?.images?.fixed_height?.url || pick?.images?.original?.url || null;
      if (gifUrl) {
        localStorage.setItem(cacheKey, JSON.stringify({ url: gifUrl, expires: Date.now() + CACHE_TTL }));
      }
      return gifUrl;
    } catch {
      return null;
    }
  }

  function getEmoji(verbKey) {
    return VERB_EMOJIS[verbKey] || '📝';
  }

  function clearCache() {
    Object.keys(localStorage)
      .filter(k => k.startsWith('gif_'))
      .forEach(k => localStorage.removeItem(k));
  }

  return { getGif, getEmoji, clearCache };
})();

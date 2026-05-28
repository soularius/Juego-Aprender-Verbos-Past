/* ===== MAIN APP ===== */
(async () => {
  // --- Data ---
  const [verbos, questionsData] = await Promise.all([
    fetch('data/verbos.json').then(r => r.json()),
    fetch('data/questions.json').then(r => r.json()),
  ]);

  const questionsMap = {};
  questionsData.forEach(entry => { questionsMap[entry.key] = entry.questions; });

  // --- State ---
  let state = Storage.load();
  let settings = Storage.loadSettings();
  let currentVerb = null;
  let currentQuestions = [];
  let currentQIdx = 0;
  let currentQuizCorrect = 0;
  let quizWrong = [];
  let challengeTimer = null;
  let challengeSeconds = 60;
  let challengeScore = 0;
  let challengeCorrect = 0;
  let challengeWrong = 0;
  let challengeStreak = 0;
  let challengePool = [];
  let challengePoolIdx = 0;
  let pendingChallenge = false;

  const QUESTIONS_PER_VERB = 5;
  const CHALLENGE_EVERY = 5;

  // --- DOM helpers ---
  const $ = id => document.getElementById(id);
  const views = {};
  document.querySelectorAll('.view').forEach(el => {
    views[el.id.replace('view-', '')] = el;
  });

  function showView(name) {
    Object.values(views).forEach(v => v.classList.remove('active'));
    const el = views[name];
    if (el) el.classList.add('active');
  }

  // --- Apply theme ---
  function applyTheme() {
    document.body.classList.toggle('light', !settings.darkMode);
    $('toggle-dark').checked = settings.darkMode;
  }

  // --- Audio ---
  const _audio = new Audio();

  function playAudio(word) {
    _audio.src = `data/audios/${word.trim().toLowerCase()}.mp3`;
    _audio.play().catch(() => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(word);
        u.lang = 'en-US';
        u.rate = 0.85;
        window.speechSynthesis.speak(u);
      }
    });
  }

  function speakVerb(form) {
    const parts = form.split('/').map(p => p.trim()).filter(Boolean);
    playAudio(parts[0]);
    if (parts[1]) setTimeout(() => playAudio(parts[1]), 900);
  }

  // --- HOME view ---
  function renderHome() {
    state = Storage.updateStreak(state);
    Storage.save(state);

    const done = state.verbsMastered.length;
    const total = verbos.length;
    $('ring-done').textContent = done;
    $('ring-total').textContent = total;
    $('streak-count').textContent = state.streakDays;

    const pct = total > 0 ? done / total : 0;
    const circumference = 314;
    $('ring-fill').style.strokeDashoffset = circumference * (1 - pct);

    $('btn-continue').textContent = state.verbIndex > 0 || state.verbsSeen.length > 0
      ? `Continuar — ${verbos[state.verbIndex]?.base_form || ''}`
      : 'Empezar';
  }

  // --- VERB LIST view ---
  function renderVerbList() {
    const grid = $('verb-list-grid');
    grid.innerHTML = '';
    verbos.forEach((v, i) => {
      const card = document.createElement('div');
      card.className = 'verb-card'
        + (state.verbsMastered.includes(v.key) ? ' done' : '')
        + (i === state.verbIndex ? ' current' : '');
      card.innerHTML = `
        <span class="verb-card-base">${v.base_form}</span>
        ${state.verbsMastered.includes(v.key) ? '<span class="verb-card-check">&#10003;</span>' : ''}
        <div class="verb-card-past">${v.simple_past}</div>
        <div class="verb-card-es">${v.meaning_es}</div>`;
      card.addEventListener('click', () => {
        state.verbIndex = i;
        Storage.save(state);
        startVerb(i);
      });
      grid.appendChild(card);
    });
  }

  // --- SETTINGS view ---
  function openSettings() {
    $('giphy-key-input').value = settings.giphyKey || '';
    $('settings-msg').textContent = '';
    $('settings-msg').className = 'settings-msg';
    showView('settings');
  }

  $('btn-save-settings').addEventListener('click', () => {
    settings.giphyKey = $('giphy-key-input').value.trim();
    Storage.saveSettings(settings);
    const msg = $('settings-msg');
    msg.textContent = '¡Guardado!';
    msg.className = 'settings-msg ok';
    setTimeout(() => { msg.textContent = ''; }, 2000);
  });

  $('btn-test-giphy').addEventListener('click', async () => {
    const key = $('giphy-key-input').value.trim() || settings.giphyKey;
    const msg = $('settings-msg');
    if (!key) { msg.textContent = 'Ingresa una API key primero.'; msg.className = 'settings-msg err'; return; }
    msg.textContent = 'Probando...'; msg.className = 'settings-msg';
    try {
      const res = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${key}&q=run&limit=1&rating=g`);
      const data = await res.json();
      if (data.data && data.data.length > 0) {
        msg.textContent = '✅ Conexión exitosa con Giphy';
        msg.className = 'settings-msg ok';
      } else {
        msg.textContent = '❌ Key inválida o sin resultados';
        msg.className = 'settings-msg err';
      }
    } catch {
      msg.textContent = '❌ Error de conexión';
      msg.className = 'settings-msg err';
    }
  });

  $('toggle-dark').addEventListener('change', () => {
    settings.darkMode = $('toggle-dark').checked;
    Storage.saveSettings(settings);
    applyTheme();
  });

  $('btn-reset-progress').addEventListener('click', () => {
    if (!confirm('¿Segura que quieres borrar todo el progreso?')) return;
    Storage.reset();
    Giphy.clearCache();
    state = Storage.load();
    renderHome();
    showView('home');
  });

  // --- Back buttons ---
  document.querySelectorAll('.back-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const dest = btn.dataset.back;
      if (dest === 'home') { renderHome(); showView('home'); }
    });
  });

  // --- FLASHCARD view ---
  async function startVerb(idx) {
    const verb = verbos[idx];
    if (!verb) { renderHome(); showView('home'); return; }
    currentVerb = verb;
    currentQIdx = 0;
    currentQuizCorrect = 0;
    quizWrong = [];

    // Reset GIF rotation so the first question of this verb starts from a fresh URL
    Giphy.resetIndex(verb.key);

    $('flashcard').classList.remove('flipped');

    $('fc-verb-index').textContent = `${idx + 1} / ${verbos.length}`;
    $('fc-base').textContent = verb.base_form;
    $('fc-meaning').textContent = verb.meaning_es;

    // Build past row: one chip+button per form (handles "was/were", "showed/shown", etc.)
    const pastParts = verb.simple_past.split('/').map(p => p.trim()).filter(Boolean);
    const pastRow = $('fc-past-row');
    pastRow.innerHTML = pastParts.map(p =>
      `<div class="fc-past-part">
         <div class="fc-past-form">${p}</div>
         <button class="speak-btn fc-speak-past" data-word="${p}" aria-label="Escuchar ${p}">🔊</button>
       </div>`
    ).join('');
    pastRow.querySelectorAll('.fc-speak-past').forEach(btn => {
      btn.addEventListener('click', e => { e.stopPropagation(); playAudio(btn.dataset.word); });
    });

    const gr = verb.grammar_rules;
    const grEl = $('fc-grammar-rules');
    if (gr) {
      grEl.innerHTML = `
        <div class="gr-row gr-aff"><span class="gr-label">+</span>${gr.aff}</div>
        <div class="gr-row gr-neg"><span class="gr-label">−</span>${gr.neg}</div>
        <div class="gr-row gr-q"><span class="gr-label">?</span>${gr.q}</div>`;
    } else {
      grEl.innerHTML = '';
    }

    // Wire base form audio button (stopPropagation so it doesn't flip the card)
    $('btn-speak-base').onclick = e => { e.stopPropagation(); playAudio(verb.base_form); };

    setGif('fc-gif', 'fc-gif-placeholder', 'fc-gif-emoji', verb.key);
    showView('flashcard');
  }

  function showFeedbackGif(gifPromise, gifEl) {
    gifEl.hidden = true;
    gifEl.src = '';
    gifPromise.then(url => {
      if (!url) return;
      gifEl.onload  = () => { gifEl.hidden = false; };
      gifEl.onerror = () => {};
      gifEl.src = url;
      if (gifEl.complete && gifEl.naturalWidth > 0) gifEl.hidden = false;
    });
  }

  function setGif(imgId, placeholderId, emojiId, verbKey, emojiOverride) {
    const img = $(imgId);
    const ph = $(placeholderId);
    const em = emojiId ? $(emojiId) : null;
    if (em) em.textContent = emojiOverride || Giphy.getEmoji(verbKey);

    // Reset src first so onload always fires, even if the next URL is the same
    img.hidden = true;
    img.src = '';
    ph.style.display = 'flex';

    Giphy.getGif(verbKey).then(url => {
      if (!url) return;
      img.onload  = () => { img.hidden = false; ph.style.display = 'none'; };
      img.onerror = () => { img.hidden = true;  ph.style.display = 'flex'; };
      img.src = url;
      // If the browser already has it decoded (complete), show immediately
      if (img.complete && img.naturalWidth > 0) {
        img.hidden = false;
        ph.style.display = 'none';
      }
    });
  }

  $('flashcard').addEventListener('click', () => {
    $('flashcard').classList.toggle('flipped');
  });

  $('btn-start-quiz').addEventListener('click', () => startQuiz());

  // --- QUIZ view ---
  function pickQuestions(verbKey) {
    const pool = questionsMap[verbKey] || [];
    const shuffled = [...pool].sort(() => Math.random() - .5);
    return shuffled.slice(0, QUESTIONS_PER_VERB);
  }

  function startQuiz() {
    currentQuestions = pickQuestions(currentVerb.key);
    currentQIdx = 0;
    currentQuizCorrect = 0;
    quizWrong = [];
    showView('quiz');
    renderQuestion();
  }

  const TYPE_CHIP = {
    wh_question:           { label: '? Pregunta',           cls: 'chip-blue'   },
    yes_no_question:       { label: '? Sí / No',            cls: 'chip-blue'   },
    affirmative_statement: { label: '✏ Completa la oración', cls: 'chip-purple' },
    negative_statement:    { label: '✗ Forma negativa',     cls: 'chip-red'    },
    negative_question:     { label: '? Pregunta negativa',  cls: 'chip-orange' },
  };

  const GRAMMAR_TIP = {
    affirmative_statement: '💡 Usa la forma pasada directamente. Recuerda: es un verbo irregular.',
    negative_statement:    '💡 Negativa: <strong>didn\'t + verbo base</strong>. Nunca "didn\'t + pasado".',
    negative_question:     '💡 Pregunta negativa: <strong>Didn\'t + sujeto + verbo base</strong>.',
  };

  function renderQuestion() {
    const q = currentQuestions[currentQIdx];
    const total = currentQuestions.length;

    $('quiz-progress-label').textContent = `${currentQIdx + 1} / ${total}`;
    $('quiz-progress-fill').style.width = `${((currentQIdx) / total) * 100}%`;

    // Fresh GIF for each question
    setGif('quiz-gif', 'quiz-gif-placeholder', 'quiz-gif-emoji', currentVerb.key);

    // Reset correct-answer GIF
    const correctGif = $('quiz-correct-gif');
    correctGif.hidden = true;
    correctGif.src = '';

    // Type chip
    const chipInfo = TYPE_CHIP[q.type];
    const chipEl = $('quiz-type-chip');
    if (chipInfo) {
      chipEl.textContent = chipInfo.label;
      chipEl.className = `quiz-type-chip ${chipInfo.cls}`;
    } else {
      chipEl.className = 'quiz-type-chip hidden';
    }

    // Grammar tip
    const tipEl = $('grammar-tip');
    const tipText = GRAMMAR_TIP[q.type];
    if (tipText) {
      tipEl.innerHTML = tipText;
      tipEl.classList.remove('hidden');
    } else {
      tipEl.classList.add('hidden');
    }

    $('quiz-scaffold').innerHTML = renderScaffold(q.scaffold);
    $('quiz-feedback').classList.add('hidden');

    const opts = $('quiz-options');
    opts.innerHTML = '';
    const shuffledOpts = [...q.options].sort(() => Math.random() - .5);
    shuffledOpts.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.textContent = opt;
      btn.addEventListener('click', () => selectAnswer(btn, opt, q));
      opts.appendChild(btn);
    });
  }

  function renderScaffold(scaffold) {
    return scaffold
      .replace(/\{\{ans_1\}\}/g, '<span class="blank">___</span>')
      .replace(/\{\{ans_2\}\}/g, '<span class="blank">___</span>');
  }

  function selectAnswer(btn, chosen, q) {
    const allBtns = $('quiz-options').querySelectorAll('.option-btn');
    allBtns.forEach(b => b.disabled = true);

    const correct = chosen === q.correct_answer;

    if (correct) {
      btn.classList.add('correct');
      currentQuizCorrect++;
      $('quiz-scaffold').innerHTML = renderAnswered(q.scaffold, q.correct_answer, true);
      showFeedbackGif(Giphy.getCelebrationGif(), $('quiz-correct-gif'));
    } else {
      btn.classList.add('wrong');
      quizWrong.push(q);
      allBtns.forEach(b => {
        if (b.textContent === q.correct_answer) b.classList.add('correct');
      });
      $('quiz-scaffold').innerHTML = renderAnswered(q.scaffold, q.correct_answer, false);
      showFeedbackGif(Giphy.getWrongGif(), $('quiz-correct-gif'));
    }

    const fb = $('quiz-feedback');
    $('quiz-feedback-icon').textContent = correct ? '✅' : '❌';
    $('quiz-feedback-text').textContent = correct ? '¡Correcto!' : 'Incorrecto';
    $('quiz-rationale').textContent = q.rationale;
    fb.classList.remove('hidden');

    btn.classList.add(correct ? 'bounce-in' : 'shake');
  }

  function renderAnswered(scaffold, answer, correct) {
    const parts = answer.split(' / ');
    let result = scaffold;
    parts.forEach((p, i) => {
      const placeholder = `{{ans_${i + 1}}}`;
      const style = correct
        ? 'style="color:var(--success);border-color:var(--success)"'
        : 'style="color:var(--danger);border-color:var(--danger)"';
      result = result.replace(placeholder, `<span class="blank" ${style}>${p}</span>`);
    });
    return result;
  }

  $('btn-next-question').addEventListener('click', () => {
    currentQIdx++;
    if (currentQIdx < currentQuestions.length) {
      renderQuestion();
    } else {
      finishQuiz();
    }
  });

  function finishQuiz() {
    if (!state.verbsSeen.includes(currentVerb.key)) {
      state.verbsSeen.push(currentVerb.key);
    }
    if (currentQuizCorrect >= 3 && !state.verbsMastered.includes(currentVerb.key)) {
      state.verbsMastered.push(currentVerb.key);
    }
    quizWrong.forEach(q => {
      const already = state.wrongAnswers.find(w => w.verbKey === currentVerb.key && w.qNum === q.question_number);
      if (!already) state.wrongAnswers.push({ verbKey: currentVerb.key, qNum: q.question_number });
    });

    const currentIdx = verbos.findIndex(v => v.key === currentVerb.key);
    if (currentIdx >= state.verbIndex) {
      state.verbIndex = Math.min(currentIdx + 1, verbos.length - 1);
    }
    Storage.save(state);

    if (state.verbsSeen.length > 0 && state.verbsSeen.length % CHALLENGE_EVERY === 0
      && state.verbsSeen.length / CHALLENGE_EVERY > state.challengesDone) {
      showSummaryThenChallenge();
    } else {
      showVerbSummary();
    }
  }

  function showVerbSummary() {
    $('summary-icon').textContent = currentQuizCorrect === currentQuestions.length ? '🎉' : '📝';
    $('summary-title').textContent = currentQuizCorrect >= 2 ? '¡Verbo aprendido!' : 'Sigue practicando';
    $('summary-base').textContent = currentVerb.base_form;
    $('summary-past').textContent = currentVerb.simple_past;
    $('summary-correct').textContent = currentQuizCorrect;
    $('summary-total').textContent = currentQuestions.length;

    const wrongSec = $('summary-wrong-section');
    if (quizWrong.length > 0) {
      wrongSec.classList.remove('hidden');
      $('summary-wrong-list').innerHTML = quizWrong.map(q =>
        `<span class="wrong-tag">${q.scaffold.replace(/\{\{ans_[12]\}\}/g, '___').substring(0, 30)}…</span>`
      ).join('');
    } else {
      wrongSec.classList.add('hidden');
    }
    showView('summary');
  }

  function showSummaryThenChallenge() {
    pendingChallenge = true;
    showVerbSummary();
    $('btn-next-verb').textContent = '🔥 ¡Modo Reto! 60 segundos →';
  }

  $('btn-next-verb').addEventListener('click', () => {
    if (pendingChallenge) {
      pendingChallenge = false;
      $('btn-next-verb').textContent = 'Siguiente verbo →';
      startChallenge();
    } else {
      startVerb(state.verbIndex);
    }
  });

  $('btn-home-from-summary').addEventListener('click', () => {
    renderHome();
    showView('home');
  });

  // --- CHALLENGE (60s) ---
  function startChallenge() {
    challengeScore = 0;
    challengeCorrect = 0;
    challengeWrong = 0;
    challengeStreak = 0;
    challengeSeconds = 60;

    challengePool = [];
    state.verbsSeen.forEach(key => {
      const qs = questionsMap[key];
      if (qs) qs.forEach(q => challengePool.push({ ...q, verbKey: key }));
    });
    challengePool = challengePool.sort(() => Math.random() - .5);
    challengePoolIdx = 0;

    $('challenge-score').textContent = 0;
    showView('challenge');
    renderChallengeQuestion();
    startChallengeTimer();
  }

  function renderChallengeQuestion() {
    if (challengePoolIdx >= challengePool.length) challengePoolIdx = 0;
    const q = challengePool[challengePoolIdx++];

    $('challenge-scaffold').innerHTML = renderScaffold(q.scaffold);
    const opts = $('challenge-options');
    opts.innerHTML = '';
    const shuffledOpts = [...q.options].sort(() => Math.random() - .5);
    shuffledOpts.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.textContent = opt;
      btn.addEventListener('click', () => selectChallengeAnswer(btn, opt, q));
      opts.appendChild(btn);
    });
  }

  function selectChallengeAnswer(btn, chosen, q) {
    const allBtns = $('challenge-options').querySelectorAll('.option-btn');
    allBtns.forEach(b => b.disabled = true);
    const correct = chosen === q.correct_answer;

    if (correct) {
      btn.classList.add('correct');
      challengeStreak++;
      const bonus = challengeStreak >= 3 ? 2 : 1;
      challengeScore += bonus;
      challengeCorrect++;
    } else {
      btn.classList.add('wrong');
      allBtns.forEach(b => { if (b.textContent === q.correct_answer) b.classList.add('correct'); });
      challengeStreak = 0;
      challengeWrong++;
    }
    $('challenge-score').textContent = challengeScore;
    flashChallenge(correct);

    setTimeout(() => renderChallengeQuestion(), 600);
  }

  function flashChallenge(correct) {
    const fl = $('challenge-flash');
    fl.classList.remove('hidden', 'flash-correct', 'flash-wrong');
    fl.classList.add(correct ? 'flash-correct' : 'flash-wrong');
    setTimeout(() => { fl.classList.add('hidden'); fl.classList.remove('flash-correct', 'flash-wrong'); }, 300);
  }

  function startChallengeTimer() {
    clearInterval(challengeTimer);
    const circumference = 213.6;
    const fill = $('timer-ring-fill');
    const countdown = $('challenge-countdown');
    const timerWrap = document.querySelector('.challenge-timer-wrap');

    fill.style.strokeDashoffset = 0;
    challengeTimer = setInterval(() => {
      challengeSeconds--;
      countdown.textContent = challengeSeconds;
      fill.style.strokeDashoffset = circumference * (1 - challengeSeconds / 60);
      if (challengeSeconds <= 10) timerWrap.classList.add('timer-urgent');
      if (challengeSeconds <= 0) endChallenge();
    }, 1000);
  }

  function endChallenge() {
    clearInterval(challengeTimer);
    state.challengesDone++;
    Storage.save(state);

    $('result-score-big').textContent = challengeScore;
    $('res-correct').textContent = challengeCorrect;
    $('res-wrong').textContent = challengeWrong;
    $('res-streak').textContent = challengeStreak;
    document.querySelector('.challenge-timer-wrap').classList.remove('timer-urgent');
    showView('challenge-result');
  }

  $('btn-after-challenge').addEventListener('click', () => {
    startVerb(state.verbIndex);
  });

  // --- HOME buttons ---
  $('btn-settings').addEventListener('click', openSettings);

  $('btn-continue').addEventListener('click', () => {
    startVerb(state.verbIndex);
  });

  $('btn-restart').addEventListener('click', () => {
    if (!confirm('¿Empezar desde el principio? El progreso actual se borrará.')) return;
    Storage.reset();
    state = Storage.load();
    renderHome();
  });

  $('btn-show-list').addEventListener('click', () => {
    renderVerbList();
    showView('verb-list');
  });

  $('btn-show-kb').addEventListener('click', () => showView('kb'));

  // --- FOOD VOCABULARY QUIZ ---
  const FOOD_VOCAB = [
    { en: 'soup',        es: 'sopa',           emoji: '🍲' },
    { en: 'bread',       es: 'pan',            emoji: '🍞' },
    { en: 'sandwich',    es: 'sándwich',        emoji: '🥪' },
    { en: 'crackers',    es: 'galletas de sal', emoji: '🫙' },
    { en: 'chicken',     es: 'pollo',           emoji: '🍗' },
    { en: 'steak',       es: 'bistec',          emoji: '🥩' },
    { en: 'fish',        es: 'pescado',         emoji: '🐟' },
    { en: 'beef',        es: 'carne de res',    emoji: '🥩' },
    { en: 'lamb',        es: 'cordero',         emoji: '🐑' },
    { en: 'rice',        es: 'arroz',           emoji: '🍚' },
    { en: 'potatoes',    es: 'papas',           emoji: '🥔' },
    { en: 'green beans', es: 'habichuelas',     emoji: '🫘' },
    { en: 'vegetables',  es: 'verduras',        emoji: '🥦' },
    { en: 'tomato',      es: 'tomate',          emoji: '🍅' },
    { en: 'apple',       es: 'manzana',         emoji: '🍎' },
    { en: 'banana',      es: 'banano',          emoji: '🍌' },
    { en: 'orange',      es: 'naranja',         emoji: '🍊' },
    { en: 'pineapple',   es: 'piña',            emoji: '🍍' },
    { en: 'coconut',     es: 'coco',            emoji: '🥥' },
    { en: 'cheese',      es: 'queso',           emoji: '🧀' },
    { en: 'butter',      es: 'mantequilla',     emoji: '🧈' },
    { en: 'egg',         es: 'huevo',           emoji: '🥚' },
    { en: 'ice cream',   es: 'helado',          emoji: '🍦' },
    { en: 'dessert',     es: 'postre',          emoji: '🍰' },
    { en: 'juice',       es: 'jugo',            emoji: '🧃' },
    { en: 'water',       es: 'agua',            emoji: '💧' },
    { en: 'soda',        es: 'gaseosa',         emoji: '🥤' },
    { en: 'coffee',      es: 'café',            emoji: '☕' },
  ];

  let foodItems  = [];
  let foodQIdx   = 0;
  let foodScore  = 0;

  function startFoodQuiz() {
    foodItems = [...FOOD_VOCAB].sort(() => Math.random() - .5);
    foodQIdx  = 0;
    foodScore = 0;
    showView('food');
    renderFoodQuestion();
  }

  function renderFoodQuestion() {
    const item  = foodItems[foodQIdx];
    const total = foodItems.length;

    $('food-progress-label').textContent = `${foodQIdx + 1} / ${total}`;
    $('food-progress-fill').style.width  = `${(foodQIdx / total) * 100}%`;

    // GIF unique to this food word, with its own emoji placeholder
    setGif('food-gif', 'food-gif-ph', 'food-gif-emoji', item.en, item.emoji);

    // Scaffold: show English word as the question
    $('food-scaffold').innerHTML =
      `<span class="food-q-label">¿Cómo se dice en español?</span>` +
      `<span class="food-q-word">${item.en}</span>`;

    // 4 options: 1 correct + 3 random wrong Spanish words
    const wrong = FOOD_VOCAB
      .filter(f => f.en !== item.en)
      .sort(() => Math.random() - .5)
      .slice(0, 3)
      .map(f => f.es);
    const opts = [...wrong, item.es].sort(() => Math.random() - .5);

    $('food-feedback').classList.add('hidden');
    $('food-correct-gif').hidden = true;

    const optEl = $('food-options');
    optEl.innerHTML = '';
    opts.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.textContent = opt;
      btn.addEventListener('click', () => selectFoodAnswer(btn, opt, item));
      optEl.appendChild(btn);
    });
  }

  function selectFoodAnswer(btn, chosen, item) {
    $('food-options').querySelectorAll('.option-btn').forEach(b => b.disabled = true);
    const correct = chosen === item.es;

    if (correct) {
      btn.classList.add('correct');
      foodScore++;
      showFeedbackGif(Giphy.getCelebrationGif(), $('food-correct-gif'));
    } else {
      btn.classList.add('wrong');
      $('food-options').querySelectorAll('.option-btn').forEach(b => {
        if (b.textContent === item.es) b.classList.add('correct');
      });
      showFeedbackGif(Giphy.getWrongGif(), $('food-correct-gif'));
    }

    $('food-feedback-icon').textContent = correct ? '✅' : '❌';
    $('food-feedback-text').textContent = correct ? '¡Correcto!' : 'Incorrecto';
    $('food-rationale').textContent = `${item.en} = ${item.es}`;
    $('food-feedback').classList.remove('hidden');
    btn.classList.add(correct ? 'bounce-in' : 'shake');
  }

  $('btn-food-next').addEventListener('click', () => {
    foodQIdx++;
    if (foodQIdx < foodItems.length) {
      renderFoodQuestion();
    } else {
      $('food-result-score').textContent   = foodScore;
      $('food-result-subtitle').textContent = `de ${foodItems.length} correctas`;
      showView('food-result');
    }
  });

  $('btn-food-restart').addEventListener('click', startFoodQuiz);
  $('btn-food-home').addEventListener('click', () => { renderHome(); showView('home'); });

  $('btn-show-food').addEventListener('click', startFoodQuiz);

  // --- Init ---
  // Purge old single-URL gif cache entries (gif_ prefix) from previous version
  Object.keys(localStorage)
    .filter(k => k.startsWith('gif_'))
    .forEach(k => localStorage.removeItem(k));

  applyTheme();
  renderHome();
})();

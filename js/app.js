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

    // Reset card to front
    $('flashcard').classList.remove('flipped');

    $('fc-verb-index').textContent = `${idx + 1} / ${verbos.length}`;
    $('fc-base').textContent = verb.base_form;
    $('fc-meaning').textContent = verb.meaning_es;
    $('fc-past').textContent = verb.simple_past;

    // Grammar rules on back of card
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

    // GIF
    setGif('fc-gif', 'fc-gif-placeholder', 'fc-gif-emoji', verb.key);

    showView('flashcard');
  }

  function setGif(imgId, placeholderId, emojiId, verbKey) {
    const img = $(imgId);
    const ph = $(placeholderId);
    const em = emojiId ? $(emojiId) : null;
    if (em) em.textContent = Giphy.getEmoji(verbKey);
    img.hidden = true;
    ph.style.display = 'flex';

    Giphy.getGif(verbKey).then(url => {
      if (url) {
        img.src = url;
        img.onload = () => { img.hidden = false; ph.style.display = 'none'; };
        img.onerror = () => { img.hidden = true; ph.style.display = 'flex'; };
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
    setGif('quiz-gif', 'quiz-gif-placeholder', 'quiz-gif-emoji', currentVerb.key);
    showView('quiz');
    renderQuestion();
  }

  const TYPE_CHIP = {
    wh_question:           { label: '? Pregunta',          cls: 'chip-blue' },
    yes_no_question:       { label: '? Sí / No',           cls: 'chip-blue' },
    affirmative_statement: { label: '✏ Completa la oración', cls: 'chip-purple' },
    negative_statement:    { label: '✗ Forma negativa',    cls: 'chip-red' },
    negative_question:     { label: '? Pregunta negativa', cls: 'chip-orange' },
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
      // Show correct answer in scaffold
      $('quiz-scaffold').innerHTML = renderAnswered(q.scaffold, q.correct_answer, true);
    } else {
      btn.classList.add('wrong');
      quizWrong.push(q);
      allBtns.forEach(b => {
        if (b.textContent === q.correct_answer) b.classList.add('correct');
      });
      $('quiz-scaffold').innerHTML = renderAnswered(q.scaffold, q.correct_answer, false);
    }

    const fb = $('quiz-feedback');
    $('quiz-feedback-icon').textContent = correct ? '✅' : '❌';
    $('quiz-feedback-text').textContent = correct ? '¡Correcto!' : 'Incorrecto';
    $('quiz-rationale').textContent = q.rationale;
    fb.classList.remove('hidden');

    // Animate options
    btn.classList.add(correct ? 'bounce-in' : 'shake');
  }

  function renderAnswered(scaffold, answer, correct) {
    const parts = answer.split(' / ');
    let result = scaffold;
    parts.forEach((p, i) => {
      const placeholder = `{{ans_${i + 1}}}`;
      const cls = correct ? 'blank' : 'blank';
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
    // Save progress
    if (!state.verbsSeen.includes(currentVerb.key)) {
      state.verbsSeen.push(currentVerb.key);
    }
    if (currentQuizCorrect >= 3 && !state.verbsMastered.includes(currentVerb.key)) {
      state.verbsMastered.push(currentVerb.key);
    }
    // Record wrong answers
    quizWrong.forEach(q => {
      const already = state.wrongAnswers.find(w => w.verbKey === currentVerb.key && w.qNum === q.question_number);
      if (!already) state.wrongAnswers.push({ verbKey: currentVerb.key, qNum: q.question_number });
    });

    // Advance verb index
    const currentIdx = verbos.findIndex(v => v.key === currentVerb.key);
    if (currentIdx >= state.verbIndex) {
      state.verbIndex = Math.min(currentIdx + 1, verbos.length - 1);
    }
    Storage.save(state);

    // Check challenge trigger
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

    // Build pool from all seen verbs
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

  // --- Init ---
  applyTheme();
  renderHome();
})();

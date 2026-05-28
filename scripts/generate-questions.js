/**
 * Generates 10 new questions per verb (4 affirmative_statement + 4 negative_statement + 2 negative_question)
 * and appends them to data/questions.json
 */
const fs = require('fs');
const path = require('path');

const DATA = path.join(__dirname, '..', 'data');
const verbos = JSON.parse(fs.readFileSync(path.join(DATA, 'verbos.json'), 'utf8'));
const questions = JSON.parse(fs.readFileSync(path.join(DATA, 'questions.json'), 'utf8'));

// ── verb context bank ──────────────────────────────────────────────────────────
// Each verb gets 4 affirmative contexts + 4 negative contexts (different subjects/situations)
// Format: plain string with {PAST} or {BASE} placeholder replaced at generation time

const SUBJECTS = ['She', 'He', 'They', 'We', 'My sister', 'The teacher', 'My friend', 'You'];
const pick = arr => arr[Math.floor(Math.random() * arr.length)];

// Verb-specific context phrases for {BASE} / {PAST}
const VERB_CONTEXTS = {
  be: null, // handled separately
  become: [
    ['a professional singer', 'an important person', 'very popular at school', 'the team captain'],
    ['a doctor', 'best friends', 'the class president', 'famous overnight'],
  ],
  begin: [
    ['the presentation on time', 'the movie late', 'working at the new office', 'studying for the test'],
    ['the race', 'the concert', 'cooking dinner', 'their homework'],
  ],
  break: [
    ['her arm during practice', 'the school record', 'the window accidentally', 'the rules at the party'],
    ['the glass', 'his promise', 'the old chair', 'the computer screen'],
  ],
  bring: [
    ['her umbrella to school', 'a gift for the party', 'lunch from home', 'good news to the office'],
    ['enough copies of the document', 'his dog to the park', 'the wrong file', 'the birthday cake'],
  ],
  build: [
    ['a sandcastle at the beach', 'a new shelf for the room', 'a strong team', 'the furniture from scratch'],
    ['a new house', 'a treehouse for the kids', 'confidence in the group', 'the website'],
  ],
  buy: [
    ['a new laptop last month', 'tickets for the concert', 'groceries at the supermarket', 'a birthday present'],
    ['the expensive shoes', 'lunch at the cafeteria', 'a used car', 'flowers for her mom'],
  ],
  can: null, // handled with could/couldn't
  catch: [
    ['the bus on time', 'a cold after the trip', 'a big fish at the lake', 'the ball during the game'],
    ['the early flight', 'the thief in the act', 'her attention with the joke', 'the last train home'],
  ],
  choose: [
    ['the blue dress for the event', 'a new career path', 'the best option available', 'her favorite restaurant'],
    ['the most expensive item on the menu', 'the right answer on the test', 'a new apartment', 'the team leader'],
  ],
  come: [
    ['home late last night', 'to the party with her friends', 'first in the race', 'to the meeting unprepared'],
    ['to school on time', 'to visit us last summer', 'to the hospital immediately', 'back from vacation early'],
  ],
  cost: [
    ['a lot of money to repair', 'more than expected', 'him his job', 'very little at the sale'],
    ['the company thousands of dollars', 'a fortune to fix', 'nothing to enter', 'more than the budget'],
  ],
  cut: [
    ['her finger while cooking', 'the cake into pieces', 'the old tree in the backyard', 'the budget significantly'],
    ['his hair too short', 'the vegetables for dinner', 'the rope with scissors', 'class to go to the mall'],
  ],
  do: [
    ['all her homework last night', 'a great job at the presentation', 'the dishes after dinner', 'some research online'],
    ['his best in the competition', 'yoga in the morning', 'the laundry on Saturday', 'a favor for his neighbor'],
  ],
  draw: [
    ['a portrait of her grandmother', 'a map to the treasure', 'a picture for the art class', 'the curtains in the bedroom'],
    ['a diagram on the board', 'his dream house', 'a comic strip for fun', 'the winning ticket'],
  ],
  drink: [
    ['three cups of coffee before noon', 'juice at breakfast', 'water during the whole run', 'tea to feel better'],
    ['too much soda at the party', 'hot chocolate after the snow', 'a glass of water', 'the cold medicine'],
  ],
  drive: [
    ['to the airport at 4 a.m.', 'the kids to school', 'across the country last summer', 'the new car for the first time'],
    ['through the storm', 'her parents crazy with the noise', 'to the hospital quickly', 'a long route to avoid traffic'],
  ],
  eat: [
    ['breakfast before the exam', 'all the pizza at the party', 'dinner at the new restaurant', 'a sandwich for lunch'],
    ['too much candy on Halloween', 'at the school cafeteria', 'the leftovers from last night', 'a healthy salad'],
  ],
  fall: [
    ['off her bike in the park', 'asleep during the lecture', 'in love with the city', 'down the stairs'],
    ['behind in her studies', 'off the ladder', 'asleep before midnight', 'into a deep sleep'],
  ],
  feel: [
    ['sick after eating at that restaurant', 'nervous before the presentation', 'happy about the news', 'cold all day'],
    ['tired after the long trip', 'proud of her achievement', 'lost in the new city', 'better after the medicine'],
  ],
  find: [
    ['her keys under the sofa', 'a job in a new city', 'the answer online', 'a wallet on the street'],
    ['a great deal at the store', 'the solution to the problem', 'her phone after two hours', 'a good recipe'],
  ],
  fly: [
    ['to Paris for the holiday', 'business class for the first time', 'over the mountains', 'back home last Sunday'],
    ['to the conference', 'across the Atlantic', 'on a small propeller plane', 'with a budget airline'],
  ],
  forget: [
    ['her password again', 'to bring the report', 'their anniversary', 'to turn off the lights'],
    ['his wallet at home', 'to call his mother', 'the name of the restaurant', 'to return the library books'],
  ],
  get: [
    ['a promotion at work', 'lost on the way to school', 'a great grade on the test', 'the job after the interview'],
    ['home very late', 'sick during the vacation', 'a surprise birthday party', 'a good deal on the car'],
  ],
  give: [
    ['a speech at the wedding', 'her sister a birthday present', 'the students extra homework', 'good advice to her friend'],
    ['away all his old clothes', 'the dog some treats', 'a big tip to the server', 'blood at the donation center'],
  ],
  go: [
    ['to the cinema last Friday', 'on vacation to the beach', 'to the gym before work', 'to bed very late'],
    ['to the wrong address', 'shopping with her friends', 'to the doctor last week', 'hiking in the mountains'],
  ],
  grow: [
    ['vegetables in her garden', 'up in a small town', 'a beard during the winter', 'tired of the same routine'],
    ['tomatoes on the balcony', 'up very fast', 'her own herbs for cooking', 'bored with the job'],
  ],
  have: [
    ['a great time at the concert', 'dinner with her family', 'a meeting with the boss', 'trouble finding parking'],
    ['breakfast at a nice café', 'a long conversation with her friend', 'an accident on the way home', 'fun at the festival'],
  ],
  hear: [
    ['a strange noise in the night', 'the good news about the promotion', 'the concert from outside', 'the alarm clock go off'],
    ['about the accident on the radio', 'the phone ring while in the shower', 'the dog barking all night', 'the announcement'],
  ],
  hit: [
    ['the target on the first try', 'a new personal record', 'the road very early', 'the ball out of the park'],
    ['the snooze button too many times', 'a difficult patch in the project', 'the jackpot at the game', 'traffic on the highway'],
  ],
  keep: [
    ['a journal for five years', 'the change after the purchase', 'the door open all afternoon', 'the secret for weeks'],
    ['her promise to the team', 'the dog inside during the storm', 'extra food in the fridge', 'her old toys from childhood'],
  ],
  know: [
    ['the answer to every question', 'the city like the back of her hand', 'something was wrong immediately', 'him from university'],
    ['all the words of the song', 'the truth the whole time', 'the right person for the job', 'how to solve the problem'],
  ],
  leave: [
    ['her phone at the restaurant', 'the office early on Friday', 'for London last Tuesday', 'the lights on all night'],
    ['the party before midnight', 'a tip for the waiter', 'the door unlocked', 'her umbrella on the bus'],
  ],
  lend: [
    ['her car to her brother', 'money to a friend', 'her umbrella to a colleague', 'his phone to a stranger'],
    ['the tools to the neighbor', 'her notes to a classmate', 'his jacket to her', 'support to the project'],
  ],
  lie: [
    ['on the sofa all afternoon', 'in bed until noon on Sunday', 'on the beach for two hours', 'on the grass in the park'],
    ['on the couch to watch TV', 'on the floor to stretch', 'quietly in the hammock', 'outside to stargaze'],
  ],
  lose: [
    ['her keys on the way home', 'the game in the final minutes', 'her job during the crisis', 'five pounds on the new diet'],
    ['the match against the rival team', 'his wallet at the airport', 'the argument with her sister', 'track of time at the museum'],
  ],
  make: [
    ['a cake for the birthday party', 'a big mistake at work', 'a new friend at the gym', 'dinner for the whole family'],
    ['a lot of noise during the night', 'an important decision quickly', 'her bed before going to school', 'a promise she couldn\'t keep'],
  ],
  mean: [
    ['to call but forgot', 'it as a compliment', 'well but it came out wrong', 'to arrive earlier'],
    ['no harm with the comment', 'to return the book sooner', 'it seriously this time', 'to apologize but didn\'t'],
  ],
  meet: [
    ['her future husband at a coffee shop', 'the famous author at the book fair', 'old friends at the reunion', 'the deadline with time to spare'],
    ['the new neighbors last weekend', 'the project requirements', 'the team for the first time', 'her idol backstage'],
  ],
  pay: [
    ['for dinner at the expensive restaurant', 'the rent two weeks late', 'close attention during the lecture', 'a fortune for the repairs'],
    ['the full price without a discount', 'in cash at the market', 'for someone else\'s mistakes', 'the bill without checking it'],
  ],
  put: [
    ['the keys in the wrong drawer', 'her phone on silent before class', 'extra effort into the project', 'the dishes in the dishwasher'],
    ['the baby to sleep', 'on a jacket before going outside', 'up a shelf in the living room', 'the leftovers in the fridge'],
  ],
  read: [
    ['the entire book in one weekend', 'the instructions carefully before starting', 'the news article about the election', 'her daughter a bedtime story'],
    ['the email three times before replying', 'the contract before signing', 'a novel during the long flight', 'the report to prepare for the meeting'],
  ],
  ride: [
    ['her bike to work every day last week', 'a horse at the countryside ranch', 'the subway for the first time', 'a scooter around the city'],
    ['a motorcycle to the beach', 'a camel during the desert tour', 'the rollercoaster twice', 'a taxi instead of the bus'],
  ],
  ring: [
    ['the doorbell three times', 'the alarm too early', 'the phone but nobody answered', 'the church bells at noon'],
    ['in the new year with fireworks', 'the customer service hotline', 'the bell to start class', 'the emergency contact'],
  ],
  run: [
    ['a marathon last spring', 'to the bus stop to catch the last bus', 'the meeting while the boss was away', 'out of ideas quickly'],
    ['five kilometers before breakfast', 'the whole company for six months', 'out of time on the exam', 'into an old classmate downtown'],
  ],
  say: [
    ['hello to everyone at the party', 'something she later regretted', 'the wrong name during the introduction', 'goodbye before leaving'],
    ['thank you in three different languages', 'nothing during the whole meeting', 'the answer out loud', 'something funny to break the tension'],
  ],
  see: [
    ['a shooting star late at night', 'the new movie at the cinema', 'her old friends at the reunion', 'the dolphins from the boat'],
    ['something suspicious near the car', 'the sunrise from the mountain top', 'a famous actor at the coffee shop', 'the Northern Lights'],
  ],
  sell: [
    ['her car to buy a motorcycle', 'handmade jewelry at the market', 'the house in just one week', 'his collection of vintage records'],
    ['everything at the garage sale', 'the business after ten years', 'tickets for the event online', 'her old laptop to a student'],
  ],
  send: [
    ['a birthday card to her grandmother', 'the report to the wrong person', 'a long email to the manager', 'the package by express mail'],
    ['flowers to apologize', 'the documents before the deadline', 'a message to the whole group', 'photos from the trip'],
  ],
  show: [
    ['us the way to the train station', 'his new paintings at the gallery', 'the team how to use the software', 'great patience during the problem'],
    ['her ID at the entrance', 'the tourists around the city', 'remarkable courage under pressure', 'the results of the experiment'],
  ],
  sing: [
    ['a song at the school talent show', 'the national anthem before the game', 'karaoke with her friends', 'a lullaby to the baby'],
    ['in the shower every morning last week', 'the chorus with the whole crowd', 'her favorite song at the party', 'in a band during university'],
  ],
  sit: [
    ['next to a famous actor on the plane', 'in the front row at the concert', 'through a very long meeting', 'on the park bench for an hour'],
    ['by the window to enjoy the view', 'in silence during the ceremony', 'in the wrong seat at first', 'outside to eat lunch'],
  ],
  sleep: [
    ['through her alarm on Monday', 'for ten hours after the trip', 'on the couch instead of the bed', 'badly because of the noise'],
    ['under the stars last summer', 'on the train and missed her stop', 'well for the first time in weeks', 'in until 11 a.m. on Sunday'],
  ],
  speak: [
    ['to the manager about the problem', 'in front of five hundred people', 'at the graduation ceremony', 'three languages fluently at age twelve'],
    ['too fast during the presentation', 'to her sister after a long silence', 'to the press after the victory', 'at the conference about climate change'],
  ],
  spend: [
    ['the weekend at the beach', 'all her savings on the trip', 'three hours in the waiting room', 'quality time with her family'],
    ['too much at the shopping mall', 'the night at a hotel downtown', 'the holiday with her grandparents', 'the whole day cooking'],
  ],
  stand: [
    ['in line for two hours', 'up for what she believed in', 'out in the crowd with her red coat', 'next to the mayor for the photo'],
    ['on top of the mountain at sunset', 'by her friend during a difficult time', 'outside in the rain waiting for a taxi', 'in front of the whole school'],
  ],
  swim: [
    ['across the lake on a dare', 'in the ocean every morning', 'in the school competition and won', 'with dolphins on vacation'],
    ['two kilometers without stopping', 'in the freezing river', 'in the community pool', 'in the hotel pool after dinner'],
  ],
  take: [
    ['the wrong bus and got lost', 'a photo of the sunset', 'a long nap after lunch', 'the dog to the vet'],
    ['an exam without studying', 'the fastest route to the airport', 'medicine for three days', 'a risk and succeeded'],
  ],
  teach: [
    ['her son to ride a bike', 'English at a school abroad', 'the team a valuable lesson', 'herself to play the piano'],
    ['a yoga class at the gym', 'him how to cook traditional recipes', 'the course during the summer', 'children to read'],
  ],
  tell: [
    ['a funny story at the dinner table', 'her friend the whole truth', 'the kids a bedtime story', 'the manager about the problem'],
    ['everyone the good news', 'a lie to avoid trouble', 'her parents about the accident', 'the team about the new plan'],
  ],
  think: [
    ['the meeting was canceled', 'she left her wallet at home', 'the answer was obvious', 'about her future all night'],
    ['the movie was excellent', 'it was a great idea at first', 'carefully before answering', 'she knew the right person for the job'],
  ],
  throw: [
    ['the ball over the fence accidentally', 'a surprise party for her best friend', 'her old clothes away', 'the paper in the recycling bin'],
    ['a tantrum when she lost', 'the winning pass in the last minute', 'the frisbee too hard', 'a coin in the fountain for luck'],
  ],
  understand: [
    ['the instructions the first time', 'the reason behind the decision', 'the foreign language perfectly', 'the problem immediately'],
    ['the assignment without any help', 'why her friend was upset', 'the contract before signing it', 'the gravity of the situation'],
  ],
  wake: [
    ['up before sunrise to hike', 'her roommate with loud music', 'up three times during the night', 'up feeling refreshed for once'],
    ['everyone up with the alarm', 'up late on the day of the flight', 'up in the middle of a dream', 'the baby up accidentally'],
  ],
  wear: [
    ['her grandmother\'s ring to the wedding', 'a costume to the Halloween party', 'formal clothes to the interview', 'a hat to protect from the sun'],
    ['the same jacket for three days', 'high heels to the event', 'a uniform to school', 'sunscreen at the beach'],
  ],
  win: [
    ['first prize at the science fair', 'the championship after five years', 'a free trip to Hawaii', 'the debate competition'],
    ['the lottery twice in a row', 'the match in overtime', 'a scholarship to university', 'the crowd over with her speech'],
  ],
  write: [
    ['a poem for Valentine\'s Day', 'the final chapter of her novel', 'a complaint letter to the company', 'the code for the new app'],
    ['her thesis in just two months', 'a song for her friend\'s wedding', 'the wrong date on the form', 'a positive review about the restaurant'],
  ],
};

// ── BE verb special templates ──────────────────────────────────────────────────

const BE_AFFIRMATIVE = [
  { subj: 'She',  past: 'was',  ctx: 'at the library until midnight.' },
  { subj: 'He',   past: 'was',  ctx: 'really nervous before the big presentation.' },
  { subj: 'They', past: 'were', ctx: 'on vacation in Italy last summer.' },
  { subj: 'We',   past: 'were', ctx: 'late to the concert by twenty minutes.' },
  { subj: 'The food', past: 'was', ctx: 'delicious at the new restaurant.' },
  { subj: 'The walls', past: 'were', ctx: 'painted orange in her old bedroom.' },
  { subj: 'My friends', past: 'were', ctx: 'surprised by the news.' },
  { subj: 'The store', past: 'was', ctx: 'closed when we arrived.' },
];

const BE_NEGATIVE = [
  { subj: 'She',  neg: "wasn't",  ctx: 'at home when I called.' },
  { subj: 'He',   neg: "wasn't",  ctx: 'ready for the exam.' },
  { subj: 'They', neg: "weren't", ctx: 'at the party last Saturday.' },
  { subj: 'We',   neg: "weren't", ctx: 'happy about the decision.' },
  { subj: 'The movie', neg: "wasn't", ctx: 'as good as the reviews said.' },
  { subj: 'The tickets', neg: "weren't", ctx: 'available online.' },
  { subj: 'My phone', neg: "wasn't", ctx: 'charged before the trip.' },
  { subj: 'The kids', neg: "weren't", ctx: 'tired at all after the long day.' },
];

const BE_NEG_QUESTION = [
  { wh: "Weren't", subj: 'they', ctx: 'at the meeting this morning?' },
  { wh: "Wasn't",  subj: 'she',  ctx: 'at school on Friday?' },
  { wh: "Weren't", subj: 'you',  ctx: 'satisfied with the result?' },
  { wh: "Wasn't",  subj: 'the food', ctx: 'included in the price?' },
];

// ── CAN verb special templates (could / couldn't) ──────────────────────────────

const CAN_AFFIRMATIVE = [
  'She could speak French when she was six.',
  'He could run a mile in under five minutes.',
  'They could see the city from the hotel room.',
  'We could hear the music from outside.',
];

const CAN_NEGATIVE = [
  { line: 'She {{ans_1}} {{ans_2}} the instructions clearly.', neg: "couldn't / understand" },
  { line: 'He {{ans_1}} {{ans_2}} his bike after the accident.', neg: "couldn't / ride" },
  { line: 'They {{ans_1}} {{ans_2}} a taxi during rush hour.', neg: "couldn't / find" },
  { line: 'We {{ans_1}} {{ans_2}} the concert because it was sold out.', neg: "couldn't / attend" },
];

const CAN_NEG_QUESTION = [
  { line: '{{ans_1}} she {{ans_2}} the exam after missing so many classes?', ans: "Couldn't / pass" },
  { line: '{{ans_1}} they {{ans_2}} the problem on their own?', ans: "Couldn't / solve" },
];

// ── Helper: make fake past for distractor ─────────────────────────────────────
function fakePast(base) {
  if (base.endsWith('e')) return base + 'd';
  if (base.endsWith('y') && !'aeiou'.includes(base[base.length - 2])) return base.slice(0, -1) + 'ied';
  return base + 'ed';
}

function getPastParticiple(verb) {
  // Approximate past participles for common verbs
  const pp = {
    be: 'been', become: 'become', begin: 'begun', break: 'broken', bring: 'brought',
    build: 'built', buy: 'bought', catch: 'caught', choose: 'chosen', come: 'come',
    cost: 'cost', cut: 'cut', do: 'done', draw: 'drawn', drink: 'drunk',
    drive: 'driven', eat: 'eaten', fall: 'fallen', feel: 'felt', find: 'found',
    fly: 'flown', forget: 'forgotten', get: 'gotten', give: 'given', go: 'gone',
    grow: 'grown', have: 'had', hear: 'heard', hit: 'hit', keep: 'kept',
    know: 'known', leave: 'left', lend: 'lent', lie: 'lain', lose: 'lost',
    make: 'made', mean: 'meant', meet: 'met', pay: 'paid', put: 'put',
    read: 'read', ride: 'ridden', ring: 'rung', run: 'run', say: 'said',
    see: 'seen', sell: 'sold', send: 'sent', show: 'shown', sing: 'sung',
    sit: 'sat', sleep: 'slept', speak: 'spoken', spend: 'spent', stand: 'stood',
    swim: 'swum', take: 'taken', teach: 'taught', tell: 'told', think: 'thought',
    throw: 'thrown', understand: 'understood', wake: 'woken', wear: 'worn',
    win: 'won', write: 'written',
  };
  return pp[verb] || (verb + 'ed');
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

// ── Generate questions for a single verb ──────────────────────────────────────

function generateForVerb(verbEntry) {
  const { key, base_form, simple_past } = verbEntry;
  const newQs = [];
  let qNum = 11;

  // ── BE special case ──────────────────────────────────────────────────────
  if (key === 'be') {
    // 4 affirmative_statement
    for (let i = 0; i < 4; i++) {
      const tmpl = BE_AFFIRMATIVE[i];
      const scaffold = `${tmpl.subj} {{ans_1}} ${tmpl.ctx}`;
      const correct = tmpl.past;
      const other = correct === 'was' ? 'were' : 'was';
      const options = shuffle([correct, other, 'is', 'be']);
      newQs.push({
        question_number: qNum++, type: 'affirmative_statement', scaffold,
        options, correct_answer: correct,
        rationale: `Usamos '${correct}' porque el sujeto '${tmpl.subj}' es ${correct === 'was' ? 'singular' : 'plural'}. Forma afirmativa del pasado de 'be'.`,
      });
    }
    // 4 negative_statement
    for (let i = 0; i < 4; i++) {
      const tmpl = BE_NEGATIVE[i];
      const scaffold = `${tmpl.subj} {{ans_1}} ${tmpl.ctx}`;
      const correct = tmpl.neg;
      const other = correct === "wasn't" ? "weren't" : "wasn't";
      const options = shuffle([correct, other, "didn't be", "isn't"]);
      newQs.push({
        question_number: qNum++, type: 'negative_statement', scaffold,
        options, correct_answer: correct,
        rationale: `La forma negativa del pasado de 'be' es '${correct}'. Nunca se usa 'didn't be'.`,
      });
    }
    // 2 negative_question
    for (let i = 0; i < 2; i++) {
      const tmpl = BE_NEG_QUESTION[i];
      const scaffold = `{{ans_1}} ${tmpl.subj} ${tmpl.ctx}`;
      const correct = tmpl.wh;
      const other = correct === "Weren't" ? "Wasn't" : "Weren't";
      const options = shuffle([correct, other, "Didn't", correct.replace("n't", "")]);
      newQs.push({
        question_number: qNum++, type: 'negative_question', scaffold,
        options, correct_answer: correct,
        rationale: `Pregunta negativa con 'be' en pasado: '${correct}'. No se usa 'Didn't' con 'be'.`,
      });
    }
    return newQs;
  }

  // ── CAN special case ──────────────────────────────────────────────────────
  if (key === 'can') {
    // 4 affirmative_statement (already full sentence, single blank)
    const affTempl = [
      { scaffold: 'She {{ans_1}} speak French when she was six.', ans: 'could' },
      { scaffold: 'He {{ans_1}} run a mile in under five minutes back then.', ans: 'could' },
      { scaffold: 'They {{ans_1}} see the whole city from the hotel room.', ans: 'could' },
      { scaffold: 'We {{ans_1}} hear the music from two blocks away.', ans: 'could' },
    ];
    for (const tmpl of affTempl) {
      const options = shuffle(['could', 'can', 'was able', 'did can']);
      newQs.push({
        question_number: qNum++, type: 'affirmative_statement', scaffold: tmpl.scaffold,
        options, correct_answer: 'could',
        rationale: "El pasado de 'can' es 'could'. Se usa sin auxiliar 'did'.",
      });
    }
    // 4 negative_statement (couldn't + base)
    const negTempl = [
      { scaffold: "She {{ans_1}} {{ans_2}} the instructions clearly.", ans: "couldn't / understand" },
      { scaffold: "He {{ans_1}} {{ans_2}} his bike after the accident.", ans: "couldn't / ride" },
      { scaffold: "They {{ans_1}} {{ans_2}} a taxi during rush hour.", ans: "couldn't / find" },
      { scaffold: "We {{ans_1}} {{ans_2}} the concert because it was sold out.", ans: "couldn't / attend" },
    ];
    for (const tmpl of negTempl) {
      const base = tmpl.ans.split(' / ')[1];
      const options = shuffle([tmpl.ans, `couldn't / ${fakePast(base)}`, `can't / ${base}`, `didn't / ${base}`]);
      newQs.push({
        question_number: qNum++, type: 'negative_statement', scaffold: tmpl.scaffold,
        options, correct_answer: tmpl.ans,
        rationale: "La forma negativa de 'could' es 'couldn't'. El verbo siguiente va en forma base.",
      });
    }
    // 2 negative_question
    const nqTempl = [
      { scaffold: "{{ans_1}} she {{ans_2}} the exam after missing so many classes?", ans: "Couldn't / pass" },
      { scaffold: "{{ans_1}} they {{ans_2}} the problem on their own?", ans: "Couldn't / solve" },
    ];
    for (const tmpl of nqTempl) {
      const base = tmpl.ans.split(' / ')[1];
      const options = shuffle([tmpl.ans, `Couldn't / ${fakePast(base)}`, `Didn't / ${base}`, `Can't / ${base}`]);
      newQs.push({
        question_number: qNum++, type: 'negative_question', scaffold: tmpl.scaffold,
        options, correct_answer: tmpl.ans,
        rationale: "Pregunta negativa con 'could': 'Couldn't + verbo base'. No se usa 'Didn't' con 'can/could'.",
      });
    }
    return newQs;
  }

  // ── Standard verbs ────────────────────────────────────────────────────────
  const contexts = VERB_CONTEXTS[key];
  if (!contexts) {
    console.warn(`No contexts defined for verb: ${key}`);
    return [];
  }

  const affCtxPool = contexts[0];
  const negCtxPool = contexts[1];
  const stdSubjects = ['She', 'He', 'They', 'We', 'My friend', 'The team', 'My sister', 'He'];
  const pp = getPastParticiple(key);
  const fp = fakePast(key);

  // 4 × affirmative_statement
  const affSubjects = ['She', 'He', 'They', 'We'];
  for (let i = 0; i < 4; i++) {
    const subj = affSubjects[i];
    const ctx = affCtxPool[i % affCtxPool.length];
    const scaffold = `${subj} {{ans_1}} ${ctx}`;
    const correct = simple_past;
    let opts;
    if (correct === base_form) {
      // Same-form verb (cost, cut, put, read, hit)
      opts = [correct, fp, pp, `${correct}s`];
    } else {
      opts = [correct, base_form, fp, pp];
    }
    opts = shuffle(opts.slice(0, 4));
    newQs.push({
      question_number: qNum++, type: 'affirmative_statement', scaffold,
      options: opts, correct_answer: correct,
      rationale: `La forma pasada de '${base_form}' es '${correct}'. Es un verbo irregular. No se dice '${fp}'.`,
    });
  }

  // 4 × negative_statement (didn't + base)
  const negSubjects = ['She', 'He', 'They', 'We'];
  for (let i = 0; i < 4; i++) {
    const subj = negSubjects[i];
    const ctx = negCtxPool[i % negCtxPool.length];
    const scaffold = `${subj} {{ans_1}} {{ans_2}} ${ctx}`;
    const correct = `didn't / ${base_form}`;
    const opts = shuffle([
      correct,
      `didn't / ${simple_past}`,  // ← most common error
      `doesn't / ${base_form}`,
      `don't / ${base_form}`,
    ]);
    newQs.push({
      question_number: qNum++, type: 'negative_statement', scaffold,
      options: opts, correct_answer: correct,
      rationale: `Después de 'didn't', el verbo principal va en su forma base: 'didn't ${base_form}'. El error más común es 'didn't ${simple_past}'.`,
    });
  }

  // 2 × negative_question (Didn't + subject + base)
  const nqSubjects = [['she', 'She'], ['they', 'They']];
  const nqCtxes = [affCtxPool[0], negCtxPool[0]];
  for (let i = 0; i < 2; i++) {
    const [subj_lc, subj_cap] = nqSubjects[i];
    const ctx = nqCtxes[i];
    const scaffold = `{{ans_1}} ${subj_lc} {{ans_2}} ${ctx}?`;
    const correct = `Didn't / ${base_form}`;
    const opts = shuffle([
      correct,
      `Didn't / ${simple_past}`,  // ← most common error
      `Doesn't / ${base_form}`,
      `Wasn't / ${base_form}`,
    ]);
    newQs.push({
      question_number: qNum++, type: 'negative_question', scaffold,
      options: opts, correct_answer: correct,
      rationale: `Pregunta negativa en pasado: 'Didn't + sujeto + verbo base'. Nunca 'Didn't + ${simple_past}'.`,
    });
  }

  return newQs;
}

// ── Main: append new questions to each verb entry ────────────────────────────

let totalAdded = 0;
const updated = questions.map(entry => {
  const verbEntry = verbos.find(v => v.key === entry.key);
  if (!verbEntry) return entry;

  // Only add if we don't already have the new types
  const existingTypes = new Set(entry.questions.map(q => q.type));
  if (existingTypes.has('affirmative_statement')) {
    return entry; // already done
  }

  const newQs = generateForVerb(verbEntry);
  totalAdded += newQs.length;
  return { ...entry, questions: [...entry.questions, ...newQs] };
});

fs.writeFileSync(path.join(DATA, 'questions.json'), JSON.stringify(updated, null, 4), 'utf8');
console.log(`Done. Added ${totalAdded} new questions.`);
console.log(`Total questions now: ${updated.reduce((a, b) => a + b.questions.length, 0)}`);

// Quick validation
let errors = 0;
updated.forEach(entry => {
  entry.questions.forEach(q => {
    if (!q.options.includes(q.correct_answer)) {
      console.error(`ERROR: ${entry.key} Q${q.question_number}: "${q.correct_answer}" not in options`);
      errors++;
    }
  });
});
if (errors === 0) console.log('Validation: all answers found in options ✅');
else console.log(`Validation: ${errors} errors ❌`);

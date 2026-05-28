const fs = require('fs');
const path = require('path');

const DATA = path.join(__dirname, '..', 'data');
const verbos = JSON.parse(fs.readFileSync(path.join(DATA, 'verbos.json'), 'utf8'));

const rules = {
  be:         { aff: 'I was / They were tired.',            neg: "I wasn't / They weren't ready.",          q: 'Was she / Were they at home?' },
  become:     { aff: 'She became a doctor.',                neg: "She didn't become a nurse.",               q: 'Did she become a teacher?' },
  begin:      { aff: 'The movie began late.',               neg: "The concert didn't begin on time.",        q: 'Did the class begin at 9?' },
  break:      { aff: 'He broke the window.',                neg: "He didn't break the rules.",               q: 'Did she break her arm?' },
  bring:      { aff: 'She brought her umbrella.',           neg: "She didn't bring her phone.",              q: 'Did they bring food?' },
  build:      { aff: 'They built a new house.',             neg: "They didn't build the fence.",             q: 'Did he build the shed?' },
  buy:        { aff: 'She bought a new laptop.',            neg: "She didn't buy the expensive one.",        q: 'Did you buy tickets?' },
  can:        { aff: 'She could swim at age five.',         neg: "She couldn't ride a bike.",                q: "Couldn't he finish in time?" },
  catch:      { aff: 'He caught the ball.',                 neg: "He didn't catch the bus.",                 q: 'Did they catch a fish?' },
  choose:     { aff: 'She chose the blue dress.',           neg: "She didn't choose the expensive option.",  q: 'Did you choose a topic?' },
  come:       { aff: 'She came home late.',                 neg: "She didn't come to the party.",            q: 'Did he come to the meeting?' },
  cost:       { aff: 'The car cost a lot.',                 neg: "The dinner didn't cost much.",             q: 'Did it cost more than $50?' },
  cut:        { aff: 'She cut her finger.',                 neg: "She didn't cut the cake yet.",             q: 'Did he cut the grass?' },
  do:         { aff: 'She did her homework.',               neg: "She didn't do the dishes.",                q: 'Did you do the assignment?' },
  draw:       { aff: 'He drew a map.',                      neg: "He didn't draw the curtains.",             q: 'Did she draw the portrait?' },
  drink:      { aff: 'He drank too much coffee.',           neg: "He didn't drink the juice.",               q: 'Did they drink water?' },
  drive:      { aff: 'She drove to the airport.',           neg: "She didn't drive home that night.",        q: 'Did he drive the new car?' },
  eat:        { aff: 'She ate breakfast early.',            neg: "She didn't eat lunch today.",              q: 'Did they eat at the restaurant?' },
  fall:       { aff: 'She fell off her bike.',              neg: "She didn't fall asleep early.",            q: 'Did he fall during the hike?' },
  feel:       { aff: 'She felt sick after eating.',         neg: "She didn't feel nervous.",                 q: 'Did you feel cold?' },
  find:       { aff: 'She found her keys.',                 neg: "She didn't find the answer easily.",       q: 'Did he find a new job?' },
  fly:        { aff: 'She flew to Paris.',                  neg: "She didn't fly business class.",           q: 'Did they fly direct?' },
  forget:     { aff: 'She forgot her password.',            neg: "She didn't forget the anniversary.",       q: 'Did he forget to call?' },
  get:        { aff: 'She got a promotion.',                neg: "She didn't get the job at first.",         q: 'Did you get my message?' },
  give:       { aff: 'She gave a great speech.',            neg: "She didn't give up.",                      q: 'Did they give you homework?' },
  go:         { aff: 'She went to the cinema.',             neg: "She didn't go to the gym.",                q: 'Did he go to the party?' },
  grow:       { aff: 'She grew tomatoes.',                  neg: "She didn't grow up in the city.",          q: 'Did he grow a beard?' },
  have:       { aff: 'She had a great time.',               neg: "She didn't have breakfast.",               q: 'Did they have a meeting?' },
  hear:       { aff: 'She heard a strange noise.',          neg: "She didn't hear the alarm.",               q: 'Did you hear the news?' },
  hit:        { aff: 'She hit the target.',                 neg: "She didn't hit the ball hard.",            q: 'Did he hit a new record?' },
  keep:       { aff: 'She kept a journal.',                 neg: "She didn't keep her promise.",             q: 'Did they keep the receipt?' },
  know:       { aff: 'She knew the answer.',                neg: "She didn't know the way.",                 q: 'Did he know the truth?' },
  leave:      { aff: 'She left her phone at home.',         neg: "She didn't leave early.",                  q: 'Did they leave on time?' },
  lend:       { aff: 'She lent her car to her brother.',    neg: "She didn't lend money to anyone.",         q: 'Did he lend you an umbrella?' },
  lie:        { aff: 'The cat lay on the rug.',             neg: "The cat didn't lie on the sofa.",          q: 'Did she lie on the beach?' },
  lose:       { aff: 'She lost her keys.',                  neg: "She didn't lose the match.",               q: 'Did they lose the game?' },
  make:       { aff: 'She made a cake.',                    neg: "She didn't make a mistake.",               q: 'Did he make the decision?' },
  mean:       { aff: 'She meant to call.',                  neg: "She didn't mean to be rude.",              q: 'Did it mean a lot to her?' },
  meet:       { aff: 'She met her husband at a cafe.',      neg: "She didn't meet the deadline.",            q: 'Did you meet the new team?' },
  pay:        { aff: 'She paid for dinner.',                neg: "She didn't pay the full price.",           q: 'Did he pay in cash?' },
  put:        { aff: 'She put the keys on the table.',      neg: "She didn't put the milk back.",            q: 'Did they put up the decorations?' },
  read:       { aff: 'She read the whole book.',            neg: "She didn't read the instructions.",        q: 'Did you read the email?' },
  ride:       { aff: 'She rode her bike to work.',          neg: "She didn't ride the subway.",              q: 'Did he ride a horse?' },
  ring:       { aff: 'The bell rang at noon.',              neg: "The alarm didn't ring on time.",           q: 'Did your phone ring?' },
  run:        { aff: 'She ran a marathon.',                 neg: "She didn't run this morning.",             q: 'Did they run out of time?' },
  say:        { aff: 'She said thank you.',                 neg: "She didn't say anything.",                 q: 'Did he say goodbye?' },
  see:        { aff: 'She saw a shooting star.',            neg: "She didn't see the movie.",                q: 'Did you see the match?' },
  sell:       { aff: 'She sold her old car.',               neg: "She didn't sell the house.",               q: 'Did they sell all the tickets?' },
  send:       { aff: 'She sent an email.',                  neg: "She didn't send the package.",             q: 'Did he send the report?' },
  show:       { aff: 'She showed us the photos.',           neg: "She didn't show her ID.",                  q: 'Did they show the film?' },
  sing:       { aff: 'She sang at the talent show.',        neg: "She didn't sing karaoke.",                 q: 'Did he sing at the wedding?' },
  sit:        { aff: 'She sat in the front row.',           neg: "She didn't sit next to him.",              q: 'Did they sit together?' },
  sleep:      { aff: 'She slept through her alarm.',        neg: "She didn't sleep well.",                   q: 'Did you sleep on the flight?' },
  speak:      { aff: 'She spoke to the manager.',          neg: "She didn't speak at the meeting.",         q: 'Did he speak at the conference?' },
  spend:      { aff: 'She spent the weekend at the beach.', neg: "She didn't spend too much.",              q: 'Did they spend time together?' },
  stand:      { aff: 'She stood in line for two hours.',   neg: "She didn't stand up for herself.",         q: 'Did he stand on the podium?' },
  swim:       { aff: 'She swam across the lake.',          neg: "She didn't swim in the ocean.",            q: 'Did they swim in the morning?' },
  take:       { aff: 'She took the wrong bus.',             neg: "She didn't take a taxi.",                  q: 'Did he take the exam?' },
  teach:      { aff: 'She taught English abroad.',          neg: "She didn't teach on Fridays.",             q: 'Did they teach the new method?' },
  tell:       { aff: 'She told a funny story.',             neg: "She didn't tell anyone the secret.",       q: 'Did he tell the truth?' },
  think:      { aff: 'She thought the movie was great.',   neg: "She didn't think it was a good idea.",     q: 'Did they think about it first?' },
  throw:      { aff: 'She threw the ball too hard.',        neg: "She didn't throw away the receipt.",       q: 'Did he throw the frisbee?' },
  understand: { aff: 'She understood the instructions.',   neg: "She didn't understand the question.",      q: 'Did you understand the lesson?' },
  wake:       { aff: 'She woke up before sunrise.',         neg: "She didn't wake up early enough.",         q: 'Did the alarm wake you up?' },
  wear:       { aff: 'She wore a red dress.',               neg: "She didn't wear a jacket.",                q: 'Did he wear a tie?' },
  win:        { aff: 'She won the championship.',           neg: "She didn't win the lottery.",              q: 'Did they win the match?' },
  write:      { aff: 'She wrote a poem.',                   neg: "She didn't write the report.",             q: 'Did he write the email?' },
};

const updated = verbos.map(v => ({ ...v, grammar_rules: rules[v.key] || null }));
fs.writeFileSync(path.join(DATA, 'verbos.json'), JSON.stringify(updated, null, 2), 'utf8');

const missing = updated.filter(v => !v.grammar_rules).map(v => v.key);
console.log('grammar_rules added to verbos.json');
if (missing.length) console.log('Missing rules for:', missing);
else console.log('All verbs have grammar_rules ✅');

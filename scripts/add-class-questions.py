import json

with open('data/questions.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

existing_keys = {g['key'] for g in questions}

new_groups = [
  {
    'key': 'colors_past',
    'base_form': 'colors',
    'questions': [
      {
        'question_number': 1,
        'type': 'wh_question',
        'scaffold': "What color {{ans_1}} the couch in Paula's living room?",
        'options': ['was', 'were', 'did', 'is'],
        'correct_answer': 'was',
        'rationale': "'The couch' es singular (it), por tanto usamos 'was' en el pasado."
      },
      {
        'question_number': 2,
        'type': 'affirmative_statement',
        'scaffold': 'The bedroom walls {{ans_1}} pink and green.',
        'options': ['was', 'were', 'is', 'be'],
        'correct_answer': 'were',
        'rationale': "'The bedroom walls' es plural, por tanto usamos 'were' en el pasado."
      },
      {
        'question_number': 3,
        'type': 'yes_no_question',
        'scaffold': '{{ans_1}} the phone white or black?',
        'options': ['Was', 'Were', 'Did', 'Is'],
        'correct_answer': 'Was',
        'rationale': "Pregunta yes/no para sujeto singular 'the phone' (it) → 'Was' al inicio."
      },
      {
        'question_number': 4,
        'type': 'wh_question',
        'scaffold': 'What color {{ans_1}} the living room walls?',
        'options': ['was', 'were', 'did', 'are'],
        'correct_answer': 'were',
        'rationale': "'The living room walls' es plural, por tanto la forma correcta es 'were'."
      },
      {
        'question_number': 5,
        'type': 'affirmative_statement',
        'scaffold': 'The old phone {{ans_1}} black, not white.',
        'options': ['was', 'were', 'is', 'be'],
        'correct_answer': 'was',
        'rationale': "'The old phone' es singular (it), usamos 'was' en el pasado afirmativo."
      },
      {
        'question_number': 6,
        'type': 'yes_no_question',
        'scaffold': '{{ans_1}} the walls orange in the living room?',
        'options': ['Was', 'Were', 'Did', 'Are'],
        'correct_answer': 'Were',
        'rationale': "'The walls' es plural, por tanto la pregunta empieza con 'Were'."
      },
      {
        'question_number': 7,
        'type': 'wh_question',
        'scaffold': 'What color {{ans_1}} the green phone in the kitchen?',
        'options': ['was', 'were', 'did', 'is'],
        'correct_answer': 'was',
        'rationale': "'The green phone' es singular (it), usamos 'was' en preguntas de informacion."
      },
      {
        'question_number': 8,
        'type': 'affirmative_statement',
        'scaffold': 'The car {{ans_1}} gray and really old.',
        'options': ['was', 'were', 'is', 'be'],
        'correct_answer': 'was',
        'rationale': "'The car' es singular (it), por tanto usamos 'was' en el pasado afirmativo."
      },
      {
        'question_number': 9,
        'type': 'yes_no_question',
        'scaffold': '{{ans_1}} the shoes brown?',
        'options': ['Was', 'Were', 'Did', 'Are'],
        'correct_answer': 'Were',
        'rationale': "'The shoes' es plural, por tanto la pregunta empieza con 'Were'."
      },
      {
        'question_number': 10,
        'type': 'wh_question',
        'scaffold': 'What color {{ans_1}} the walls in your childhood bedroom?',
        'options': ['was', 'were', 'did', 'are'],
        'correct_answer': 'were',
        'rationale': "'The walls' es plural → forma correcta 'were' en preguntas de informacion."
      },
      {
        'question_number': 11,
        'type': 'negative_statement',
        'scaffold': "The phone {{ans_1}} white — it was black.",
        'options': ["wasn't", "weren't", "didn't be", 'not was'],
        'correct_answer': "wasn't",
        'rationale': "Forma negativa del pasado de 'be' para singular (it) = 'wasn't'. Nunca 'didn't be'."
      },
      {
        'question_number': 12,
        'type': 'affirmative_statement',
        'scaffold': 'The kitchen chair {{ans_1}} yellow and very old.',
        'options': ['was', 'were', 'is', 'be'],
        'correct_answer': 'was',
        'rationale': "'The kitchen chair' es singular (it) → 'was' en el pasado afirmativo."
      },
      {
        'question_number': 13,
        'type': 'yes_no_question',
        'scaffold': '{{ans_1}} the sofa blue or green?',
        'options': ['Was', 'Were', 'Did', 'Is'],
        'correct_answer': 'Was',
        'rationale': "'The sofa' es singular (it) → pregunta empieza con 'Was'."
      },
      {
        'question_number': 14,
        'type': 'negative_statement',
        'scaffold': 'The bedroom walls {{ans_1}} white — they were pink and green!',
        'options': ["wasn't", "weren't", "didn't be", "aren't"],
        'correct_answer': "weren't",
        'rationale': "'The bedroom walls' es plural → forma negativa correcta es 'weren't'."
      },
      {
        'question_number': 15,
        'type': 'wh_question',
        'scaffold': 'What color {{ans_1}} the refrigerator in the kitchen?',
        'options': ['was', 'were', 'did', 'is'],
        'correct_answer': 'was',
        'rationale': "'The refrigerator' es singular (it) → 'was' en preguntas de informacion."
      },
      {
        'question_number': 16,
        'type': 'affirmative_statement',
        'scaffold': "My grandparents' house {{ans_1}} really colorful!",
        'options': ['was', 'were', 'is', 'be'],
        'correct_answer': 'was',
        'rationale': "'My grandparents' house' funciona como sujeto singular (it) → 'was'."
      },
      {
        'question_number': 17,
        'type': 'negative_question',
        'scaffold': '{{ans_1}} the walls white? No, they were orange!',
        'options': ["Wasn't", "Weren't", "Didn't", "Aren't"],
        'correct_answer': "Weren't",
        'rationale': "'The walls' es plural → pregunta negativa empieza con 'Weren't'."
      },
      {
        'question_number': 18,
        'type': 'affirmative_statement',
        'scaffold': 'The living room chairs {{ans_1}} brown and very comfortable.',
        'options': ['was', 'were', 'is', 'be'],
        'correct_answer': 'were',
        'rationale': "'The living room chairs' es plural → 'were' en el pasado afirmativo."
      },
      {
        'question_number': 19,
        'type': 'negative_statement',
        'scaffold': 'The phone {{ans_1}} big — it was actually small and cute.',
        'options': ["wasn't", "weren't", "didn't be", 'not was'],
        'correct_answer': "wasn't",
        'rationale': "'The phone' es singular → forma negativa 'wasn't'. Nunca 'didn't be'."
      },
      {
        'question_number': 20,
        'type': 'yes_no_question',
        'scaffold': '{{ans_1}} the old refrigerator white or gray?',
        'options': ['Was', 'Were', 'Did', 'Is'],
        'correct_answer': 'Was',
        'rationale': "'The old refrigerator' es singular (it) → pregunta empieza con 'Was'."
      }
    ]
  },
  {
    'key': 'adjectives_past',
    'base_form': 'adjectives',
    'questions': [
      {
        'question_number': 1,
        'type': 'affirmative_statement',
        'scaffold': 'The go-kart {{ans_1}} slow, but Mason loved it anyway.',
        'options': ['was', 'were', 'is', 'be'],
        'correct_answer': 'was',
        'rationale': "'The go-kart' es singular (it) → 'was' en el pasado con adjetivos."
      },
      {
        'question_number': 2,
        'type': 'affirmative_statement',
        'scaffold': "The yard at the grandparents' house {{ans_1}} beautiful.",
        'options': ['was', 'were', 'is', 'be'],
        'correct_answer': 'was',
        'rationale': "'The yard' es singular (it) → 'was' en el pasado afirmativo."
      },
      {
        'question_number': 3,
        'type': 'yes_no_question',
        'scaffold': '{{ans_1}} the kids noisy during the summer vacation?',
        'options': ['Was', 'Were', 'Did', 'Are'],
        'correct_answer': 'Were',
        'rationale': "'The kids' es plural → pregunta empieza con 'Were'."
      },
      {
        'question_number': 4,
        'type': 'affirmative_statement',
        'scaffold': 'The summer vacation {{ans_1}} really exciting!',
        'options': ['was', 'were', 'is', 'be'],
        'correct_answer': 'was',
        'rationale': "'The summer vacation' es singular (it) → 'was' en el pasado afirmativo."
      },
      {
        'question_number': 5,
        'type': 'wh_question',
        'scaffold': 'How old {{ans_1}} Mason in the Flashback Friday photo?',
        'options': ['was', 'were', 'did', 'is'],
        'correct_answer': 'was',
        'rationale': "'Mason' es singular (he) → 'was' en preguntas de informacion sobre edad."
      },
      {
        'question_number': 6,
        'type': 'affirmative_statement',
        'scaffold': 'The dog {{ans_1}} cute but not very friendly.',
        'options': ['was', 'were', 'is', 'be'],
        'correct_answer': 'was',
        'rationale': "'The dog' es singular (it) → 'was' en el pasado afirmativo."
      },
      {
        'question_number': 7,
        'type': 'negative_statement',
        'scaffold': "The grandparents' yard {{ans_1}} awful — it was wonderful!",
        'options': ["wasn't", "weren't", "didn't be", 'not was'],
        'correct_answer': "wasn't",
        'rationale': "'The grandparents' yard' es singular → 'wasn't' en el pasado negativo."
      },
      {
        'question_number': 8,
        'type': 'affirmative_statement',
        'scaffold': 'The go-kart {{ans_1}} fast and exciting for an eight-year-old.',
        'options': ['was', 'were', 'is', 'be'],
        'correct_answer': 'was',
        'rationale': "'The go-kart' es singular (it) → 'was' en el pasado afirmativo."
      },
      {
        'question_number': 9,
        'type': 'yes_no_question',
        'scaffold': '{{ans_1}} the summer vacation noisy and exciting?',
        'options': ['Was', 'Were', 'Did', 'Is'],
        'correct_answer': 'Was',
        'rationale': "'The summer vacation' es singular (it) → pregunta empieza con 'Was'."
      },
      {
        'question_number': 10,
        'type': 'wh_question',
        'scaffold': 'Why {{ans_1}} the kids so noisy in the summer?',
        'options': ['was', 'were', 'did', 'are'],
        'correct_answer': 'were',
        'rationale': "'The kids' es plural → 'were' en preguntas de informacion."
      },
      {
        'question_number': 11,
        'type': 'negative_statement',
        'scaffold': 'The farm animals {{ans_1}} friendly — they were not like pets.',
        'options': ["wasn't", "weren't", "didn't be", 'not were'],
        'correct_answer': "weren't",
        'rationale': "'The farm animals' es plural → forma negativa 'weren't'."
      },
      {
        'question_number': 12,
        'type': 'affirmative_statement',
        'scaffold': 'The go-kart {{ans_1}} new in 2009, not old.',
        'options': ['was', 'were', 'is', 'be'],
        'correct_answer': 'was',
        'rationale': "'The go-kart' es singular (it) → 'was' en el pasado afirmativo."
      },
      {
        'question_number': 13,
        'type': 'yes_no_question',
        'scaffold': '{{ans_1}} Fluffy Duffy an old dog? No, he was young!',
        'options': ['Was', 'Were', 'Did', 'Is'],
        'correct_answer': 'Was',
        'rationale': "'Fluffy Duffy' es singular (he) → pregunta empieza con 'Was'."
      },
      {
        'question_number': 14,
        'type': 'affirmative_statement',
        'scaffold': 'The farm {{ans_1}} small, not big.',
        'options': ['was', 'were', 'is', 'be'],
        'correct_answer': 'was',
        'rationale': "'The farm' es singular (it) → 'was' en el pasado afirmativo."
      },
      {
        'question_number': 15,
        'type': 'wh_question',
        'scaffold': 'What {{ans_1}} the dog like? Was it friendly or noisy?',
        'options': ['was', 'were', 'did', 'is'],
        'correct_answer': 'was',
        'rationale': "'The dog' es singular (it) → 'was' en preguntas con 'What ... like?'"
      },
      {
        'question_number': 16,
        'type': 'negative_statement',
        'scaffold': "The dog's real name {{ans_1}} 'Fluffy Duffy' — it was Jake.",
        'options': ["wasn't", "weren't", "didn't be", 'not was'],
        'correct_answer': "wasn't",
        'rationale': "'The dog's real name' es singular → 'wasn't' en el pasado negativo."
      },
      {
        'question_number': 17,
        'type': 'affirmative_statement',
        'scaffold': 'Ethan {{ans_1}} seven years old at the time of the visit.',
        'options': ['was', 'were', 'is', 'be'],
        'correct_answer': 'was',
        'rationale': "'Ethan' es singular (he) → 'was' para expresar edad en el pasado."
      },
      {
        'question_number': 18,
        'type': 'yes_no_question',
        'scaffold': "{{ans_1}} the children quiet at the grandparents' farm?",
        'options': ['Was', 'Were', 'Did', 'Are'],
        'correct_answer': 'Were',
        'rationale': "'The children' es plural → pregunta empieza con 'Were'."
      },
      {
        'question_number': 19,
        'type': 'negative_question',
        'scaffold': '{{ans_1}} the go-kart fast when Mason was eight?',
        'options': ["Wasn't", "Weren't", "Didn't", "Isn't"],
        'correct_answer': "Wasn't",
        'rationale': "Pregunta negativa para singular (it) → 'Wasn't' al inicio."
      },
      {
        'question_number': 20,
        'type': 'affirmative_statement',
        'scaffold': 'Mason and his sister {{ans_1}} really noisy kids during the summer.',
        'options': ['was', 'were', 'is', 'be'],
        'correct_answer': 'were',
        'rationale': "'Mason and his sister' es plural (they) → 'were' en el pasado afirmativo."
      }
    ]
  },
  {
    'key': 'uncertainty',
    'base_form': 'uncertainty',
    'questions': [
      {
        'question_number': 1,
        'type': 'affirmative_statement',
        'scaffold': "A: Where was Kate Winslet born? B: I have no ___.",
        'options': ['idea', 'clue', 'time', 'plan'],
        'correct_answer': 'idea',
        'rationale': "La expresion fija en ingles para total incertidumbre es 'I have no idea.'"
      },
      {
        'question_number': 2,
        'type': 'affirmative_statement',
        'scaffold': "I'm not ___. Maybe it was 1997?",
        'options': ['sure', 'certain', 'ready', 'positive'],
        'correct_answer': 'sure',
        'rationale': "La expresion natural en ingles para incertidumbre es 'I'm not sure.'"
      },
      {
        'question_number': 3,
        'type': 'affirmative_statement',
        'scaffold': "Her name is Kate, I ___.",
        'options': ['think', 'know', 'say', 'believe'],
        'correct_answer': 'think',
        'rationale': "Para expresar incertidumbre leve se usa 'I think' al final de la oracion."
      },
      {
        'question_number': 4,
        'type': 'affirmative_statement',
        'scaffold': "___ it's Kate Hudson? No, she's American.",
        'options': ['Maybe', 'Sure', 'Of course', 'Definitely'],
        'correct_answer': 'Maybe',
        'rationale': "Para proponer algo con incertidumbre usamos 'Maybe' al inicio."
      },
      {
        'question_number': 5,
        'type': 'affirmative_statement',
        'scaffold': "Let me ___. Was she in Titanic?",
        'options': ['think', 'see', 'go', 'look'],
        'correct_answer': 'think',
        'rationale': "'Let me think' es la expresion para ganar tiempo antes de responder."
      },
      {
        'question_number': 6,
        'type': 'affirmative_statement',
        'scaffold': "Sorry, I'm not ___. Let me look it up.",
        'options': ['sure', 'ready', 'free', 'right'],
        'correct_answer': 'sure',
        'rationale': "'I'm not sure' expresa incertidumbre de forma natural y educada."
      },
      {
        'question_number': 7,
        'type': 'affirmative_statement',
        'scaffold': "A: How many movies was she in? B: I have no ___.",
        'options': ['idea', 'answer', 'clue', 'memory'],
        'correct_answer': 'idea',
        'rationale': "La expresion fija en ingles para desconocimiento total es 'I have no idea.'"
      },
      {
        'question_number': 8,
        'type': 'affirmative_statement',
        'scaffold': "___ she was at home. I'm not sure.",
        'options': ['I think', 'I know', 'I say', 'I see'],
        'correct_answer': 'I think',
        'rationale': "'I think' indica que es una suposicion, no algo seguro."
      },
      {
        'question_number': 9,
        'type': 'affirmative_statement',
        'scaffold': "Um, ___ it was in 1997. Let me check.",
        'options': ['maybe', 'sure', 'yes', 'no'],
        'correct_answer': 'maybe',
        'rationale': "En clase se uso 'maybe' como expresion de incertidumbre leve."
      },
      {
        'question_number': 10,
        'type': 'affirmative_statement',
        'scaffold': "I ___ know. Let me think.",
        'options': ["don't", 'not', 'no', 'never'],
        'correct_answer': "don't",
        'rationale': "'I don't know' = no se. La estructura correcta es con el auxiliar 'don't'."
      },
      {
        'question_number': 11,
        'type': 'affirmative_statement',
        'scaffold': "___, I have no idea. Why don't we look online?",
        'options': ['Sorry', 'Sure', 'Great', 'Fine'],
        'correct_answer': 'Sorry',
        'rationale': "'Sorry' es una forma natural de suavizar el hecho de no saber algo."
      },
      {
        'question_number': 12,
        'type': 'affirmative_statement',
        'scaffold': "Her first name is Kate, I ___.",
        'options': ['think', 'know', 'see', 'feel'],
        'correct_answer': 'think',
        'rationale': "'I think' al final de una oracion expresa incertidumbre leve."
      },
      {
        'question_number': 13,
        'type': 'affirmative_statement',
        'scaffold': "A: Where are the restrooms? B: Sorry, I'm not ___.",
        'options': ['sure', 'certain', 'positive', 'clear'],
        'correct_answer': 'sure',
        'rationale': "'I'm not sure' es la respuesta estandar del libro para incertidumbre educada."
      },
      {
        'question_number': 14,
        'type': 'affirmative_statement',
        'scaffold': "___ it was at my grandmother's house. Oh, yeah!",
        'options': ['Maybe', 'Perhaps', 'Probably', 'Definitely'],
        'correct_answer': 'Maybe',
        'rationale': "Se usa 'Maybe' para expresar incertidumbre; 'Oh, yeah!' cuando se recuerda algo."
      },
      {
        'question_number': 15,
        'type': 'affirmative_statement',
        'scaffold': "I ___ no idea where the keys are.",
        'options': ['have', 'get', 'find', 'know'],
        'correct_answer': 'have',
        'rationale': "La expresion es 'I have no idea.' El verbo correcto es 'have', no 'get' ni 'know'."
      },
      {
        'question_number': 16,
        'type': 'affirmative_statement',
        'scaffold': "Um, let me ___... I think it was in 1998.",
        'options': ['think', 'say', 'know', 'try'],
        'correct_answer': 'think',
        'rationale': "'Let me think' es la frase para pedir un momento antes de responder."
      },
      {
        'question_number': 17,
        'type': 'wh_question',
        'scaffold': "A: When {{ans_1}} the movie Titanic in theaters? B: I have no idea.",
        'options': ['was', 'were', 'did', 'is'],
        'correct_answer': 'was',
        'rationale': "'The movie' es singular (it) → 'was' en preguntas de informacion en pasado."
      },
      {
        'question_number': 18,
        'type': 'yes_no_question',
        'scaffold': "{{ans_1}} Mona at the concert yesterday? No, she was at home.",
        'options': ['Was', 'Were', 'Did', 'Is'],
        'correct_answer': 'Was',
        'rationale': "'Mona' es singular (she) → pregunta yes/no empieza con 'Was'."
      },
      {
        'question_number': 19,
        'type': 'affirmative_statement',
        'scaffold': "A: Is this the right bus? B: I ___ know. It's very slow!",
        'options': ["don't", 'not', 'no', 'never'],
        'correct_answer': "don't",
        'rationale': "'I don't know' es la expresion correcta para decir que no se sabe algo."
      },
      {
        'question_number': 20,
        'type': 'affirmative_statement',
        'scaffold': "___ it was in 2009. I'm not sure.",
        'options': ['Maybe', 'Sure', 'Of course', 'Definitely'],
        'correct_answer': 'Maybe',
        'rationale': "'Maybe' = quizas. Es la palabra del libro para expresar incertidumbre."
      }
    ]
  },
  {
    'key': 'some_any',
    'base_form': 'some / any',
    'questions': [
      {
        'question_number': 1,
        'type': 'yes_no_question',
        'scaffold': 'Did you have ___ dessert after dinner?',
        'options': ['any', 'some', 'the', 'a'],
        'correct_answer': 'any',
        'rationale': "En preguntas yes/no, usamos 'any' con sustantivos incontables o plurales."
      },
      {
        'question_number': 2,
        'type': 'affirmative_statement',
        'scaffold': 'I had ___ soup for dinner last night.',
        'options': ['some', 'any', 'the', 'a'],
        'correct_answer': 'some',
        'rationale': "En oraciones afirmativas usamos 'some' con sustantivos incontables."
      },
      {
        'question_number': 3,
        'type': 'negative_statement',
        'scaffold': "We didn't have ___ ice cream for dessert.",
        'options': ['any', 'some', 'the', 'a'],
        'correct_answer': 'any',
        'rationale': "En oraciones negativas con 'didn't', usamos 'any', no 'some'."
      },
      {
        'question_number': 4,
        'type': 'affirmative_statement',
        'scaffold': 'Can I have ___ bread, please?',
        'options': ['some', 'any', 'a', 'the'],
        'correct_answer': 'some',
        'rationale': "En pedidos y ofertas educadas ('Can I have...'), usamos 'some', no 'any'."
      },
      {
        'question_number': 5,
        'type': 'yes_no_question',
        'scaffold': 'Did they eat ___ vegetables with the steak?',
        'options': ['any', 'some', 'the', 'a'],
        'correct_answer': 'any',
        'rationale': "En preguntas yes/no, usamos 'any' con sustantivos contables en plural."
      },
      {
        'question_number': 6,
        'type': 'negative_statement',
        'scaffold': "I didn't have ___ juice — just water.",
        'options': ['any', 'some', 'the', 'a'],
        'correct_answer': 'any',
        'rationale': "En oraciones negativas con 'didn't', usamos 'any', no 'some'."
      },
      {
        'question_number': 7,
        'type': 'affirmative_statement',
        'scaffold': 'Would you like ___ potatoes with your steak?',
        'options': ['some', 'any', 'the', 'a'],
        'correct_answer': 'some',
        'rationale': "En ofertas ('Would you like...'), usamos 'some', no 'any'."
      },
      {
        'question_number': 8,
        'type': 'yes_no_question',
        'scaffold': 'Did Jackie drink ___ apple juice?',
        'options': ['any', 'some', 'the', 'a'],
        'correct_answer': 'any',
        'rationale': "En preguntas yes/no usamos 'any' con sustantivos incontables."
      },
      {
        'question_number': 9,
        'type': 'affirmative_statement',
        'scaffold': 'Tyler had ___ crackers and a banana on the bus.',
        'options': ['some', 'any', 'the', 'a'],
        'correct_answer': 'some',
        'rationale': "En oraciones afirmativas usamos 'some' para indicar cantidad indefinida."
      },
      {
        'question_number': 10,
        'type': 'negative_statement',
        'scaffold': "There wasn't ___ meat on the menu.",
        'options': ['any', 'some', 'the', 'a'],
        'correct_answer': 'any',
        'rationale': "En oraciones negativas (wasn't) usamos 'any'."
      },
      {
        'question_number': 11,
        'type': 'negative_statement',
        'scaffold': "She didn't buy ___ food at the supermarket.",
        'options': ['any', 'some', 'the', 'a'],
        'correct_answer': 'any',
        'rationale': "Despues de 'didn't' en negaciones, usamos 'any', no 'some'."
      },
      {
        'question_number': 12,
        'type': 'affirmative_statement',
        'scaffold': 'Can I have ___ water, please?',
        'options': ['some', 'any', 'the', 'a'],
        'correct_answer': 'some',
        'rationale': "En pedidos educados ('Can I have...'), usamos 'some', no 'any'."
      },
      {
        'question_number': 13,
        'type': 'yes_no_question',
        'scaffold': 'Did Yoo-ri have ___ apple juice? No, she had a soda.',
        'options': ['any', 'some', 'the', 'a'],
        'correct_answer': 'any',
        'rationale': "En preguntas yes/no con 'did', usamos 'any'."
      },
      {
        'question_number': 14,
        'type': 'affirmative_statement',
        'scaffold': 'We had ___ green beans with the steak.',
        'options': ['some', 'any', 'the', 'a'],
        'correct_answer': 'some',
        'rationale': "En oraciones afirmativas usamos 'some' con sustantivos contables en plural."
      },
      {
        'question_number': 15,
        'type': 'negative_statement',
        'scaffold': "They didn't drink ___ coffee after dinner.",
        'options': ['any', 'some', 'the', 'a'],
        'correct_answer': 'any',
        'rationale': "En negaciones con 'didn't', usamos 'any', no 'some'."
      },
      {
        'question_number': 16,
        'type': 'affirmative_statement',
        'scaffold': 'Would you like ___ more dessert?',
        'options': ['some', 'any', 'the', 'a'],
        'correct_answer': 'some',
        'rationale': "En ofertas ('Would you like...'), siempre usamos 'some'."
      },
      {
        'question_number': 17,
        'type': 'affirmative_statement',
        'scaffold': 'He bought ___ sandwiches at the bus station.',
        'options': ['some', 'any', 'the', 'a'],
        'correct_answer': 'some',
        'rationale': "En oraciones afirmativas usamos 'some' para indicar cantidad indefinida."
      },
      {
        'question_number': 18,
        'type': 'yes_no_question',
        'scaffold': 'Did you have ___ vegetables for dinner?',
        'options': ['any', 'some', 'the', 'a'],
        'correct_answer': 'any',
        'rationale': "En preguntas yes/no con 'did', usamos 'any', no 'some'."
      },
      {
        'question_number': 19,
        'type': 'affirmative_statement',
        'scaffold': "I'll have ___ chicken and rice, please.",
        'options': ['some', 'any', 'the', 'a'],
        'correct_answer': 'some',
        'rationale': "Al pedir comida en un restaurante ('I'll have...'), usamos 'some'."
      },
      {
        'question_number': 20,
        'type': 'yes_no_question',
        'scaffold': 'Did the restaurant have ___ vegetarian options?',
        'options': ['any', 'some', 'the', 'a'],
        'correct_answer': 'any',
        'rationale': "En preguntas yes/no usamos 'any', especialmente cuando no sabemos la respuesta."
      }
    ]
  }
]

added = 0
for group in new_groups:
    if group['key'] not in existing_keys:
        questions.append(group)
        added += 1
        print(f"  + Added: {group['key']} ({len(group['questions'])} questions)")
    else:
        print(f"  ~ Already exists: {group['key']}")

with open('data/questions.json', 'w', encoding='utf-8') as f:
    json.dump(questions, f, ensure_ascii=False, indent=4)

print(f'\nDone. {added} new groups added. Total groups: {len(questions)}')
total_q = sum(len(g['questions']) for g in questions)
print(f'Total questions across all groups: {total_q}')

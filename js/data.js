/*
 * Course content for Polski Path.
 *
 * Word:      { pl: "woda" | ["woda", ...], en: ["water", ...], e: "💧" }
 * Sentence:  { pl: "..." | [...], en: [...] }
 * The first entry in each list is the "main" answer shown to the learner;
 * the rest are also accepted. English checking ignores a/an/the,
 * punctuation, case and common contractions (I'm = I am, etc.).
 */
window.COURSE = (function () {
  const thisIs = (x) => [`This is ${x}.`, `That is ${x}.`, `It is ${x}.`];

  const units = [
    {
      title: 'Greetings',
      desc: 'Say hello, goodbye and thank you',
      color: '#dc143c',
      tips: [
        {
          h: 'Formal vs. informal',
          p: '<b>Cześć</b> is casual and works for both "hi" and "bye" with friends. With strangers, shop staff or older people use <b>Dzień dobry</b> (during the day) or <b>Dobry wieczór</b> (in the evening).',
          ex: [['Cześć!', 'Hi! / Bye!'], ['Dzień dobry!', 'Good morning! / Hello!'], ['Do widzenia!', 'Goodbye!']],
        },
        {
          h: 'Pronunciation basics',
          p: 'Stress is almost always on the <b>second-to-last syllable</b>. <b>ł</b> sounds like English "w", and <b>w</b> sounds like "v". <b>cz</b> = "ch", <b>sz</b> = "sh", and <b>ć / ś / ź</b> are softer versions of ch / sh / zh. <b>ą</b> and <b>ę</b> are nasal vowels.',
          ex: [['dziękuję', 'thank you'], ['przepraszam', 'sorry']],
        },
        {
          h: 'One word, many jobs',
          p: '<b>Proszę</b> means "please", but it is also "you\'re welcome" and "here you go" when handing something over.',
          ex: [['Dziękuję! — Proszę!', 'Thank you! — You\'re welcome!']],
        },
      ],
      lessons: [
        {
          title: 'Hello!',
          words: [
            { pl: 'cześć', en: ['hi', 'hello', 'bye'], e: '👋' },
            { pl: 'dzień dobry', en: ['good morning', 'hello', 'good afternoon', 'good day'], e: '☀️' },
            { pl: 'dobry wieczór', en: ['good evening'], e: '🌆' },
            { pl: 'do widzenia', en: ['goodbye', 'bye'], e: '🚪' },
            { pl: 'dobranoc', en: ['good night'], e: '😴' },
          ],
          sentences: [
            { pl: 'Cześć, Anna!', en: ['Hi, Anna!', 'Hello, Anna!', 'Bye, Anna!'] },
            { pl: 'Cześć, Marek!', en: ['Hi, Marek!', 'Hello, Marek!', 'Bye, Marek!'] },
            { pl: 'Dzień dobry i do widzenia.', en: ['Good morning and goodbye.', 'Hello and goodbye.', 'Good afternoon and goodbye.'] },
            { pl: 'Dobry wieczór i dobranoc.', en: ['Good evening and good night.'] },
          ],
        },
        {
          title: 'Polite words',
          words: [
            { pl: 'tak', en: ['yes'], e: '✅' },
            { pl: 'nie', en: ['no', 'not'], e: '❌' },
            { pl: 'dziękuję', en: ['thank you', 'thanks'], e: '🙏' },
            { pl: 'proszę', en: ['please', "you're welcome", 'here you go'], e: '🤲' },
            { pl: 'przepraszam', en: ['sorry', 'excuse me', "I'm sorry"], e: '😅' },
          ],
          sentences: [
            { pl: 'Tak, dziękuję.', en: ['Yes, thank you.', 'Yes, thanks.'] },
            { pl: 'Nie, dziękuję.', en: ['No, thank you.', 'No, thanks.'] },
            { pl: 'Dziękuję bardzo!', en: ['Thank you very much!', 'Thanks a lot!', 'Thank you so much!', 'Thanks very much!'] },
            { pl: 'Bardzo przepraszam!', en: ["I'm very sorry!", "I'm so sorry!", 'Very sorry!'] },
            { pl: 'Tak, proszę.', en: ['Yes, please.'] },
          ],
        },
      ],
    },

    {
      title: 'People',
      desc: 'Talk about who is who',
      color: '#2e86de',
      tips: [
        {
          h: 'No "a" or "the"',
          p: 'Polish has no articles. <b>kobieta</b> can mean "woman", "a woman" or "the woman" — context decides.',
          ex: [['To jest kobieta.', 'This is a woman.']],
        },
        {
          h: 'To be: być',
          p: 'The verb "to be" changes with the person: <b>ja jestem</b> (I am), <b>ty jesteś</b> (you are), <b>on / ona jest</b> (he / she is). Because the verb shows who is talking, the pronoun is often dropped: <b>Jestem tutaj</b> = "I am here".',
          ex: [['Jestem tutaj.', 'I am here.'], ['Ona jest tam.', 'She is there.']],
        },
        {
          h: '"To jest" — this is',
          p: '<b>To jest…</b> is the easiest way to point something out: "This is… / That is… / It is…".',
          ex: [['Kto to jest?', 'Who is this?']],
        },
      ],
      lessons: [
        {
          title: 'Who is it?',
          words: [
            { pl: 'mężczyzna', en: ['man'], e: '👨' },
            { pl: 'kobieta', en: ['woman'], e: '👩' },
            { pl: 'chłopiec', en: ['boy'], e: '👦' },
            { pl: 'dziewczynka', en: ['girl', 'little girl'], e: '👧' },
            { pl: 'dziecko', en: ['child', 'kid'], e: '🧒' },
          ],
          sentences: [
            { pl: 'To jest kobieta.', en: thisIs('a woman') },
            { pl: 'To jest chłopiec.', en: thisIs('a boy') },
            { pl: 'To jest dziecko.', en: thisIs('a child').concat(thisIs('a kid')) },
            { pl: 'Mężczyzna i kobieta.', en: ['A man and a woman.'] },
            { pl: 'Dziewczynka i chłopiec.', en: ['A girl and a boy.'] },
          ],
        },
        {
          title: 'I am, you are',
          words: [
            { pl: 'ja', en: ['I'], e: '🙋' },
            { pl: 'ty', en: ['you'], e: '🫵' },
            { pl: 'on', en: ['he'], e: '🧔' },
            { pl: 'ona', en: ['she'], e: '👩‍🦰' },
            { pl: 'jestem', en: ['I am', 'am'], e: '🧍' },
            { pl: 'tutaj', en: ['here'], e: '📍' },
          ],
          sentences: [
            { pl: ['Jestem tutaj.', 'Ja jestem tutaj.'], en: ['I am here.'] },
            { pl: 'Ona jest tutaj.', en: ['She is here.'] },
            { pl: 'On jest tam.', en: ['He is there.'] },
            { pl: 'Jesteś tutaj?', en: ['Are you here?'] },
            { pl: 'Kto to jest?', en: ['Who is this?', 'Who is that?', 'Who is it?'] },
          ],
        },
      ],
    },

    {
      title: 'Food & Drink',
      desc: 'Order coffee and talk about meals',
      color: '#e67e22',
      tips: [
        {
          h: 'Endings change after "I eat / I drink"',
          p: 'The thing you eat or drink takes the <b>accusative case</b>. For feminine words ending in <b>-a</b>, the ending becomes <b>-ę</b>. Masculine things and neuter words stay the same.',
          ex: [['woda → Piję wodę.', 'water → I drink water.'], ['kawa → Piję kawę.', 'coffee → I drink coffee.'], ['chleb → Jem chleb.', 'bread → I eat bread.']],
        },
        {
          h: '"z" = with',
          p: 'After <b>z</b> ("with"), nouns take the <b>instrumental case</b>: <b>mleko → z mlekiem</b>.',
          ex: [['Kawa z mlekiem.', 'Coffee with milk.']],
        },
        {
          h: 'I / he / she',
          p: '<b>jem</b> (I eat) → <b>je</b> (he/she eats). <b>piję</b> (I drink) → <b>pije</b> (he/she drinks). Polish has one present tense, so <b>jem</b> covers both "I eat" and "I am eating".',
          ex: [['Ona je zupę.', 'She eats soup.']],
        },
      ],
      lessons: [
        {
          title: 'Drinks & bread',
          words: [
            { pl: 'woda', en: ['water'], e: '💧' },
            { pl: 'chleb', en: ['bread'], e: '🍞' },
            { pl: 'kawa', en: ['coffee'], e: '☕' },
            { pl: 'herbata', en: ['tea'], e: '🍵' },
            { pl: 'mleko', en: ['milk'], e: '🥛' },
          ],
          sentences: [
            { pl: 'Woda i chleb.', en: ['Water and bread.'] },
            { pl: 'Kawa z mlekiem.', en: ['Coffee with milk.'] },
            { pl: 'Herbata, proszę.', en: ['Tea, please.', 'A tea, please.'] },
            { pl: 'Kawa czy herbata?', en: ['Coffee or tea?'] },
            { pl: 'Kawa jest tutaj.', en: ['The coffee is here.', 'Coffee is here.'] },
          ],
        },
        {
          title: 'Eating',
          words: [
            { pl: 'jabłko', en: ['apple'], e: '🍎' },
            { pl: 'ser', en: ['cheese'], e: '🧀' },
            { pl: 'zupa', en: ['soup'], e: '🍲' },
            { pl: 'jem', en: ['I eat', 'I am eating'], e: '🍽️' },
            { pl: 'piję', en: ['I drink', 'I am drinking'], e: '🥤' },
          ],
          sentences: [
            { pl: ['Jem jabłko.', 'Ja jem jabłko.'], en: ['I eat an apple.', 'I am eating an apple.'] },
            { pl: ['Piję wodę.', 'Ja piję wodę.'], en: ['I drink water.', 'I am drinking water.'] },
            { pl: ['Piję kawę z mlekiem.', 'Ja piję kawę z mlekiem.'], en: ['I drink coffee with milk.', 'I am drinking coffee with milk.'] },
            { pl: ['Jem chleb i ser.', 'Ja jem chleb i ser.'], en: ['I eat bread and cheese.', 'I am eating bread and cheese.'] },
            { pl: 'Ona je zupę.', en: ['She eats soup.', 'She is eating soup.', 'She eats the soup.'] },
            { pl: 'On pije herbatę.', en: ['He drinks tea.', 'He is drinking tea.'] },
          ],
        },
      ],
    },

    {
      title: 'Numbers',
      desc: 'Count from one to ten',
      color: '#8e44ad',
      tips: [
        {
          h: 'Numbers change the noun',
          p: 'After <b>2, 3, 4</b> a noun takes the normal plural (<b>dwa jabłka</b>). From <b>5</b> upward it takes the genitive plural (<b>pięć jabłek</b>). It looks odd at first and becomes automatic with practice.',
          ex: [['dwa jabłka', 'two apples'], ['pięć jabłek', 'five apples']],
        },
        {
          h: 'One has three genders',
          p: '<b>jeden</b> (masculine), <b>jedna</b> (feminine), <b>jedno</b> (neuter): <b>jeden chleb, jedna kawa, jedno jabłko</b>.',
          ex: [['Jedna herbata, proszę.', 'One tea, please.']],
        },
        {
          h: 'Telling your age',
          p: 'Polish says "I have ... years": <b>Mam dziesięć lat</b> = "I am ten years old".',
          ex: [['Mam osiem lat.', 'I am eight years old.']],
        },
      ],
      lessons: [
        {
          title: 'One to five',
          words: [
            { pl: 'jeden', en: ['one'], e: '1️⃣' },
            { pl: 'dwa', en: ['two'], e: '2️⃣' },
            { pl: 'trzy', en: ['three'], e: '3️⃣' },
            { pl: 'cztery', en: ['four'], e: '4️⃣' },
            { pl: 'pięć', en: ['five'], e: '5️⃣' },
          ],
          sentences: [
            { pl: 'Dwa jabłka.', en: ['Two apples.'] },
            { pl: 'Trzy kawy, proszę.', en: ['Three coffees, please.'] },
            { pl: 'Jedna herbata, proszę.', en: ['One tea, please.'] },
            { pl: 'Cztery zupy.', en: ['Four soups.'] },
            { pl: 'Pięć jabłek.', en: ['Five apples.'] },
          ],
        },
        {
          title: 'Six to ten',
          words: [
            { pl: 'sześć', en: ['six'], e: '6️⃣' },
            { pl: 'siedem', en: ['seven'], e: '7️⃣' },
            { pl: 'osiem', en: ['eight'], e: '8️⃣' },
            { pl: 'dziewięć', en: ['nine'], e: '9️⃣' },
            { pl: 'dziesięć', en: ['ten'], e: '🔟' },
          ],
          sentences: [
            { pl: 'Mam dziesięć lat.', en: ['I am ten years old.', 'I am ten.'] },
            { pl: 'Mam osiem lat.', en: ['I am eight years old.', 'I am eight.'] },
            { pl: 'Mam siedem jabłek.', en: ['I have seven apples.'] },
            { pl: 'Dziewięć kaw, proszę.', en: ['Nine coffees, please.'] },
            { pl: 'Sześć i siedem.', en: ['Six and seven.'] },
          ],
        },
      ],
    },

    {
      title: 'Family',
      desc: 'Introduce the people you love',
      color: '#16a085',
      tips: [
        {
          h: 'Noun genders',
          p: 'Masculine nouns usually end in a consonant (<b>brat</b>), feminine nouns in <b>-a</b> (<b>siostra</b>) and neuter nouns in <b>-o</b> or <b>-e</b> (<b>dziecko</b>). Words for male people, like <b>tata</b>, are masculine even though they end in -a.',
          ex: [],
        },
        {
          h: 'My: mój / moja / moje',
          p: '"My" matches the noun: <b>mój brat</b>, <b>moja siostra</b>, <b>moje dziecko</b>. After a verb like <b>kocham</b> (I love), <b>moja</b> becomes <b>moją</b>.',
          ex: [['To jest moja mama.', 'This is my mom.'], ['Kocham moją rodzinę.', 'I love my family.']],
        },
        {
          h: '"I have a brother"',
          p: 'After <b>mam</b> (I have), masculine people add <b>-a</b> (<b>brat → brata</b>) and feminine <b>-a</b> becomes <b>-ę</b> (<b>siostra → siostrę</b>).',
          ex: [['Mam brata.', 'I have a brother.'], ['Mam siostrę.', 'I have a sister.']],
        },
      ],
      lessons: [
        {
          title: 'My family',
          words: [
            { pl: 'mama', en: ['mom', 'mother', 'mum'], e: '👩‍🍼' },
            { pl: 'tata', en: ['dad', 'father'], e: '👨‍🍼' },
            { pl: 'brat', en: ['brother'], e: '🧑‍🤝‍🧑' },
            { pl: 'siostra', en: ['sister'], e: '👭' },
            { pl: 'rodzina', en: ['family'], e: '👨‍👩‍👧' },
          ],
          sentences: [
            { pl: 'To jest moja mama.', en: thisIs('my mom').concat(thisIs('my mother'), thisIs('my mum')) },
            { pl: 'To jest mój brat.', en: thisIs('my brother') },
            { pl: 'Mam siostrę.', en: ['I have a sister.'] },
            { pl: 'Mam brata.', en: ['I have a brother.'] },
            { pl: 'Tata pije kawę.', en: ['Dad drinks coffee.', 'Dad is drinking coffee.', 'Father drinks coffee.', 'Father is drinking coffee.'] },
            { pl: 'Moja rodzina.', en: ['My family.'] },
          ],
        },
        {
          title: 'Grandparents & kids',
          words: [
            { pl: 'babcia', en: ['grandma', 'grandmother', 'granny'], e: '👵' },
            { pl: 'dziadek', en: ['grandpa', 'grandfather'], e: '👴' },
            { pl: 'syn', en: ['son'], e: '👶' },
            { pl: 'córka', en: ['daughter'], e: '🎀' },
            { pl: 'kocham', en: ['I love'], e: '❤️' },
          ],
          sentences: [
            { pl: 'Babcia i dziadek.', en: ['Grandma and grandpa.', 'Grandmother and grandfather.'] },
            { pl: 'Moja córka je zupę.', en: ['My daughter eats soup.', 'My daughter is eating soup.'] },
            { pl: 'Mój syn pije mleko.', en: ['My son drinks milk.', 'My son is drinking milk.'] },
            { pl: 'Kocham moją rodzinę.', en: ['I love my family.'] },
            { pl: 'Kocham babcię.', en: ['I love grandma.', 'I love my grandma.', 'I love grandmother.', 'I love my grandmother.'] },
          ],
        },
      ],
    },

    {
      title: 'Colors',
      desc: 'Describe things with color',
      color: '#c0392b',
      tips: [
        {
          h: 'Adjectives match their noun',
          p: 'Color words change their ending to match the gender of the noun: <b>-y / -i</b> for masculine, <b>-a</b> for feminine, <b>-e</b> for neuter.',
          ex: [['czerwony ser', 'red cheese'], ['czerwona kawa', 'red coffee'], ['czerwone jabłko', 'red apple']],
        },
        {
          h: 'The Polish flag',
          p: 'The flag of Poland is white on top and red below: <b>biało-czerwona</b>.',
          ex: [['Flaga jest biała i czerwona.', 'The flag is white and red.']],
        },
      ],
      lessons: [
        {
          title: 'Colors',
          words: [
            { pl: 'czerwony', en: ['red'], e: '🔴' },
            { pl: 'biały', en: ['white'], e: '⚪' },
            { pl: 'niebieski', en: ['blue'], e: '🔵' },
            { pl: 'zielony', en: ['green'], e: '🟢' },
            { pl: 'żółty', en: ['yellow'], e: '🟡' },
            { pl: 'czarny', en: ['black'], e: '⚫' },
          ],
          sentences: [
            { pl: 'Czerwone jabłko.', en: ['A red apple.'] },
            { pl: 'Biały ser.', en: ['White cheese.'] },
            { pl: 'Czarna kawa.', en: ['Black coffee.'] },
            { pl: 'Zielona herbata.', en: ['Green tea.'] },
            { pl: 'Flaga jest biała i czerwona.', en: ['The flag is white and red.'] },
            { pl: 'Jabłko jest zielone.', en: ['The apple is green.'] },
          ],
        },
      ],
    },

    {
      title: 'Conversation',
      desc: 'Small talk and finding your way',
      color: '#3b5bdb',
      tips: [
        {
          h: 'Introducing yourself',
          p: '<b>Mam na imię…</b> literally means "I have for a name…". It is the most common way to say "My name is…".',
          ex: [['Mam na imię Anna.', 'My name is Anna.']],
        },
        {
          h: 'Yes/no questions with "czy"',
          p: 'Put <b>czy</b> in front of a statement to turn it into a yes/no question. In speech it is often left out and the rising voice is enough.',
          ex: [['Czy mówisz po angielsku?', 'Do you speak English?']],
        },
        {
          h: 'Speaking a language',
          p: '"In Polish" is <b>po polsku</b> and "in English" is <b>po angielsku</b>.',
          ex: [['Mówię trochę po polsku.', 'I speak a little Polish.']],
        },
      ],
      lessons: [
        {
          title: 'How are you?',
          words: [
            { pl: 'dobrze', en: ['well', 'good', 'fine', 'ok'], e: '👍' },
            { pl: 'źle', en: ['badly', 'bad'], e: '👎' },
            { pl: 'imię', en: ['name', 'first name'], e: '🏷️' },
            { pl: 'rozumiem', en: ['I understand'], e: '💡' },
            { pl: 'mówię', en: ['I speak', 'I say'], e: '🗣️' },
          ],
          sentences: [
            { pl: 'Jak się masz?', en: ['How are you?'] },
            { pl: 'Dobrze, dziękuję.', en: ['Good, thank you.', 'Fine, thank you.', 'Well, thank you.', 'Good, thanks.', 'Fine, thanks.', 'I am fine, thank you.', 'I am good, thank you.', 'I am well, thank you.', 'I am fine, thanks.', 'I am good, thanks.'] },
            { pl: 'Mam na imię Anna.', en: ['My name is Anna.'] },
            { pl: 'Nie rozumiem.', en: ['I do not understand.'] },
            { pl: 'Mówię trochę po polsku.', en: ['I speak a little Polish.', 'I speak some Polish.', 'I speak a bit of Polish.'] },
            { pl: ['Czy mówisz po angielsku?', 'Mówisz po angielsku?'], en: ['Do you speak English?'] },
          ],
        },
        {
          title: 'Getting around',
          words: [
            { pl: 'dom', en: ['house', 'home'], e: '🏠' },
            { pl: 'sklep', en: ['shop', 'store'], e: '🏪' },
            { pl: 'dworzec', en: ['station', 'train station'], e: '🚉' },
            { pl: 'hotel', en: ['hotel'], e: '🏨' },
            { pl: 'toaleta', en: ['toilet', 'bathroom', 'restroom'], e: '🚻' },
            { pl: 'gdzie', en: ['where'], e: '🧭' },
          ],
          sentences: [
            { pl: 'Gdzie jest toaleta?', en: ['Where is the toilet?', 'Where is the bathroom?', 'Where is the restroom?'] },
            { pl: 'Gdzie jest hotel?', en: ['Where is the hotel?'] },
            { pl: 'Gdzie jest dworzec?', en: ['Where is the station?', 'Where is the train station?'] },
            { pl: 'Sklep jest tam.', en: ['The shop is there.', 'The store is there.', 'The shop is over there.', 'The store is over there.'] },
            { pl: 'Idę do domu.', en: ['I am going home.', 'I go home.'] },
          ],
        },
      ],
    },
  ];

  // Hover hints for words that appear in sentences in inflected forms.
  // (Base words from the lessons are added automatically.)
  const hints = {
    i: 'and', z: 'with', czy: 'or / (question word)', to: 'this / it', jest: 'is', bardzo: 'very / very much',
    tam: 'there', jesteś: 'you are', kto: 'who', jak: 'how', się: 'oneself', masz: 'you have', mam: 'I have',
    na: 'on / for', po: 'in (a language)', polsku: 'Polish', angielsku: 'English', mówisz: 'you speak',
    trochę: 'a little', idę: "I go / I'm going", do: 'to', domu: 'home', wodę: 'water', kawę: 'coffee',
    herbatę: 'tea', zupę: 'soup', mlekiem: 'milk', je: 'eats', pije: 'drinks', jabłka: 'apples',
    jabłek: 'apples', kawy: 'coffees', kaw: 'coffees', zupy: 'soups', jedna: 'one', lat: 'years',
    moja: 'my', mój: 'my', moją: 'my', siostrę: 'sister', brata: 'brother', babcię: 'grandma',
    rodzinę: 'family', czerwone: 'red', czarna: 'black', zielona: 'green', zielone: 'green',
    biała: 'white', czerwona: 'red', flaga: 'flag', dzień: 'day', dobry: 'good', wieczór: 'evening',
    widzenia: 'seeing (goodbye)', anna: 'Anna (a name)', marek: 'Marek (a name)',
  };

  return { units, hints };
})();

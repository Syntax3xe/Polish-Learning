# Polski Path

A free, browser-based game for learning Polish from English, with short lessons, hearts, XP and daily streaks.

**Play it:** https://YOUR-USERNAME.github.io/polish-learning/

## Features

- 7 units and 13 lessons: greetings, people, food & drink, numbers, family, colors and conversation
- Exercise types: picture cards, multiple choice, typing, listening, matching pairs and word-tile sentence building
- Lenient checking: missing Polish accents and small typos are accepted with a note
- Polish audio through the browser's built-in speech voice
- A guidebook of grammar tips for each unit
- Progress is saved in the browser (localStorage)

## Run locally

No build step is needed. Open `index.html` in a browser.

## Adding content

All lessons live in [`js/data.js`](js/data.js). To add a lesson, add an object like this to a unit's `lessons` array:

```js
{
  title: 'My lesson',
  words: [{ pl: 'kot', en: ['cat'], e: '🐱' }],
  sentences: [{ pl: 'To jest kot.', en: ['This is a cat.'] }],
}
```

The first entry in each answer list is the one shown to the learner. The other entries are also accepted as correct.

import books from '../../js/peshitta.js';
import { toEasternSyriac } from '../../js/cal-syriac.js';

const BOOK_NUMBER = 1;
const SUPPORTED_CHAPTERS = 12;
const CHECKPOINT_SIZE = 5;
const LESSON_PASS_SCORE = 60;
const CHECKPOINT_PASS_SCORE = 75;
const DAILY_GOAL = 120;
const LEVEL_SIZE = 500;
const book = books[BOOK_NUMBER];
const bookName = books[0][1];
const params = new URLSearchParams(window.location.search);
const chapterNumber = Number.parseInt(params.get('chapter') || '1', 10);
const chapterData = book && book[chapterNumber];

const dom = {
  backLink: document.getElementById('backLink'),
  chapterSelect: document.getElementById('chapterSelect'),
  chapterTitle: document.getElementById('chapterTitle'),
  chapterSubtitle: document.getElementById('chapterSubtitle'),
  chapterProgress: document.getElementById('chapterProgress'),
  chapterProgressBar: document.getElementById('chapterProgressBar'),
  dailyProgressBar: document.getElementById('dailyProgressBar'),
  dailyProgressText: document.getElementById('dailyProgressText'),
  xpTotal: document.getElementById('xpTotal'),
  streakTotal: document.getElementById('streakTotal'),
  levelTotal: document.getElementById('levelTotal'),
  learningPath: document.getElementById('learningPath'),
  screen: document.getElementById('screen'),
  loadingState: document.getElementById('loadingState'),
  masteryTotal: document.getElementById('masteryTotal'),
  starsTotal: document.getElementById('starsTotal'),
  accuracyTotal: document.getElementById('accuracyTotal'),
  nextReview: document.getElementById('nextReview'),
  badgeShelf: document.getElementById('badgeShelf'),
  resetProgress: document.getElementById('resetProgress'),
  celebration: document.getElementById('celebration')
};

let verses = [];
let nodes = [];
let progress = null;
let profile = null;
let activeNode = null;
let view = 'launch';
let session = null;
let result = null;
let sound = null;
let soundVerse = 0;
let segmentEnd = null;
let animationFrame = 0;

const createElement = (tagName, className, text) => {
  const element = document.createElement(tagName);
  if (className) {
    element.className = className;
  }
  if (text !== undefined) {
    element.textContent = text;
  }
  return element;
};

const createButton = (className, text, handler) => {
  const button = createElement('button', className, text);
  button.type = 'button';
  if (handler) {
    button.addEventListener('click', handler);
  }
  return button;
};

const pad = value => value.toString().padStart(2, '0');

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const shuffle = values => {
  const resultValues = [...values];
  for (let index = resultValues.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [resultValues[index], resultValues[swapIndex]] = [resultValues[swapIndex], resultValues[index]];
  }
  return resultValues;
};

const uniqueValues = values => [...new Set(values.filter(Boolean))];

const getChapterFile = number => `01_Mattai_${pad(number)}.html`;

const todayKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  return `${year}-${month}-${day}`;
};

const yesterdayKey = () => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return todayKey(date);
};

const isCue = cue => cue && Number.isFinite(cue.s) && Number.isFinite(cue.e);

const profileKey = 'aramlang:peshitta-path:profile:v2';

const progressKey = () => `aramlang:peshitta-path:${bookName}:${chapterNumber}:v2`;

const parseSaved = (key, fallback) => {
  try {
    return { ...fallback, ...JSON.parse(window.localStorage.getItem(key) || '{}') };
  } catch {
    return fallback;
  }
};

const loadProfile = () => {
  const fallback = {
    totalXp: 0,
    dailyXp: 0,
    dailyDate: todayKey(),
    streak: 0,
    lastPractice: '',
    playbackSpeed: 1
  };
  const saved = parseSaved(profileKey, fallback);
  if (saved.dailyDate !== todayKey()) {
    saved.dailyXp = 0;
    saved.dailyDate = todayKey();
  }
  return saved;
};

const loadProgress = () => parseSaved(progressKey(), {
  version: 2,
  chapterXp: 0,
  verses: {},
  checkpoints: {}
});

const saveProfile = () => {
  try {
    window.localStorage.setItem(profileKey, JSON.stringify(profile));
  } catch {
    return;
  }
};

const saveProgress = () => {
  try {
    window.localStorage.setItem(progressKey(), JSON.stringify(progress));
  } catch {
    return;
  }
};

const buildVerses = () => chapterData.slice(1).map((verse, index) => ({
  number: index + 1,
  translation: '',
  words: verse.slice(1).map((word, wordIndex) => ({
    index: wordIndex,
    cal: word.w,
    syriac: toEasternSyriac(word.w),
    cue: word.t,
    gloss: ''
  }))
}));

const hasCompleteCues = () => verses.length > 0 && verses.every(verse => (
  verse.words.length > 0 && verse.words.every(word => isCue(word.cue))
));

const loadGlosses = async () => {
  const response = await fetch(getChapterFile(chapterNumber));
  if (!response.ok) {
    throw new Error('The chapter text could not be loaded.');
  }
  const html = await response.text();
  const source = new DOMParser().parseFromString(html, 'text/html');
  source.querySelectorAll('main .verse').forEach((verseElement, verseIndex) => {
    const verse = verses[verseIndex];
    if (!verse) {
      return;
    }
    const glosses = [...verseElement.querySelectorAll('.eng')].map(element => (
      element.textContent.replace(/\s+/g, ' ').trim()
    ));
    verse.words.forEach((word, wordIndex) => {
      word.gloss = glosses[wordIndex] || '';
    });
    verse.translation = glosses.filter(Boolean).join(' ');
  });
};

const getCheckpointStart = end => Math.floor((end - 1) / CHECKPOINT_SIZE) * CHECKPOINT_SIZE + 1;

const buildNodes = () => {
  const pathNodes = [];
  for (const verse of verses) {
    pathNodes.push({ type: 'verse', number: verse.number, key: `verse-${verse.number}` });
    if (verse.number % CHECKPOINT_SIZE === 0 || verse.number === verses.length) {
      pathNodes.push({
        type: 'checkpoint',
        number: verse.number,
        start: getCheckpointStart(verse.number),
        end: verse.number,
        key: `checkpoint-${verse.number}`
      });
    }
  }
  return pathNodes;
};

const verseRecord = number => progress.verses[number] || {};

const checkpointRecord = number => progress.checkpoints[number] || {};

const isNodeComplete = node => node.type === 'verse'
  ? Boolean(verseRecord(node.number).mastered)
  : Boolean(checkpointRecord(node.number).passed);

const isCheckpointEnd = number => number % CHECKPOINT_SIZE === 0 || number === verses.length;

const isNodeUnlocked = node => {
  if (node.type === 'checkpoint') {
    for (let number = node.start; number <= node.end; number++) {
      if (!verseRecord(number).mastered) {
        return false;
      }
    }
    return true;
  }
  if (node.number === 1) {
    return true;
  }
  const previousNumber = node.number - 1;
  if (!verseRecord(previousNumber).mastered) {
    return false;
  }
  if (isCheckpointEnd(previousNumber) && !checkpointRecord(previousNumber).passed) {
    return false;
  }
  return true;
};

const getNextNode = () => nodes.find(node => isNodeUnlocked(node) && !isNodeComplete(node)) || nodes[nodes.length - 1];

const getNodeAfter = node => {
  const index = nodes.findIndex(candidate => candidate.key === node.key);
  const candidate = nodes[index + 1];
  return candidate && isNodeUnlocked(candidate) ? candidate : node;
};

const masteredCount = () => verses.filter(verse => verseRecord(verse.number).mastered).length;

const checkpointCount = () => nodes.filter(node => node.type === 'checkpoint' && isNodeComplete(node)).length;

const chapterComplete = () => nodes.every(isNodeComplete);

const totalStars = () => Object.values(progress.verses).reduce((sum, record) => sum + (record.stars || 0), 0);

const averageAccuracy = () => {
  const records = Object.values(progress.verses).filter(record => Number.isFinite(record.bestScore));
  if (!records.length) {
    return 0;
  }
  return Math.round(records.reduce((sum, record) => sum + record.bestScore, 0) / records.length);
};

const getLevel = xp => Math.floor(xp / LEVEL_SIZE) + 1;

const getStars = score => score === 100 ? 3 : score >= 80 ? 2 : score >= LESSON_PASS_SCORE ? 1 : 0;

const wordPool = () => verses.flatMap(verse => verse.words).filter(word => word.gloss);

const pickWord = (verse, seed) => {
  const eligible = verse.words.filter(word => word.gloss);
  const candidates = eligible.length ? eligible : verse.words;
  return candidates[Math.abs(seed) % candidates.length];
};

const makeOptions = (answer, pool, count = 4) => {
  const alternatives = shuffle(uniqueValues(pool).filter(value => value !== answer));
  return shuffle([answer, ...alternatives.slice(0, count - 1)]);
};

const makeWordOptions = (target, property) => makeOptions(
  target[property],
  wordPool().map(word => word[property])
);

const makeTranslationOptions = verse => makeOptions(
  verse.translation,
  verses.map(candidate => candidate.translation),
  3
);

const makeQuestion = (type, verse, seed) => {
  const target = pickWord(verse, seed);
  const base = {
    id: `${type}-${verse.number}-${seed}`,
    type,
    verseNumber: verse.number,
    target,
    audio: { verseNumber: verse.number, start: target.cue.s, end: target.cue.e }
  };

  if (type === 'listenWord') {
    return {
      ...base,
      category: 'Listening',
      title: 'Which word did you hear?',
      answer: target.syriac,
      options: makeWordOptions(target, 'syriac'),
      optionStyle: 'syriac',
      hint: `Listen for the word meaning “${target.gloss}.”`
    };
  }

  if (type === 'meaning') {
    return {
      ...base,
      category: 'Meaning',
      title: 'Choose the meaning',
      answer: target.gloss,
      options: makeWordOptions(target, 'gloss'),
      optionStyle: 'english',
      hint: 'Play the word again and listen for its place in the verse.'
    };
  }

  if (type === 'missing') {
    return {
      ...base,
      category: 'Memory',
      title: 'Restore the missing word',
      answer: target.syriac,
      options: makeWordOptions(target, 'syriac'),
      optionStyle: 'syriac',
      targetIndex: target.index,
      hint: `The missing word means “${target.gloss}.”`
    };
  }

  if (type === 'arrange') {
    const size = Math.min(5, verse.words.length);
    const maxStart = Math.max(0, verse.words.length - size);
    const start = maxStart ? Math.abs(seed) % (maxStart + 1) : 0;
    const chunk = verse.words.slice(start, start + size);
    const tokens = chunk.map((word, index) => ({
      id: `${verse.number}-${start + index}-${seed}`,
      label: word.syriac
    }));
    return {
      ...base,
      category: 'Word order',
      title: 'Build the phrase you hear',
      tokens,
      bank: shuffle(tokens),
      audio: {
        verseNumber: verse.number,
        start: chunk[0].cue.s,
        end: chunk[chunk.length - 1].cue.e
      },
      hint: `The phrase begins with ${chunk[0].syriac}`
    };
  }

  return {
    ...base,
    category: 'Verse recognition',
    title: 'Which line matches the reading?',
    answer: verse.translation,
    options: makeTranslationOptions(verse),
    optionStyle: 'translation',
    audio: { verseNumber: verse.number, start: 0, end: null },
    hint: `Listen for the opening word ${verse.words[0].syriac}`
  };
};

const makeVerseQuestions = (verse, attempt) => [
  makeQuestion('listenWord', verse, verse.number + attempt),
  makeQuestion('meaning', verse, verse.number * 2 + attempt),
  makeQuestion('missing', verse, verse.number * 3 + attempt),
  makeQuestion('arrange', verse, verse.number * 5 + attempt),
  makeQuestion('listenVerse', verse, verse.number * 7 + attempt)
];

const makeCheckpointQuestions = node => {
  const reviewVerses = verses.slice(node.start - 1, node.end);
  const types = ['listenVerse', 'meaning', 'missing', 'listenWord', 'arrange', 'meaning', 'listenVerse', 'missing'];
  return types.map((type, index) => {
    const verse = reviewVerses[index % reviewVerses.length];
    return makeQuestion(type, verse, node.number * 11 + index);
  });
};

const awardProfileXp = xp => {
  const today = todayKey();
  if (profile.lastPractice !== today) {
    profile.streak = profile.lastPractice === yesterdayKey() ? profile.streak + 1 : 1;
    profile.lastPractice = today;
  }
  profile.totalXp += xp;
  profile.dailyXp += xp;
  profile.dailyDate = today;
  progress.chapterXp += xp;
  saveProfile();
  saveProgress();
};

const updateHeader = () => {
  const pendingXp = session ? session.xp : 0;
  const shownXp = profile.totalXp + pendingXp;
  const completed = masteredCount();
  const progressPercent = verses.length ? completed / verses.length * 100 : 0;
  dom.xpTotal.textContent = shownXp.toLocaleString();
  dom.streakTotal.textContent = profile.streak.toString();
  dom.levelTotal.textContent = getLevel(shownXp).toString();
  dom.dailyProgressText.textContent = `${Math.min(profile.dailyXp + pendingXp, DAILY_GOAL)} / ${DAILY_GOAL} XP`;
  dom.dailyProgressBar.style.width = `${clamp((profile.dailyXp + pendingXp) / DAILY_GOAL * 100, 0, 100)}%`;
  dom.chapterProgress.textContent = `${completed} of ${verses.length} verses`;
  dom.chapterProgressBar.style.width = `${progressPercent}%`;
  dom.masteryTotal.textContent = `${completed} / ${verses.length}`;
  dom.starsTotal.textContent = totalStars().toString();
  dom.accuracyTotal.textContent = `${averageAccuracy()}%`;

  const upcoming = nodes.find(node => node.type === 'checkpoint' && !isNodeComplete(node));
  dom.nextReview.textContent = upcoming
    ? `Verses ${upcoming.start}–${upcoming.end}`
    : 'Chapter complete';
};

const getBadges = () => [
  { code: '01', name: 'First line', unlocked: masteredCount() >= 1 },
  { code: '05', name: 'Fivefold', unlocked: masteredCount() >= 5 },
  { code: 'A+', name: 'Clear ear', unlocked: Object.values(progress.verses).some(record => record.bestScore === 100) },
  { code: 'R', name: 'Review keeper', unlocked: checkpointCount() >= 1 },
  { code: 'C', name: 'Chapter keeper', unlocked: chapterComplete() }
];

const renderBadges = () => {
  dom.badgeShelf.replaceChildren();
  for (const badge of getBadges()) {
    const item = createElement('li', `badge${badge.unlocked ? ' unlocked' : ''}`);
    const mark = createElement('span', 'badge-mark', badge.unlocked ? badge.code : '—');
    const name = createElement('span', 'badge-name', badge.name);
    item.append(mark, name);
    dom.badgeShelf.append(item);
  }
};

const renderStars = count => {
  const stars = createElement('span', 'node-stars');
  stars.setAttribute('aria-label', `${count} mastery stars`);
  for (let index = 0; index < 3; index++) {
    stars.append(createElement('i', index < count ? 'earned' : ''));
  }
  return stars;
};

const openNode = node => {
  if (!isNodeUnlocked(node)) {
    return;
  }
  stopSound();
  activeNode = node;
  session = null;
  result = null;
  view = 'launch';
  render();
};

const renderPath = () => {
  dom.learningPath.replaceChildren();
  nodes.forEach((node, index) => {
    const unlocked = isNodeUnlocked(node);
    const complete = isNodeComplete(node);
    const selected = activeNode && activeNode.key === node.key;
    const item = createElement('li', `path-item ${node.type}`);
    item.style.setProperty('--node-index', index);
    const button = createButton(
      `path-node${complete ? ' complete' : ''}${selected ? ' selected' : ''}${!unlocked ? ' locked' : ''}`,
      '',
      () => openNode(node)
    );
    button.disabled = !unlocked;

    if (node.type === 'verse') {
      const number = createElement('span', 'node-number', node.number.toString());
      const copy = createElement('span', 'node-copy');
      copy.append(
        createElement('strong', '', `Verse ${node.number}`),
        renderStars(verseRecord(node.number).stars || 0)
      );
      button.append(number, copy);
      button.setAttribute('aria-label', `${complete ? 'Review' : 'Learn'} verse ${node.number}`);
    } else {
      const mark = createElement('span', 'checkpoint-mark', complete ? 'PASS' : 'TEST');
      const copy = createElement('span', 'node-copy');
      copy.append(
        createElement('strong', '', `Review ${node.start}–${node.end}`),
        createElement('small', '', complete ? `${checkpointRecord(node.number).bestScore}% best` : 'Cumulative test')
      );
      button.append(mark, copy);
      button.setAttribute('aria-label', `Cumulative review for verses ${node.start} through ${node.end}`);
    }
    item.append(button);
    dom.learningPath.append(item);
  });
};

const renderTimeline = verse => {
  const timeline = createElement('div', 'audio-timeline');
  timeline.setAttribute('aria-hidden', 'true');
  verse.words.forEach((word, index) => {
    const segment = createElement('span', 'timeline-segment');
    segment.dataset.verseNumber = verse.number.toString();
    segment.dataset.wordIndex = index.toString();
    segment.style.flexGrow = Math.max(0.35, word.cue.e - word.cue.s).toString();
    segment.style.setProperty('--pulse-height', `${35 + (index * 29 % 60)}%`);
    timeline.append(segment);
  });
  return timeline;
};

const makeAudioButton = (audio, label, className = 'audio-button') => {
  const button = createButton(`${className} js-audio`, label, () => toggleAudio(audio));
  button.dataset.verseNumber = audio.verseNumber.toString();
  button.dataset.label = label;
  button.setAttribute('aria-label', label);
  return button;
};

const renderVerseWords = (verse, showGlosses = true) => {
  const words = createElement('div', 'verse-words');
  words.lang = 'syc';
  words.dir = 'rtl';
  verse.words.forEach((word, index) => {
    const button = createButton('verse-word', '', () => playSegment({
      verseNumber: verse.number,
      start: word.cue.s,
      end: word.cue.e
    }));
    button.dataset.verseNumber = verse.number.toString();
    button.dataset.wordIndex = index.toString();
    button.title = showGlosses ? word.gloss : 'Play word';
    button.append(createElement('span', 'syriac-word', word.syriac));
    if (showGlosses) {
      button.append(createElement('span', 'word-meaning', word.gloss));
    }
    words.append(button);
  });
  return words;
};

const createRewardChip = (label, value) => {
  const chip = createElement('div', 'reward-chip');
  chip.append(createElement('span', '', label), createElement('strong', '', value));
  return chip;
};

const beginSession = node => {
  stopSound();
  const isCheckpoint = node.type === 'checkpoint';
  const priorAttempts = isCheckpoint
    ? checkpointRecord(node.number).attempts || 0
    : verseRecord(node.number).attempts || 0;
  session = {
    node,
    kind: node.type,
    questions: isCheckpoint
      ? makeCheckpointQuestions(node)
      : makeVerseQuestions(verses[node.number - 1], priorAttempts),
    index: isCheckpoint ? 0 : -1,
    phase: isCheckpoint ? 'answer' : 'intro',
    selection: null,
    selectedTokens: [],
    firstAttempt: true,
    correctFirstTry: 0,
    xp: 0,
    combo: 0,
    bestCombo: 0,
    focus: 3,
    feedback: null,
    missedVerses: new Set()
  };
  view = 'session';
  render();
};

const renderLaunch = () => {
  const node = activeNode || getNextNode();
  activeNode = node;
  const panel = createElement('section', `launch-panel ${node.type}`);
  const top = createElement('div', 'launch-top');
  const eyebrow = createElement('p', 'screen-eyebrow');
  const title = createElement('h1', 'screen-title');
  const copy = createElement('p', 'screen-copy');
  const art = createElement('div', 'launch-art');
  const actions = createElement('div', 'launch-actions');

  if (node.type === 'verse') {
    const verse = verses[node.number - 1];
    const record = verseRecord(node.number);
    eyebrow.textContent = record.mastered ? 'Mastery replay' : 'Next verse';
    title.textContent = record.mastered ? `Sharpen verse ${node.number}` : `Learn verse ${node.number}`;
    copy.textContent = verse.translation;
    const script = createElement('div', 'launch-script', verse.words.map(word => word.syriac).join(' '));
    script.lang = 'syc';
    script.dir = 'rtl';
    art.append(script, renderTimeline(verse));
    actions.append(
      createRewardChip('Challenges', '5'),
      createRewardChip('Pass mark', `${LESSON_PASS_SCORE}%`),
      createRewardChip('Reward', 'up to 125 XP')
    );
    const button = createButton('primary-action', record.mastered ? 'Practice again' : 'Begin lesson', () => beginSession(node));
    top.append(eyebrow, title, copy);
    panel.append(top, art, actions, button);
  } else {
    const record = checkpointRecord(node.number);
    eyebrow.textContent = record.passed ? 'Milestone replay' : 'Checkpoint unlocked';
    title.textContent = `Review verses ${node.start}–${node.end}`;
    copy.textContent = 'A mixed test of listening, meaning, memory, and word order. Pass it to open the next stretch of the path.';
    const seals = createElement('div', 'review-seals');
    for (let number = node.start; number <= node.end; number++) {
      const seal = createElement('div', 'review-seal');
      seal.append(createElement('strong', '', number.toString()), renderStars(verseRecord(number).stars || 0));
      seals.append(seal);
    }
    art.append(seals);
    actions.append(
      createRewardChip('Questions', '8'),
      createRewardChip('Pass mark', `${CHECKPOINT_PASS_SCORE}%`),
      createRewardChip('Bonus', '100 XP')
    );
    const button = createButton('primary-action checkpoint-action', record.passed ? 'Retake review' : 'Start checkpoint', () => beginSession(node));
    top.append(eyebrow, title, copy);
    panel.append(top, art, actions, button);
  }
  dom.screen.replaceChildren(panel);
};

const renderSessionMeter = () => {
  const header = createElement('div', 'session-meter');
  const close = createButton('close-session', '×', () => {
    stopSound();
    session = null;
    view = 'launch';
    render();
  });
  close.setAttribute('aria-label', 'Leave lesson');
  const progressTrack = createElement('div', 'question-progress');
  session.questions.forEach((_, index) => {
    const segment = createElement('span');
    if (index < session.index) {
      segment.className = 'complete';
    } else if (index === session.index) {
      segment.className = 'current';
    }
    progressTrack.append(segment);
  });
  const focus = createElement('div', 'focus-meter');
  focus.append(createElement('span', 'focus-label', 'Focus'));
  for (let index = 0; index < 3; index++) {
    focus.append(createElement('i', index < session.focus ? 'full' : 'empty'));
  }
  header.append(close, progressTrack, focus);
  return header;
};

const renderIntro = () => {
  const verse = verses[session.node.number - 1];
  const shell = createElement('section', 'session-shell intro-session');
  const content = createElement('div', 'intro-content');
  const header = createElement('header', 'challenge-header');
  header.append(
    createElement('p', 'screen-eyebrow', `Verse ${verse.number} · Listen first`),
    createElement('h1', 'challenge-title', 'Meet the whole line'),
    createElement('p', 'challenge-copy', verse.translation)
  );
  const audioRow = createElement('div', 'intro-audio');
  audioRow.append(
    makeAudioButton({ verseNumber: verse.number, start: 0, end: null }, 'Play full verse', 'audio-button large'),
    renderTimeline(verse)
  );
  content.append(header, audioRow, renderVerseWords(verse));

  const footer = createElement('footer', 'answer-footer ready');
  const note = createElement('div', 'footer-message');
  note.append(createElement('strong', '', `${verse.words.length} timed words`), createElement('span', '', 'Each word can be played on its own.'));
  const start = createButton('check-button', 'Start 5 challenges', () => {
    stopSound();
    session.index = 0;
    session.phase = 'answer';
    render();
  });
  footer.append(note, start);
  shell.append(renderSessionMeter(), content, footer);
  dom.screen.replaceChildren(shell);
};

const chooseOption = option => {
  if (session.phase !== 'answer') {
    return;
  }
  session.selection = option;
  render();
};

const toggleToken = tokenId => {
  if (session.phase !== 'answer') {
    return;
  }
  const selectedIndex = session.selectedTokens.indexOf(tokenId);
  if (selectedIndex >= 0) {
    session.selectedTokens.splice(selectedIndex, 1);
  } else {
    session.selectedTokens.push(tokenId);
  }
  render();
};

const renderOptionButtons = question => {
  const options = createElement('div', `option-grid ${question.optionStyle}`);
  question.options.forEach((option, index) => {
    let className = 'answer-option';
    if (session.selection === option) {
      className += ' selected';
    }
    if (session.phase === 'wrong' && session.selection === option) {
      className += ' wrong';
    }
    if (session.phase === 'correct' && option === question.answer) {
      className += ' correct';
    }
    const button = createButton(className, '', () => chooseOption(option));
    button.disabled = session.phase !== 'answer';
    button.append(
      createElement('span', 'option-key', String.fromCharCode(65 + index)),
      createElement('span', question.optionStyle === 'syriac' ? 'option-syriac' : 'option-text', option)
    );
    options.append(button);
  });
  return options;
};

const renderArrange = question => {
  const area = createElement('div', 'arrange-area');
  area.append(makeAudioButton(question.audio, 'Play phrase', 'audio-button compact'));
  const selected = createElement('div', 'selected-phrase');
  if (!session.selectedTokens.length) {
    selected.append(createElement('span', 'selection-placeholder', 'Build the phrase here'));
  } else {
    session.selectedTokens.forEach(tokenId => {
      const token = question.tokens.find(candidate => candidate.id === tokenId);
      selected.append(createButton('word-tile chosen', token.label, () => toggleToken(token.id)));
    });
  }
  const bank = createElement('div', 'word-bank');
  question.bank.forEach(token => {
    if (!session.selectedTokens.includes(token.id)) {
      bank.append(createButton('word-tile', token.label, () => toggleToken(token.id)));
    }
  });
  area.append(selected, bank);
  return area;
};

const renderMissingVerse = question => {
  const verse = verses[question.verseNumber - 1];
  const line = createElement('div', 'cloze-line');
  line.lang = 'syc';
  line.dir = 'rtl';
  verse.words.forEach((word, index) => {
    if (index === question.targetIndex) {
      line.append(createElement('span', 'missing-slot', '…'));
    } else {
      line.append(createElement('span', '', word.syriac));
    }
  });
  return line;
};

const renderQuestionBody = question => {
  const body = createElement('div', 'challenge-body');
  if (question.type === 'listenWord') {
    const listen = createElement('div', 'listen-focus');
    listen.append(
      makeAudioButton(question.audio, 'Hear word', 'sound-orb'),
      createElement('span', 'listen-caption', 'Replay as often as you need')
    );
    body.append(listen, renderOptionButtons(question));
  } else if (question.type === 'meaning') {
    const prompt = createElement('div', 'script-prompt', question.target.syriac);
    prompt.lang = 'syc';
    prompt.dir = 'rtl';
    body.append(prompt, makeAudioButton(question.audio, 'Hear word', 'audio-button compact'), renderOptionButtons(question));
  } else if (question.type === 'missing') {
    body.append(renderMissingVerse(question), renderOptionButtons(question));
  } else if (question.type === 'arrange') {
    body.append(renderArrange(question));
  } else {
    const listen = createElement('div', 'verse-listen');
    listen.append(makeAudioButton(question.audio, 'Play verse', 'sound-orb wide'), renderTimeline(verses[question.verseNumber - 1]));
    body.append(listen, renderOptionButtons(question));
  }
  return body;
};

const currentAnswerReady = question => question.type === 'arrange'
  ? session.selectedTokens.length === question.tokens.length
  : session.selection !== null;

const isCurrentAnswerCorrect = question => {
  if (question.type !== 'arrange') {
    return session.selection === question.answer;
  }
  const selectedLabels = session.selectedTokens.map(tokenId => (
    question.tokens.find(token => token.id === tokenId).label
  ));
  return selectedLabels.every((label, index) => label === question.tokens[index].label);
};

const checkAnswer = () => {
  const question = session.questions[session.index];
  if (session.phase !== 'answer' || !currentAnswerReady(question)) {
    return;
  }
  if (isCurrentAnswerCorrect(question)) {
    const firstTry = session.firstAttempt;
    if (firstTry) {
      session.correctFirstTry++;
      session.combo++;
    }
    session.bestCombo = Math.max(session.bestCombo, session.combo);
    const earned = firstTry ? 20 + Math.min((session.combo - 1) * 3, 12) : 8;
    session.xp += earned;
    session.feedback = {
      type: 'correct',
      title: firstTry ? 'Clean hit' : 'Locked in',
      detail: firstTry && session.combo > 1 ? `${session.combo} in a row` : 'Keep the line moving',
      xp: earned
    };
    session.phase = 'correct';
  } else {
    session.firstAttempt = false;
    session.combo = 0;
    session.focus = Math.max(0, session.focus - 1);
    session.missedVerses.add(question.verseNumber);
    session.feedback = {
      type: 'wrong',
      title: 'Not quite',
      detail: question.hint
    };
    session.phase = 'wrong';
  }
  render();
};

const retryQuestion = () => {
  session.phase = 'answer';
  session.feedback = null;
  session.selection = null;
  session.selectedTokens = [];
  render();
};

const continueSession = () => {
  stopSound();
  if (session.index >= session.questions.length - 1) {
    finishSession();
    return;
  }
  session.index++;
  session.phase = 'answer';
  session.selection = null;
  session.selectedTokens = [];
  session.firstAttempt = true;
  session.feedback = null;
  render();
};

const renderAnswerFooter = question => {
  const footer = createElement('footer', `answer-footer ${session.phase}`);
  const message = createElement('div', 'footer-message');
  let action;
  if (session.phase === 'correct') {
    message.append(
      createElement('strong', '', session.feedback.title),
      createElement('span', '', `${session.feedback.detail} · +${session.feedback.xp} XP`)
    );
    action = createButton('check-button success', 'Continue', continueSession);
  } else if (session.phase === 'wrong') {
    message.append(
      createElement('strong', '', session.feedback.title),
      createElement('span', '', session.feedback.detail)
    );
    action = createButton('check-button retry', 'Try again', retryQuestion);
  } else {
    message.append(
      createElement('strong', '', session.kind === 'checkpoint' ? 'Checkpoint score counts first tries' : 'First try earns full XP'),
      createElement('span', '', `Combo ${session.combo} · ${session.xp} XP earned`)
    );
    action = createButton('check-button', 'Check answer', checkAnswer);
    action.disabled = !currentAnswerReady(question);
  }
  footer.append(message, action);
  return footer;
};

const renderQuestion = () => {
  const question = session.questions[session.index];
  const shell = createElement('section', `session-shell ${session.kind}-session`);
  const content = createElement('div', 'question-content');
  const header = createElement('header', 'challenge-header');
  const count = `${session.index + 1} of ${session.questions.length}`;
  header.append(
    createElement('p', 'screen-eyebrow', `${question.category} · ${count}`),
    createElement('h1', 'challenge-title', question.title)
  );
  if (session.kind === 'checkpoint') {
    header.append(createElement('p', 'challenge-copy', `From verse ${question.verseNumber}`));
  }
  content.append(header, renderQuestionBody(question));
  shell.append(renderSessionMeter(), content, renderAnswerFooter(question));
  dom.screen.replaceChildren(shell);
};

const updateRecord = (collection, key, score, stars, passed) => {
  const previous = collection[key] || {};
  collection[key] = {
    attempts: (previous.attempts || 0) + 1,
    bestScore: Math.max(previous.bestScore || 0, score),
    stars: Math.max(previous.stars || 0, stars),
    mastered: Boolean(previous.mastered || passed),
    passed: Boolean(previous.passed || passed)
  };
};

const finishSession = () => {
  stopSound();
  const completedSession = session;
  const total = completedSession.questions.length;
  const score = Math.round(completedSession.correctFirstTry / total * 100);
  const threshold = completedSession.kind === 'checkpoint' ? CHECKPOINT_PASS_SCORE : LESSON_PASS_SCORE;
  const passed = score >= threshold;
  const stars = completedSession.kind === 'verse' ? getStars(score) : 0;
  let bonus = 0;
  if (passed) {
    bonus = completedSession.kind === 'checkpoint' ? 100 : 25;
    if (score === 100) {
      bonus += 25;
    }
  }
  completedSession.xp += bonus;

  if (completedSession.kind === 'verse') {
    updateRecord(progress.verses, completedSession.node.number, score, stars, passed);
  } else {
    updateRecord(progress.checkpoints, completedSession.node.number, score, 0, passed);
  }
  awardProfileXp(completedSession.xp);

  result = {
    node: completedSession.node,
    kind: completedSession.kind,
    score,
    threshold,
    passed,
    stars,
    xp: completedSession.xp,
    bonus,
    bestCombo: completedSession.bestCombo,
    missedVerses: [...completedSession.missedVerses].sort((a, b) => a - b)
  };
  session = null;
  view = 'result';
  if (passed) {
    launchCelebration(`+${result.xp} XP`);
  }
  render();
};

const renderScoreRing = score => {
  const ring = createElement('div', 'score-ring');
  ring.style.setProperty('--score', `${score * 3.6}deg`);
  const center = createElement('div', 'score-center');
  center.append(createElement('strong', '', `${score}%`), createElement('span', '', 'accuracy'));
  ring.append(center);
  return ring;
};

const renderResult = () => {
  const panel = createElement('section', `result-panel${result.passed ? ' passed' : ' retry-result'}`);
  const eyebrow = createElement('p', 'screen-eyebrow', result.passed ? 'Path advanced' : 'One more pass');
  const title = createElement('h1', 'screen-title');
  if (result.kind === 'checkpoint') {
    title.textContent = result.passed ? 'Checkpoint cleared' : 'Checkpoint needs another run';
  } else {
    title.textContent = result.passed ? `Verse ${result.node.number} mastered` : `Verse ${result.node.number} is taking root`;
  }
  const scoreArea = createElement('div', 'result-score');
  scoreArea.append(renderScoreRing(result.score));

  const rewards = createElement('div', 'result-rewards');
  rewards.append(
    createRewardChip('XP earned', `+${result.xp}`),
    createRewardChip('Best combo', result.bestCombo.toString()),
    createRewardChip('Pass mark', `${result.threshold}%`)
  );
  if (result.kind === 'verse') {
    const mastery = createElement('div', 'result-mastery');
    mastery.append(createElement('span', '', 'Mastery'), renderStars(result.stars));
    rewards.append(mastery);
  }

  const detail = createElement('p', 'result-detail');
  if (result.passed) {
    detail.textContent = result.kind === 'checkpoint'
      ? 'The next stretch of verses is open.'
      : result.score === 100
        ? 'Every answer landed on the first try.'
        : 'Your first-try score was strong enough to move forward.';
  } else {
    detail.textContent = result.missedVerses.length
      ? `Review ${result.missedVerses.map(number => `verse ${number}`).join(', ')} and try the set again.`
      : 'Run the lesson once more to raise your first-try score.';
  }

  const actions = createElement('div', 'result-actions');
  if (result.passed) {
    const next = getNodeAfter(result.node);
    actions.append(createButton('primary-action', next.key === result.node.key ? 'Return to path' : 'Continue path', () => {
      activeNode = next;
      result = null;
      view = 'launch';
      render();
    }));
  } else {
    actions.append(createButton('primary-action', 'Try this set again', () => beginSession(result.node)));
  }
  actions.append(createButton('secondary-action', 'Back to path', () => {
    result = null;
    view = 'launch';
    render();
  }));

  panel.append(eyebrow, title, scoreArea, rewards, detail, actions);
  dom.screen.replaceChildren(panel);
};

const renderSession = () => {
  if (session.phase === 'intro') {
    renderIntro();
  } else {
    renderQuestion();
  }
};

const launchCelebration = label => {
  dom.celebration.replaceChildren();
  const reward = createElement('strong', 'celebration-label', label);
  dom.celebration.append(reward);
  const colors = ['coral', 'gold', 'teal', 'blue'];
  for (let index = 0; index < 28; index++) {
    const piece = createElement('i', colors[index % colors.length]);
    piece.style.setProperty('--x', `${5 + Math.random() * 90}%`);
    piece.style.setProperty('--delay', `${Math.random() * 0.35}s`);
    piece.style.setProperty('--turn', `${Math.random() * 540 - 270}deg`);
    dom.celebration.append(piece);
  }
  dom.celebration.classList.remove('show');
  window.requestAnimationFrame(() => dom.celebration.classList.add('show'));
  window.setTimeout(() => dom.celebration.classList.remove('show'), 1900);
};

const updateAudioButtons = () => {
  document.querySelectorAll('.js-audio').forEach(button => {
    const active = sound && sound.playing() && Number(button.dataset.verseNumber) === soundVerse;
    button.textContent = active ? 'Pause' : button.dataset.label;
    button.classList.toggle('playing', Boolean(active));
  });
};

const clearHighlights = () => {
  document.querySelectorAll('.is-speaking').forEach(element => element.classList.remove('is-speaking'));
};

const syncWordHighlight = () => {
  clearHighlights();
  if (!sound || !sound.playing()) {
    return;
  }
  const seek = sound.seek() || 0;
  const verse = verses[soundVerse - 1];
  if (!verse) {
    return;
  }
  const activeIndex = verse.words.findIndex(word => seek >= word.cue.s && seek < word.cue.e);
  if (activeIndex < 0) {
    return;
  }
  document.querySelectorAll(`[data-verse-number="${soundVerse}"][data-word-index="${activeIndex}"]`).forEach(element => {
    element.classList.add('is-speaking');
  });
};

const animateAudio = () => {
  window.cancelAnimationFrame(animationFrame);
  if (!sound || !sound.playing()) {
    syncWordHighlight();
    updateAudioButtons();
    return;
  }
  const seek = sound.seek() || 0;
  if (segmentEnd !== null && seek >= segmentEnd) {
    sound.pause();
    segmentEnd = null;
    syncWordHighlight();
    updateAudioButtons();
    return;
  }
  syncWordHighlight();
  animationFrame = window.requestAnimationFrame(animateAudio);
};

const stopSound = () => {
  window.cancelAnimationFrame(animationFrame);
  if (sound) {
    sound.stop();
    sound.unload();
  }
  sound = null;
  soundVerse = 0;
  segmentEnd = null;
  clearHighlights();
  updateAudioButtons();
};

const getSound = verseNumber => {
  if (sound && soundVerse === verseNumber) {
    return sound;
  }
  stopSound();
  const file = `01_Mattai_${pad(chapterNumber)}_${pad(verseNumber)}`;
  soundVerse = verseNumber;
  sound = new window.Howl({
    src: [`../../media/${file}.mp3`, `../../media/${file}.m4a`],
    preload: true,
    onplay: () => {
      updateAudioButtons();
      animateAudio();
    },
    onpause: () => {
      window.cancelAnimationFrame(animationFrame);
      syncWordHighlight();
      updateAudioButtons();
    },
    onstop: () => {
      window.cancelAnimationFrame(animationFrame);
      clearHighlights();
      updateAudioButtons();
    },
    onend: () => {
      window.cancelAnimationFrame(animationFrame);
      clearHighlights();
      updateAudioButtons();
    },
    onloaderror: () => {
      const message = createElement('div', 'audio-error', 'This audio could not be loaded.');
      dom.screen.prepend(message);
    }
  });
  return sound;
};

const playSegment = audio => {
  if (!window.Howl) {
    return;
  }
  const player = getSound(audio.verseNumber);
  const startPlayback = () => {
    if (player !== sound) {
      return;
    }
    segmentEnd = audio.end;
    player.seek(audio.start || 0);
    player.rate(Number(profile.playbackSpeed) || 1);
    player.play();
  };
  if (player.state() === 'loaded') {
    startPlayback();
  } else {
    player.once('load', startPlayback);
    player.load();
  }
};

const toggleAudio = audio => {
  if (sound && sound.playing() && soundVerse === audio.verseNumber) {
    sound.pause();
    return;
  }
  playSegment(audio);
};

const render = () => {
  updateHeader();
  renderPath();
  renderBadges();
  if (view === 'session' && session) {
    renderSession();
  } else if (view === 'result' && result) {
    renderResult();
  } else {
    renderLaunch();
  }
  updateAudioButtons();
  syncWordHighlight();
};

const configureChapter = () => {
  document.title = `${bookName} ${chapterNumber} | Peshitta Path`;
  dom.backLink.href = getChapterFile(chapterNumber);
  dom.chapterTitle.textContent = `${bookName} ${chapterNumber}`;
  dom.chapterSubtitle.textContent = `${verses.length} verses · checkpoints every ${CHECKPOINT_SIZE}`;
  dom.chapterSelect.replaceChildren();
  for (let number = 1; number <= SUPPORTED_CHAPTERS; number++) {
    const option = createElement('option', '', `Chapter ${number}`);
    option.value = number.toString();
    option.selected = number === chapterNumber;
    dom.chapterSelect.append(option);
  }
  dom.chapterSelect.addEventListener('change', event => {
    window.location.href = `practice.html?chapter=${event.target.value}`;
  });
  dom.resetProgress.addEventListener('click', () => {
    if (!window.confirm(`Reset all practice progress for ${bookName} ${chapterNumber}?`)) {
      return;
    }
    stopSound();
    window.localStorage.removeItem(progressKey());
    progress = loadProgress();
    activeNode = nodes[0];
    view = 'launch';
    render();
  });
};

const showError = (title, message) => {
  dom.loadingState.hidden = true;
  dom.screen.hidden = false;
  const error = createElement('section', 'error-panel');
  error.append(createElement('h1', '', title), createElement('p', '', message));
  dom.screen.replaceChildren(error);
};

const start = async () => {
  if (!Number.isInteger(chapterNumber) || chapterNumber < 1 || chapterNumber > SUPPORTED_CHAPTERS || !chapterData) {
    showError('Practice is not available here yet.', 'This path opens only for chapters with complete word timing.');
    return;
  }

  verses = buildVerses();
  if (!hasCompleteCues()) {
    showError('This chapter is still being prepared.', 'Every word needs an audio cue before graded practice can open.');
    return;
  }

  try {
    await loadGlosses();
  } catch (error) {
    showError('The lesson could not be prepared.', error.message);
    return;
  }

  profile = loadProfile();
  progress = loadProgress();
  nodes = buildNodes();
  activeNode = getNextNode();
  configureChapter();
  dom.loadingState.hidden = true;
  dom.screen.hidden = false;
  render();
};

start();
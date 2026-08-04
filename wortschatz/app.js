const state = {
  entries: [],
  mode: 'literal',
  preferEnglish: true,
  sortColumn: 'original',
  sortDirection: 'ascending',
};

const categoryCodes = {
  Noun: 'N', ProperNoun: 'PN', Pronoun: 'PRN', Adjective: 'ADJ', Adverb: 'ADV',
  Article: 'ART', Determiner: 'D', Preposition: 'PRP', Conjunction: 'C',
  Interjection: 'I', Numeral: 'NM', Particle: 'PRT', Verb: 'V',
};

const input = document.querySelector('#search-input');
const entriesElement = document.querySelector('#entries');
const emptyState = document.querySelector('#empty-state');
const searchStatus = document.querySelector('#search-status');
const datasetStatus = document.querySelector('#dataset-status');
const statusDot = document.querySelector('.status-dot');

function fold(value, ignoreCase = true) {
  const source = ignoreCase ? value.toLocaleLowerCase('de-DE') : value;
  let result = '';
  for (let index = 0; index < source.length; index += 1) {
    const pair = source.slice(index, index + 2).toLocaleLowerCase('de-DE');
    if (['ae', 'oe', 'ue', 'ss'].includes(pair)) {
      result += source[index];
      index += 1;
      continue;
    }
    result += ({ ä: 'a', Ä: 'A', ö: 'o', Ö: 'O', ü: 'u', Ü: 'U', ß: 's', ẞ: 'S', é: 'e', ê: 'e', É: 'E', Ê: 'E', à: 'a', À: 'A' }[source[index]] ?? source[index]);
  }
  return result;
}

function damerau(source, target, limit) {
  let previousPrevious = Array(target.length + 1).fill(0);
  let previous = Array.from({ length: target.length + 1 }, (_, index) => index);
  let current = Array(target.length + 1).fill(0);
  for (let sourceIndex = 1; sourceIndex <= source.length; sourceIndex += 1) {
    current[0] = sourceIndex;
    let rowMinimum = current[0];
    for (let targetIndex = 1; targetIndex <= target.length; targetIndex += 1) {
      const substitution = source[sourceIndex - 1] === target[targetIndex - 1] ? 0 : 1;
      current[targetIndex] = Math.min(current[targetIndex - 1] + 1, previous[targetIndex] + 1, previous[targetIndex - 1] + substitution);
      if (sourceIndex > 1 && targetIndex > 1 && source[sourceIndex - 1] === target[targetIndex - 2] && source[sourceIndex - 2] === target[targetIndex - 1]) {
        current[targetIndex] = Math.min(current[targetIndex], previousPrevious[targetIndex - 2] + 1);
      }
      rowMinimum = Math.min(rowMinimum, current[targetIndex]);
    }
    if (rowMinimum > limit) return limit + 1;
    [previousPrevious, previous, current] = [previous, current, previousPrevious];
  }
  return previous[target.length];
}

function fuzzyThreshold(query) {
  if (/\d/u.test(query)) return 0;
  return query.length <= 3 ? 0 : query.length <= 6 ? 1 : 2;
}

function fuzzyMatches(value, query) {
  if (value.includes(query)) return true;
  const threshold = fuzzyThreshold(query);
  if (!threshold) return false;
  const candidates = [value, ...value.split(/[^\p{L}\p{N}]+/u).filter(Boolean)];
  return candidates.some((candidate) => Math.abs(candidate.length - query.length) <= threshold && damerau(candidate, query, threshold) <= threshold);
}

function regexMatches(value, pattern, ignoreCase) {
  try { return new RegExp(pattern, ignoreCase ? 'iu' : 'u').test(value); } catch { return false; }
}

function columnRank(value, query, ignoreCase) {
  if (state.mode === 'regex') return regexMatches(value, query, ignoreCase) ? 0 : Number.MAX_SAFE_INTEGER;
  const normalizedQuery = fold(query, ignoreCase);
  const normalizedValue = fold(value, ignoreCase);
  const matches = state.mode === 'literal' ? normalizedValue.includes(normalizedQuery) : fuzzyMatches(normalizedValue, normalizedQuery);
  if (!matches) return Number.MAX_SAFE_INTEGER;
  return normalizedValue === normalizedQuery ? 0 : normalizedValue.startsWith(normalizedQuery) ? 1 : normalizedValue.includes(normalizedQuery) ? 2 : 3;
}

function germanDisplay(entry) {
  if (entry.LexicalClass !== 'Noun') return entry.German || '';
  const article = entry.IsPluralOnly ? 'die' : ({ M: 'der', F: 'die', N: 'das' }[entry.Gender] ?? null);
  return article && entry.German ? `${article} ${entry.German}` : entry.German || '';
}

function articleDisplay(entry) {
  const gender = entry.IsPluralOnly ? `${entry.Gender || ''}*` : entry.Gender || '';
  const personNumber = entry.PersonNumber || '';
  return gender && personNumber ? `${gender}, ${personNumber}` : gender || personNumber;
}

function rankedMatch(entry, query) {
  const englishRank = columnRank(entry.English || '', query, true);
  const germanRank = columnRank(germanDisplay(entry), query, false);
  if (englishRank === Number.MAX_SAFE_INTEGER && germanRank === Number.MAX_SAFE_INTEGER) return null;
  const englishWins = state.preferEnglish ? englishRank <= germanRank : englishRank < germanRank;
  return { rank: Math.min(englishRank, germanRank), englishWins };
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/gu, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}

function sortValue(entry, column) {
  return ({
    english: entry.English || '',
    german: germanDisplay(entry),
    gender: articleDisplay(entry),
    category: categoryCodes[entry.LexicalClass] || '',
    grammar: entry.GrammarNote || '',
  })[column] || '';
}

function sortMatches(matches) {
  if (state.sortColumn === 'original') return matches;
  const direction = state.sortDirection === 'ascending' ? 1 : -1;
  return matches.sort(({ entry: left }, { entry: right }) => {
    const result = sortValue(left, state.sortColumn).localeCompare(sortValue(right, state.sortColumn), undefined, { sensitivity: 'base', numeric: true });
    return result === 0 ? left.Sequence - right.Sequence : result * direction;
  });
}

function renderSortControls() {
  document.querySelectorAll('.sort-button').forEach((button) => {
    const isActive = button.dataset.sort === state.sortColumn;
    button.classList.toggle('is-active', isActive);
    if (button.dataset.sort === 'original') {
      button.textContent = 'Unsort';
      return;
    }
    const direction = isActive ? (state.sortDirection === 'ascending' ? ' ↑' : ' ↓') : '';
    button.textContent = `${button.dataset.sort === 'gender' ? 'Gen' : button.dataset.sort === 'category' ? 'Categ' : button.dataset.sort[0].toUpperCase() + button.dataset.sort.slice(1)}${direction}`;
    button.setAttribute('aria-sort', isActive ? state.sortDirection : 'none');
  });
}

function render() {
  const query = input.value.trim();
  let matches = state.entries.map((entry) => ({ entry, match: query ? rankedMatch(entry, query) : null })).filter(({ match }) => !query || match);
  let regexError = '';
  if (state.mode === 'regex' && query) {
    try { new RegExp(query, 'iu'); } catch (error) { regexError = error.message; matches = []; }
  }
  const selected = query ? matches.reduce((best, current) => !best || current.match.rank < best.match.rank || (current.match.rank === best.match.rank && current.entry.Sequence < best.entry.Sequence) ? current : best, null) : null;
  sortMatches(matches);
  entriesElement.innerHTML = matches.map(({ entry }) => {
    const selectedClass = selected && selected.entry.Id === entry.Id ? ' selected' : '';
    return `<div class="entry${selectedClass}" role="row"><span role="cell">${escapeHtml(entry.English)}</span><span class="german" role="cell">${escapeHtml(germanDisplay(entry))}</span><span class="gender" role="cell">${escapeHtml(articleDisplay(entry))}</span><span class="category" role="cell">${escapeHtml(categoryCodes[entry.LexicalClass] || '')}</span><span class="grammar" role="cell" title="${escapeHtml(entry.GrammarNote || '')}">${escapeHtml(entry.GrammarNote || '')}</span></div>`;
  }).join('');
  emptyState.hidden = matches.length > 0;
  searchStatus.classList.toggle('error', Boolean(regexError));
  searchStatus.textContent = regexError || (query ? `${matches.length} matching ${matches.length === 1 ? 'entry' : 'entries'}` : `${state.entries.length} entries`);
  renderSortControls();
}

document.querySelectorAll('.sort-button').forEach((button) => button.addEventListener('click', () => {
  if (button.dataset.sort === 'original') {
    state.sortColumn = 'original';
  } else if (state.sortColumn === button.dataset.sort) {
    state.sortDirection = state.sortDirection === 'ascending' ? 'descending' : 'ascending';
  } else {
    state.sortColumn = button.dataset.sort;
    state.sortDirection = 'ascending';
  }
  render();
}));

document.querySelectorAll('.mode-button').forEach((button) => button.addEventListener('click', () => {
  state.mode = button.dataset.mode;
  document.querySelectorAll('.mode-button').forEach((item) => item.classList.toggle('is-active', item === button));
  render();
}));

document.querySelectorAll('.language-button').forEach((button) => button.addEventListener('click', () => {
  state.preferEnglish = button.dataset.language === 'english';
  document.querySelectorAll('.language-button').forEach((item) => item.classList.toggle('is-active', item === button));
  render();
}));

input.addEventListener('focus', () => input.select());
input.addEventListener('input', render);
document.querySelector('#clear-button').addEventListener('click', () => { input.value = ''; input.focus(); render(); });

const helpSections = [
  ['Keyboard shortcuts', [['Ctrl+H', 'Open this Help window.'], ['Ctrl+G', 'Open the Gender Rules window (der/die/das suffix patterns).'], ['Esc', 'Clear the search box.']]],
  ['Search modes', [['≈ Fuzzy', 'Finds close spellings and transposed letters; exact and substring matches rank first.'], ['" Literal', 'Default. Finds the entered characters as a substring. Regex punctuation has no special meaning.'], ['.* Regex', 'Uses a regular expression. English is case-insensitive; German is case-sensitive unless an inline flag overrides it.']]],
  ['Prefer language', [['English', 'Both English and German columns are always searched. When a result matches equally well in both, prefer the English match.'], ['Deutsch', 'Both English and German columns are always searched. When a result matches equally well in both, prefer the German match.']]],
  ['Sorting', [['Column headers', 'Select a column header to sort matching entries by that column. Select it again to reverse the order.'], ['Unsort', 'Restore the dataset\'s original order.']]],
  ['Regex examples', [['house', "Contains 'house'"], ['\\bhouse\\b', "Whole word 'house'"], ['small house', 'Exact phrase'], ['\\bHaus\\w*', "Starts with 'Haus'"], ['\\w*haus\\b', "Ends with 'haus'"], ['house|home', "Either 'house' or 'home'"], ['(?=.*small)(?=.*house)', 'Both terms, in any order'], ['colou?r', "Optional character: 'color' or 'colour'"], ['(?i)\\bhaus\\b', 'Force case-insensitive German search'], ['(?-i)\\bHouse\\b', 'Force case-sensitive English search'], ['(?:ä|ae)', "Match either 'ä' or 'ae'"], ['(?:ß|ss)', "Match either 'ß' or 'ss'"]]],
  ['Category (Categ column)', [['N', 'Noun'], ['PN', 'Proper noun'], ['PRN', 'Pronoun'], ['ADJ', 'Adjective'], ['ADV', 'Adverb'], ['ART', 'Article'], ['D', 'Determiner'], ['PRP', 'Preposition'], ['C', 'Conjunction'], ['I', 'Interjection'], ['NM', 'Numeral'], ['PRT', 'Particle'], ['V', 'Verb']]],
  ['Gender / person (Gen column)', [['M', 'Masculine (der)'], ['F', 'Feminine (die)'], ['N', 'Neuter (das)'], ['*', 'Plural only, shown after the gender (for example F*)'], ['1s / 2s / 3s', '1st/2nd/3rd person singular'], ['1p / 2p / 3p', '1st/2nd/3rd person plural'], ['M, 1s', 'Combined gender + person/number'], ['1s, 3s', 'Multiple person/number matches'], ['(hover)', 'If the full text does not fit, hover the cell to see it all']]],
  ['Grammar (Grammar column)', [['Pl: ...', 'Noun plural form'], ['Comp: ... / Sup: ...', 'Adjective/adverb comparative/superlative'], ['Pret: ... / Part: ...', 'Verb preterite / past participle'], ['separable', 'Separable-prefix verb'], ['(hover)', 'If the full text does not fit, hover the cell to see it all']]],
];

const genderRuleSections = [
  ['Die (feminine) nouns', 'Feminine nouns have the most rigid suffix rules. If a noun ends in one of these, it is die.', [['-ung', 'Nominalized verbs (actions/results)', 'die Lösung (the solution)'], ['-heit', 'Concepts / states of being', 'die Freiheit (the freedom)'], ['-keit', 'Concepts ending in -ig/-bar/-sam', 'die Möglichkeit (the possibility)'], ['-schaft', 'Collectives / relationships', 'die Freundschaft (the friendship)'], ['-ei', 'Places of business / activities', 'die Bäckerei (the bakery)'], ['-in', 'Female persons / professions', 'die Ärztin (the female doctor)'], ['-ion', 'Latin loan words', 'die Situation (the situation)'], ['-tät', 'Latin loan words', 'die Universität (the university)'], ['-ik', 'Sciences / fields of study', 'die Musik (the music), die Physik (physics)'], ['-ur', 'Latin loan words', 'die Kultur (the culture)']]],
  ['Das (neuter) nouns', 'Neuter rules strictly govern diminutives and specific classes of foreign loan words.', [['-chen', 'Diminutive (smaller/cute)', 'das Mädchen (the girl)'], ['-lein', 'Diminutive (regional/poetic)', 'das Büchlein (the little book)'], ['-um', 'Latin loan words', 'das Museum (the museum)'], ['-ma', 'Greek loan words', 'das Thema (the topic)'], ['-ment', 'Results or instruments', 'das Dokument (the document)', 'Roughly 99% reliable; rare exceptions include der Zement and der Moment.']]],
  ['Der (masculine) nouns', 'Masculine suffixes mostly dictate people, ideologies, or active agents.', [['-ismus', 'Ideologies / systems', 'der Kapitalismus (capitalism)'], ['-ling', 'Persons / objects with a specific trait', 'der Schmetterling (the butterfly)'], ['-ist', 'Persons (practitioners/followers)', 'der Journalist (the journalist)'], ['-ant', 'Persons (active participants)', 'der Praktikant (the intern)'], ['-ent', 'Persons (active participants)', 'der Student (the student)'], ['-er', 'Persons / agents, tools (common but not strict)', 'der Computer, der Lehrer'], ['-en', 'Common noun ending (not strict)', 'der Wagen']]],
];

function renderHelp() {
  const target = document.querySelector('#help-sections');
  target.innerHTML = helpSections.map(([title, entries]) => `<section class="help-section"><h3>${escapeHtml(title)}</h3>${entries.map(([code, meaning]) => `<p class="help-entry"><strong>${escapeHtml(code)}</strong><span>${escapeHtml(meaning)}</span></p>`).join('')}</section>`).join('');
  document.querySelector('#gender-rules-sections').innerHTML = genderRuleSections.map(([title, intro, entries]) => `<section class="gender-rule-section"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(intro)}</p>${entries.map(([suffix, detail, example, note]) => `<div class="gender-rule"><strong>${escapeHtml(suffix)}</strong><span class="detail">${escapeHtml(detail)}</span><span class="example">${escapeHtml(example)}</span>${note ? `<span class="note">${escapeHtml(note)}</span>` : ''}</div>`).join('')}${title.startsWith('Der') ? '<p class="footer-note">* Masculine the vast majority of the time, but not a strict rule. Exceptions include die Mutter, das Fenster, and das Essen.</p>' : ''}</section>`).join('');
}

const helpDialog = document.querySelector('#help-dialog');
const genderRulesDialog = document.querySelector('#gender-rules-dialog');
renderHelp();
function openDialog(dialog) { dialog.hidden = false; dialog.classList.add('is-open'); document.body.classList.add('modal-open'); }
function closeDialog(dialog) { dialog.hidden = true; dialog.classList.remove('is-open'); if (helpDialog.hidden && genderRulesDialog.hidden) document.body.classList.remove('modal-open'); }
document.querySelector('#help-button').addEventListener('click', () => openDialog(helpDialog));
document.querySelector('#close-help-button').addEventListener('click', () => closeDialog(helpDialog));
document.querySelector('#gender-rules-button').addEventListener('click', () => { closeDialog(helpDialog); openDialog(genderRulesDialog); });
document.querySelector('#back-to-help-button').addEventListener('click', () => { closeDialog(genderRulesDialog); openDialog(helpDialog); });
document.querySelector('#close-gender-rules-button').addEventListener('click', () => closeDialog(genderRulesDialog));
helpDialog.addEventListener('click', (event) => { if (event.target === helpDialog) closeDialog(helpDialog); });
genderRulesDialog.addEventListener('click', (event) => { if (event.target === genderRulesDialog) closeDialog(genderRulesDialog); });
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && (!helpDialog.hidden || !genderRulesDialog.hidden)) { closeDialog(helpDialog); closeDialog(genderRulesDialog); return; }
  if (event.key === 'Escape') { input.value = ''; render(); }
  if (event.ctrlKey && event.key.toLowerCase() === 'h') { event.preventDefault(); openDialog(helpDialog); }
  if (event.ctrlKey && event.key.toLowerCase() === 'g') { event.preventDefault(); openDialog(genderRulesDialog); }
});

fetch('vocabulary.json')
  .then((response) => { if (!response.ok) throw new Error(`Could not load vocabulary (${response.status})`); return response.json(); })
  .then((data) => {
    state.entries = data.sort((left, right) => (left.Sequence ?? 0) - (right.Sequence ?? 0));
    datasetStatus.textContent = `${state.entries.length} entries loaded`;
    statusDot.classList.add('ready');
    render();
  })
  .catch((error) => {
    datasetStatus.textContent = 'Vocabulary unavailable';
    searchStatus.textContent = error.message;
    searchStatus.classList.add('error');
  });

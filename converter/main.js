"use strict";

function inverse(obj) {
  var retobj = {};
  for (var key in obj) {
    retobj[obj[key]] = key;
  }
  return retobj;
}

const hamzaMap = inverse(atorHamza);
function isHamza(char) {
  return hamzaMap[char];
}

const spirantMap = inverse(atorSpirant);
function isSpirant(char) {
  return spirantMap[char];
}

const syameMap = inverse(atorSyame);
function isSyame(char) {
  return syameMap[char];
}

const vowelMap = inverse(atorVowel);
function isVowel(char) {
  return vowelMap[char];
}

const markMap = inverse(atorMark);
function isMark(char) {
  return markMap[char];
}

const punctMap = inverse(atorPunct);
function isPunct(char) {
  return punctMap[char];
}

const letterMap = inverse(atorLetter);
function isLetter(char) {
  return letterMap[char];
}

const arabicLetterMark = 0x61C;   // invisible

function hexaConvert(number) {
  var str = number.toString(16).toUpperCase();
  return "0x" + str;
};

function mapLetter(value, group) {
  group.letter = value;

  if (group.function) {
    group.function(group);
  }

  var out = String.fromCharCode(group.letter);
  if (group.hamza) {
    out = out + String.fromCharCode(group.hamza);
  }
  if (group.spirant) {
    out = out + String.fromCharCode(group.spirant);
  }
  if (group.mark) { // should other marks come after spirants?
    out = out + String.fromCharCode(group.mark);
  }
  if (group.syame) {
    out = out + String.fromCharCode(group.syame);
  }
  if (group.vowel) {
    out = out + String.fromCharCode(group.vowel);
  }
  if (group.secondLetter) {
    out = out + String.fromCharCode(group.secondLetter);
  }

  return out;
}

function mapChar(char, group) {
  var value = map[char];

  if (typeof value === 'function') {
    group.function = value;
    return isLetter(char)
      ? mapLetter(value, group)
      : null;
  }

  if (isHamza(char)) {
    group.hamza = value;
    return null;
  }

  if (isSpirant(char)) {
    group.spirant = value;
    return null;
  }

  if (isMark(char)) {
    group.mark = value;
    return null;
  }

  if (isSyame(char)) {
    group.syame = value;
    return null;
  }

  if (isVowel(char)) {
    group.vowel = value;
    return null;
  }

  if (isPunct(char)) {
    return String.fromCharCode(value);
  }

  // assuming if gotten here it is a letter
  if (!isLetter(char)) {
    alert('Expected a letter. Got unknown ' + hexaConvert(char) + ' char!');
    return null;
  }

  return mapLetter(value, group);
}

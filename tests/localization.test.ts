import test from 'node:test';
import assert from 'node:assert/strict';
import { creditPairs, credits } from '../src/credits/credits-data';
import { levelCopy } from '../src/i18n/levels';
import { levels } from '../src/games/gravity-snake/levels';

test('paired credits have equal complete columns and clean localized content', () => {
  assert.equal(creditPairs.length, 329);
  assert.equal(credits.filter((credit) => credit.name === 'ChatGPT').length, 329);
  assert.equal(credits.filter((credit) => credit.name === 'Andy Yu').length, 329);
  for (const pair of creditPairs) {
    for (const entry of [pair.left, pair.right]) {
      assert.ok(entry.zh.length && entry.en.length);
      assert.doesNotMatch(entry.en, /[\p{Script=Han}]/u);
      assert.doesNotMatch(entry.zh, /[A-Za-z]/);
      assert.doesNotMatch(entry.zh + entry.en, /undefined|\[object Object\]/);
    }
  }
});

test('all ten levels have English names and instructions without modifying rule data', () => {
  const before = JSON.stringify(levels);
  for (const level of levels) {
    const en = levelCopy(level, 'en');
    assert.ok(en.name.length);
    assert.doesNotMatch(en.name + en.hint, /[\p{Script=Han}]/u);
    assert.ok(level.chase || en.hint.length);
    assert.deepEqual(levelCopy(level, 'zh'), { name: level.name, hint: level.hint });
  }
  assert.equal(JSON.stringify(levels), before);
});

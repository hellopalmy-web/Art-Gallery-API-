const test = require('node:test');
const assert = require('node:assert/strict');
const { getSearchSuggestions } = require('../searchUtils.js');

test('returns empty suggestions for blank keyword', () => {
  const suggestions = getSearchSuggestions([
    { title: 'The Starry Night', artist: 'Van Gogh', year: 1889 },
  ], '   ');

  assert.deepEqual(suggestions, []);
});

test('matches by title, artist, and year while typing', () => {
  const artworks = [
    { title: 'The Starry Night', artist: 'Vincent van Gogh', year: 1889 },
    { title: 'Sunflowers', artist: 'Vincent van Gogh', year: 1888 },
    { title: 'Self Portrait', artist: 'Frida Kahlo', year: 1943 },
  ];

  const suggestions = getSearchSuggestions(artworks, 'van');

  assert.equal(suggestions.length >= 2, true);
  assert.equal(suggestions[0].title, 'The Starry Night');
  assert.equal(suggestions.some((item) => item.kind === 'artist'), true);
});

test('orders matches by strongest title match first', () => {
  const artworks = [
    { title: 'Portrait of a Lady', artist: 'Unknown', year: 1500 },
    { title: 'Mona Lisa', artist: 'Leonardo da Vinci', year: 1503 },
    { title: 'The Lady and the Unicorn', artist: 'Unknown', year: 1500 },
  ];

  const suggestions = getSearchSuggestions(artworks, 'lady');

  assert.equal(suggestions[0].title, 'Portrait of a Lady');
  assert.equal(suggestions[0].kind, 'title');
});

test('matches artworks by country or origin description', () => {
  const artworks = [
    { title: 'Blue-and-white Dish', artist: 'Unknown Artist', country: 'China' },
    { title: 'Woodblock Print', artist: 'Hokusai', description: 'ผลงานจาก Japan' },
    { title: 'Mona Lisa', artist: 'Leonardo da Vinci', year: 1503 },
  ];

  const suggestions = getSearchSuggestions(artworks, 'japan');

  assert.equal(suggestions.length, 1);
  assert.equal(suggestions[0].title, 'Woodblock Print');
  assert.equal(suggestions[0].kind, 'country');
});

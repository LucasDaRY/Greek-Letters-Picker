var MAX_LETTERS = 200
var MAX_GLYPH = 4
var MAX_NAME = 64
var MAX_ALIASES = 8

function parseLetters(raw) {
  var data
  try {
    data = JSON.parse(String(raw || ""))
  } catch (e) {
    return []
  }
  if (!Array.isArray(data)) return []

  var out = []
  var count = Math.min(data.length, MAX_LETTERS)
  for (var i = 0; i < count; i++) {
    var item = sanitizeLetter(data[i])
    if (item) out.push(item)
  }
  return out
}

function sanitizeLetter(item) {
  if (!item || typeof item !== "object") return null
  var glyph = typeof item.glyph === "string" ? item.glyph : ""
  var name = typeof item.name === "string" ? item.name : ""
  if (!glyph || glyph.length > MAX_GLYPH) return null
  if (!name || name.length > MAX_NAME) return null

  var aliases = []
  var source = Array.isArray(item.aliases) ? item.aliases : []
  var aliasCount = Math.min(source.length, MAX_ALIASES)
  for (var i = 0; i < aliasCount; i++) {
    if (typeof source[i] !== "string" || !source[i] || source[i].length > MAX_NAME) continue
    aliases.push(source[i])
  }
  return { glyph: glyph, name: name, aliases: aliases }
}

function normalizedQuery(query) {
  return String(query || "").trim().toLowerCase()
}

function fieldRank(text, needle, exactRank, prefixRank) {
  var value = String(text || "").toLowerCase()
  if (!value) return null
  if (value === needle) return exactRank
  if (value.indexOf(needle) === 0) return prefixRank
  return null
}

function rankOf(item, needle) {
  var best = fieldRank(item.name, needle, 0, 1)
  var aliases = item.aliases || []
  for (var i = 0; i < aliases.length; i++) {
    var aliasRank = fieldRank(aliases[i], needle, 2, 3)
    if (aliasRank !== null && (best === null || aliasRank < best)) best = aliasRank
  }
  var glyph = String(item.glyph || "")
  if (glyph && (glyph === needle || glyph.toLowerCase() === needle)) {
    if (best === null || best > 0) best = 0
  }
  return best
}

function filterLetters(letters, query, limit) {
  var values = Array.isArray(letters) ? letters : []
  var needle = normalizedQuery(query)
  var max = limit === undefined || limit === null ? 200 : Number(limit)
  if (isNaN(max)) max = 200
  max = Math.max(0, max)
  if (max === 0) return []

  var matched = []
  for (var i = 0; i < values.length; i++) {
    var item = values[i]
    if (!item || !item.glyph || !item.name) continue
    var rank = needle ? rankOf(item, needle) : 0
    if (rank === null) continue
    matched.push({ item: item, rank: rank, index: i })
  }

  matched.sort(function(a, b) {
    if (a.rank !== b.rank) return a.rank - b.rank
    return a.index - b.index
  })

  var out = []
  for (var j = 0; j < matched.length && out.length < max; j++) out.push(matched[j].item)
  return out
}

if (typeof module !== "undefined") {
  module.exports = {
    parseLetters: parseLetters,
    normalizedQuery: normalizedQuery,
    filterLetters: filterLetters
  }
}

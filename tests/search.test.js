const assert = require("assert")
const fs = require("fs")
const path = require("path")
const search = require("../GreekSearch.js")

const root = path.join(__dirname, "..")
const letters = search.parseLetters(fs.readFileSync(path.join(root, "letters.json"), "utf8"))

function names(query) {
  return search.filterLetters(letters, query).map(function(item) { return item.name })
}

assert.deepStrictEqual(names("delt"), ["delta", "Delta"])
assert.deepStrictEqual(names("epsilon"), ["epsilon", "Epsilon", "varepsilon"])
assert.deepStrictEqual(names("varepsilon"), ["varepsilon"])
assert.deepStrictEqual(names("DELTA"), ["delta", "Delta"])
assert.deepStrictEqual(names("phi"), ["phi", "Phi", "varphi"])
assert.deepStrictEqual(names("sigma"), ["sigma", "Sigma", "varsigma"])
assert.deepStrictEqual(names(""), letters.map(function(item) { return item.name }))

const byName = {}
letters.forEach(function(item) { byName[item.name] = item.glyph })
assert.strictEqual(byName.delta.codePointAt(0), 0x03b4)
assert.strictEqual(byName.Delta.codePointAt(0), 0x0394)
assert.strictEqual(byName.epsilon.codePointAt(0), 0x03b5)
assert.strictEqual(byName.Epsilon.codePointAt(0), 0x0395)
assert.strictEqual(byName.varepsilon.codePointAt(0), 0x03f5)
assert.strictEqual(byName.ohm.codePointAt(0), 0x2126)
assert.strictEqual(byName.nabla.codePointAt(0), 0x2207)

const evilName = '<img src="https://example.invalid/tracker">'
const evil = search.parseLetters(JSON.stringify([
  { glyph: "\u03b4", name: evilName, aliases: ["delta"] },
  { glyph: "not-a-letter", name: "too-long-glyph" },
  { glyph: "\u03b1", name: "" }
]))
assert.strictEqual(evil.length, 1)
assert.strictEqual(evil[0].name, evilName)
assert.strictEqual(search.filterLetters(evil, "delta")[0].name, evilName)
assert.strictEqual(search.filterLetters(evil, "delta")[0].glyph, "\u03b4")

const qml = fs.readFileSync(path.join(root, "Greek.qml"), "utf8")
const textBlocks = qml.split(/Text\s*\{/).length - 1
const plain = (qml.match(/textFormat:\s*Text\.PlainText/g) || []).length
assert.ok(textBlocks > 0)
assert.strictEqual(plain, textBlocks, "every Text element sets PlainText")

console.log("ok " + letters.length + " letters")

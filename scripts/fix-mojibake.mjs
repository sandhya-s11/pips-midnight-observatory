import fs from 'node:fs'

const path = process.argv[2]
if (!path) {
  console.error('Usage: node scripts/fix-mojibake.mjs <file>')
  process.exit(1)
}

let text = fs.readFileSync(path, 'utf8')
const before = (text.match(/Ã|â€™|â€œ|â€/g) || []).length

function latin1ToUtf8(s) {
  return Buffer.from(s, 'latin1').toString('utf8')
}

for (let i = 0; i < 3; i += 1) {
  const next = latin1ToUtf8(text)
  if (next === text) break
  text = next
}

const after = (text.match(/Ã¢|Ãƒ|â€™/g) || []).length
fs.writeFileSync(path, text, 'utf8')
console.log(`${path}: suspicious sequences before≈${before} after≈${after} chars=${text.length}`)

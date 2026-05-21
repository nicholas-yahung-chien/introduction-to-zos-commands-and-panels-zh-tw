import { readFile } from 'node:fs/promises'

const questions = JSON.parse(await readFile('data/practice-questions.json', 'utf8'))
const sourceInventory = JSON.parse(await readFile('data/practice-sources.json', 'utf8'))

const findings = []
const questionIds = new Set()
const sourceIds = new Set()
const mojibakeHints = ['�', '憭批', '銝餅', '蝟餌', '隤脩', '摰']

function checkTextEncoding(label, fieldName, value) {
  if (typeof value !== 'string') return
  for (const hint of mojibakeHints) {
    if (value.includes(hint)) {
      findings.push(`${label}: ${fieldName} appears to contain mojibake text.`)
      return
    }
  }
}

if (!Array.isArray(questions)) {
  findings.push('data/practice-questions.json must be an array.')
}

if (!sourceInventory || !Array.isArray(sourceInventory.sources)) {
  findings.push('data/practice-sources.json must include a sources array.')
} else {
  for (const source of sourceInventory.sources) {
    const label = source?.id || 'source without id'
    for (const field of ['id', 'title', 'type', 'sourceUrl', 'sectionSlug', 'sectionTitle', 'status', 'intendedUse']) {
      if (!source?.[field] || typeof source[field] !== 'string') {
        findings.push(`${label}: missing string field "${field}".`)
      } else {
        checkTextEncoding(label, field, source[field])
      }
    }
    if (sourceIds.has(source.id)) findings.push(`${label}: duplicate source id.`)
    if (source.id) sourceIds.add(source.id)
  }
}

if (Array.isArray(questions)) {
  for (const [index, question] of questions.entries()) {
    const label = question?.id || `question at index ${index}`

    for (const field of ['id', 'section', 'lessonSlug', 'lessonTitle', 'sourceType', 'sourceUrl', 'sourceReference', 'prompt', 'explanation']) {
      if (!question?.[field] || typeof question[field] !== 'string') {
        findings.push(`${label}: missing string field "${field}".`)
      } else {
        checkTextEncoding(label, field, question[field])
      }
    }

    if (questionIds.has(question.id)) findings.push(`${label}: duplicate question id.`)
    if (question.id) questionIds.add(question.id)

    if (!Array.isArray(question.choices) || question.choices.length < 2) {
      findings.push(`${label}: choices must contain at least two options.`)
    } else {
      const choiceIds = new Set()
      for (const choice of question.choices) {
        if (!choice?.id || typeof choice.id !== 'string') findings.push(`${label}: every choice needs a string id.`)
        if (!choice?.text || typeof choice.text !== 'string') findings.push(`${label}: every choice needs text.`)
        checkTextEncoding(label, 'choice.text', choice?.text)
        if (choiceIds.has(choice.id)) findings.push(`${label}: duplicate choice id "${choice.id}".`)
        if (choice.id) choiceIds.add(choice.id)
      }
      if (!Array.isArray(question.correctChoiceIds) || question.correctChoiceIds.length === 0) {
        findings.push(`${label}: correctChoiceIds must contain at least one choice id.`)
      } else {
        for (const correctChoiceId of question.correctChoiceIds) {
          if (!choiceIds.has(correctChoiceId)) {
            findings.push(`${label}: correctChoiceIds includes unknown choice id "${correctChoiceId}".`)
          }
        }
      }
    }

    if (!question.review || typeof question.review !== 'object') {
      findings.push(`${label}: review object is required.`)
    } else {
      for (const field of ['label', 'coursePath', 'videoEntryId', 'hint']) {
        if (!question.review[field] || typeof question.review[field] !== 'string') {
          findings.push(`${label}: review.${field} is required.`)
        } else {
          checkTextEncoding(label, `review.${field}`, question.review[field])
        }
      }
    }

    if (sourceIds.size > 0 && !sourceIds.has(question.sourceReference)) {
      findings.push(`${question.id}: sourceReference does not match data/practice-sources.json.`)
    }
  }
}

if (findings.length > 0) {
  console.error(findings.join('\n'))
  process.exit(1)
}

console.log(`Practice data checks passed: ${Array.isArray(questions) ? questions.length : 0} question(s), ${sourceInventory.sources.length} source(s).`)

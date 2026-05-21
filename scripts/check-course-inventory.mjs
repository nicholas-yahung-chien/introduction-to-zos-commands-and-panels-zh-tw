import { readFile } from 'node:fs/promises'

const manifest = JSON.parse(await readFile('data/course-manifest.json', 'utf8'))
const audit = JSON.parse(await readFile('data/course-inventory-audit.json', 'utf8'))
const assessment = JSON.parse(await readFile('data/assessment-inventory.json', 'utf8'))
const practiceQuestions = JSON.parse(await readFile('data/practice-questions.json', 'utf8'))

const findings = []

const manifestActivities = manifest.sections.flatMap((section) => section.activities)
const videos = manifestActivities.filter((activity) => activity.type === 'video')
const labs = manifestActivities.filter((activity) => activity.type === 'lab')
const moodleQuizzes = manifestActivities.filter((activity) => activity.type === 'quiz')
const hvpActivities = manifestActivities.filter((activity) => activity.type === 'hvp')

function expect(label, actual, expected) {
  if (actual !== expected) findings.push(`${label}: expected ${expected}, found ${actual}`)
}

expect('manifest sections', manifest.sections.length, 5)
expect('manifest videos', videos.length, 9)
expect('manifest labs', labs.length, 7)
expect('manifest Moodle quizzes', moodleQuizzes.length, 2)
expect('manifest H5P activities', hvpActivities.length, 5)

expect('live unique activities', audit.summary?.uniqueActivities ?? audit.sections.reduce((sum, section) => sum + section.activityCount, 0), 33)
expect('live videos', audit.liveCounts.video, 9)
expect('live pages', audit.liveCounts.page, 10)
expect('live Moodle quizzes', audit.liveCounts.quiz, 2)
expect('live H5P activities', audit.liveCounts.hvp, 5)

expect('static practice questions', practiceQuestions.length, 19)
expect('assessment static practice questions', assessment.summary.staticPracticeQuestions, 19)
expect('assessment badge quiz question count', assessment.summary.formalBadgeQuizQuestions, 20)
expect('assessment total known quiz questions', assessment.summary.totalKnownQuizQuestionsIncludingBadge, 39)
expect('assessment lab pages', assessment.summary.labPages, 7)

if (audit.manifestComparison.missingFromManifest.length > 0) {
  findings.push(`live activities missing from manifest: ${audit.manifestComparison.missingFromManifest.map((item) => item.href).join(', ')}`)
}

if (audit.manifestComparison.missingFromLive.length > 0) {
  findings.push(`manifest activities missing from live inventory: ${audit.manifestComparison.missingFromLive.map((item) => item.sourceUrl).join(', ')}`)
}

if (findings.length > 0) {
  console.error(findings.join('\n'))
  process.exit(1)
}

console.log('Course inventory checks passed: 33 activities, 9 videos, 7 labs, 19 static practice questions, 20 formal badge quiz questions.')

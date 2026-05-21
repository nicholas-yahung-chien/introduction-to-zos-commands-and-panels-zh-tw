<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { withBase } from 'vitepress'
import questionsData from '../../../../data/practice-questions.json'

type PracticeChoice = {
  id: string
  text: string
}

type PracticeQuestion = {
  id: string
  section: string
  lessonSlug: string
  lessonTitle: string
  sourceType: string
  sourceUrl: string
  sourceReference: string
  prompt: string
  choices: PracticeChoice[]
  correctChoiceIds: string[]
  explanation: string
  review: {
    label: string
    coursePath: string
    videoEntryId: string
    hint: string
  }
}

const questions = questionsData as PracticeQuestion[]
const allSectionsLabel = '全部'

const sectionOptions = [allSectionsLabel, ...Array.from(new Set(questions.map((question) => question.section)))]
const selectedSection = ref(allSectionsLabel)
const selectedChoices = reactive<Record<string, string[]>>({})
const checkedQuestions = reactive<Record<string, boolean>>({})

const sourceLabels: Record<string, string> = {
  'short-quiz-exercises-1-and-2': '檢核點 1',
  'short-quiz-exercise-3': '檢核點 2',
  'short-quiz-exercise-4': '檢核點 3',
  'short-quiz-exercise-5': '檢核點 4',
  'short-quiz-exercise-6': '檢核點 5',
  'short-quiz-exercise-7': '檢核點 6',
  'badge-quiz': '綜合回顧'
}

const filteredQuestions = computed(() => {
  if (selectedSection.value === allSectionsLabel) return questions
  return questions.filter((question) => question.section === selectedSection.value)
})

const sectionCounts = computed(() => {
  const counts = new Map<string, number>()
  for (const question of questions) {
    counts.set(question.section, (counts.get(question.section) || 0) + 1)
  }
  return counts
})

function selectionFor(question: PracticeQuestion) {
  return selectedChoices[question.id] || []
}

function isMultiSelect(question: PracticeQuestion) {
  return question.correctChoiceIds.length > 1
}

function choose(question: PracticeQuestion, choiceId: string) {
  if (!isMultiSelect(question)) {
    selectedChoices[question.id] = [choiceId]
    checkedQuestions[question.id] = true
    return
  }

  const current = new Set(selectionFor(question))
  if (current.has(choiceId)) current.delete(choiceId)
  else current.add(choiceId)
  selectedChoices[question.id] = Array.from(current)
  checkedQuestions[question.id] = false
}

function isAnswered(question: PracticeQuestion) {
  return isMultiSelect(question)
    ? checkedQuestions[question.id] === true
    : selectionFor(question).length > 0
}

function canCheck(question: PracticeQuestion) {
  return selectionFor(question).length > 0
}

function checkAnswer(question: PracticeQuestion) {
  if (canCheck(question)) checkedQuestions[question.id] = true
}

function isChoiceSelected(question: PracticeQuestion, choiceId: string) {
  return selectionFor(question).includes(choiceId)
}

function sameChoices(left: string[], right: string[]) {
  return [...left].sort().join('|') === [...right].sort().join('|')
}

function isCorrect(question: PracticeQuestion) {
  return sameChoices(selectionFor(question), question.correctChoiceIds)
}

function choiceState(question: PracticeQuestion, choiceId: string) {
  if (!isAnswered(question)) return ''
  const selected = isChoiceSelected(question, choiceId)
  const correct = question.correctChoiceIds.includes(choiceId)
  if (correct) return 'is-correct'
  if (selected) return 'is-incorrect'
  return ''
}

function sourceLabel(question: PracticeQuestion) {
  return sourceLabels[question.sourceReference] || '課程活動'
}
</script>

<template>
  <section class="practice-shell" aria-label="互動練習題目">
    <div class="practice-overview">
      <div class="practice-overview__lede">
        <p>請依單元或完整清單練習。答錯時可直接回到相關影片與段落複習。</p>
      </div>
      <div class="practice-overview__numbers" aria-label="練習數量">
        <div>
          <strong>{{ questions.length }}</strong>
          <span>練習題目</span>
        </div>
        <div>
          <strong>{{ sectionOptions.length - 1 }}</strong>
          <span>課程單元</span>
        </div>
      </div>
    </div>

    <div class="practice-filters" aria-label="單元篩選">
      <button
        v-for="section in sectionOptions"
        :key="section"
        class="practice-filter"
        type="button"
        :class="{ 'is-active': selectedSection === section }"
        :aria-pressed="selectedSection === section"
        @click="selectedSection = section"
      >
        <span>{{ section }}</span>
        <small v-if="section !== allSectionsLabel">{{ sectionCounts.get(section) || 0 }}</small>
        <small v-else>{{ questions.length }}</small>
      </button>
    </div>

    <div class="practice-list" :aria-label="`${selectedSection}練習清單`">
      <article v-for="(question, index) in filteredQuestions" :key="question.id" class="practice-question">
        <div class="practice-question__meta">
          <span>{{ sourceLabel(question) }}</span>
          <span>{{ question.lessonTitle }}</span>
          <span v-if="isMultiSelect(question)">可複選</span>
        </div>

        <h2>{{ index + 1 }}. {{ question.prompt }}</h2>

        <div class="practice-choices">
          <button
            v-for="choice in question.choices"
            :key="choice.id"
            class="practice-choice"
            type="button"
            :class="[choiceState(question, choice.id), { 'is-selected': isChoiceSelected(question, choice.id) }]"
            :aria-pressed="isChoiceSelected(question, choice.id)"
            @click="choose(question, choice.id)"
          >
            <span class="practice-choice__mark">{{ choice.id.toUpperCase() }}</span>
            <span class="practice-choice__text">{{ choice.text }}</span>
          </button>
        </div>

        <div v-if="isMultiSelect(question)" class="practice-question__actions">
          <span>請選完所有適用選項後再檢查答案。</span>
          <button
            class="practice-check"
            type="button"
            :disabled="!canCheck(question)"
            @click="checkAnswer(question)"
          >
            檢查答案
          </button>
        </div>

        <div
          v-if="isAnswered(question)"
          class="practice-feedback"
          :class="{ 'is-correct': isCorrect(question), 'is-incorrect': !isCorrect(question) }"
          aria-live="polite"
        >
          <strong>{{ isCorrect(question) ? '答對了' : '再複習一下' }}</strong>
          <p>{{ question.explanation }}</p>
          <a v-if="!isCorrect(question)" :href="withBase(question.review.coursePath)">
            {{ question.review.hint }}
          </a>
        </div>
      </article>
    </div>
  </section>
</template>

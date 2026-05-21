<script setup lang="ts">
import lessonNotes from '../../../../data/lesson-notes.json'

type LessonNote = {
  summary: string
  keyPoints: string[]
  terms: string[]
}

const props = defineProps<{
  slug: string
}>()

const note = (lessonNotes as Record<string, LessonNote>)[props.slug]
</script>

<template>
  <section v-if="note" class="lesson-notes" aria-label="影片學習摘要">
    <p class="lesson-notes__summary">{{ note.summary }}</p>

    <div class="lesson-notes__grid">
      <div>
        <h3>學習重點</h3>
        <ul>
          <li v-for="point in note.keyPoints" :key="point">{{ point }}</li>
        </ul>
      </div>

      <div>
        <h3>重要術語</h3>
        <ul class="lesson-notes__terms">
          <li v-for="term in note.terms" :key="term">{{ term }}</li>
        </ul>
      </div>
    </div>
  </section>
</template>

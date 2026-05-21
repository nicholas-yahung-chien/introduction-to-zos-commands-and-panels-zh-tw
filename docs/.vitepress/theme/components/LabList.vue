<script setup lang="ts">
import labsData from '../../../../data/labs.json'

type LabItem = {
  id: string
  title: string
  titleZh: string
  type: string
  sourceUrl: string
  courseUrl: string
  section: string
  summary: string
  learningPurpose: string[]
  recommendedBefore: string[]
  launchGuidance: string
}

const labs = labsData as LabItem[]
</script>

<template>
  <section class="lab-shell" aria-label="Lab 與互動實作清單">
    <div class="lab-overview">
      <p>
        原課程中的 Lab 與互動活動需要在 IBM Learn 環境中完成。本站保留活動定位、學習目的與原課程連結，協助你安排學習順序。
      </p>
      <div class="lab-count">
        <strong>{{ labs.length }}</strong>
        <span>項原課程實作活動</span>
      </div>
    </div>

    <div class="lab-list">
      <article v-for="lab in labs" :key="lab.id" class="lab-item">
        <div class="lab-item__meta">
          <span>{{ lab.section }}</span>
          <span>{{ lab.type }}</span>
        </div>
        <h2>{{ lab.titleZh }}</h2>
        <p class="lab-item__title">{{ lab.title }}</p>
        <p>{{ lab.summary }}</p>

        <div class="lab-item__details">
          <div>
            <h3>學習目的</h3>
            <ul>
              <li v-for="purpose in lab.learningPurpose" :key="purpose">{{ purpose }}</li>
            </ul>
          </div>
          <div>
            <h3>建議先完成</h3>
            <ul>
              <li v-for="topic in lab.recommendedBefore" :key="topic">{{ topic }}</li>
            </ul>
          </div>
        </div>

        <p class="lab-item__guidance">{{ lab.launchGuidance }}</p>
        <div class="lab-item__actions">
          <a :href="lab.sourceUrl">開啟原課程活動</a>
          <a :href="lab.courseUrl">前往 IBM Learn 課程</a>
        </div>
      </article>
    </div>
  </section>
</template>

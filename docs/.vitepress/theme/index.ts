import DefaultTheme from 'vitepress/theme'
import VideoLesson from './components/VideoLesson.vue'
import CourseManifest from './components/CourseManifest.vue'
import LessonNotes from './components/LessonNotes.vue'
import PracticeQuestions from './components/PracticeQuestions.vue'
import LabList from './components/LabList.vue'
import VideoAssetList from './components/VideoAssetList.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('VideoLesson', VideoLesson)
    app.component('CourseManifest', CourseManifest)
    app.component('LessonNotes', LessonNotes)
    app.component('PracticeQuestions', PracticeQuestions)
    app.component('LabList', LabList)
    app.component('VideoAssetList', VideoAssetList)
  }
}

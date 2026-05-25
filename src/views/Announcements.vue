<script setup>
import { ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Bell, CheckCircle } from 'lucide-vue-next'
import AppHeader from '@/components/common/AppHeader.vue'

const { locale } = useI18n({ useScope: 'global' })

const originalAnnouncements = [
  {
    id: 1,
    title: 'New Event: River Cleanup Drive',
    desc: 'Join us this Saturday for a community cleanup along the riverbed.',
    time: '1h ago',
    read: false
  },
  {
    id: 2,
    title: 'Milestone Reached!',
    desc: 'Our community just crossed 10,000 resolved issues. Thank you to all the volunteers.',
    time: '1d ago',
    read: true
  }
]

const announcements = ref([...originalAnnouncements])
const isTranslating = ref(false)

const translateText = async (text, targetLang) => {
  if (!text) return text
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
    const response = await fetch(url)
    const data = await response.json()
    return data[0].map(item => item[0]).join('')
  } catch (error) {
    console.error("Translation failed:", error)
    return text
  }
}

const translateAll = async (targetLang) => {
  isTranslating.value = true

  const results = await Promise.all(
    originalAnnouncements.map(item =>
      Promise.all([
        translateText(item.title, targetLang),
        translateText(item.desc, targetLang)
      ])
    )
  )

  announcements.value = originalAnnouncements.map((item, index) => ({
    ...item,
    title: results[index][0],
    desc: results[index][1]
  }))

  isTranslating.value = false
}

watch(locale, (newLang) => {
  translateAll(newLang)
})

onMounted(() => {
  const savedLang = localStorage.getItem('lang') || 'en'
  translateAll(savedLang)
})
</script>

<template>
  <div class="min-h-full bg-gray-50/50 pb-6 text-gray-800">
    <AppHeader />

    <div class="px-5 mt-4 space-y-3">
      <div 
        v-for="item in announcements" :key="item.id"
        class="bg-white p-4 rounded-2xl border shadow-sm flex items-start space-x-4 transition-opacity duration-300"
        :class="[
          item.read ? 'border-gray-100 opacity-80' : 'border-primary-100 shadow-primary-500/5',
          isTranslating ? 'opacity-50' : ''
        ]"
      >
        <div class="mt-1">
          <div v-if="!item.read" class="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-600">
            <Bell class="w-5 h-5" />
          </div>
          <div v-else class="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
            <CheckCircle class="w-5 h-5" />
          </div>
        </div>
        <div class="flex-1">
          <div class="flex items-start justify-between">
            <h4 class="font-bold text-[15px]" :class="!item.read ? 'text-gray-900' : 'text-gray-700'">
              {{ item.title }}
            </h4>
          </div>
          <p class="text-sm mt-1 leading-relaxed" :class="!item.read ? 'text-gray-600' : 'text-gray-500'">
            {{ item.desc }}
          </p>
          <span class="text-xs font-semibold mt-3 block" :class="!item.read ? 'text-primary-600' : 'text-gray-400'">
            {{ item.time }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
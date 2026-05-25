<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { MessageSquare, Heart, Award } from 'lucide-vue-next'
import { getTimeSinceCreation } from '@/utils/utils'
// Added unlikePost to the import list below
import { likePost, unlikePost } from '@/services/api'
import { authState } from '@/auth'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  post: {
    type: Object,
    required: true
  }
})

const { locale } = useI18n({ useScope: 'global' })

const tagColors = [
  'bg-blue-50 text-blue-600',
  'bg-green-50 text-green-600',
  'bg-purple-50 text-purple-600',
  'bg-red-50 text-red-600',
  'bg-yellow-50 text-yellow-700',
]

const isVisible = ref(true)
const containerRef = ref(null)
const savedHeight = ref(0)
let observer = null

// Like toggle state (Note: If your API returns whether the current user liked it, use that here instead of false)
const isLiked = ref(false)

// Translation state
const translatedDescription = ref(props.post.description || '')
const translatedUserCategory = ref(props.post.user_profile?.user_category || '')
const translatedUserType = ref(props.post.user_profile?.user_type || '')
const translatedTags = ref([])
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
  const rawTags = props.post.tag
    ?.split(',')
    .map(t => t.trim())
    .filter(Boolean) || []

  isTranslating.value = true

  const [desc, category, userType, ...tags] = await Promise.all([
    translateText(props.post.description, targetLang),
    translateText(props.post.user_profile?.user_category, targetLang),
    translateText(props.post.user_profile?.user_type, targetLang),
    ...rawTags.map(tag => translateText(tag, targetLang))
  ])

  translatedDescription.value = desc
  translatedUserCategory.value = category
  translatedUserType.value = userType
  translatedTags.value = tags

  isTranslating.value = false
}

watch(locale, (newLang) => {
  translateAll(newLang)
})

// Updated Like Toggle Logic
const handleLikeToggle = async () => {
  const userEmail = authState.email || localStorage.getItem('user')
  
  if (!userEmail) {
    console.error("No user email found")
    return
  }

  try {
    if (isLiked.value) {
      // If already liked, call unlike API
      await unlikePost(props.post.name, userEmail)
      props.post.like_count--
    } else {
      // If not liked, call like API
      await likePost(props.post.name, userEmail)
      props.post.like_count++
    }
    
    isLiked.value = !isLiked.value
    
  } catch (err) {
    console.error("FETCH FAILED", err)
  }
}

onMounted(() => {
  const savedLang = localStorage.getItem('lang') || 'en'
  translateAll(savedLang)

  observer = new IntersectionObserver((entries) => {
    const entry = entries[0]
    if (entry.isIntersecting) {
      isVisible.value = true
    } else {
      if (containerRef.value) {
        savedHeight.value = containerRef.value.getBoundingClientRect().height
      }
      isVisible.value = false
    }
  }, { rootMargin: '600px' })

  if (containerRef.value) {
    observer.observe(containerRef.value)
  }
})

onUnmounted(() => {
  if (observer) observer.disconnect()
})
</script>

<template>
  <div
    ref="containerRef"
    class="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] mb-4 border border-gray-100 overflow-hidden"
    :style="{ minHeight: !isVisible && savedHeight ? `${savedHeight}px` : 'auto' }"
  >
    <div v-show="isVisible">
      <div class="p-4 flex items-center justify-between">
        <router-link
          :to="{ name: 'profile', query: { user_email: post.user } }"
          class="flex items-center space-x-3 hover:opacity-80 transition-opacity"
        >
          <div class="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
            <img
              v-if="post.user_profile?.user_image"
              :src="post.user_profile.user_image"
              alt="Avatar"
              referrerpolicy="no-referrer"
              class="w-full h-full object-cover"
            />
            <div
              v-else
              class="w-full h-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold"
            >
              {{ post.user_profile?.full_name?.charAt(0) || '?' }}
            </div>
          </div>

          <div>
            <div class="flex items-center space-x-1">
              <h4 class="font-semibold text-gray-900 text-sm">
                {{ post.user_profile?.full_name || 'Unknown User' }}
              </h4>
              <Award v-if="post.user_profile?.user_type" class="w-3.5 h-3.5 text-green-500" />
              <span
                v-if="translatedUserType"
                class="text-[10px] font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-md"
                :class="{ 'opacity-50': isTranslating }"
              >
                {{ translatedUserType }}
              </span>
            </div>
            <p
              class="text-xs text-gray-500 transition-opacity duration-300"
              :class="{ 'opacity-50': isTranslating }"
            >
              {{ translatedUserCategory || '' }}
            </p>
          </div>
        </router-link>

        <div class="flex items-center space-x-2">
          <span class="text-xs text-gray-400 font-medium">{{ getTimeSinceCreation(post.creation) }}</span>
        </div>
      </div>

      <div class="px-4 pb-3">
        <p
          v-if="translatedDescription"
          class="text-gray-800 text-sm leading-relaxed mb-3 transition-opacity duration-300"
          :class="{ 'opacity-50': isTranslating }"
        >
          {{ translatedDescription }}
        </p>

        <div v-if="post.media" class="rounded-xl overflow-hidden mb-3 max-h-64 bg-gray-100">
          <img :src="post.media" class="w-full h-full object-cover" referrerpolicy="no-referrer" />
        </div>

        <div class="flex items-center space-x-2 mb-2">
          <span
            v-for="(tag, index) in (translatedTags.length ? translatedTags : post.tag?.split(',').map(t => t.trim()).filter(Boolean))"
            :key="index"
            :class="[
              'px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide uppercase transition-opacity duration-300',
              tagColors[index % tagColors.length],
              { 'opacity-50': isTranslating }
            ]"
          >
            {{ tag }}
          </span>
        </div>
      </div>

      <div class="px-4 py-3 border-t border-gray-50 flex items-center justify-between">
        <div class="flex items-center space-x-6">

          <button
            @click="handleLikeToggle"
            class="flex items-center space-x-1.5 transition-colors"
            :class="isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'"
          >
            <Heart
              class="w-5 h-5 transition-all duration-150"
              :class="isLiked ? 'fill-red-500 scale-110' : ''"
            />
            <span class="text-xs font-semibold">{{ post.like_count }}</span>
          </button>

          <div class="flex items-center space-x-1.5 text-gray-500">
            <MessageSquare class="w-5 h-5" />
            <span class="text-xs font-semibold">{{ post.comment_count }}</span>
          </div>

        </div>
      </div>

    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Menu, Settings, LogOut } from 'lucide-vue-next'
import { authState } from '@/auth'
import { logout as apiLogout } from '@/services/api'

const { t, locale } = useI18n({ useScope: 'global' })

defineProps({
  title: {
    type: String,
    default: ''
  }
})

const isMenuOpen = ref(false)
const translatedCategory = ref(authState.profile.category || '')
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

const handleTranslation = async (targetLang) => {
  if (!authState.profile.category) return
  isTranslating.value = true
  translatedCategory.value = await translateText(authState.profile.category, targetLang)
  isTranslating.value = false
}

watch(locale, (newLang) => {
  handleTranslation(newLang)
})

onMounted(() => {
  const savedLang = localStorage.getItem('lang') || 'en'
  handleTranslation(savedLang)
})

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const handleLogout = async () => {
  try {
    await apiLogout()
  } catch (error) {
    console.warn("Logout error:", error)
  } finally {
    isMenuOpen.value = false
    localStorage.clear()
    window.location.href = '/login'
  }
}
</script>

<template>
  <header class="bg-white px-5 py-4 flex items-center justify-between sticky top-0 z-[100] shadow-sm border-b border-gray-100 mb-1">
    <slot name="left">
      <template v-if="title">
        <h2 class="font-bold text-gray-900 text-xl">{{ title }}</h2>
      </template>
      <template v-else>
        <router-link to="/profile" class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold overflow-hidden">
            <img v-if="authState.profile.image" :src="authState.profile.image" referrerpolicy="no-referrer" class="w-full h-full object-cover" />
            <span v-else>{{ authState.profile.fullName ? authState.profile.fullName.charAt(0) : '?' }}</span>
          </div>
          <div>
            <h2 class="font-bold text-gray-900 text-[15px]">{{ authState.profile.fullName }}</h2>
            <p class="text-[11px] text-gray-500 transition-opacity duration-300" :class="{ 'opacity-50': isTranslating }">{{ translatedCategory }}</p>
          </div>
        </router-link>
      </template>
    </slot>
    
    <slot name="right">
      <div class="relative">
        <button 
          @click="toggleMenu" 
          class="w-9 h-9 bg-gray-50 rounded-full flex items-center justify-center hover:bg-gray-100 active:scale-95 transition-all"
        >
          <Menu class="w-5 h-5 text-gray-600" />
        </button>

        <transition
          enter-active-class="transition duration-100 ease-out"
          enter-from-class="transform scale-95 opacity-0"
          enter-to-class="transform scale-100 opacity-100"
          leave-active-class="transition duration-75 ease-in"
          leave-from-class="transform scale-100 opacity-100"
          leave-to-class="transform scale-95 opacity-0"
        >
          <div 
            v-if="isMenuOpen" 
            class="absolute right-0 top-12 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 z-[110] overflow-hidden"
          >
            <div class="flex flex-col py-1">
              <router-link 
                to="/settings"
                @click="isMenuOpen = false" 
                class="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 text-gray-700 transition-colors"
              >
                <Settings class="w-4 h-4 text-gray-500" />
                <span class="text-sm font-medium">{{ t('profile.settings') }}</span>
              </router-link>
              
              <div class="border-t border-gray-100 mx-2"></div>
              
              <button 
                @click="handleLogout" 
                class="flex items-center space-x-3 px-4 py-3 hover:bg-red-50 text-red-600 transition-colors text-left"
              >
                <LogOut class="w-4 h-4" />
                <span class="text-sm font-medium">{{ t('profile.logout') }}</span>
              </button>
            </div>
          </div>
        </transition>
      </div>
    </slot>

    <div 
      v-if="isMenuOpen" 
      @click="isMenuOpen = false" 
      class="fixed inset-0 z-[105] bg-black/5"
    ></div>
  </header>
</template>
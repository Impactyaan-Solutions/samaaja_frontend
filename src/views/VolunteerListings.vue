<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  MapPin,
  Tag,
  SlidersHorizontal,
  X,
  ChevronDown,
  Loader2
} from 'lucide-vue-next'

import AppHeader from '@/components/common/AppHeader.vue'
import { getVolunteerListings } from '@/services/api'

const listings = ref([])
const loading = ref(true)
const error = ref(null)

const selectedLocation = ref('')
const selectedCategory = ref('')
const selectedSkill = ref('')

const showLocationFilter = ref(false)
const showCategoryFilter = ref(false)
const showSkillFilter = ref(false)

onMounted(async () => {
  try {
    listings.value = await getVolunteerListings()
  } catch (e) {
    error.value = e.message || 'Failed to load volunteer opportunities.'
  } finally {
    loading.value = false
  }
})

/*
 * Filter options are generated from the opportunities
 * returned by the existing API.
 */
const locations = computed(() => {
  const values = listings.value
    .map((item) => {
      if (typeof item.location === 'object') {
        return item.location?.city || item.location?.name
      }

      return item.location
    })
    .filter(Boolean)

  return [...new Set(values)]
})

const categories = computed(() => {
  return [
    ...new Set(
      listings.value
        .map((item) => item.category)
        .filter(Boolean)
    )
  ]
})

const extractSkills = (item) => {
  const skills = item.skills_needed || item.skills || []

  if (Array.isArray(skills)) {
    return skills
      .map((skill) => {
        if (typeof skill === 'string') return skill

        return (
          skill?.skill ||
          skill?.skill_name ||
          skill?.name ||
          skill?.skills
        )
      })
      .filter(Boolean)
  }

  if (typeof skills === 'string') {
    return skills
      .split(',')
      .map((skill) => skill.trim())
      .filter(Boolean)
  }

  return []
}

const skills = computed(() => {
  const allSkills = listings.value.flatMap(extractSkills)

  return [...new Set(allSkills)]
})

const getLocation = (item) => {
  if (typeof item.location === 'object') {
    return item.location?.city || item.location?.name || 'Location'
  }

  return item.location || 'Location'
}

const filteredListings = computed(() => {
  return listings.value.filter((item) => {
    const locationMatch =
      !selectedLocation.value ||
      getLocation(item) === selectedLocation.value

    const categoryMatch =
      !selectedCategory.value ||
      item.category === selectedCategory.value

    const itemSkills = extractSkills(item)

    const skillMatch =
      !selectedSkill.value ||
      itemSkills.includes(selectedSkill.value)

    return locationMatch && categoryMatch && skillMatch
  })
})

const clearFilters = () => {
  selectedLocation.value = ''
  selectedCategory.value = ''
  selectedSkill.value = ''

  showLocationFilter.value = false
  showCategoryFilter.value = false
  showSkillFilter.value = false
}

const selectLocation = (value) => {
  selectedLocation.value = value
  showLocationFilter.value = false
}

const selectCategory = (value) => {
  selectedCategory.value = value
  showCategoryFilter.value = false
}

const selectSkill = (value) => {
  selectedSkill.value = value
  showSkillFilter.value = false
}

const hasFilters = computed(() => {
  return (
    selectedLocation.value ||
    selectedCategory.value ||
    selectedSkill.value
  )
})

const formatDescription = (description) => {
  if (!description) {
    return 'Volunteer and make a meaningful difference in your community.'
  }

  if (description.length > 125) {
    return `${description.substring(0, 125)}...`
  }

  return description
}
</script>

<template>
  <div class="min-h-full bg-[#f7f9fb] pb-24 text-[#172033]">
    <AppHeader />

    <!-- Figma style profile/header area -->
    <div class="px-5 pt-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold text-gray-900">
            Volunteer Opportunity
          </h1>

          <p class="mt-1 text-xs text-gray-500">
            Find opportunities and make an impact
          </p>
        </div>

        <div
          class="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-600"
        >
          <SlidersHorizontal class="h-5 w-5" />
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="relative mt-4 px-5">
      <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <!-- Location -->
        <button
          @click="
            showLocationFilter = !showLocationFilter;
            showCategoryFilter = false;
            showSkillFilter = false
          "
          class="flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition"
          :class="
            selectedLocation
              ? 'border-primary-500 bg-primary-50 text-primary-700'
              : 'border-gray-200 bg-white text-gray-700'
          "
        >
          <MapPin class="h-3.5 w-3.5" />

          <span>
            {{ selectedLocation || 'Location' }}
          </span>

          <ChevronDown class="h-3 w-3" />
        </button>

        <!-- Category -->
        <button
          @click="
            showCategoryFilter = !showCategoryFilter;
            showLocationFilter = false;
            showSkillFilter = false
          "
          class="flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition"
          :class="
            selectedCategory
              ? 'border-primary-500 bg-primary-50 text-primary-700'
              : 'border-gray-200 bg-white text-gray-700'
          "
        >
          <Tag class="h-3.5 w-3.5" />

          <span>
            {{ selectedCategory || 'Category' }}
          </span>

          <ChevronDown class="h-3 w-3" />
        </button>

        <!-- Skills -->
        <button
          @click="
            showSkillFilter = !showSkillFilter;
            showLocationFilter = false;
            showCategoryFilter = false
          "
          class="flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition"
          :class="
            selectedSkill
              ? 'border-primary-500 bg-primary-50 text-primary-700'
              : 'border-gray-200 bg-white text-gray-700'
          "
        >
          <SlidersHorizontal class="h-3.5 w-3.5" />

          <span>
            {{ selectedSkill || 'Skills' }}
          </span>

          <ChevronDown class="h-3 w-3" />
        </button>

        <!-- Clear -->
        <button
          v-if="hasFilters"
          @click="clearFilters"
          class="flex shrink-0 items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-500"
        >
          <X class="h-3.5 w-3.5" />
          Clear
        </button>
      </div>

      <!-- Location dropdown -->
      <div
        v-if="showLocationFilter"
        class="absolute left-5 right-5 top-12 z-30 rounded-xl border border-gray-100 bg-white p-2 shadow-lg"
      >
        <button
          @click="selectLocation('')"
          class="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-50"
        >
          All locations
        </button>

        <button
          v-for="location in locations"
          :key="location"
          @click="selectLocation(location)"
          class="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-50"
        >
          {{ location }}
        </button>

        <div
          v-if="locations.length === 0"
          class="px-3 py-2 text-sm text-gray-400"
        >
          No locations available
        </div>
      </div>

      <!-- Category dropdown -->
      <div
        v-if="showCategoryFilter"
        class="absolute left-5 right-5 top-12 z-30 rounded-xl border border-gray-100 bg-white p-2 shadow-lg"
      >
        <button
          @click="selectCategory('')"
          class="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-50"
        >
          All categories
        </button>

        <button
          v-for="category in categories"
          :key="category"
          @click="selectCategory(category)"
          class="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-50"
        >
          {{ category }}
        </button>

        <div
          v-if="categories.length === 0"
          class="px-3 py-2 text-sm text-gray-400"
        >
          No categories available
        </div>
      </div>

      <!-- Skills dropdown -->
      <div
        v-if="showSkillFilter"
        class="absolute left-5 right-5 top-12 z-30 max-h-64 overflow-y-auto rounded-xl border border-gray-100 bg-white p-2 shadow-lg"
      >
        <button
          @click="selectSkill('')"
          class="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-50"
        >
          All skills
        </button>

        <button
          v-for="skill in skills"
          :key="skill"
          @click="selectSkill(skill)"
          class="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-50"
        >
          {{ skill }}
        </button>

        <div
          v-if="skills.length === 0"
          class="px-3 py-2 text-sm text-gray-400"
        >
          No skills available
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div
      v-if="loading"
      class="flex flex-col items-center justify-center px-5 pt-16 text-center"
    >
      <Loader2 class="mb-3 h-7 w-7 animate-spin text-primary-500" />

      <p class="text-sm text-gray-500">
        Loading volunteer opportunities...
      </p>
    </div>

    <!-- Error -->
    <div
      v-else-if="error"
      class="px-5 pt-12 text-center"
    >
      <p class="text-sm text-red-500">
        {{ error }}
      </p>
    </div>

    <!-- Empty -->
    <div
      v-else-if="filteredListings.length === 0"
      class="px-5 pt-12 text-center"
    >
      <div
        class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100"
      >
        <SlidersHorizontal class="h-6 w-6 text-gray-400" />
      </div>

      <h3 class="mt-4 text-base font-semibold text-gray-800">
        No opportunities found
      </h3>

      <p class="mt-1 text-sm text-gray-500">
        Try changing your filters.
      </p>
    </div>

    <!-- Opportunity cards -->
    <div
      v-else
      class="space-y-3 px-5 pb-6 pt-4"
    >
      <div
        v-for="item in filteredListings"
        :key="item.name || item.title"
        class="rounded-xl border border-gray-100 bg-white p-3.5 shadow-[0_2px_10px_rgba(0,0,0,0.04)]"
      >
        <!-- Category -->
        <div
          class="inline-flex rounded-md bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-700"
        >
          {{ item.category || 'Community' }}
        </div>

        <!-- Title -->
        <h2 class="mt-2 text-sm font-bold leading-5 text-gray-900">
          {{ item.title || 'Volunteer Opportunity' }}
        </h2>

        <!-- Description -->
        <p class="mt-1.5 text-xs leading-5 text-gray-500">
          {{ formatDescription(item.description) }}
        </p>

        <!-- Location + button -->
        <div
          class="mt-3 flex items-center justify-between gap-3"
        >
          <div class="flex min-w-0 items-center gap-1.5 text-xs text-gray-500">
            <MapPin
              class="h-3.5 w-3.5 shrink-0 text-gray-400"
            />

            <span class="truncate">
              {{ getLocation(item) }}
            </span>
          </div>

          <button
            class="shrink-0 rounded-md bg-primary-600 px-4 py-2 text-[11px] font-semibold text-white transition hover:bg-primary-700"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
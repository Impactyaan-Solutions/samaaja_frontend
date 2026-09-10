<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Loader2 } from 'lucide-vue-next'
import { authState } from '@/auth'
import {
  checkVolunteerApplication,
  getVolunteerOpportunity
} from '@/services/api'
import Form from '@/components/common/form.vue'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const volunteerOpportunityId = route.params.id
const opportunity = ref(null)

const loading = ref(true)
const alreadyApplied = ref(false)
const error = ref(null)
const success = ref(null)
const handleFormResult = (result) => {
  success.value = result.message || t('volunteerApplication.applicationSubmittedSuccess')
}
onMounted(async () => {
  try {
    const result = await checkVolunteerApplication(
      volunteerOpportunityId
    )

    alreadyApplied.value = result.already_applied
    opportunity.value = await getVolunteerOpportunity(
      volunteerOpportunityId
    )
  } catch (e) {
    error.value = e.message || t('volunteerApplication.loadError')
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="space-y-4">
    <div v-if="!success">
      <header
       class="sticky top-0 z-20 flex items-center border-b border-gray-50 bg-white px-5 py-5"
      >
       <button
         type="button"
         @click="router.back()"
         aria-label="Go back"
       >
         ←
       </button>

       <h1 class="ml-4 text-lg font-semibold text-gray-900">
         {{ t('volunteerApplication.headerTitle') }}
       </h1>
     </header>
     <div 
       v-if="opportunity" 
       class="rounded-lg bg-white p-4 shadow-sm"
     >
       <p class="text-sm text-gray-500">
         {{ t('volunteerApplication.applyingFor') }}
       </p>

       <h1 class="mt-1 text-lg font-semibold text-gray-900">
         {{ opportunity.title }}
       </h1>
     </div>
    </div>

    <div
      v-if="loading"
      class="flex flex-col items-center justify-center px-5 pt-16 text-center"
    >
      <Loader2
        class="mb-3 h-7 w-7 animate-spin text-primary-500"
      />

      <p class="text-sm text-gray-500">
        {{ t('volunteerApplication.checkingApplicationStatus') }}
      </p>
    </div>

    <div v-else-if="error">
      <p class="text-sm text-red-600">
        {{ error }}
      </p>
    </div>

    <div v-else-if="alreadyApplied">
      <section class="rounded-lg bg-white p-6 text-center shadow-sm">
        <p class="text-base font-semibold text-gray-900">
          {{ t('volunteerApplication.alreadyApplied') }}
        </p>
      </section>

      <div class="space-y-4">
        <button
          type="button"
          @click="router.push('/volunteer-listings')"
          class="w-full rounded-lg bg-primary-600 px-6 py-4 text-base font-semibold text-white"
        >
          {{ t('volunteerApplication.browseMoreOpportunities') }}
        </button>

        <button
          type="button"
          @click="router.push('/')"
          class="w-full rounded-lg border border-primary-600 bg-white px-6 py-4 text-base font-semibold text-primary-600"
        >
          {{ t('volunteerApplication.returnToHome') }}
        </button>
      </div>
    </div>
    <div v-else-if="success">
      <h1 class="text-lg font-normal text-gray-900">
        {{ t('volunteerApplication.applicationStatus') }}
      </h1>

      <div class="space-y-3">

      <!-- Application Submitted -->
      <section class="rounded-lg bg-white p-6 text-center shadow-sm">
        <div class="mb-3 text-center text-4xl font-light text-green-600">
          ✓
        </div>

        <h2 class="text-base font-semibold text-gray-900">
          {{ t('volunteerApplication.applicationSubmitted') }}
        </h2>

        <p class="mt-2 text-sm leading-5 text-gray-500">
         {{ t('volunteerApplication.applicationSubmittedDescription') }}
        </p>
      </section>

      <!-- Applicant Status -->
      <section class="rounded-lg bg-white px-4 py-5 shadow-sm">
        <div class="flex items-center justify-between">
          <p class="text-sm font-semibold text-gray-900">
            {{ authState.profile.fullName }}
          </p>

          <span class="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">
            <span class="h-2 w-2 rounded-full bg-amber-500"></span>
            {{ t('volunteerApplication.underReview') }}
          </span>
        </div>
      </section>

      <!-- Application Summary -->
      <section class="rounded-lg bg-white px-4 py-5 shadow-sm">
        <h2 class="mb-4 text-xs font-semibold uppercase text-gray-500">
          {{ t('volunteerApplication.applicationSummary') }}
        </h2>

        <div class="space-y-3 text-sm">
          <div class="grid grid-cols-[96px_1fr] gap-4">
            <span class="text-gray-500">
              {{ t('volunteerApplication.organisation') }}
            </span>
            <span class="text-left text-gray-900">
              {{ opportunity?.organization || '-' }}
            </span>
          </div>

          <div class="grid grid-cols-[96px_1fr] gap-4">
            <span class="text-gray-500">
              {{ t('volunteerApplication.opportunity') }}
            </span>
            <span class="text-left text-gray-900">
              {{ opportunity?.title || '-' }}
            </span>
          </div>

          <div class="grid grid-cols-[96px_1fr] gap-4">
            <span class="text-gray-500">
              {{ t('volunteerApplication.contactVia') }}
            </span>
            <span class="text-left text-gray-900">
              {{ authState.email }}<br />
              {{ authState.profile.mobileNumber }}
            </span>
          </div>
        </div>
      </section>

      <!-- What happens next -->
      <section class="rounded-lg bg-white px-4 py-5 shadow-sm">
        <h2 class="mb-2 text-xs font-semibold uppercase text-gray-500">
          {{ t('volunteerApplication.whatHappensNext') }}
        </h2>

        <p class="text-sm leading-5 text-gray-700">
          {{ t('volunteerApplication.whatHappensNextDescription') }}
        </p>
      </section>

      <!-- CTAs -->
      <div class="space-y-4">
        <button
          type="button"
          @click="router.push('/volunteer-listings')"
          class="w-full rounded-lg bg-primary-600 px-6 py-4 text-base font-semibold text-white"
        >
          {{ t('volunteerApplication.browseMoreOpportunities') }}
        </button>

        <button
          type="button"
          @click="router.push('/')"
          class="w-full rounded-lg border border-primary-600 bg-white px-6 py-4 text-base font-semibold text-primary-600"
        >
          {{ t('volunteerApplication.returnToHome') }}
        </button>
      </div>

    </div>
  </div>

    <div v-else>
      <Form
        :volunteer-opportunity-id="volunteerOpportunityId"
        @result="handleFormResult"
      />
    </div>

  </div>
</template>
<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { authState } from '@/auth'
import { applyForVolunteerOpportunity } from '@/services/api'

const { t } = useI18n()

const props = defineProps({
  volunteerOpportunityId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['result'])

const age = ref('')
const fullName = ref(authState.profile.fullName || '')
const email = ref(authState.email || '')
const phoneNumber = ref(authState.profile.mobileNumber || '')
const gender = ref(authState.profile.gender || '')
const preferredAvailableDays = ref('')
const whyDoYouWantToVolunteer = ref('')
const privacyConsent = ref(true)
const loading = ref(false)
const error = ref(null)
const isListening = ref(false)
const recognition = ref(null)
const validateForm = () => {
  error.value = null

  if (!preferredAvailableDays.value) {
    error.value = t('volunteerApplication.preferredDaysRequired')
    return false
  }

  if (!privacyConsent.value) {
    error.value = t('volunteerApplication.privacyConsentRequired')
    return false
  }

  return true
}

const startVoiceInput = () => {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition

  if (!SpeechRecognition) {
    error.value = t('volunteerApplication.voiceInputNotSupported')
    return
  }

  recognition.value = new SpeechRecognition()
  recognition.value.lang = 'en-IN'
  recognition.value.interimResults = false
  recognition.value.continuous = false

  recognition.value.onstart = () => {
    isListening.value = true
  }

  recognition.value.onresult = (event) => {
    whyDoYouWantToVolunteer.value =
      event.results[0][0].transcript
  }

  recognition.value.onerror = () => {
    error.value = t('volunteerApplication.voiceInputError')
  }

  recognition.value.onend = () => {
    isListening.value = false
  }

  recognition.value.start()
}

const submitApplication = async () => {
  if (!validateForm()) {
    return
  }

  try {
    loading.value = true
    error.value = null

    const result = await applyForVolunteerOpportunity({
      volunteer_opportunity: props.volunteerOpportunityId,
      age: age.value,
      preferred_available_days: preferredAvailableDays.value,
      why_do_you_want_to_volunteer: whyDoYouWantToVolunteer.value,
      privacy_consent: privacyConsent.value
    })

    emit('result', result)
  } catch (e) {
    error.value = e.message || t('volunteerApplication.submitError')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="space-y-4">

    <!-- Applicant Profile -->
    <section class="rounded-lg bg-white p-4 shadow-sm">
      <h2 class="mb-4 text-sm font-semibold uppercase text-gray-900">
        {{ t('volunteerApplication.applicantProfile') }}
      </h2>

      <div class="space-y-4">

        <!-- Full Name -->
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700">
            {{ t('volunteerApplication.fullName') }} <span class="text-red-500">*</span>
          </label>

          <input
           v-model="fullName"
           type="text"
           readonly
           class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700"
          />
        </div>

        <!-- Email -->
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700">
            {{ t('volunteerApplication.email') }} <span class="text-red-500">*</span>
          </label>

          <input
            v-model="email"
            type="email"
            readonly
            class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700"
          />
        </div>

        <!-- Phone Number -->
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700">
            {{ t('volunteerApplication.phoneNumber') }} <span class="text-red-500">*</span>
          </label>

          <input
            v-model="phoneNumber"
            type="tel"
            readonly
            class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700"
          />
        </div>

        <!-- Age -->
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700">
            {{ t('volunteerApplication.age') }}
          </label>

          <input
            v-model="age"
            type="number"
            min="1"
            class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700"
          />
        </div>

        <!-- Gender -->
        <div>
          <label class="mb-2 block text-sm font-medium text-gray-700">
            {{ t('volunteerApplication.gender') }}
          </label>

          <div class="space-y-2">
            <label class="flex items-center gap-2 text-sm text-gray-700">
              <input
                v-model="gender"
                type="radio"
                value="Male"
              />
              {{ t('volunteerApplication.genderMale') }}
            </label>

            <label class="flex items-center gap-2 text-sm text-gray-700">
              <input
                v-model="gender"
                type="radio"
                value="Female"
              />
              {{ t('volunteerApplication.genderFemale') }}
            </label>

            <label class="flex items-center gap-2 text-sm text-gray-700">
              <input
                v-model="gender"
                type="radio"
                value="Prefer not to say"
              />
              {{ t('volunteerApplication.genderPreferNotToSay') }}
            </label>
          </div>
        </div>
        <!-- Preferred Available Days -->
        <div>
          <label class="mb-2 block text-sm font-medium text-gray-700">
            {{ t('volunteerApplication.preferredAvailableDays') }} <span class="text-red-500">*</span>
          </label>

          <div class="space-y-2">
            <label class="flex items-center gap-2 text-sm text-gray-700">
              <input
                v-model="preferredAvailableDays"
                type="radio"
                value="Daily"
              />
              {{ t('volunteerApplication.daily') }}
            </label>

            <label class="flex items-center gap-2 text-sm text-gray-700">
              <input
                v-model="preferredAvailableDays"
                type="radio"
                value="Few times a week"
              />
              {{ t('volunteerApplication.fewTimesAWeek') }}
            </label>

            <label class="flex items-center gap-2 text-sm text-gray-700">
              <input
                v-model="preferredAvailableDays"
                type="radio"
                value="Only on Weekends"
              />
              {{ t('volunteerApplication.onlyOnWeekends') }}
            </label>

            <label class="flex items-center gap-2 text-sm text-gray-700">
              <input
                v-model="preferredAvailableDays"
                type="radio"
                value="Flexible"
              />
              {{ t('volunteerApplication.flexible') }}
            </label>
          </div>
        </div>
        <!-- Why do you want to volunteer? -->
        <section class="rounded-lg bg-white p-3 shadow-sm">
          <h2 class="mb-2 text-sm font-semibold text-gray-900">
            {{ t('volunteerApplication.whyVolunteer') }}
          </h2>

          <textarea
            v-model="whyDoYouWantToVolunteer"
            rows="4"
            :placeholder="t('volunteerApplication.whyVolunteerPlaceholder')"
            class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700"
          ></textarea>
          <button
            type="button"
            @click="startVoiceInput"
            class="mt-2 w-full rounded-md border border-primary-600 bg-primary-50 px-3 py-2 text-sm font-medium text-primary-700"
          >
          {{ isListening
            ? t('volunteerApplication.listening')
            : t('volunteerApplication.addVoiceInput')
          }}
          </button>
        </section>

        <!-- Privacy Consent -->
        <section class="rounded-lg bg-white p-4 shadow-sm">
          <div class="rounded-md border-l-4 border-primary-500 bg-gray-100 px-4 py-3">
            <p class="text-sm leading-5 text-gray-700">
              {{ t('volunteerApplication.privacyConsentText') }}
            </p>
          </div>
        </section>
      </div>
    </section>
    <p
      v-if="error"
      class="text-sm text-red-600"
    >
      {{ error }}
    </p>

    <div class="h-4"></div>

    <button
      type="button"
      @click="submitApplication"
      :disabled="loading"
      class="w-full rounded-lg bg-primary-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {{ loading
        ? t('volunteerApplication.submitting')
        : t('volunteerApplication.submit')
      }}
    </button>

  </div>
</template>





<!--
PSEUDO-CODE: VOLUNTEER APPLICATION FORM COMPONENT

1. Receive from ApplicationForm.vue:
   - volunteer opportunity ID
   - required profile information

2. Keep profile information pre-filled/hidden
   wherever required by the application flow.

3. Show fields that the user needs to enter:
   - Age
   - Preferred available days
   - Why do you want to volunteer?
   - Privacy consent

4. Keep Submit button inside this component.

5. When Submit is clicked:
   - Validate required fields.
   - Call applyVolunteerOpportunity API.
   - Send:
       volunteer_opportunity
       age
       preferred_available_days
       why_do_you_want_to_volunteer
       privacy_consent

6. Do NOT send user ID from frontend.
   Backend gets current user from session.

7. Emit the API result back to ApplicationForm.vue.

8. Handle loading state so user cannot submit repeatedly.
-->
<script setup>
import { ref } from 'vue'

const isListening = ref(false)
const recognition = ref(null)
const voiceInputRefs = {}

const startVoiceInput = (field) => {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition

  if (!SpeechRecognition) {
    field.voiceInputError = field.voiceInput.notSupportedMessage
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
    const transcript = event.results[0][0].transcript
    const textarea = voiceInputRefs[field.key]

    if (textarea) {
      textarea.value = transcript
    }
  }

  recognition.value.onerror = () => {
    field.voiceInputError = field.voiceInput.errorMessage
  }

  recognition.value.onend = () => {
    isListening.value = false
  }

  recognition.value.start()
}

const setVoiceInputRef = (key) => (element) => {
  if (element) {
    voiceInputRefs[key] = element
  }
}
const props = defineProps({
  fields: {
    type: Array,
    required: true
  },
  submitLabel: {
    type: String,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['submit'])

const submitForm = (event) => {
  const formData = new FormData(event.target)
  const data = Object.fromEntries(formData.entries())

  const consentField = props.fields.find(
    field => field.type === 'consent'
  )

  if (consentField) {
    data[consentField.key] = formData.has(consentField.key)
  }

  emit('submit', data)
}
</script>

<template>
  <form
    class="space-y-4"
    @submit.prevent="submitForm"
  >

    <div
      v-for="field in fields"
      :key="field.key"
    >
      <!-- Text / Email / Tel / Number -->
      <div v-if="['text', 'email', 'tel', 'number'].includes(field.type)">
        <label class="mb-1 block text-sm font-medium text-gray-700">
          {{ field.label }}

          <span
            v-if="field.required"
            class="text-red-500"
          >
            *
          </span>
        </label>

        <input
          :name="field.key"
          :type="field.type"
          :min="field.min"
          :placeholder="field.placeholder"
          :value="field.value ?? ''"
          :readonly="field.editable === false"
          :required="field.required"
          :class="[
            'w-full rounded-md border border-gray-300 px-3 py-2 text-sm',
            field.editable === false
              ? 'bg-gray-100 text-gray-500'
              : 'text-gray-700'
          ]"
        />
      </div>

      <!-- Radio -->
      <div v-else-if="field.type === 'radio'">
        <label class="mb-2 block text-sm font-medium text-gray-700">
          {{ field.label }}

          <span
            v-if="field.required"
            class="text-red-500"
          >
            *
          </span>
        </label>

        <div class="space-y-2">
          <label
            v-for="option in field.options"
            :key="option.value"
            class="flex items-center gap-2 text-sm text-gray-700"
          >
            <input
              :name="field.key"
              type="radio"
              :value="option.value"
              :required="field.required"
            />

            {{ option.label }}
          </label>
        </div>
      </div>

      <!-- Dropdown -->
      <div v-else-if="field.type === 'dropdown'">
        <label class="mb-1 block text-sm font-medium text-gray-700">
          {{ field.label }}

          <span
            v-if="field.required"
            class="text-red-500"
          >
            *
          </span>
        </label>

        <select
          :name="field.key"
          :disabled="field.editable === false"
          class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700"
        >
          <option
            value=""
            disabled
          >
            {{ field.placeholder }}
          </option>

          <option
            v-for="option in field.options"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </div>

      <!-- Textarea -->
      <div v-else-if="field.type === 'textarea'">
        <label class="mb-2 block text-sm font-medium text-gray-700">
          {{ field.label }}

          <span
            v-if="field.required"
            class="text-red-500"
          >
            *
          </span>
        </label>

        <textarea
          :ref="field.voiceInput?.enabled
            ? setVoiceInputRef(field.key)
            : undefined"
          :name="field.key"
          rows="4"
          :placeholder="field.placeholder"
          :readonly="field.editable === false"
          :required="field.required"
          class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700"
        ></textarea>
        <button
          v-if="field.voiceInput?.enabled"
          type="button"
          @click="startVoiceInput(field)"
          class="mt-2 w-full rounded-md border border-primary-600 bg-primary-50 px-3 py-2 text-sm font-medium text-primary-700"
        >
          {{ isListening
            ? field.voiceInput.listeningLabel
            : field.voiceInput.label
          }}
        </button>

        <p
          v-if="field.voiceInputError"
          class="mt-2 text-sm text-red-600"
        >
          {{ field.voiceInputError }}
        </p>
      </div>

      <!-- Consent -->
      <div v-else-if="field.type === 'consent'">
        <label class="flex items-start gap-2 text-sm text-gray-700">
          <input
            :name="field.key"
            type="checkbox"
            :required="field.required"
            class="mt-1"
          />

          <span>
            {{ field.label }}
          </span>
        </label>
      </div>
    </div>

    <button
      type="submit"
      :disabled="loading"
      class="w-full rounded-lg bg-primary-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {{ submitLabel }}
    </button>
    <p
      v-if="error"
      class="text-sm text-red-600"
    >
      {{ error }}
    </p>

  </form>
</template>
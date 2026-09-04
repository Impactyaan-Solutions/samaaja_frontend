<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Share2 } from 'lucide-vue-next'

import AppHeader from '@/components/common/AppHeader.vue'
import { getVolunteerOpportunity } from '@/services/api'

const route = useRoute()
const router = useRouter()

const opportunity = ref(null)
const loading = ref(true)
const error = ref(null)

const fetchOpportunity = async () => {
  try {
    loading.value = true
    error.value = null

    const result = await getVolunteerOpportunity(route.params.id)

    opportunity.value = result
  } catch (e) {
    error.value = e.message || 'Failed to load volunteer opportunity.'
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/volunteer-listings')
}

onMounted(() => {
  fetchOpportunity()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader />

    <main class="mx-auto max-w-4xl px-4 pb-28 pt-6">
      <!-- Loading -->
      <div
        v-if="loading"
        class="flex min-h-[60vh] items-center justify-center"
      >
        Loading...
      </div>

      <!-- Error -->
      <div
        v-else-if="error"
        class="flex min-h-[60vh] items-center justify-center text-red-500"
      >
        {{ error }}
      </div>

      <!-- Opportunity -->
      <div v-else-if="opportunity">
        <!-- Header -->
        <div class="mb-6 flex items-center justify-between">
          <button
            type="button"
            class="flex items-center gap-2 text-sm font-medium"
            @click="goBack"
          >
            <ArrowLeft class="h-5 w-5" />
            Back
          </button>

          <button
            type="button"
            class="rounded-full p-2"
          >
            <Share2 class="h-5 w-5" />
          </button>
        </div>

        <!-- Opportunity Title Card -->
        <div class="rounded-2xl bg-white p-5 shadow-sm">
          <div class="mb-3">
            <span
              class="inline-flex rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-600"
            >
              {{ opportunity.category }}
            </span>
          </div>
          <h1 class="text-2xl font-bold text-gray-900">
            {{ opportunity.title }}
          </h1>
          <div class="mt-3 flex items-center gap-2 text-sm text-gray-500">
            <span>{{ opportunity.location }}</span>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>
































<!--
PSEUDO-CODE: VOLUNTEER OPPORTUNITY DETAIL VIEW PAGE

START

1. Open this page when the user clicks "View Details"
   from the Volunteer Listings page.

2. Receive the selected volunteer opportunity ID
   from the route.

3. Show a loading state while fetching the opportunity details.

4. Call the Volunteer Opportunity Detail API
   using the opportunity ID.

5. If the API request is successful:
   - Store the returned opportunity details.
   - Stop the loading state.

6. Display the page header:
   - Static title: "Volunteer Opportunity"
   - Back button.
   - Share button.

7. Back Button:
   - When clicked, navigate to the Community Pulse
     landing page of the app.

8. Share Button:
   - Create the link for the current opportunity page.
   - Copy the link to the clipboard.
   - Show a success message if the link is copied.
   - Show an error message if copying fails.

9. Display the Opportunity Title Card:
   - Category Type tag.
   - Opportunity title.
   - Location.

10. Display "About this Opportunity":
    - Show the opportunity description.
    - Display a few lines initially.
    - Allow the description section to scroll
      when the content is longer.

11. Display "What is Expected":
    - Expected time commitment.
    - Start date.
    - End date.
    - Volunteer format:
      Remote / On-ground / Hybrid.
    - Compensation:
      Pro Bono / Paid.

12. Display "Skills Needed":
    - Display all required skills as tags.

13. Display "What happens after I apply":
    - Show static information explaining that
      the application will be reviewed and the user
      will be contacted on the provided details.

14. Display a fixed "Apply Now" button:
    - Keep the button fixed at the bottom.
    - Keep it above the bottom navigation.

15. Apply Now:
    - When the user clicks "Apply Now",
      start the volunteer application flow.
    - Application form and submission workflow
      will be implemented in a later scope.

16. If fetching opportunity details fails:
    - Stop the loading state.
    - Display an error message.

END
-->
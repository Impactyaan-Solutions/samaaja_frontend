<script setup>
/*
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
*/
</script>

<template>
  <!--
  PSEUDO-CODE:

  Render required application fields

  Render Submit button

  On Submit:
      validate
      call apply API
      emit success/error response
  -->
</template>
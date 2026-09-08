<script setup>
/*
PSEUDO-CODE: APPLICATION FORM PAGE

1. Get volunteer opportunity ID from route.

2. When page opens:
   - Call check_application API using opportunity ID.

3. If already_applied is true:
   - Do not render the application form.
   - Show "Already applied" response/message.

4. If already_applied is false:
   - Load the reusable Form component.
   - Pass the opportunity ID to the Form component.
   - Pass required profile information from authState
     to the Form component as pre-filled/hidden values.

5. Listen for form submission/result.

6. Display the API success or error response
   returned after application submission.
*/
</script>

<template>
  <!--
  PSEUDO-CODE:

  IF checking application:
      show loading state

  ELSE IF already applied:
      show already-applied message

  ELSE:
      render common Form component
  -->
</template>
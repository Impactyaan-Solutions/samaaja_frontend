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
# Stock Broker Dashboard - Setup Instructions

## Disable Email Confirmation (For Development)

To allow users to sign up and login immediately without email verification:

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Providers**
3. Find the **Email** provider
4. Scroll down to **Confirm email**
5. **Uncheck** the "Confirm email" toggle
6. Click **Save**

Now users can sign up and will be automatically logged in without needing to verify their email.

## Alternative: Use Magic Links (Optional)

If you want to test email functionality locally:

1. In Supabase Dashboard, go to **Authentication** → **Email Templates**
2. For development, you can see confirmation links in the Supabase logs
3. Navigate to **Authentication** → **Users** to manually confirm users

## For Production

Remember to re-enable email confirmation before deploying to production:
- Enable "Confirm email" toggle
- Configure proper email templates
- Set up custom SMTP (optional) for branded emails

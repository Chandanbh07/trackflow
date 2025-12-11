-- Auto-confirm all new users (bypasses email confirmation requirement)
-- This is useful for development when you don't want to set up email confirmation

CREATE OR REPLACE FUNCTION auto_confirm_user()
RETURNS trigger AS $$
BEGIN
  -- Update the user to be confirmed automatically
  UPDATE auth.users
  SET email_confirmed_at = NOW(),
      confirmed_at = NOW()
  WHERE id = NEW.id
  AND email_confirmed_at IS NULL;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-confirm users on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auto_confirm_user();

-- Note: This trigger will automatically confirm all new users
-- Remove this in production if you want proper email verification

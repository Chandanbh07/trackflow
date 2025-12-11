# StockTracker Pro - Stock Broker Dashboard

A real-time stock monitoring dashboard that allows users to subscribe to and track their favorite stocks.

## Features

- **User Authentication**: Secure email/password authentication with Supabase
- **Stock Subscriptions**: Subscribe to up to 5 supported stocks (GOOG, TSLA, AMZN, META, NVDA)
- **Real-time Updates**: Stock prices update every second without page refresh
- **Multi-user Support**: Multiple users can have different subscriptions updating independently
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Setup

1. **Database Setup**: Run the SQL scripts in the `scripts` folder to set up the database:
   - `001_create_subscriptions_table.sql` - Creates the subscriptions table
   - `002_auto_confirm_users.sql` - Auto-confirms new users (for development)

2. **Sign Up**: Create an account with your email and password

3. **Start Trading**: Subscribe to stocks and watch them update in real-time!

## Supported Stocks

- GOOG (Google)
- TSLA (Tesla)
- AMZN (Amazon)
- META (Meta)
- NVDA (NVIDIA)

## Development Note

The app uses simulated stock prices that update every second with random fluctuations (±2%). In production, you would integrate with a real stock API.

## Security

- Row Level Security (RLS) is enabled on the subscriptions table
- Users can only view and manage their own subscriptions
- All authentication is handled securely by Supabase
</parameter>

# Analytics Setup Guide

This project includes three options for tracking visitors to your waitlist page:

## Option 1: Google Analytics 4 (Recommended)

Google Analytics provides comprehensive analytics including:
- Page views
- User demographics
- Traffic sources
- Real-time visitors
- And much more

### Setup Steps:

1. **Create a Google Analytics account** (if you don't have one):
   - Go to [Google Analytics](https://analytics.google.com/)
   - Sign up for a free account
   - Create a new property for your website

2. **Get your Measurement ID**:
   - In Google Analytics, go to Admin → Data Streams
   - Click on your web stream
   - Copy your Measurement ID (format: `G-xxxxxxxxxx`)

3. **Add the Measurement ID to your environment variables**:
   - Create or update your `.env.local` file in the `web` directory
   - Add: `NEXT_PUBLIC_GA_ID=G-6HEOKZ7B9G`
   - **Note**: Your Google Analytics ID is `G-6HEOKZ7B9G` (already configured in the code)

4. **View your analytics**:
   - Visit [Google Analytics](https://analytics.google.com/)
   - Navigate to Reports → Realtime to see current visitors
   - Check Reports → Engagement → Pages and screens to see page view counts

## Option 2: Custom Supabase Tracking

This option stores page views directly in your Supabase database, giving you full control over your data.

### Setup Steps:

1. **Create the `page_views` table in Supabase**:
   - Go to your Supabase dashboard
   - Navigate to Table Editor
   - Create a new table called `page_views` with the following columns:
     - `id` (uuid, primary key, default: `gen_random_uuid()`)
     - `path` (text, not null)
     - `timestamp` (timestamptz, not null)
     - `referrer` (text, nullable)
     - `user_agent` (text, nullable)
     - `created_at` (timestamptz, default: `now()`)

2. **Enable tracking** (optional):
   - By default, tracking only works in production
   - To enable in development, add to `.env.local`: `NEXT_PUBLIC_ENABLE_PAGE_TRACKING=true`

3. **Query your data**:
   - You can query the `page_views` table directly in Supabase
   - Example SQL to count waitlist page views:
     ```sql
     SELECT COUNT(*) 
     FROM page_views 
     WHERE path = '/waitlist';
     ```
   - Example to see recent visitors:
     ```sql
     SELECT path, timestamp, referrer 
     FROM page_views 
     WHERE path = '/waitlist'
     ORDER BY timestamp DESC 
     LIMIT 100;
     ```

## Option 3: Vercel Analytics (Automatic)

Vercel Analytics is automatically enabled when you deploy to Vercel. It provides:
- Web Vitals tracking (Core Web Vitals metrics)
- Page view analytics
- Real-time analytics dashboard
- No additional configuration needed

### Setup Steps:

1. **Deploy to Vercel**: 
   - The Analytics component is already integrated in `layout.tsx`
   - Simply deploy your app to Vercel and analytics will work automatically

2. **View your analytics**:
   - Go to your Vercel dashboard
   - Navigate to the Analytics tab for your project
   - View real-time and historical data

**Note**: Vercel Analytics works automatically in production on Vercel. No environment variables or additional setup required.

## Using Multiple Options

You can use Google Analytics, Supabase tracking, and Vercel Analytics simultaneously. They work independently and won't interfere with each other.

## Viewing Waitlist Page Statistics

### Google Analytics:
- Go to Reports → Engagement → Pages and screens
- Filter by page path containing `/waitlist`
- Or use the search bar to find `/waitlist`

### Supabase:
- Use the SQL editor to run queries on the `page_views` table
- Create a dashboard view in Supabase Studio
- Or build a custom admin page in your Next.js app

## Troubleshooting

- **Google Analytics not working**: Make sure `NEXT_PUBLIC_GA_ID` is set correctly in your `.env.local` file
- **Supabase tracking not working**: 
  - Verify the `page_views` table exists
  - Check that `SUPABASE_SERVICE_ROLE_KEY` is set in your environment variables
  - Ensure you're in production mode or have `NEXT_PUBLIC_ENABLE_PAGE_TRACKING=true` set

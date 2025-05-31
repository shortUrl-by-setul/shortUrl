import { createClient } from '@supabase/supabase-js';
// Create a single supabase client for interacting with your database
const goHere = 'https://ewzkjhdkkgvfcjzwmsuc.supabase.co';
// process.env.SUPABASE_KEY
const withThis = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3emtqaGRra2d2ZmNqendtc3VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzMzM1OTksImV4cCI6MjA1OTkwOTU5OX0.--5sBUEUvVxnGCZU0bsIwoUStK9xKvIDUed8ZzEuHn8';
export const supabase = createClient(goHere, withThis);
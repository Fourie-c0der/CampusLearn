-- Create the messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  sender TEXT NOT NULL,
  recipient TEXT NOT NULL,
  content TEXT NOT NULL,
  module TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Disable Row Level Security for anonymous access
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

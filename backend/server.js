import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const START_PORT = Number(process.env.PORT) || 5000;

// Set up generative AI if key exists
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

// Middleware
app.use(cors());
app.use(express.json());

// Get the directory path for the sqlite file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db;

// Initialize SQLite Database
async function initDb() {
  try {
    const dbPath =
      process.env.DB_PATH?.trim() ||
      path.join(__dirname, 'database.sqlite');

    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    console.log('Connected to SQLite database.');

    // Create tables
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT UNIQUE,
        phone TEXT,
        password TEXT,
        age TEXT,
        gender TEXT,
        dob TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS assessments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT,
        formData TEXT,
        result TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Backward-compatible migration for existing DBs created before dob field existed
    const userCols = await db.all(`PRAGMA table_info(users)`);
    const hasDobColumn = userCols.some((c) => c.name === 'dob');
    if (!hasDobColumn) {
      await db.exec(`ALTER TABLE users ADD COLUMN dob TEXT`);
    }
  } catch (error) {
    console.error('Failed to initialize SQLite database:', error);
    throw error;
  }
}

async function main() {
  await initDb();
  startListening(START_PORT);
}

function requireDb(req, res, next) {
  if (!db) {
    return res.status(503).json({
      error: 'Database not initialized.',
    });
  }
  return next();
}

// Basic Route
app.get('/api/status', (req, res) => {
  res.json({ status: 'API is running.', dbConnected: !!db });
});

// Chat Route
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const text = message.toLowerCase().trim();

    // Safety check first
    if (text.includes('suicid') || text.includes('kill my') || text.includes('end my life') || text.includes('self harm') || text.includes('hurt my')) {
      return res.json({
        response: "I am really glad you reached out. If you may be in danger, please contact your local emergency service immediately. You can also call or text a crisis helpline in your country. Your life is valuable and there is support available."
      });
    }

    if (genAI) {
      // Use Gemini
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `You are Wellness AI, an empathetic, supportive, and practical mental health assistant.
The user is talking to you for support. Respond directly to their specific issue. Be concise, empathetic, and offer one or two actionable pieces of advice. Keep your response under 4 sentences. Do not use markdown styling unless absolutely necessary.
User's message: "${message}"`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      return res.json({ response: responseText });
    }

    // Dynamic Fallback Heuristics
    const has = (words) => words.some(w => text.includes(w));

    if (has(['hello', 'hi', 'hey'])) {
      return res.json({ response: "Hi there! How are you feeling today? I'm here to support you with stress, sleep, mood, or focus. Tell me what's on your mind." });
    }
    if (has(['stress', 'anxious', 'anxiety', 'panic', 'worry', 'overthinking'])) {
      return res.json({ response: "I hear that you're feeling stressed or anxious. A quick grounding exercise can help: try breathing in for 4 seconds, holding for 4, and exhaling for 6. Would you like to try breaking down what's worrying you?" });
    }
    if (has(['sleep', 'insomnia', 'tired', 'wake'])) {
      return res.json({ response: "Sleep struggles can really drain you. A good tip is to strictly separate your sleep environment from work, and try a 5-minute wind-down routine tonight. How many hours did you get last night?" });
    }
    if (has(['depress', 'sad', 'low', 'empty', 'hopeless', 'cry'])) {
      return res.json({ response: "I'm sorry you are feeling this way. It sounds very heavy. A gentle goal for today might be to do just one small self-care task, like drinking a glass of water or getting 5 minutes of sunlight. I'm here for you." });
    }
    if (has(['focus', 'study', 'work', 'procrastination', 'distract'])) {
      return res.json({ response: "If focus is tough today, try setting a timer for just 15 minutes of work, then take a full break. Removing your phone from the room often helps too. What is the very first step of the task you need to do?" });
    }
    if (has(['thank', 'thanks', 'appreciate'])) {
      return res.json({ response: "You're very welcome. Remember to be kind to yourself today." });
    }

    const fallbacks = [
      "I understand. Could you tell me a little more about how long you've been feeling this way?",
      "That sounds challenging. How does this make you feel physically and emotionally?",
      "I hear you. What is one small step that might make things feel just a tiny bit easier right now?",
      "Thank you for sharing that. It takes courage to open up. Could you provide a bit more context so I can offer specific guidance?",
      "I'm here to listen. Sometimes just writing it all out helps. Feel free to elaborate."
    ];
    const fallbackMessage = fallbacks[message.length % fallbacks.length];

    return res.json({ response: fallbackMessage });

  } catch (error) {
    console.error('Chat API Error:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

// Authentication Routes
app.post('/api/auth/register', requireDb, async (req, res) => {
  try {
    const { name, email, phone, password, age = '', gender = '' } = req.body;

    // Check if user already exists
    const existingUser = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    // Create new user
    const result = await db.run(
      'INSERT INTO users (name, email, phone, password, age, gender, dob) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email, phone, password, String(age), String(gender), '']
    );

    const savedUser = await db.get('SELECT * FROM users WHERE id = ?', [result.lastID]);

    // Don't send the password back
    const userToReturn = {
      id: savedUser.email, // using email as ID for frontend compatibility
      email: savedUser.email,
      name: savedUser.name,
      phone: savedUser.phone,
      createdAt: savedUser.createdAt,
      age: savedUser.age,
      gender: savedUser.gender
    };

    res.status(201).json({ user: userToReturn });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed.' });
  }
});

app.post('/api/auth/login', requireDb, async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(400).json({ error: 'No account found with this email.' });
    }

    if (user.password !== password) {
      return res.status(401).json({ error: 'Wrong password.' });
    }

    const userToReturn = {
      id: user.email, // using email as ID for frontend compatibility
      email: user.email,
      name: user.name,
      phone: user.phone,
      createdAt: user.createdAt,
      age: user.age,
      gender: user.gender
    };

    res.status(200).json({ user: userToReturn });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed.' });
  }
});

// Simplified Google auth path for quick onboarding
app.post('/api/auth/google', requireDb, async (req, res) => {
  try {
    const { email, name } = req.body || {};
    if (!email) {
      return res.status(400).json({ error: 'Email is required for Google login.' });
    }
    let user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      const displayName = name || email.split('@')[0];
      const result = await db.run(
        'INSERT INTO users (name, email, phone, password, age, gender, dob) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [displayName, email, '', 'google-auth', '', '', '']
      );
      user = await db.get('SELECT * FROM users WHERE id = ?', [result.lastID]);
    }
    return res.status(200).json({
      user: {
        id: user.email,
        email: user.email,
        name: user.name,
        phone: user.phone,
        createdAt: user.createdAt,
        age: user.age,
        gender: user.gender
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    return res.status(500).json({ error: 'Google login failed.' });
  }
});

// Save an assessment
app.post('/api/assessments', requireDb, async (req, res) => {
  try {
    const { userId, formData, result } = req.body;

    const dbResult = await db.run(
      'INSERT INTO assessments (userId, formData, result) VALUES (?, ?, ?)',
      [userId, JSON.stringify(formData), JSON.stringify(result)]
    );

    const savedAssessment = await db.get('SELECT * FROM assessments WHERE id = ?', [dbResult.lastID]);

    // Keep user profile fields in sync so next login includes persisted age/gender
    if (formData?.age || formData?.gender) {
      await db.run(
        'UPDATE users SET age = COALESCE(NULLIF(?, \'\'), age), gender = COALESCE(NULLIF(?, \'\'), gender) WHERE email = ?',
        [String(formData.age || ''), String(formData.gender || ''), userId]
      );
    }

    // Parse JSON string back to object for the response
    res.status(201).json({
      ...savedAssessment,
      formData: JSON.parse(savedAssessment.formData),
      result: JSON.parse(savedAssessment.result)
    });
  } catch (error) {
    console.error('Error saving assessment:', error);
    res.status(500).json({ error: 'Failed to save assessment' });
  }
});

// Get assessment history for a specific user
app.get('/api/assessments/:userId', requireDb, async (req, res) => {
  try {
    const { userId } = req.params;

    const history = await db.all('SELECT * FROM assessments WHERE userId = ? ORDER BY createdAt DESC', [userId]);

    // Parse JSON strings back to objects
    const formattedHistory = history.map(item => ({
      ...item,
      formData: JSON.parse(item.formData),
      result: JSON.parse(item.result)
    }));

    res.status(200).json(formattedHistory);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

app.patch('/api/users/:email/profile', requireDb, async (req, res) => {
  try {
    const { email } = req.params;
    const { age = '', gender = '' } = req.body || {};
    await db.run(
      'UPDATE users SET age = COALESCE(NULLIF(?, \'\'), age), gender = COALESCE(NULLIF(?, \'\'), gender) WHERE email = ?',
      [String(age), String(gender), email]
    );
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({
      id: user.email,
      email: user.email,
      name: user.name,
      phone: user.phone,
      createdAt: user.createdAt,
      age: user.age,
      gender: user.gender
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
});

// --- NEW CODE: Serve React Frontend ---
// This tells Express to serve the static files inside the 'dist' folder
app.use(express.static(path.join(__dirname, '../dist')));

// This acts as a catch-all for React Router. Every route not handled by an /api route will return the React app.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});
// --------------------------------------
function startListening(port, attemptsLeft = 10) {
  const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });

  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE' && attemptsLeft > 0) {
      server.close(() => startListening(port + 1, attemptsLeft - 1));
      return;
    }
    throw err;
  });
}

main().catch(() => {
  process.exitCode = 1;
});

# Discord Roblox Game Idea Bot

A Discord bot that lets users sign in, save chat memory for each account, and generate Roblox game ideas with AI.

Features:
- `/signin` — signs the Discord user in and stores their profile.
- `/gameidea <prompt>` — generates a Roblox game idea with AI memory support.
- `/resetmemory` — clears prior conversation memory for that user.
- Fallback AI mode if `OPENAI_API_KEY` is not set.
- SQLite storage for user profiles and chat memory.

Tech stack:
- Node.js
- Discord.js
- OpenAI API
- SQLite via better-sqlite3

Quick start:
1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy the example environment file and fill in your values:
   ```bash
   cp .env.example .env
   ```

3. Add your Discord bot token and app ID:
   - `DISCORD_TOKEN`
   - `CLIENT_ID`
   - `GUILD_ID` is optional, but useful for quick testing in one server
   - `OPENAI_API_KEY` is optional; if left blank, the bot still works with a built-in fallback generator

4. Start the bot:
   ```bash
   npm start
   ```

Commands:
- `/signin`
- `/gameidea` with a prompt like: `A futuristic city-building game with drifting cars and co-op missions`
- `/resetmemory`

Example flow:
```text
/user: /signin
Bot: You are now signed in.
/user: /gameidea A survival game set in a giant space station with crafting and PvE raids
Bot: Returns a full Roblox game concept, progression plan, and starter structure.
```

Notes:
- This bot creates game ideas and starter project direction.
- It does not directly build inside Roblox Studio or upload to Roblox automatically.
- If you want the next step, we can extend this bot to generate Roblox Lua starter scripts and folder templates.

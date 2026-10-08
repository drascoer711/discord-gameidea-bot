import OpenAI from 'openai';

const systemPrompt = `You are a professional Roblox game designer and creative director.
Your job is to create exciting Roblox game concepts with a clear theme, mechanics, progression, and starter script structure.
The answer must be friendly, structured, and useful to a developer building a Roblox game.
Return output in plain text with sections and bullet points.
You are also remembering the user's previous chat topics to keep continuity.
`;

function createFallbackGameIdea({ prompt, memory }) {
  const cleanPrompt = prompt || 'A fun Roblox game';
  const memoryText = memory.length ? `Recent memory: ${memory.join(' | ')}` : 'No prior memory yet.';

  return `Here is a Roblox game idea based on your prompt: "${cleanPrompt}"

Game Title: ${cleanPrompt.split(' ').slice(0, 4).join(' ')} Rush
Genre: Action Adventure / Social / Co-op
Core Hook:
- Players are dropped into a massive open-world Roblox map where they gather loot, fight enemies, and build a base.
- The main goal is to survive, upgrade gear, and unlock special abilities over time.

Why it works:
- Easy to learn, fun to replay, and perfect for Roblox players.
- Includes collectibles, progression, mini-boss fights, and social co-op play.

Game Loop:
1. Spawn into a themed world.
2. Complete quests and gather materials.
3. Fight enemies and bosses.
4. Upgrade abilities and gear.
5. Unlock new zones and challenge events.

Main Features:
- Character leveling system
- Shop and upgrade station
- Team-based co-op battle zones
- Daily rewards and challenge missions
- Cosmetic unlocks and avatar progression

Roblox Starter Structure:
- ServerScriptService/GameManager.lua
- StarterPlayer/StarterPlayerScripts/MovementController.lua
- StarterGui/MainUI.lua
- ReplicatedStorage/Config/GameConfig.lua
- Workspace/Map/SpawnZones.lua

Example progression:
- Stage 1: Beginner arena
- Stage 2: Boss dungeon
- Stage 3: PvP arena or floating island
- Stage 4: Ultimate raid event

Memory note:
${memoryText}

If you want, I can turn this into a more detailed game pitch or generate starter Roblox Lua scripts next.
`;
}

export async function generateRobloxGameIdea({ prompt, userName, memory = [] }) {
  const sanitizedPrompt = String(prompt || 'Create a Roblox game idea').trim();
  const memoryText = memory.length ? memory.map((entry) => `- ${entry}`).join('\n') : 'No memory yet.';

  if (!process.env.OPENAI_API_KEY) {
    return createFallbackGameIdea({ prompt: sanitizedPrompt, memory: memory.slice(-3) });
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.9,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `User name: ${userName}\nPrevious memory:\n${memoryText}\n\nCreate a Roblox game concept based on this idea: "${sanitizedPrompt}". Include a title, genre, hook, gameplay loop, features, progression, and a basic Roblox starter structure. Keep it practical and ready for a Roblox developer to build.`
        }
      ]
    });

    return completion.choices[0]?.message?.content || createFallbackGameIdea({ prompt: sanitizedPrompt, memory: memory.slice(-3) });
  } catch (error) {
    console.error('OpenAI request failed:', error);
    return createFallbackGameIdea({ prompt: sanitizedPrompt, memory: memory.slice(-3) });
  }
}

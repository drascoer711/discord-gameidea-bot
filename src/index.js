import 'dotenv/config';
import { Client, GatewayIntentBits, REST, Routes, InteractionType } from 'discord.js';
import { getUser, getMemory, saveMemory, resetMemory, upsertUser } from './db.js';
import { generateRobloxGameIdea } from './ai.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages
  ]
});

const commands = [
  {
    name: 'signin',
    description: 'Sign in to your Roblox game designer profile.'
  },
  {
    name: 'gameidea',
    description: 'Generate a Roblox game idea with AI and memory support.',
    options: [
      {
        name: 'prompt',
        description: 'Describe the type of Roblox game you want.',
        type: 3,
        required: true
      }
    ]
  },
  {
    name: 'resetmemory',
    description: 'Clear the saved conversation memory for this account.'
  }
];

async function registerCommands() {
  const token = process.env.DISCORD_TOKEN;
  const clientId = process.env.CLIENT_ID;

  if (!token || !clientId) {
    throw new Error('Missing DISCORD_TOKEN or CLIENT_ID in .env');
  }

  const rest = new REST({ version: '10' }).setToken(token);

  if (process.env.GUILD_ID) {
    await rest.put(Routes.applicationGuildCommands(clientId, process.env.GUILD_ID), {
      body: commands
    });
  } else {
    await rest.put(Routes.applicationCommands(clientId), {
      body: commands
    });
  }
}

async function handleSignin(interaction) {
  const { user } = interaction;

  upsertUser({
    id: user.id,
    username: user.username,
    discriminator: user.discriminator || null
  });

  await interaction.reply({
    content: `You are now signed in as ${user.username}. Your Roblox game ideas and memory will be saved to your account.`,
    ephemeral: true
  });
}

async function handleGameIdea(interaction) {
  const user = interaction.user;
  const savedUser = getUser(user.id);

  if (!savedUser || savedUser.signed_in !== 1) {
    await interaction.reply({
      content: 'You need to sign in first using `/signin` before generating game ideas.',
      ephemeral: true
    });
    return;
  }

  const prompt = interaction.options.getString('prompt');
  const memory = getMemory(user.id, 8).map((row) => row.content);

  const idea = await generateRobloxGameIdea({
    prompt,
    userName: user.username,
    memory
  });

  const memoryEntry = `User request: ${prompt}\nAI output: ${idea}`;
  saveMemory(user.id, memoryEntry);

  await interaction.reply({
    content: idea,
    ephemeral: false
  });
}

async function handleResetMemory(interaction) {
  const user = interaction.user;
  const savedUser = getUser(user.id);

  if (!savedUser) {
    await interaction.reply({
      content: 'You are not signed in yet. Use `/signin` first.',
      ephemeral: true
    });
    return;
  }

  resetMemory(user.id);

  await interaction.reply({
    content: 'Your saved memory has been cleared.',
    ephemeral: true
  });
}

client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);
  client.user.setPresence({
    activities: [{ name: 'Roblox ideas | /gameidea', type: 0 }],
    status: 'online'
  });

  try {
    await registerCommands();
    console.log('Slash commands registered successfully.');
  } catch (error) {
    console.error('Failed to register commands:', error);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  try {
    switch (interaction.commandName) {
      case 'signin':
        await handleSignin(interaction);
        break;
      case 'gameidea':
        await handleGameIdea(interaction);
        break;
      case 'resetmemory':
        await handleResetMemory(interaction);
        break;
      default:
        break;
    }
  } catch (error) {
    console.error('Interaction error:', error);
    if (interaction.deferred || interaction.replied) {
      await interaction.followUp({
        content: 'Something went wrong while running that command.',
        ephemeral: true
      });
      return;
    }

    await interaction.reply({
      content: 'Something went wrong while running that command.',
      ephemeral: true
    });
  }
});

client.login(process.env.DISCORD_TOKEN);

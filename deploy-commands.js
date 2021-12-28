const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildId, token } = require('./config.json');

// Should I just change this into a giant subcommand tree to keep the command list free of noise?
const commands = [
	new SlashCommandBuilder().setName('yabai_mc_start').setDescription('Starts the minecraft server'),
	new SlashCommandBuilder().setName('yabai_mc_stop').setDescription('Stops the minecraft server'),
	new SlashCommandBuilder()
		.setName('yabai_mc_command')
		.setDescription('Sends a command to the minecraft server')
		.addStringOption(option =>
			option.setName('command')
				.setDescription('command string')
				.setRequired(true)),
	new SlashCommandBuilder().setName('yabai_mc_status').setDescription('Gets the status of the server'),	
	new SlashCommandBuilder().setName('yabai_mc_wake').setDescription('Tries to wake the server computer up'),
	new SlashCommandBuilder().setName('yabai_mc_cancelstop').setDescription('Cancels the server stop command if it is queued'),

]
	.map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);
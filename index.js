

const { Client, Intents, MessageEmbed } = require('discord.js');
const { 
    token, 
    serverAPIAddress, 
    secret, 
    startRoute, 
    commandRoute, 
    stopRoute, 
    cancelRoute, 
    wakeRoute, 
    statusRoute } 
    = require('./config.json');
const axios = require('axios');
const jwt = require('jsonwebtoken');


// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.once('ready', () => {
	console.log('Ready!');
});

// Spin up a fast mongodb and add this later
const approvedList = [
    '125100230872924161',
    '120059932052684803',
    '160263288276385792'
];

function checkUserApproved(userId) {
    // Check user approved, just a quick loop through
    // Dynamically check the user approved list I guess
    // Or make a event listener that triggers a new approved list refresh
    // After a user has been added
    return approvedList.includes(userId);
}

async function apiReq(route, body) {
    var token = jwt.sign({ body }, secret);

    var headers = {
        Authorization: token
    }

    const replyObj = await axios.post(serverAPIAddress+route, body, { headers })
        .then(response => {
            return(response.data.response);
        })
        .catch(error => {
            if(error.response) {
                if(error.response.data.response) {
                    return(error.response.data.response);
                } else {
                    return(
                        {
                            reply: " Web API is down, ping Alex",
                            error: true
                        }
                    )
                }
            }
            return(
                {
                    reply: error.code + " Server machine is down or something else went wrong. Try using the wake command and if that doesn't work DM Alex",
                    error: true
                }
            )
        });

    return replyObj;
}

function constructEmbed(message) {
    const embed = new MessageEmbed()
        .addFields(
            { name: 'Server Reply', value: message}
        );
    return embed;
}

async function handleCommand(interaction, route, body) {

    console.log(route, body)
    try{
        if(checkUserApproved(interaction.user.id)) {
            await interaction.deferReply();

            const replyObj = await apiReq(route, body);
            const embed = constructEmbed(replyObj.reply);

            if(replyObj.success) {
                embed.setColor('GREEN');
            } else {
                embed.setColor('RED');
            }

            await interaction.editReply({embeds: [embed], ephemeral: true });
        } else {
            await interaction.reply( {content: 'Can you stop trying to fuck with my bot?', ephemeral: true});

            // await interaction.reply('Unauthorized User: Ask Alex to be added to the list');
        }
    } catch(error) {
        // It should pretty much never get here
        console.log("Error in the command handler")
    }
}

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    // TODO: Abstract out into a command handler pattern
    // (The function above is not an actual command handler)
    // Since there's only going to be a couple of commands now
    // And I just want to get the skeleton MVP up, leave it like this
	if (commandName === 'yabai_mc_start') {
		handleCommand(interaction, startRoute, {
            userId: interaction.user.id
        })
	} else if (commandName === 'yabai_mc_stop') {
		handleCommand(interaction, stopRoute, {
            userId: interaction.user.id
        })
	} else if (commandName === 'yabai_mc_command') {
        handleCommand(interaction, commandRoute, {
            userId: interaction.user.id,
            command: interaction.options.getString('command')
        })
	} else if (commandName === 'yabai_mc_status') {
        handleCommand(interaction, statusRoute, {
            userId: interaction.user.id
        })
    } else if (commandName === 'yabai_mc_wake') {
        await interaction.reply( {content: 'Not implemented yet', ephemeral: true});
    } else if (commandName === 'yabai_mc_cancelstop') {
        handleCommand(interaction, cancelRoute, {
            userId: interaction.user.id
        })
    }
});

// Login to Discord with your client's token
client.login(token);
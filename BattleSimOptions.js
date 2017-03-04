// --==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==
// -- D I S C O R D   B A T T L E   S I M U L A T O R --
// Coded by Zedek the Plague Doctor, simple turn-based "battle" simulator
//
// This text file houses all of the various options for the battle simulator, change them to your liking
// --==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==

// -- ALL OF THE VARIOUS THINGS WE'RE GOING TO USE
BSOpt = {
	weapons: require('./weapons'),
	monsters: require('./monsters'),
	items: require('./items'),

	// -- CHANCES
	findChance: 0.25,
	wepChance: 0.5,
	idleChance: 0.25,

	// -- DIFFERENT EMOTES FOR DIFFERENT THINGS
	EMT_ATTACK: "pissed",								// -- SHOWN WHEN WE ATTACK
	EMT_DODGE: "chkkin",								// -- SHOWN WHEN WE DODGE
	EMT_SEARCH: "pack",									// -- SHOWN WHEN WE SEARCH
	EMT_GIBBED: "horrifying",							// -- WE'RE DEAD AND WE'RE GIBBED
	EMT_DEAD: "horrifying",								// -- DEAD BUT NOT GIBBED
	EMT_BANNERLEFT: "swastika",							// -- LEFT SIDE OF THE BANNER
	EMT_BANNERRIGHT: "swastika",						// -- RIGHT SIDE OF THE BANNER
	EMT_PACKICON: "pack",								// -- THE BACKPACKS WE GIVE OUT
	EMT_TURNM: "mystery",								// -- MONSTER IS THINKING
	EMT_TURNP: "smiles",								// -- PLAYER IS THINKING
	EMT_ALLDIED: "horrifying",							// -- BLOODY THING WHEN EVERYONE DIES

	GAMENAME: "VGP ARENA",								// -- THE ACTUAL NAME OF THE GAME

	STR_CUBE: "CUBE",									// -- WHAT SPAWNS THE MONSTERS
	STR_PACKS: "backpacks",								// -- WHAT ARE GIVEN TO THE PLAYERS
	STR_CUBELONG: "boss cube",							// -- WHAT APPEARS OUT OF NOWHERE

	SND_CUBESPAWN: "DSBOSPIT.wav",						// -- SOUND THAT PLAYS WHEN A CUBE IS SPAWNED
	SND_BACKPACKS: "DSWPNUP.wav",						// -- PLAYED WHEN PEOPLE GET THEIR WEAPONS

	// Constants
	BS_NOTHING: -1,										// -- NOT EVEN FIGHTING
	BS_WAITING: 0,										// -- IN THE LOBBY, WAITING
	BS_BACKPACKS: 1,									// -- GIVING PLAYERS THEIR BACKPACKS
	BS_SPAWNING: 2,										// -- SPAWNING A MONSTER
	BS_PLAYERTURN: 3,									// -- TIME FOR THE PLAYERS TO TAKE TURNS
	BS_MONSTERTURN: 4,									// -- MONSTERS TAKE THEIR TURNS

	// -- DIFFERENT ACTIONS --
	ACT_NONE: 0,
	ACT_DODGE: 1,
	ACT_ATTACK: 2,
	ACT_SEARCH: 3,
	ACT_SUICIDE: 4,

	backpackTime: 3,
	attackEndTime: 3,
	actionStrings: ["","Dodging","Attacking","Searching", "Suicidal"],

	spawnTime: 5,																		// How long it takes in seconds to "spawn" a monster...												
	missChance: 0.5,																		// The chance of missing a dodged player, this will be 50%

	// -- ALL OF THE MONSTERS THAT CAN SHOW UP --
	monsterURL: "./battle/images/",					// All images are stored in this folder
	spawnImage: "bosscube_full.png",				// The spawn image to use for the cube
	
	fightCommands: [
		// -- STARTS A BASIC FIGHT GAME
		{
			display:"!fight",id:"!fight",description:"Starts a fight.",process:function(message,BS){
				if (message.content.length <= 6 )
				{
					if (message.channel.guild.name == "Valhalla Game Plays")
					{
					if (BS.battleState == BS.BSoptions.BS_NOTHING){BS.startFight(message);}
					else{message.reply("A fight is already going!");}
					}
				}
			}
		},
		
		// -- SAYS THAT WE'RE READY
		{
			display:"!ready",id:"!ready",description:"Tells the fight that you're ready.",process:function(message,BS){
				if (BS.battleState == BS.BSoptions.BS_WAITING){BS.becomeReady(message.author); message.delete();}
				else{message.reply("Lobby time is over!");}
			}
		},
		
		// -- ACTUALLY ATTACKS IN A FIGHT GAME
		{
			display:"!attack",id:"!attack",description:"Attacks in a fight game.",process:function(message,BS){
				if (BS.battleState == BS.BSoptions.BS_PLAYERTURN){BS.setAction(message,BS.BSoptions.ACT_ATTACK);}
				else{message.reply("Wait your turn!");}
			}
		},
		
		// -- ACTUALLY DODGE IN A FIGHT GAME
		{
			display:"!dodge",id:"!dodge",description:"Dodges in a fight game.",process:function(message,BS){
				if (BS.battleState == BS.BSoptions.BS_PLAYERTURN){BS.setAction(message,BS.BSoptions.ACT_DODGE);}
				else{message.reply("Wait your turn!");}
			}
		},
		
		// -- SUICIDE IN A FIGHT GAME
		{
			display:"!suicide",id:"!suicide",description:"Kills yourself in a fight game.",process:function(message,BS){
				if (BS.battleState == BS.BSoptions.BS_PLAYERTURN){BS.setAction(message,BS.BSoptions.ACT_SUICIDE);}
				else{message.reply("Wait your turn!");}
			}
		},
		
		// -- ACTUALLY SEARCH IN A FIGHT GAME
		{
			display:"!search",id:"!search",description:"Searches in a fight game.",process:function(message,BS){
				if (BS.battleState == BS.BSoptions.BS_PLAYERTURN){BS.setAction(message,BS.BSoptions.ACT_SEARCH);}
				else{message.reply("Wait your turn!");}
			}
		},
		
		// -- JOINS A FIGHT GAME
		{
			display:"!play",id:"!play",description:"Joins a fight game.",process:function(message,BS){
				if (BS.battleState == BS.BSoptions.BS_WAITING)
				{
					BS.joinFight(message);
				}
				else{message.reply("No battle is going right now.");}
			}
		}
	]
}

module.exports = BSOpt;
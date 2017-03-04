// --==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==
// ALL OF THE POSSIBLE BATTLE ENVIRONMENTS
// --==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==

// THE ENVIRONMENTS YO
var environ = [

	// -- DON'T MODIFY THIS
	{
		id:"town",
		levelMin:0,
		levelMax:0,
		tags:[],
		BGpic:'hexen.png',
		tracks:[],
		findChanceMultiplier: 0.0,
		description:"Main Town",
		prefix:"the"
	},
	
	// -- HEXEN-ISH - DEFAULT
	{
		id:"hexen",
		levelMin:0,
		levelMax:999,
		tags:[],
		BGpic:'hexen.png',
		tracks:['xcom_tactics.mp3','nyarlathotep.mp3'],
		findChanceMultiplier: 1.0,
		description:"Dark Catacombs",
		prefix:"the"
	},
	
	// -- CHIPTUNE SHIT
	{
		id:"retro",
		levelMin:0,
		levelMax:999,
		tags:[],
		BGpic:'chiptune.png',
		tracks:['mystery.mp3', 'chiptune_two.mp3', 'chiptune_three.mp3'],
		findChanceMultiplier: 1.0,
		description:"Pixelated Dwelling",
		prefix:"a"
	}
];

// -- ALL OF THE TEMPLES WE CAN ENTER
var temples = [

	// SHRINE
	{
		enterImage:'temple_standard.png',
		name:"Shrine"
	},
	
	// TEMPLE
	{
		enterImage:'temple_standard.png',
		name:"Temple"
	},
	
	// TOMB
	{
		enterImage:'temple_standard.png',
		name:"Tomb"
	},
	
	// SACRIFICIAL CIRCLE
	{
		enterImage:'temple_standard.png',
		name:"Sacrificial Circle"
	},
	
	// RUINS
	{
		enterImage:'temple_standard.png',
		name:"Ruins"
	},
	
	// LABYRINTH
	{
		enterImage:'temple_standard.png',
		name:"Labyrinth"
	},
	
	// CHAMBER
	{
		enterImage:'temple_standard.png',
		name:"Chamber"
	}
]

// -- ALL OF THE POSSIBLE REGIONS TO EXPLORE
var biomes = [
	{
		enterString:"the forest",
		partyString:"Forest",
		fullName:"Forest",
		monsterTags:["forest"],
		musicTracks:[],
		bossTracks:[],
		id:"!forest",
		dungeonLevel:-1,
		allowInspect:true,
		icon:":evergreen_tree:",
		description:"The forest is dark, and the branches cover most of the ground in shadows...",
		specialEvents:[
			{
				id:"witchhut",
				chance:0.9,
				eventName:"Witch Hut",
				stumbleText:"**You stumble upon a run-down witch's hut in the middle of the forest...**",
				sweetener:"*Do you dare enter? Type* `!event` *to walk away, and* `!event enter` *to enter the home.*",
				eventImage:'witch.png',
				enterFunction: function(sim,message,account,party) {
					message.reply(":pig: **You open the door and a pig greets you!**");
					
					setTimeout(function(){party.eventID = ""; sim.monsterManager.startBattle("piggy",party,message);}.bind(this),1000);
					return {allowed:true,save:true};
				},
				leaveFunction: function(sim,message,account,party) {
					message.reply("**You leave the hut to find something else..**");
				}
			}
		]
	},
	
	{
		enterString:"the tropical Poknos",
		partyString:"Poknos Vacation",
		fullName:"Poknos",
		monsterTags:["beach"],
		musicTracks:['beach1.mp3','beach2.mp3'],
		bossTracks:[],
		id:"!beach",
		dungeonLevel:-1,
		allowInspect:true,
		icon:":kiwi:",
		description:"Welcome to the tropical Poknos beach! Anything goes in the Poknos. Sunshine, palm trees, Poknos.",
		specialEvents:[]
	},
	
	{
		enterString:"the main town",
		partyString:"In Town",
		fullName:"Main Town",
		icon:":house:",
		monsterTags:[""],
		musicTracks:[],
		bossTracks:[],
		id:"!town",
		allowInspect:false,
		dungeonLevel:0,
		description:"In the main town, you can meet various NPCs and enter the dungeon.",
		specialEvents:[]
	}
];
	
module.exports = environ;
module.exports.temples = temples;
module.exports.biomes = biomes;
module.exports.enchantImage = 'enchantstand.png'
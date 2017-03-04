// --==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==
// -- D I S C O R D   R P G   S I M U L A T O R --
// Coded by Zedek the Plague Doctor, simple turn-based "battle" simulator
// --==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==

const AccountManager = require('./RPGAccountManager.js');
const InventoryManager = require('./RPGInventoryManager.js');
const MonsterManager = require('./RPGMonsterManager.js');
const RPGCalculator = require('./RPGCalculator.js');
const CharClass = require('./codex/RPGcharacters.js');
const Image = require('purified-image');
const jsonfile = require('jsonfile');
const util = require('util');
const Discord = require("discord.js");

// EMAIL PASS IS RPGSIMULATOR
const botInfo = {username:"william79andres@gmail.com",pass:"duckfucks123",enabled:true,pic:'./icon_musicbot.png'};
const soundBotInfo = {username:"leinadserdna79@gmail.com",pass:"qwerty!",enabled:true,pic:'./icon_soundbot.png'};
//const botInfo = {username:"jigastophu@housat.com",pass:"rpgsimulator",enabled:true,pic:'./icon_musicbot.png'};
// TEMP ACCOUNT FOR STUFF - const soundBotInfo = {username:"fronisemip@housat.com",pass:"rpgsimulator",enabled:true,pic:'./icon_soundbot.png'};
//const soundBotInfo = {username:"frustugoki@housat.com",pass:"rpgsimulator",enabled:true,pic:'./icon_soundbot.png'};
const primaryServer = "216938799652012042";
const voiceChecker = "rpg";

// Various images to use for the pictures

var path = require('path');
//const imageDirectory = __dirname + '/images/';
const imageDirectory = path.join(__dirname, 'images/');

const fontDirectory = path.join(__dirname, 'fonts/');
const musicDirectory = path.join(__dirname, 'music/');
const environmentDirectory = path.join(__dirname, 'environments/');
const IMG_profBack = 'profile_template.png';
const IMG_profOverlay = 'profile_overlay.png';
const IMG_partyHeader = 'profile_template_party.png';
const IMG_partyKing = 'partyicon_king.png';
const IMG_partyPawn = 'partyicon_pawn.png';
const IMG_invBack = 'inventory_back.png';
const IMG_charBack = 'char_bg_large.png';
const IMG_charBar = 'char_bg.png';
const IMG_skillBar = 'skillbar.png';
const IMG_infoBack = 'iteminfo_back.png';
const IMG_infoBackLarge = 'iteminfo_back_tall.png';
const IMG_downstairs = 'downstairs.png';
const IMG_upstairs = 'upstairs.png';
const wrap = require('wordwrap')(30);

const maxBarLevel = 50;
const maxStatLevel = 100;
const pageCharCount = 14;
const charBarSize = 26;
const headerSize = 32;

// Offsets to put things
const POS_displayName = {x:89, y:58};
const POS_biography = {x:89, y:90};
const POS_barXP = {x:231, y:149, w:152, h:4};
const POS_barXPText = {x:252, y:144};
const POS_barLevel = {x:231, y:169, w:152, h:4};
const POS_barLevelText = {x:272, y:165};
const POS_statBarTop = {x:295, y:37, w:92, h:4};
const POS_statBarTopText = {x:362, y:41};
const POS_goldText = {x:256, y:185};
const statBarPadding = 11;
const POS_character = {x:44, y:84};
const POS_partyIcon = {x:2, y:18};
const POS_partyName = {x:19, y:25};
const POS_skillText = {x:272, y:24};
const POS_infoIcon = {x:2, y:1};
const POS_infoName = {x:40, y:7};
const POS_infoDescription = {x:40, y:18};
const POS_infoHelper = {x:40, y:30};
const COL_helper = "#d0ffad";

const POS_priceBuy = {x:32, y:43};
const POS_priceSell = {x:369, y:43};

// -- INVENTORY OFFSETS --
const POS_badgeWep = {x:12, y:133};
const POS_badgeEQA = {x:44, y:133};
const POS_badgeEQB = {x:44, y:165};
const POS_invStart = {x:9, y:24};
const POS_invW = {x:8, y:224};
const POS_invA = {x:40, y:224};
const POS_invB = {x:72, y:224};
const invBoxSize = 32;
const invWidth = 12;
const invHeight = 6;
const POS_inventoryTitle = {x:5, y:10};
const POS_inventoryGold = {x:335, y:10};


class RPGSimulator
{
	constructor()
	{
		// ALL OF THE ACCOUNTS FOR ALL OF THE USERS
		this.accountManager = new AccountManager();
		this.inventoryManager = new InventoryManager();
		this.monsterManager = new MonsterManager();
		this.calculator = new RPGCalculator();
		this.calculator.core = this;
		this.inventoryManager.core = this;
		this.monsterManager.core = this;
		this.characters = new CharClass();
		this.accountManager.characters = this.characters;
		this.accountManager.core = this;
		this.pageIcons = [];
		this.iconCounter = 0;
		this.environments = require('./RPGEnvironments.js');
		this.townsfolk = require('./RPGNPCs.js');
		this.soundBot = new Discord.Client();
		this.musicBot = new Discord.Client();
		this.playingMusic = false;
		this.voiceInfo = {conn: undefined, strm: undefined, playing: undefined, time:0, track:"", playingSound:false};
		this.soundVoiceInfo = {conn: undefined, strm: undefined, playing: undefined, time:0, track:"", playingSound:false};
		
		this.initializeBot();
		
		// ACCESS THESE JUST IN CASE
		this.inventoryWidth = invWidth;
		this.inventoryHeight = invHeight;
		
		// -- ALL OF THE POSSIBLE COMMANDS THAT WE CAN USE --
		this.commands = [
		
			// REGISTER AN ACCOUNT
			{secret: false, id:"!register", category: "Account", description:"Creates your first account for use with the RPG simulator.", finale: function(sim,message) {
				if (sim.accountManager.currentCreator === undefined) {sim.accountManager.addAccount(message);}
				else {message.reply("**Someone's already registering. please wait...**");}
			}},
			
			// LIST ALL OF THE RPG COMMANDS
			{secret: false, id:"!rpghelp", category: "Misc", description:"Lists all of the commands for the RPG sim.", finale: function(sim,message) {
				var AR = message.content.split(" ");
				
				if (AR.length < 2)
				{
					var finalString = "\n:book: **HERE ARE ALL THE RPG SIM CATEGORIES:**\n*Add the category to `!rpghelp` to view its commands.*\n\n";
					
					finalString += sim.printCommands(message,false);
					message.reply(finalString);
				}
				else
				{
					var finalString = "\n:books: **HERE ARE ALL THE COMMANDS FOR THE `"+AR[1]+"` CATEGORY:**\n\n";
					
					finalString += sim.printCommands(message,true,AR[1]);
					message.reply(finalString);
				}
			}},
			
			// SUBMIT A FIELD FOR REGISTRATION
			{secret: false, id:"!submit", category: "Account", description:"Submits info to use in the account creation process.", finale: function(sim,message) {
				if (sim.accountManager.currentCreator != undefined)
				{
					// Are we the one registering?
					if (message.author == sim.accountManager.currentCreator.user && sim.accountManager.currentCreator.state != 2) {sim.accountManager.handleStates(message,true);}
					else {message.reply("**You're not the one registering, hold up!**");}
				}
				else {message.reply("**Someone has to be registering first!**");}
			}},
			
			// CHANGE OUR DISPLAY NAME
			{secret: false, id:"!changename", category: "Account", description:"Changes your character's name. - `!changename Vladdy`", finale: function(sim,message) {
				var AIN = sim.accountManager.fetchListAccount(message.author.id); 
				if (AIN === undefined) {message.reply(sim.accountManager.STRING_accountMissing); return;}
				
				var ARR = message.content.split(" ");
				
				if (ARR.length < 2) {message.reply("You must enter a name!"); return;}
				
				ARR.shift();
				var bioString = ARR.join(" ");
				
				AIN.template.information.displayname = bioString;
				sim.accountManager.saveAccount(AIN.id);
				
				message.reply("\n:pencil2: **Your display name has been updated, it is now:** *"+bioString+"*");
			}},
			
			// CHANGE OUR DESCRIPTION
			{secret: false, id:"!changebio", category: "Account", description:"Changes your character's bio. - `!bio i am a peasant`", finale: function(sim,message) {
				var AIN = sim.accountManager.fetchListAccount(message.author.id); 
				if (AIN === undefined) {message.reply(sim.accountManager.STRING_accountMissing); return;}
				
				var ARR = message.content.split(" ");
				
				if (ARR.length < 2) {message.reply("You must enter a bio!"); return;}
				
				ARR.shift();
				var bioString = ARR.join(" ");
				
				AIN.template.information.description = bioString;
				sim.accountManager.saveAccount(AIN.id);
				
				message.reply("\n:pencil2: **Your bio has been updated, it is now:**\n*"+bioString+"*");
			}},
			
			// SHOW OUR RPG BADGE
			{secret: false, id:"!character", category: "Account", description:"Shows all info about an RPG character. Optionally, someone else's. - Ex. `!character janus`", finale: function(sim,message) {
				var ARR = message.content.split(" ");
				var destID = message.author.id;
				
				if (ARR.length > 1)
				{
					var UBT = sim.accountManager.userByText(ARR[1]);
					if (UBT === undefined) {message.reply("That user doesn't exist!"); return;}
					
					destID = UBT.id;
				}
				
				var AIN = sim.accountManager.fetchListAccount(destID); 
				if (AIN === undefined) {message.reply(sim.accountManager.STRING_accountMissing); return;}
				
				var JSOT = AIN.template;
				if (JSOT != undefined){sim.printBadge(message.channel,sim.accountManager.toBadgeInfo(JSOT, destID));}
				else {message.reply(sim.accountManager.STRING_accountMissing);}
			}},
			
			// SHOW SOME INVENTORY ITEMS
			{secret: false, id:"!inventory", category: "Inventory", description:"Shows your character's inventory.", finale: function(sim,message) {
				var ARR = message.content.split(" ");
				var destID = message.author.id;
				
				if (ARR.length > 1)
				{
					var UBT = sim.accountManager.userByText(ARR[1]);
					if (UBT === undefined) {message.reply("That user doesn't exist!"); return;}
					
					destID = UBT.id;
				}
				
				var JSOT = sim.accountManager.fetchListAccount(destID);
				if (JSOT != undefined){
					message.reply("*Fetching inventory, one moment...*");
					sim.printInventory(message.channel,sim.inventoryManager.toInventoryInfo(JSOT.template));
				}
				else {message.reply(sim.accountManager.STRING_accountMissing);}
			}},
			
			// REMOVE OUR ACCOUNT
			{secret: false, id:"!rpgreset", category: "Account", description:"Deletes your account and resets your character.", finale: function(sim,message) {
				
				var AIN = sim.accountManager.fetchListAccount(message.author.id);
				console.log("TYPEOFAIN IS "+typeof(AIN)+", IT'S "+AIN);
				
				if (AIN === undefined) {message.reply(sim.accountManager.STRING_accountMissing); return;}
				
				var PRT = sim.accountManager.partyByName(AIN.template.information.party);
				if (PRT != undefined) {message.reply("**You're in a party!** Leave all of your active parties in order to reset your account."); return;}
				
				console.log("WE MADE IT PAST AIN AND PRT");
				
				sim.accountManager.removePartyMember(PRT,AIN);
				
				sim.accountManager.deleteAccount(message);
			}},
			
			// HEALTH
			{secret: false, id:"!health", category: "Account", description:"Shows how much health you have.", finale: function(sim,message) {
				var AIN = sim.accountManager.fetchListAccount(message.author.id);
				if (AIN === undefined) {message.reply(sim.accountManager.STRING_accountMissing); return;}
				
				var HLT = sim.accountManager.finalStat(sim,AIN,"hp");
				var MHLT = sim.accountManager.finalStat(sim,AIN,"maxhp");
				message.reply("You have **"+HLT+"/"+MHLT+"** health.");
			}},

			// MORPH
			{secret: true, id:"!morph", category: "Debug", description:"Morphs into another character.", finale: function(sim,message) {
				var AIN = sim.accountManager.fetchListAccount(message.author.id);
				if (AIN === undefined) {message.reply(sim.accountManager.STRING_accountMissing); return;}
				
				var ARR = message.content.split(" ");
				if (ARR.length < 2) {message.reply("Enter a character!");}
				
				
				AIN.template.information.character = ARR[1].toLowerCase();
				sim.accountManager.saveAccount(AIN.id);
				
				message.reply("You successfully morphed into "+ARR[1]+".");
			}},
			
			// TEST DUNGEON GENERATION
			{secret: true, id:"!newdungeon", category: "Debug", description:"Generates a new dungeon.", finale: function(sim,message) {
				var DLVL = 1;
				var ARR = message.content.split(" ");
				if (ARR.length > 1)
				{
					if (!isNaN(parseInt(ARR[1]))) {DLVL = parseInt(ARR[1]);}
				}
				
				var DUNG = sim.calculator.generateDungeon(DLVL);
				message.reply("\n:map: **New dungeon:**\n\n"+sim.calculator.levelToEmotes(DUNG));
			}},
			
			// GOLD
			{secret: false, id:"!gold", category: "Account", description:"Shows how much gold you own.", finale: function(sim,message) {
				var AIN = sim.accountManager.fetchListAccount(message.author.id);
				if (AIN === undefined) {message.reply(sim.accountManager.STRING_accountMissing); return;}
				
				var ARR = message.content.split(" ");
				
				if (ARR.length < 2 || message.channel.name.toLowerCase().indexOf("developer") == -1) {message.reply("\n:moneybag: You have **"+AIN.template.stats.gold+"** gold. Fight monsters and explore to find more."); return;}
				
				var AMT = parseInt(ARR[1]);
				if (isNaN(AMT)) {message.reply("Enter a proper number."); return;}
				
				AIN.template.stats.gold += AMT;
				sim.accountManager.saveAccount(AIN.id);
				message.reply("You gave yourself "+AMT+" gold.");
			}},
			
			// DONATE GOLD TO ANOTHER PLAYER
			{secret: false, id:"!donate", category: "Account", description:"Donates a certain amount of gold to another user. - Ex. `!donate janus 50`", finale: function(sim,message) {
				var AR = message.content.split(" ");
				if (AR.length > 2)
				{
					var AIN = sim.accountManager.fetchListAccount(message.author.id);
					if (AIN === undefined) {message.reply(sim.accountManager.STRING_accountMissing); return;}
					
					var AMT = parseInt(AR[2]);
					if (isNaN(AMT)){message.reply("That's probably not a number you entered."); return;}
					
					if (AMT > AIN.template.stats.gold) {message.reply("You're donating more gold than you have!"); return;}
					if (AMT < 0) {message.reply("You can't steal other people's gold, of course!"); return;}
					if (AMT == 0) {message.reply("You have to donate something, at least."); return;}
					
					AMT = Math.floor(AMT);
					
					var UArray = AR;
					UArray.splice(-1);
					UArray.shift();
					
					var usrText = AR.join(" ");
					var USR = sim.accountManager.userByText(usrText);
					if (USR === undefined) {message.reply("**That user doesn't have an account!** If it's a real person, tell them to make one with `!register`."); return;}
					
					AIN.template.stats.gold -= AMT;
					USR.template.stats.gold += AMT;
					
					sim.accountManager.saveAccount(AIN.id);
					sim.accountManager.saveAccount(USR.id);
					
					message.reply("\n:credit_card: You donated "+AMT+" gold to "+USR.template.information.displayname+". **They'll appreciate it!**");
				}
				else if (AR.length > 1) {message.reply("Be sure to specify an amount to give. *(Ex. `!donate bob 500`)*"); return;}
				else {message.reply("You must type in a user to give gold to.");}
			}},
			
			// GIVE AN ITEM TO SOMEONE
			{secret: false, id:"!giveitem", category: "Inventory", description:"Gives an item to someone else. - Ex. `!giveitem 20 janus`", finale: function(sim,message) {
				var AR = message.content.split(" ");
				if (AR.length > 2)
				{
					var EN = sim.inventoryManager.parseEnteredNumber(AR[1]);
					
					// Not a valid number
					if (EN === undefined) {message.reply("**That wasn't a number.**"); return;}
					
					// DO WE HAVE AN ACCOUNT?
					var AIN = sim.accountManager.fetchListAccount(message.author.id);
					if (AIN === undefined) {message.reply(sim.accountManager.STRING_accountMissing); return;}
					
					var UArray = AR;
					UArray.shift();
					UArray.shift();
					
					var usrText = AR.join(" ");
					
					console.log(usrText);
					
					var USR = sim.accountManager.userByText(usrText);
					if (USR === undefined) {message.reply("**That user doesn't have an account!** If it's a real person, tell them to make one with `!register`."); return;}
					
					var transferResult = sim.inventoryManager.transferItem(EN,AIN,USR);
					if (!transferResult.allowed) {message.reply(transferResult.msg); return;}
					else {message.reply(transferResult.msg);}
				}
				else {message.reply("**Be sure to specify a number and someone to give it to. `!giveitem X USER`**");}
			}},
			
			{secret: true, id:"!itemcount", category: "Debug", description:"How many items do you have of this type?", finale: function(sim,message) {
				var AR = message.content.split(" ");
				if (AR.length > 1)
				{
					var AIN = sim.accountManager.fetchListAccount(message.author.id);
					if (AIN === undefined) {message.reply(sim.accountManager.STRING_accountMissing); return;}
					
					var IN = sim.inventoryManager.countBackpackItems(AIN,AR[1]);
					
					message.reply("You have "+IN+" of "+AR[1]+" in your backpack");
				}
				else {message.reply("**Specify an item type to look at!**");}
			}},
			
			{secret: false, id:"!sell", category: "Inventory", description:"Sells an item to an NPC you're at. - `!sell 5`", finale: function(sim,message) {
				var AR = message.content.split(" ");
				if (AR.length > 1)
				{
					var AIN = sim.accountManager.fetchListAccount(message.author.id);
					if (AIN === undefined) {message.reply(sim.accountManager.STRING_accountMissing); return;}
					
					if (AIN.template.NPC === undefined) {message.reply("You have to be at an NPC to sell things!"); return;}
					
					var EN = sim.inventoryManager.parseEnteredNumber(AR[1]);
					if (EN === undefined){message.reply("That's not a number."); return;}

					var IT = sim.inventoryManager.itemInSlot(EN,AIN,false,true);
					if (IT.id == "") {message.reply("There's no item in that slot."); return;}
					
					if (IT.item.item.inventoryProperties.sellPrice <= 0) {message.reply("You cannot sell that item."); return;}
					
					sim.inventoryManager.itemInSlot(EN,AIN,true,false,false);
					
					message.reply("\n:moneybag: **You successfully sold that item for "+IT.item.item.inventoryProperties.sellPrice+" gold.**");
					AIN.template.stats.gold += IT.item.item.inventoryProperties.sellPrice;
					sim.accountManager.saveAccount(AIN.id);
				}
				else {message.reply("**Specify an item number to buy!**");}
			}},
			
			{secret: false, id:"!buy", category: "Inventory", description:"Buys an item from an NPC. - `!buy 50`", finale: function(sim,message) {
				var AR = message.content.split(" ");
				if (AR.length > 1)
				{
					var AIN = sim.accountManager.fetchListAccount(message.author.id);
					if (AIN === undefined) {message.reply(sim.accountManager.STRING_accountMissing); return;}
					
					if (AIN.template.NPC === undefined) {message.reply("You have to be at an NPC to buy things!"); return;}
					var buyNum = parseInt(AR[1]);
					if (isNaN(buyNum)){message.reply("That's not a number."); return;}
					if (buyNum >= AIN.template.NPC.items.length || buyNum < 0) {message.reply("That's not a valid item."); return;}
					if (AIN.template.stats.gold < AIN.template.NPC.items[buyNum].price) {message.reply("You don't have enough gold for that!"); return;}
					if (sim.inventoryManager.findFreeSpot(AIN) == -1) {message.reply("You have no free inventory space."); return;}
					
					var TID = AIN.template.NPC.items[buyNum].id;
					var GIN = sim.inventoryManager.getItemName(TID);
					
					AIN.template.stats.gold -= AIN.template.NPC.items[buyNum].price;
					message.reply("\n:moneybag: **You purchased `"+GIN+"` for "+AIN.template.NPC.items[buyNum].price+" gold.**\n*You have "+AIN.template.stats.gold+" gold remaining.*");
					
					AIN.template.NPC.items.splice(buyNum,1);
					sim.inventoryManager.giveItem(AIN,TID);
				}
				else {message.reply("**Specify an item number to buy!**");}
			}},
			
			{secret: false, id:"!iteminfo", category: "Inventory", description:"Information about a certain item in your inventory.", finale: function(sim,message) {
				var AR = message.content.split(" ");
				if (AR.length > 1)
				{
					var AIN = sim.accountManager.fetchListAccount(message.author.id);
					if (AIN === undefined) {message.reply(sim.accountManager.STRING_accountMissing); return;}
					
					var EN = sim.inventoryManager.parseEnteredNumber(AR[1]);
					
					// Not a valid number
					if (EN === undefined) {message.reply("**That wasn't a number.**"); return;}
					
					var isNPC = false;
					
					if (AR.length > 2) {if (AR[2].toLowerCase() == "npc") {isNPC = true;}}
					
					if (!isNPC)
					{
						var IT = sim.inventoryManager.itemInSlot(EN,AIN,false,true);
						if (IT.id == "") {message.reply("There's no item in that slot."); return;}
						
						var IC = sim.infoCardPrep(IT.id,IT.rarity,IT.item.item.inventoryProperties.itemName,IT.prefixes,IT.suffixes,true,-1,IT.item.item.inventoryProperties.sellPrice,true);
						sim.printItemInfo(message.channel,IC);
					}
					else
					{
						if (parseInt(AR[1]) >= AIN.template.NPC.items.length || parseInt(AR[1]) < 0) {message.reply("That's not a proper item."); return;}
						
						var TIT = AIN.template.NPC.items[parseInt(AR[1])];
						var IT = sim.inventoryManager.itemByID(TIT.id);
						if (IT === undefined) {message.reply("That doesn't work."); return;}
						
						var IC = sim.infoCardPrep(TIT.id,TIT.rarity,IT.item.inventoryProperties.itemName,[],[],true,IT.item.inventoryProperties.buyPrice,-1,true);
						sim.printItemInfo(message.channel,IC);
					}
				}
				else {message.reply("**Specify an item number to look at!**");}
			}},
			
			// DROP AN ITEM
			{secret: false, id:"!enchant", category: "Party", description:"Use this at a shrine. `!enchant` walks away, `!enchant X` enchants an item.", finale: function(sim,message) {
				if (sim.accountManager.isDead(message.author.id)) {message.reply("You can't do much when you're dead!"); return;}
				
				var AIN = sim.accountManager.fetchListAccount(message.author.id);
				if (AIN === undefined) {message.reply(sim.accountManager.STRING_accountMissing); return;}
				
				var AR = message.content.split(" ");
				
				var forced = false;
				if (AR.length > 2)
				{
					if (AR[2].toLowerCase().indexOf("force") != -1) {forced = true;}
				}
				
				if (!sim.monsterManager.atEnchantStation(AIN) && !forced){message.reply("There is no shrine in front of you right now."); return;}
				
				if (AR.length > 1)
				{
					var EN = sim.inventoryManager.parseEnteredNumber(AR[1]);
					
					// Not a valid number
					if (EN === undefined) {message.reply("**That wasn't a number.**"); return;}
					
					sim.monsterManager.enchantWalkAway(AIN);
					
					message.reply("**You decide to tempt fate, and...**");
					
					setTimeout(function(){
						// DO WE HAVE AN ACCOUNT?
						var EI = sim.inventoryManager.enchantItem(EN,AIN);
						message.channel.sendMessage(EI);
					}.bind(this),2000);
				}
				else
				{
					var EWA = sim.monsterManager.enchantWalkAway(AIN);
					message.reply(EWA);
				}
			}},
			
			// SORTS YOUR INVENTORY
			{secret: false, id:"!sort", category: "Inventory", description:"Sorts the contents of your inventory by item ID. Also use `!sort rarity` or `!sort sellprice`.", finale: function(sim,message) {
				var AIN = sim.accountManager.fetchListAccount(message.author.id);
				if (AIN === undefined) {message.reply(sim.accountManager.STRING_accountMissing); return;}
				
				var mainLength = AIN.template.backpack.length;
				var BPK = AIN.template.backpack.slice(0);
				
				for (var l=0; l<BPK.length; l++)
				{
					BPK[l].item = sim.inventoryManager.itemByID(BPK[l].id);
				}
				
				var blankness = undefined;
				
				var mode = "id";
				var ARR = message.content.split(" ");
				
				if (ARR.length > 1)
				{
					mode = ARR[1].toLowerCase();
				}
				
				BPK.sort(function(a, b) {
					
					switch (mode)
					{
						case "id":
							var nameA = a.id.toUpperCase();
							var nameB = b.id.toUpperCase();
						break;
						
						case "rarity":
							var nameA = a.rarity;
							var nameB = b.rarity;
						break;
						
						case "sellprice":
							var nameA = -1;
							var nameB = -1;
							
							if (a.id == ""){nameA = 99999}
							else{nameA = a.item.item.inventoryProperties.sellPrice;}
							
							if (b.id == ""){nameB = 99999}
							else{nameB = b.item.item.inventoryProperties.sellPrice;}
							
							return nameA - nameB;
						break;
					}
				  
					if (a.id == "") {return 1;}
					if (b.id == "") {return -1;}
					  
					if (nameA < nameB) {return -1;}
					if (nameA > nameB) {return 1;}

					return 0;
				});
				
				AIN.template.backpack = BPK;
				sim.accountManager.saveAccount(AIN.id);
					
				message.reply("**Your backpack has been neatly organized.**");
			}},
			
			// DUMP YOUR WHOLE INVENTORY
			{secret: false, id:"!dump", category: "Inventory", description:"Dumps the contents of your backpack into the void.", finale: function(sim,message) {
				var AIN = sim.accountManager.fetchListAccount(message.author.id);
				if (AIN === undefined) {message.reply(sim.accountManager.STRING_accountMissing); return;}
					
				var AR = message.content.split(" ");
				if (AR.length > 1)
				{
					if (AR[1].toLowerCase() != "yes"){message.reply("You've got to type `!dump yes` if you want to confirm."); return;}
					
					for (var l=0; l<AIN.template.backpack.length; l++) {AIN.template.backpack[l].id = ""; AIN.template.backpack[l].prefixes = []; AIN.template.backpack[l].suffixes = [];}
					sim.accountManager.saveAccount(AIN.id);
					message.reply("\n:wastebasket: **Your inventory is no more.** :wastebasket:");
				}
				else {message.reply("\n:warning: **Are you positive that you want to trash your inventory?** :warning:\n*(Type `!dump yes` to go along with it.)*");}
			}},
			
			// DROP AN ITEM
			{secret: false, id:"!drop", category: "Inventory", description:"Drops an item from your inventory.", finale: function(sim,message) {
				var AR = message.content.split(" ");
				if (AR.length > 1)
				{
					var EN = sim.inventoryManager.parseEnteredNumber(AR[1]);
					
					// Not a valid number
					if (EN === undefined) {message.reply("**That wasn't a number.**"); return;}
					
					// DO WE HAVE AN ACCOUNT?
					var AIN = sim.accountManager.fetchListAccount(message.author.id);
					if (AIN === undefined) {message.reply(sim.accountManager.STRING_accountMissing); return;}
					
					sim.inventoryManager.dropItem(message,EN,AIN);
				}
				else {message.reply("**Specify an item number to drop!**");}
			}},
			
			// SWAP TWO ITEMS
			{secret: false, id:"!swap", category: "Inventory", description:"Swaps two items in your inventory. - Ex. `!swap 21 52`", finale: function(sim,message) {
				var AR = message.content.split(" ");
				if (AR.length > 2)
				{
					// Parse the numbers that we entered
					var ENone = sim.inventoryManager.parseEnteredNumber(AR[1]);
					var ENtwo = sim.inventoryManager.parseEnteredNumber(AR[2]);
					
					// Not a valid number
					if (ENone === undefined || ENtwo === undefined) {message.reply("**Something you entered wasn't a number.**"); return;}
					
					// DO WE HAVE AN ACCOUNT?
					var AIN = sim.accountManager.fetchListAccount(message.author.id);
					if (AIN === undefined) {message.reply(sim.accountManager.STRING_accountMissing); return;}
					
					// ARE WE TRYING TO EQUIP?
					var lowerCaseOne = ENone.toLowerCase();
					var lowerCaseTwo = ENtwo.toLowerCase();
					var equipping = false;
					
					// If we're trying to put it into one of our 3 slots, then we're equipping
					// Otherwise, we're just moving it around in the backpack and this doesn't matter
					
					if (lowerCaseOne == "a" || lowerCaseTwo == "a") {equipping = true;}
					if (lowerCaseOne == "b" || lowerCaseTwo == "b") {equipping = true;}
					if (lowerCaseOne == "w" || lowerCaseTwo == "w") {equipping = true;}
					
					// Get the items in the slots that we typed, the RAW items
					var ITone = sim.inventoryManager.itemInSlot(ENone,AIN,false,true,false);
					var ITtwo = sim.inventoryManager.itemInSlot(ENtwo,AIN,false,true,false);
					
					// Which character are we?
					var primaryClass = AIN.template.information.character;
					var switchFailOne = true;
					var switchFailTwo = true;
					
					// If we have an item in slot one
					if (ITone.item != undefined) 
					{
						if (ITone.item.item.inventoryProperties.equipClasses.length == 0) {switchFailOne = false;}
						
						// DO WE MATCH THE EQUIP CLASSES OF BOTH ITEMS?
						for (var l=0; l<ITone.item.item.inventoryProperties.equipClasses.length; l++)
						{
							if (ITone.item.item.inventoryProperties.equipClasses[l] == primaryClass) {switchFailOne = false; break;}
						}
					}
					else {switchFailOne = false;}
					
					// If we have an item in slot two
					if (ITtwo.item != undefined) 
					{
						if (ITtwo.item.item.inventoryProperties.equipClasses.length == 0) {switchFailTwo = false;}
					
						// DO WE MATCH THE EQUIP CLASSES OF BOTH ITEMS?
						for (var l=0; l<ITtwo.item.item.inventoryProperties.equipClasses.length; l++)
						{
							if (ITtwo.item.item.inventoryProperties.equipClasses[l] == primaryClass) {switchFailTwo = false; break;}
						}
					}
					else {switchFailTwo = false;}
					
					// ONE OF OUR ITEMS FAILED
					if (switchFailOne || switchFailTwo) {message.reply("One of your items failed to swap, because your class can't use it."); return;}
					
					// Now actually swap the items
					var swapResult = sim.inventoryManager.swapItems(AIN,ENone,ENtwo);
					message.reply(swapResult.msg);
				}
				else {message.reply("**Specify two slots to swap!** `!swap A B`");}
			}},
			
			// CONSUME AN ITEM
			{secret: false, id:"!useitem", category: "Inventory", description:"Uses an item that's in your inventory. - NOTE: In battle, this will take up a turn!", finale: function(sim,message) {
				if (sim.accountManager.isDead(message.author.id)) {message.reply("You can't do much when you're dead!"); return;}
				
				var AR = message.content.split(" ");
				if (AR.length > 1)
				{
					var EN = sim.inventoryManager.parseEnteredNumber(AR[1]);
					
					// Not a valid number
					if (EN === undefined) {message.reply("**That wasn't a number.**"); return;}
					
					// DO WE HAVE AN ACCOUNT?
					var AIN = sim.accountManager.fetchListAccount(message.author.id);
					if (AIN === undefined) {message.reply(sim.accountManager.STRING_accountMissing); return;}
					
					var IT = sim.inventoryManager.itemInSlot(EN,AIN,false);
					if (IT === undefined) {message.reply("There isn't an item in that slot."); return;}
					
					var CC = IT.item.behavior.canConsume(-1,message,sim,IT,EN);
					var canUse = CC.allowed;
					
					if (canUse)
					{
						// IN A BATTLE?
						var IB = sim.monsterManager.inBattleByID(message.author.id);
						if (IB != undefined)
						{
							var FBM = IB.findBattleMember(AIN);
							FBM.pendingSlot = EN;
							FBM.pendingItem = IT;
							
							var fakeMess = {content:message.content,id:message.author.id,author:message.author};
							
							IB.setMemberStatus(FBM,IB.STATE_USING,fakeMess);
							message.delete();
						}
						else {message.reply(IT.item.behavior.consumed(AIN,message,sim,IT,EN,false));}
					}
					else {message.reply(CC.msg);}
				}
				else {message.reply("**Specify an item number to drop!**");}
			}},
			
			// CREATE A PARTY
			{secret: false, id:"!party", category: "Party", description:"Creates a brand new party.", finale: function(sim,message) {
				
				var AIN = sim.accountManager.fetchListAccount(message.author.id);
				if (AIN === undefined) {message.reply(sim.accountManager.STRING_accountMissing); return;}
					
				if (AIN.template.information.party != "") {message.reply("You're already in a party! Leave it first."); return;}
					
				var AR = message.content.split(" ");
				
				if (AR.length < 2) {message.reply("You have to enter a name for your party!"); return;}
				
				AR.shift();
				var PN = AR.join(" ");
				var thePart = {name:PN,members:[],creator:message.author.id,dungeonLevel:0,biome:"",dungeonSquare:0};
				var MEM = [];
				
				MEM.push(message.author.id);
				thePart.members = MEM;
				
				AIN.template.information.party = PN;
				sim.accountManager.saveAccount(message.author.id);
				
				sim.accountManager.newParty(thePart);
				
				message.reply("\n:balloon: **A new party was created!** :balloon:\n\nYou are the owner of `"+PN+"`, cherish it. Use `!partyinvite` to invite other members to your party and travel together!");
			}},
			
			// DESTROY A PARTY
			{secret: false, id:"!leaveparty", category: "Party", description:"Leaves the party that you are currently in.", finale: function(sim,message) {
				var AIN = sim.accountManager.fetchListAccount(message.author.id);
				if (AIN === undefined) {message.reply(sim.accountManager.STRING_accountMissing); return;}
				
				if (sim.accountManager.userOwnedParty(message.author.id) != undefined) {message.reply("You can't leave the party you own! Use `!disband` to delete it."); return;}
				
				var tempParty = AIN.template.information.party;
				
				var PRT = sim.accountManager.partyByName(AIN.template.information.party);
				sim.accountManager.removePartyMember(PRT,AIN);
				
				message.reply("You left `"+tempParty+"`.");
			}},
			
			// JOIN SOMEONE ELSE'S PARTY
			{secret: false, id:"!joinparty", category: "Party", description:"Joins an already existing party.", finale: function(sim,message) {
				
				var AIN = sim.accountManager.fetchListAccount(message.author.id);
				if (AIN === undefined) {message.reply(sim.accountManager.STRING_accountMissing); return;}
				if (AIN.template.information.party != "") {message.reply("You're already in a party! Leave it first."); return;}
				
				var AR = message.content.split(" ");
				
				if (AR.length < 2) {message.reply("You have to enter a name for the party!"); return;}
				
				AR.shift();
				var PN = AR.join(" ");
				
				var PRT = sim.accountManager.partyByName(PN);
				
				sim.accountManager.addPartyMember(message,PRT,AIN);
				
				message.reply(":balloon: You successfully joined `"+PRT.name+"`. Have fun!");
			}},
			
			// DESTROY A PARTY
			{secret: false, id:"!disband", category: "Party", description:"Destroys an existing party if you own it.", finale: function(sim,message) {
				var AR = message.content.split(" ");
				
				if (AR.length < 2) {message.reply("You have to enter a name for the party!"); return;}
				
				AR.shift();
				var PN = AR.join(" ");
				
				sim.accountManager.destroyParty(message,PN);
			}},
			
			// TRAVEL SOMEWHERE
			{secret: false, id:"!travel", category: "Party", description:"Shows all of the places that you can travel to.", finale: function(sim,message) {
				var FM = "\n:map: **From above the dungeon, here are all the places you can travel to...** :map:\n\n";
				
				for (var l=0; l<sim.environments.biomes.length; l++)
				{
					FM += sim.environments.biomes[l].icon+" **"+sim.environments.biomes[l].fullName+"** - `"+sim.environments.biomes[l].id+"` - *"+sim.environments.biomes[l].description+"*\n";
				}
				
				message.reply(FM);
			}},
			
			// MOVE TO A SPOT IN THE DUNGEON
			{secret: false, id:"!move", category: "Party", description:"Moves to a square on the dungeon.", finale: function(sim,message) {
				var CP = sim.commandPrep(sim,message);
				if (!CP.allowed){message.reply(CP.msg); return;}
				if (CP.PRT.dungeonLevel <= 0) {message.reply("You have to be in the dungeon to move!"); return;}
				
				var AR = message.content.split(" ");
				if (AR.length < 2) {message.reply("**You must enter a direction!** *Use N, S, E, or W.*"); return;}
				
				var dir = "";
				var dir = AR[1].toLowerCase();
				
				if (dir != "n" && dir != "w" && dir != "e" && dir != "s") {message.reply("That's not a proper cardinal direction."); return;}
				
				// Horizontal and vertical movement
				var moveH = 0;
				var moveV = 0;
				var currentSpot = CP.PRT.dungeonSquare;
				
				// From the current spot, figure out our X and Y
				var X = currentSpot - (sim.calculator.dungeonWidth * Math.floor(currentSpot / sim.calculator.dungeonHeight));
				var Y = Math.floor(currentSpot / sim.calculator.dungeonHeight);
				
				switch (dir)
				{
					case "n":
					moveV = -1;
					break;
					
					case "e":
					moveH = 1;
					break;
					
					case "w":
					moveH = -1;
					break;
					
					case "s":
					moveV = 1;
					break;
				}
				
				if (X+moveH < 0 || Y+moveV < 0 || X+moveH >= sim.calculator.dungeonWidth || Y+moveV >= sim.calculator.dungeonHeight) {message.reply("You cannot move outside of the dungeon bounds."); return;}
				
				X += moveH;
				Y += moveV;
				
				// FIGURE OUT OUR POSITION FROM X AND Y NOW
				var CPP = (sim.calculator.dungeonWidth*Y) + X;
				
				CP.PRT.dungeonSquare = CPP;
				sim.accountManager.writeParties();
				
				sim.monsterManager.dungeonLevels[CP.PRT.dungeonLevel-1].dungeon.levels[CPP].visited = true;
				sim.monsterManager.writeDungeons();
				
				// -- ENCOUNTER STUFF WITH THE NEW POSITION
				var cubeResult = sim.calculator.squareSearch();
				
				switch (cubeResult)
				{
					case "nothing":
					message.reply("You moved, but nothing happened");
					return;
					break;
					
					case "monster":
					message.reply("You moved and a monster appeared! Oh fuck nigger");
					return;
					break;
				}
			}},
			
			// SHOW THE MAP OF THE DUNGEON YOU'RE CURRENTLY ON
			{secret: false, id:"!map", category: "Party", description:"Shows a map of the dungeon you're currently in.", finale: function(sim,message) {
				var CP = sim.commandPrep(sim,message);
				if (!CP.allowed){message.reply(CP.msg); return;}
				
				if (CP.PRT.dungeonLevel <= 0) {message.reply("You have to be in the dungeon to use a map!"); return;}
				
				var FM = "\n:map: **Here's a map of dungeon level "+CP.PRT.dungeonLevel+":** :map:\n\n";
				
				var DM = sim.calculator.levelToEmotes(sim.monsterManager.dungeonLevels[CP.PRT.dungeonLevel-1].dungeon, CP.PRT.dungeonSquare);
				FM += DM;
				
				message.reply(FM);
			}},
			
			// LIST ALL PARTIES
			{secret: false, id:"!parties", category: "Party", description:"Lists all of the parties that exist.", finale: function(sim,message) {
				if (sim.accountManager.parties.length <= 0) {message.reply("No parties exist at this time. Create one with `!party`."); return;}
				var FM = "\n**Here are all of the parties that currently exist in the sim:**\n\n";
				var PRT = sim.accountManager.parties;
				
				for (var l=0; l<PRT.length; l++)
				{
					FM += ":shield: **"+PRT[l].name+"** - *";
					FM += PRT[l].members.length+" member";
					if (PRT[l].members.length > 1) {FM += "s";}
					
					FM += " - ";
					
					console.log(sim.monsterManager.dungeonLevels[PRT[l].dungeonLevel-1]);
					if (PRT[l].dungeonLevel > 0) {FM += "Lv. "+PRT[l].dungeonLevel+" ("+sim.monsterManager.dungeonLevels[PRT[l].dungeonLevel-1].env.description+")";}
					else
					{
						for (var m=0; m<sim.environments.biomes.length; m++)
						{
							if (PRT[l].dungeonLevel == sim.environments.biomes[m].dungeonLevel) {FM += sim.environments.biomes[m].partyString;}
						}
					}
					
					FM += "*";
					
					// In battle?
					if (sim.monsterManager.getBattle(PRT[l]) != undefined)
					{
						FM += ":dagger: **IN BATTLE**";
					}
					
					FM += "\n";
					
					for (var m=0; m<PRT[l].members.length; m++)
					{
						var AS = "`"+sim.accountManager.fetchListAccount(PRT[l].members[m]).template.information.username+"`";
						
						if (PRT[l].creator == PRT[l].members[m]) {AS +=" :crown:"}
						
						FM += AS+"\n";
					}
					
					FM += "\n"
				}
				
				message.reply(FM.slice(0,1999));
			}},
			
			// TWEAK A STAT VALUE
			{secret: false, id:"!stat", category: "Account", description:"Changes or views one of your character's stats. - Ex. using skill points: `!stat vitality 5`", finale: function(sim,message) {
				var AR = message.content.split(" ");
				
				if (AR.length <= 1) 
				{
					var MSG = "You have to type in a stat to do something with! Use `!stat X` to view one of your stats, or `!stat X Y` to tweak it.\n\n:books: **Here are your options:**\n\n";
					MSG += ":heart: Vitality\n"; 
					MSG += ":fist: Strength\n"; 
					MSG += ":runner: Dexterity\n"; 
					MSG += ":scream: Intimidate\n"; 
					MSG += ":satellite: Awareness\n"; 
					MSG += ":book: Wisdom\n"; 
					MSG += ":handshake: Empathy\n"; 
					MSG += ":bow_and_arrow: Precision\n"; 
					
					message.reply(MSG);
					return;
				}
				
				var AIN = sim.accountManager.fetchListAccount(message.author.id);
				//var SBS = sim.accountManager.statByString(AIN,AR[1],-1,false);
				var SBS = AIN.finalStat(sim,AIN,AR[1],false);
				var ST = SBS.num;
				
				if (ST === undefined) {message.reply("That's not a stat, make sure you picked one that exists!"); return;}
				
				// Make sure we have 3 things to do
				if (AR.length > 2)
				{
					var SP = parseInt(AR[2]);
					if (isNaN(SP)) {message.reply("That's probably not a real number."); return;}
					if (SP == 0) {message.reply("No point in leaving your stat the same!"); return;}
					
					var forced = false;
					if (AR.length > 3) {if (AR[3].toLowerCase() == "force") {forced = true;}}
					
					if (AIN.template.stats.skillPoints < SP && SP > 0 && !forced) {message.reply("You don't have enough stat points to raise it that high."); return;}
					
					// WILL THIS MAKE IT GO BELOW 0?
					if (ST+SP < 0 && !forced) {message.reply("Doing that would make your stat negative, try a higher number."); return;}
					
					if (!forced) {AIN.template.stats.skillPoints -= SP;}
					ST += SP;
					message.reply("Your *"+AR[1]+"* skill is now "+ST.toString()+"! You have "+AIN.template.stats.skillPoints+" skill points remaining.");
					sim.accountManager.statByString(AIN,AR[1],ST,true);
				}
				else
				{
					message.reply("Your *"+AR[1]+"* skill is "+ST+".\n:book: "+SBS.msg);
				}
			}},
			
			// REACT TO AN EVENT
			{secret: false, id:"!event", category: "Party", description:"Handles what happens at a special event", finale: function(sim,message) {
				var AIN = sim.accountManager.fetchListAccount(message.author.id);
				if (AIN === undefined) {message.reply(sim.accountManager.STRING_accountMissing); return;}
			
				if (AIN.template.information.party == "" || AIN.template.information.party === undefined) {message.reply("You must be in a party to do that."); return;}
				
				var PRT = sim.accountManager.partyByName(AIN.template.information.party);
				if (PRT === undefined) {message.reply("You have to be in a party to interact with the environment.");}
				
				if (PRT.eventID == "" || PRT.eventID === undefined) {message.reply("You're not at a special event, you can't do anything."); return;}
				
				var BIOME = sim.environments.biomes;
				var theEvent = undefined;
				for (var l=0; l<BIOME.length; l++)
				{
					if (PRT.dungeonLevel == BIOME[l].dungeonLevel)
					{
						for (var m=0; m<BIOME[l].specialEvents.length; m++)
						{
							if (BIOME[l].specialEvents[m].id == PRT.eventID) {theEvent = BIOME[l].specialEvents[m];}
						}
					}
				}
				
				if (theEvent === undefined) {message.reply("There was no event."); return;}
				
				var AR = message.content.split(" ");
				if (AR.length < 2)
				{
					PRT.eventID = "";
					sim.accountManager.writeParties();
					theEvent.leaveFunction(sim,message,AIN,PRT);
					return;
				}
				
				var EF = theEvent.enterFunction(sim,message,AIN,PRT);
				if (EF.allowed)
				{
					PRT.eventID = "";
					if (EF.save){sim.accountManager.writeParties(false);}
				}
			}},
			
			// SEARCH FOR SOMETHING
			{secret: false, id:"!inspect", category: "Party", description:"Searches your environment.", finale: function(sim,message) {
				if (sim.accountManager.isDead(message.author.id)) {message.reply("You can't do much when you're dead!"); return;}
				
				var AIN = sim.accountManager.fetchListAccount(message.author.id);
				if (AIN === undefined) {message.reply(sim.accountManager.STRING_accountMissing); return;}
			
				if (AIN.template.information.party == "" || AIN.template.information.party === undefined) {message.reply("You must be in a party to do that."); return;}
				
				var PRT = sim.accountManager.partyByName(AIN.template.information.party);
				if (PRT === undefined) {message.reply("You have to be in a party to interact with the environment.");}
				
				if (PRT.eventID != undefined && PRT.eventID != "") {message.reply("You're at a special event, make up your mind!"); return;}

				if (sim.monsterManager.getBattle(PRT) != undefined) {message.reply("You can't search around in battle!"); return;}
				if (sim.monsterManager.atEnchantStation(AIN)){message.reply("You can't search while at a shrine."); return;}
				var TP = sim.monsterManager.templeParty;
				if (TP == PRT) {message.reply("You can't search at a temple entrance."); return;}
				
				var BIOMES = sim.environments.biomes;
				var theBiome = undefined;
				
				for (var l=0; l<BIOMES.length; l++)
				{
					if (PRT.dungeonLevel == BIOMES[l].dungeonLevel) {theBiome = BIOMES[l];}
				}
				
				if (theBiome != undefined)
				{
					if (!theBiome.allowInspect) {message.reply("You can't search in this area."); return;}
				}
				
				if (sim.monsterManager.isAscending(AIN) || sim.monsterManager.isDescending(AIN)) {message.reply("You cannot search at stairs!"); return;}
				
				var extras = [];
				
				if (PRT.dungeonLevel <= 0 && theBiome != undefined) {extras = theBiome.specialEvents}
				
				var AR = message.content.split(" ");
				var special = false;
				
				if (AR.length > 1)
				{
					if (AR[1].toLowerCase() == "test")
					{
						var FM = "";
						for (var l=0; l<25; l++)
						{
							var searchResult = sim.calculator.searchAttempt(PRT.dungeonLevel,extras,false);
							FM += searchResult+"\n";
						}
						
						message.reply(FM);
						return;
					}
					else if (AR[1].toLowerCase() == "special") {special = true;}
				}
				
				var searchResult = sim.calculator.searchAttempt(PRT.dungeonLevel,extras,special);
			
				switch (searchResult)
				{
					case "item":
						var aware = sim.accountManager.finalStat(sim,AIN,"awareness");
						var RI = sim.calculator.randomItem(aware);
						var GI = sim.inventoryManager.giveItem(AIN,RI.item.inventoryProperties.id);
						
						var MR = "\n:package: You found an item lying on the ground: **"+RI.item.inventoryProperties.itemName+"**";
						
						if (!GI){MR += "... however, you couldn't carry it.";}
						
						message.reply(MR);
						return;
					break;
					
					case "gold":
						var aware = sim.accountManager.finalStat(sim,AIN,"awareness");
						var goldAmount = sim.calculator.decideGoldAmount(aware,PRT.dungeonLevel);
						
						AIN.template.stats.gold += goldAmount;
						sim.accountManager.saveAccount(AIN.id);
						
						message.reply("\n:moneybag: **You searched and found "+goldAmount+" gold.**");
						return;
					break;
					
					case "monster":
						message.reply("You encounter a monster");
						return;
					break;
					
					case "temple":
						var FT = sim.monsterManager.findTemple(PRT);
						if (FT.allowed) 
						{
							message.channel.sendFile(environmentDirectory+FT.pic).then(function(){message.reply(FT.msg);}.bind(this),function(){});
						}
						return;
					break;
					
					case "stairs":
						sim.monsterManager.addToDescend(AIN);
						message.channel.sendFile(environmentDirectory+IMG_downstairs).then(function(){
							message.reply("\n**:exclamation: You find a set of descending stairs... :exclamation:**\n*Do you want to descend deeper into the depths?*\n\nType `!descend go` to go lower and `!descend` to walk away.");
						}.bind(this),function(){});
						return;
					break;
					
					case "upstairs":
						sim.monsterManager.addToAscend(AIN);
						message.channel.sendFile(environmentDirectory+IMG_upstairs).then(function(){
							message.reply("\n**:grey_exclamation: You find a set of ascending stairs... :grey_exclamation:**\n*Do you want to ascend back whence you came?*\n\nType `!ascend go` to go lower and `!ascend` to walk away.");
						}.bind(this),function(){});
						return;
					break;
					
					case "enchant":
						var FT = sim.monsterManager.findEnchant(AIN);
						if (FT.allowed) 
						{
							message.channel.sendFile(environmentDirectory+FT.pic).then(function(){message.reply(FT.msg);}.bind(this),function(){});
						}
						return;
					break;
					
					case "nothing":
						message.reply("You search around, but unfortunately you've found nothing.");
						return;
					break;
				}
				
				// DID WE TRIGGER A SPECIAL EVENT?
				if (theBiome != undefined)
				{
					for (var l=0; l<theBiome.specialEvents.length; l++)
					{
						if (theBiome.specialEvents[l].id == searchResult)
						{
							PRT.eventID = searchResult;
							sim.accountManager.writeParties();
							
							var FM = "\n"+theBiome.specialEvents[l].stumbleText+"\n"+theBiome.specialEvents[l].sweetener+"";
							
							message.channel.sendFile(environmentDirectory+theBiome.specialEvents[l].eventImage).then(function(){
								message.channel.sendMessage(FM);
							}.bind(this),function(){});
						}
					}
				}
			}},
			
			// DESCEND DEEPER INTO THE DUNGEON
			{secret: false, id:"!descend", category: "Party", description:"Descends deeper into the dungeon, if stairs are available.", finale: function(sim,message) {
				if (sim.accountManager.isDead(message.author.id)) {message.reply("You can't do much when you're dead!"); return;}
				
				var CP = sim.commandPrep(sim,message);
				if (!CP.allowed){message.reply(CP.msg); return;}
				if (sim.monsterManager.getBattle(CP.PRT) != undefined) {message.reply("You can't do that in battle!"); return;}
				if (CP.PRT.dungeonLevel < 0) {message.reply("You have to be in town to do that!"); return;}
				
				var AR = message.content.split(" ");
				
				if (!sim.monsterManager.isDescending(CP.AIN) && CP.PRT.dungeonLevel > 0 && AR[1] != "forced") {message.reply("You're not in front of the proper stairs!"); return;}
				
				
				if (AR.length < 2)
				{
					if (CP.PRT.dungeonLevel > 0)
					{
						sim.monsterManager.removeDescended(CP.AIN);
						message.reply("You step away from the stairs.");
						return;
					}
					else
					{
						message.reply("You must type 'go' for the command to work!");
						return;
					}
				}
				
				if (AR[1].toLowerCase() != "go" && AR[1].toLowerCase() != "forced") {message.reply("You must type 'go' for the command to work!"); return;}
				
				CP.PRT.dungeonLevel ++;
				
				
				sim.monsterManager.removeDescended(CP.AIN);
				
				
				
				if (CP.PRT.dungeonLevel > sim.monsterManager.dungeonLevels.length)
				{
					var genDun = genLVL.env;
					var genLVL = sim.monsterManager.discoverDungeonLevel(CP.PRT.dungeonLevel);
					
					for (var l=0; l<genLVL.dun.levels.length; l++)
					{
						if (genLVL.dun.levels[l].type == "upstairs") {CP.PRT.dungeonSquare = l;}
					}
					
					sim.accountManager.writeParties();
					
					message.reply("\n:tada: **Your party has discovered level "+CP.PRT.dungeonLevel+" of the dungeon!** :tada:\n\n *As you step off of the stairs into level "+CP.PRT.dungeonLevel+" of the tunnels, you walk into "+genDun.prefix+" "+genDun.description.toLowerCase()+".*\n\n**Other parties will follow in your footsteps to this same environment.**");
					return;
				}
				
				var genLVL = sim.monsterManager.dungeonLevels[CP.PRT.dungeonLevel-1];
				for (var l=0; l<genLVL.dungeon.levels.length; l++)
				{
					if (genLVL.dungeon.levels[l].type == "upstairs") {CP.PRT.dungeonSquare = l;}
				}
				
				message.reply("\n:small_red_triangle_down: **Your party descends deeper into level "+CP.PRT.dungeonLevel+" of the dark dungeon. Untold horrors await...**");
				sim.accountManager.writeParties();
			}},
			
			// GO UP A DUNGEON LEVEL
			{secret: false, id:"!ascend", category: "Party", description:"Goes up another level from the dungeon, if stairs are available.", finale: function(sim,message) {
				if (sim.accountManager.isDead(message.author.id)) {message.reply("You can't do much when you're dead!"); return;}
				
				var CP = sim.commandPrep(sim,message);
				if (!CP.allowed){message.reply(CP.msg); return;}
				if (sim.monsterManager.getBattle(CP.PRT) != undefined) {message.reply("You can't do that in battle!"); return;}
				
				var AR = message.content.split(" ");
				
				if (!sim.monsterManager.isAscending(CP.AIN) && CP.PRT.dungeonLevel > 0 && AR[1] != "forced") {message.reply("You're not in front of the proper stairs!"); return;}
				
				if (AR.length < 2)
				{
					if (CP.PRT.dungeonLevel > 0)
					{
						sim.monsterManager.removeAscended(CP.AIN);
						message.reply("You step away from the stairs.");
						return;
					}
					else
					{
						message.reply("You must type 'go' for the command to work!");
						return;
					}
				}
				
				if (AR[1].toLowerCase() != "go" && AR[1].toLowerCase() != "forced") {message.reply("You must type 'go' for the command to work!"); return;}
				
				if (CP.PRT.dungeonLevel <= 0) {message.reply("You can't go up any higher in the town."); return;}
				CP.PRT.dungeonLevel --;
				
				var genLVL = sim.monsterManager.dungeonLevels[CP.PRT.dungeonLevel-1].dungeon;
				for (var l=0; l<genLVL.levels.length; l++)
				{
					if (genLVL.levels[l].type == "upstairs") {CP.PRT.dungeonSquare = l;}
				}
				
				sim.accountManager.writeParties();
				
				if (CP.PRT.dungeonLevel > 0) {message.reply("\n:small_red_triangle: **You escape the darkness and ascend the dungeon stairs to level "+CP.PRT.dungeonLevel+" of the catacombs...**");}
				else {message.reply("\n:high_brightness: **Your party sees sunlight again, you are back in the town.** *Fellow townsfolk and other pleasant sights greet you.*");}
			}},
			
			// FLEE A TEMPLE
			{secret: false, id:"!fleetemple", category: "Party", description:"Steps away from a temple that your party has found.", finale: function(sim,message) {
				if (sim.accountManager.isDead(message.author.id)) {message.reply("You can't do much when you're dead!"); return;}
				
				var AIN = sim.accountManager.fetchListAccount(message.author.id);
				if (AIN === undefined) {message.reply(sim.accountManager.STRING_accountMissing); return;}
			
				if (AIN.template.information.party == "" || AIN.template.information.party === undefined) {message.reply("You must be in a party to do that."); return;}
				
				var PRT = sim.accountManager.partyByName(AIN.template.information.party);
				if (PRT === undefined) {message.reply("You have to be in a party to start battles"); return;}
				
				if (sim.monsterManager.getBattle(PRT) != undefined) {message.reply("Your party's already in a battle!"); return;}
				
				var TP = sim.monsterManager.templeParty;
				if (TP === undefined) {message.reply("No party has found a temple just yet."); return;}
				if (TP != PRT) {message.reply("The party in a temple isn't the one you're in!"); return;}
				
				sim.monsterManager.templeParty = undefined;
				message.reply("**The temple's contents continue to decay as you leave.**");
			}},
			
			// ENTER A TEMPLE
			{secret: false, id:"!entertemple", category: "Party", description:"Enters a temple that your party has found.", finale: function(sim,message) {
				if (sim.accountManager.isDead(message.author.id)) {message.reply("You can't do much when you're dead!"); return;}
				
				var AIN = sim.accountManager.fetchListAccount(message.author.id);
				if (AIN === undefined) {message.reply(sim.accountManager.STRING_accountMissing); return;}
			
				if (AIN.template.information.party == "" || AIN.template.information.party === undefined) {message.reply("You must be in a party to do that."); return;}
				
				var PRT = sim.accountManager.partyByName(AIN.template.information.party);
				if (PRT === undefined) {message.reply("You have to be in a party to start battles"); return;}
				
				if (sim.monsterManager.getBattle(PRT) != undefined) {message.reply("Your party's already in a battle!"); return;}
				
				var TP = sim.monsterManager.templeParty;
				if (TP === undefined) {message.reply("No party has found a temple just yet."); return;}
				if (TP != PRT) {message.reply("The party in a temple isn't the one you're in!"); return;}
				
				sim.monsterManager.templeParty = undefined;
				
				var ENV = "hexen";
				if (PRT.dungeonLevel > 0) {ENV = sim.monsterManager.dungeonLevels[PRT.dungeonLevel-1].id;}
					
				sim.monsterManager.startBattle("",TP,message,ENV,true,true);
			}},
			
			
			// FIND A TEMPLE
			{secret: true, id:"!randomitem", category: "Debug", description:"Returns 50 random item chances. - Use `!randomitem give` to actually give yourself one and `!randomitem AW IT` to test chances.", finale: function(sim,message) {
				var FM = "";
				var AR = message.content.split(" ");
				var giveIt = false;
				
				if (AR.length > 1) 
				{
					if (AR[1].toLowerCase() == "give") {giveIt = true;}
				}
				
				if (AR.length > 2)
				{
					if (!isNaN(parseInt(AR[1])))
					{
						var aware = parseInt(AR[1]);
						var attempts = 0;
						var counts = 0;
						var ID = "";
						
						do {
							var RI = sim.calculator.randomItem(aware);
							ID = RI.item.inventoryProperties.id;
							
							if (ID == AR[2]) {counts ++;}
							
							attempts ++;
						} while (attempts < 1000);
						
						message.reply("Out of 1000 searches, "+counts+" were of "+AR[2]+" with awareness "+AR[1]+"."); return;
					}
				}
				
				if (!giveIt)
				{
					FM += "`";
					var AIN = sim.accountManager.fetchListAccount(message.author.id);
					if (AIN === undefined) {message.reply(sim.accountManager.STRING_accountMissing); return;}
					
					var colWidth = 30;
					
					var aware = sim.accountManager.finalStat(sim,AIN,"awareness");
					
					if (AR.length > 1)
					{
						aware = parseInt(AR[1]);
					}
					
					var CNT = 0;
					for (var l=0; l<48; l++)
					{
						var RI = sim.calculator.randomItem(aware);
						FM += RI.item.inventoryProperties.itemName;
						
						CNT ++;
						
						if (CNT >= 4) 
						{
							CNT = 0; 
							for (var m=0; m<colWidth-RI.item.inventoryProperties.itemName.length; m++)
							{
								FM += " ";
							}
							FM += "\n";
						}
						else 
						{
							for (var m=0; m<colWidth-RI.item.inventoryProperties.itemName.length; m++)
							{
							FM += " ";
							}
						}
					}
					FM += "`"
					
					message.reply("\n**Chance results with awareness of "+aware+":**\n\n"+FM);
				}
				else
				{
					var AIN = sim.accountManager.fetchListAccount(message.author.id);
					if (AIN === undefined) {message.reply(sim.accountManager.STRING_accountMissing); return;}
					
					var AW = sim.accountManager.finalStat(sim,AIN,"awareness");
					var RI = sim.calculator.randomItem(AW);
					var GI = sim.inventoryManager.giveItem(AIN,RI.item.inventoryProperties.id);
					
					if (!GI) {message.reply("No free inventory slots.");}
					else {message.reply("You were given **"+RI.item.inventoryProperties.itemName+"**.");}
				}
			}},
			
			// FIND A TEMPLE*
			{secret: true, id:"!npc", category: "Debug", description:"Finds a random NPC.", finale: function(sim,message) {
				var AIN = sim.accountManager.fetchListAccount(message.author.id);
				if (AIN === undefined) {message.reply(sim.accountManager.STRING_accountMissing); return;}
				
				var PRT = sim.accountManager.partyByName(AIN.template.information.party);
				if (PRT === undefined) {message.reply("You have to be in a party to visit NPCs."); return;}
				
				if (PRT.dungeonLevel != 0) {message.reply("You can only visit NPCs in the town!"); return;}
				
				var AR = message.content.split(" ");
				
				if (AR.length < 2)
				{
					if (AIN.template.NPC != undefined) 
					{
						message.reply("*You look at the NPC again...*");
						sim.townsfolk.drawNPCcard(message.channel,AIN.template.NPC,AIN.template.stats.gold);
						return;
					}
					
					var clone = sim.townsfolk.generateNPC(sim.townsfolk,sim.inventoryManager);
				
					AIN.template.NPC = clone;
					sim.accountManager.saveAccount(AIN.id);
					
					message.reply("**You walk up to the counter of "+clone.name+"...**");
					sim.townsfolk.drawNPCcard(message.channel,clone,AIN.template.stats.gold);
				}
				else if (AR[1].toLowerCase() == "leave")
				{
					if (AIN.template.NPC === undefined) {message.reply("You can't walk away from someone who's not there."); return;}
					AIN.template.NPC = undefined;
					sim.accountManager.saveAccount(AIN.id);
					
					message.reply("You walked away from the NPC.");
				}
				else {message.reply("What are you trying to do?"); return;}
			}},
			
			// FIND A TEMPLE
			{secret: true, id:"!findenchant", category: "Debug", description:"Finds an enchantment stand.", finale: function(sim,message) {
				var AIN = sim.accountManager.fetchListAccount(message.author.id);
				if (AIN === undefined) {message.reply(sim.accountManager.STRING_accountMissing); return;}

				if (sim.monsterManager.atEnchantStation(AIN)){message.reply("You already found one."); return;}
					
				var FT = sim.monsterManager.findEnchant(AIN);
				if (FT.allowed) 
				{
					message.channel.sendFile(environmentDirectory+FT.pic).then(function(){message.reply(FT.msg);}.bind(this),function(){});
				}
			}},
			
			// FIND A TEMPLE
			{secret: true, id:"!temple", category: "Debug", description:"Finds a temple.", finale: function(sim,message) {
				var AIN = sim.accountManager.fetchListAccount(message.author.id);
				if (AIN === undefined) {message.reply(sim.accountManager.STRING_accountMissing); return;}
			
				if (AIN.template.information.party == "" || AIN.template.information.party === undefined) {message.reply("You must be in a party to do that."); return;}
				
				var PRT = sim.accountManager.partyByName(AIN.template.information.party);
				if (PRT === undefined) {message.reply("You have to be in a party to start battles"); return;}
				
				if (sim.monsterManager.getBattle(PRT) != undefined) {message.reply("Your party's already in a battle!"); return;}
				
				var FT = sim.monsterManager.findTemple(PRT);
				if (FT.allowed) 
				{
					message.channel.sendFile(environmentDirectory+FT.pic).then(function(){message.reply(FT.msg);}.bind(this),function(){});
				}
			}},
			
			// VIEW INFO ABOUT A CERTAIN MONSTER
			{secret: false, id:"!codex", category: "Account", description:"Shows codex info about a certain monster, if you've found it.", finale: function(sim,message) {
				var AR = message.content.split(" ");
				if (AR.length > 1)
				{
					if (AR[1].length > 1)
					{
						var forced = false;
						if (AR.length > 2) {if (AR[2].toLowerCase().indexOf("force") != -1) {forced = true;}}
						
						var GCE = sim.monsterManager.getCodexEntry(AR[1]);
						if (GCE === undefined && !forced) {message.reply("\n:books: **There is no codex entry with that ID.**"); return;}
						
						var MID = sim.monsterManager.monsterByID(AR[1].toLowerCase());
						if (MID === undefined) {message.reply("That monster doesn't exist!"); return;}
						
						sim.monsterManager.drawCodexEntry(message.channel,MID,GCE);
					}
					else
					{
						if (!isNaN(parseInt(AR[1]))) {message.reply("You entered a number, not a letter!"); return;}
						var hasLetter = false;
						var CDX = sim.monsterManager.codex;
						var letter = AR[1];
						
						if (CDX.length <= 0) {message.reply("**There are no monsters in the codex right now. Explore to find more!**"); return;}
						
						var monsters = [];
						
						for (var l=0; l<CDX.length; l++)
						{
							if (CDX[l].id.slice(0,1).toLowerCase() == letter.toLowerCase()) 
							{
								hasLetter = true;
								var MNS = sim.monsterManager.monsterByID(CDX[l].id);
								var NM = "unknown";
								
								if (MNS != undefined) {NM = MNS.information.names[0];}
								
								monsters.push({id:CDX[l].id,name:NM});
							}
						}
						
						if (!hasLetter) {message.reply("**No monsters exist under that letter.**"); return;}
						
						var finalMessage = "\n:page_facing_up: **Here are all of the monsters in the codex, alphabetized by "+letter.toUpperCase()+". Use** `!codex monster` **with an ID.** :page_facing_up:\n\n";
						
						// Alphabetize
						monsters.sort(function(a, b) {
						  var nameA = a.id.toUpperCase();
						  var nameB = b.id.toUpperCase();
						  if (nameA < nameB) {return -1;}
						  if (nameA > nameB) {return 1;}

						  return 0;
						})
						
						for (var l=0; l<monsters.length; l++)
						{
							finalMessage += "**"+monsters[l].name+"** - `"+monsters[l].id+"`\n";
						}
						
						message.reply(finalMessage);
					}
				}
				else 
				{
					var finalMessage = "\n:book: **Here is the alphabetized monster codex. Use** `!codex X` **to view a letter or** `!codex monster` **to view a monster by ID.** :books:\n\n";
					var letterCategories = [];
					var CDX = sim.monsterManager.codex;
					
					if (CDX.length <= 0) {message.reply("**There are no monsters in the codex right now. Explore to find more!**"); return;}
					
					for (var l=0; l<CDX.length; l++)
					{
						var categoryExists = false;
						var firstLetter = CDX[l].id.slice(0,1);
						for (var m=0; m<letterCategories.length; m++)
						{
							if (letterCategories[m].letter == firstLetter){letterCategories[m].monsters.push(CDX[l].id); categoryExists = true; break;}
						}
						if (!categoryExists) {letterCategories.push({letter:firstLetter,monsters:[CDX[l].id]});}
					}
					
					// Alphabetize
					letterCategories.sort(function(a, b) {
					  var nameA = a.letter.toUpperCase();
					  var nameB = b.letter.toUpperCase();
					  if (nameA < nameB) {return -1;}
					  if (nameA > nameB) {return 1;}

					  return 0;
					})
					
					for (var o=0; o<letterCategories.length; o++)
					{
						finalMessage += "`"+letterCategories[o].letter.toUpperCase()+"` - *"+letterCategories[o].monsters.length+" monster(s)*\n";
					}
					
					message.reply(finalMessage);
				}
			}},
			
			// START A BATTLE WITH A CERTAIN MONSTER
			{secret: true, id:"!encounter", category: "Debug", description:"Starts a battle with a monster you specify.", finale: function(sim,message) {
				var AR = message.content.split(" ");
				if (AR.length > 1)
				{
					var AIN = sim.accountManager.fetchListAccount(message.author.id);
					if (AIN === undefined) {message.reply(sim.accountManager.STRING_accountMissing); return;}
				
					if (AIN.template.information.party == "" || AIN.template.information.party === undefined) {message.reply("You must be in a party to do that."); return;}
					
					var PRT = sim.accountManager.partyByName(AIN.template.information.party);
					if (PRT === undefined) {message.reply("You have to be in a party to start battles"); return;}
					
					if (sim.monsterManager.getBattle(PRT) != undefined) {message.reply("Your party's already in a battle!"); return;}
					
					if (sim.monsterManager.monsterByID(AR[1]) === undefined && AR[1].toLowerCase() != "random") {message.reply("That's not a real monster."); return;}
					
					var ENV = "hexen";
					var tag = "dungeon";
					if (PRT.dungeonLevel > 0) {ENV = sim.monsterManager.dungeonLevels[PRT.dungeonLevel-1].id;}
					
					if (AR.length >= 2) {ENV = AR[2];}
					if (AR.length >= 3) {tag = AR[3];}
					
					if (AR[1].toLowerCase() != "random"){sim.monsterManager.startBattle(AR[1],PRT,message,ENV,false,false,tag);}
					else{sim.monsterManager.startBattle("",PRT,message,ENV,true,false,tag);}
				}
			}},
			
			// ADD A CODEX ENTRY
			{secret: true, id:"!nukedungeon", category: "Debug", description:"Nukes the dungeon.", finale: function(sim,message) {
				sim.monsterManager.dungeonLevels = [];
				sim.monsterManager.writeDungeons();
				message.reply("Nuked the dungeon.");
			}},
			
			// ADD A CODEX ENTRY
			{secret: true, id:"!nukecodex", category: "Debug", description:"Nukes the codex.", finale: function(sim,message) {
				sim.monsterManager.nukeCodex();
				message.reply("Nuked the codex.");
			}},
			
			// ADD A CODEX ENTRY
			{secret: true, id:"!viewcodex", category: "Debug", description:"Shows the codex.", finale: function(sim,message) {
				message.reply(util.inspect(sim.monsterManager.codex));
			}},
			
			// ADD A CODEX ENTRY
			{secret: true, id:"!addcodex", category: "Debug", description:"Adds a codex entry, as if you killed a monster.", finale: function(sim,message) {
				var AR = message.content.split(" ");
				if (AR.length > 1)
				{
					var AC = sim.monsterManager.addToCodex(AR[1].toLowerCase());
					if (!AC) {message.reply("You added another kill to that monster."); return;}
					
					message.reply("Added `"+AR[1]+"` to the monster codex.");
				}
			}},
			
			// DEBUG AN ITEM
			{secret: true, id:"!itemdebug", category: "Debug", description:"Shows info about a certain item, suffix with an ID.", finale: function(sim,message) {
				var AR = message.content.split(" ");
				if (AR.length > 1)
				{
					sim.inventoryManager.itemDebug(message.channel,AR[1]);
				}
			}},
			
			// DEBUG A MONSTER
			{secret: true, id:"!monsterdebug", category: "Debug", description:"Shows info about a certain monster, suffix with an ID.", finale: function(sim,message) {
				var AR = message.content.split(" ");
				if (AR.length > 1)
				{
					sim.monsterManager.monsterDebug(message.channel,AR[1]);
				}
			}},
			
			// ITEM ICON
			{secret: true, id:"!itemicon", category: "Debug", description:"Sends the icon for an item.", finale: function(sim,message) {
				var AR = message.content.split(" ");
				if (AR.length > 1)
				{
					var II = sim.inventoryManager.getItemIcon(AR[1],true);
					if (II != "") {message.channel.sendFile(II);}
				}
			}},
			
			// LIST ALL ITEMS
			{secret: true, id:"!listitems", category: "Debug", description:"Lists all item folders / IDs.", finale: function(sim,message) {
				message.reply("```"+sim.inventoryManager.listItemFolders()+"```");
			}},
			
			// LIST ALL MONSTERS
			{secret: true, id:"!listmonsters", category: "Debug", description:"Lists all monster folders / IDs.", finale: function(sim,message) {
				message.reply("```"+sim.monsterManager.listMonsterFolders()+"```");
			}},
			
			// UPDATE ACCOUNT LIST
			{secret: true, id:"!updateacclist", category: "Debug", description:"Updates all of the accounts in the account list.", finale: function(sim,message) {
				sim.accountManager.updateAccountList();
				message.reply("Updated the accounts.");
			}},
			
			// FIND A FREE SPOT IN OUR INVENTORY
			{secret: true, id:"!freespot", category: "Debug", description:"Finds the first free inventory spot.", finale: function(sim,message) {
				var ACCT = sim.accountManager.fetchListAccount(message.author.id);
				if (ACCT === undefined) {message.reply(sim.accountManager.STRING_accountMissing); return;}
				
				var SPC = sim.inventoryManager.findFreeSpot(ACCT);
				if (SPC == -1) {message.reply("You don't have any free spots!"); return;}
				
				message.reply("The first free spot in your inventory is slot "+SPC.toString()+".");
			}},
			
			// GIVE OURSELVES AN ITEM
			{secret: true, id:"!summon", category: "Debug", description:"Gives yourself a certain item.", finale: function(sim,message) {
				var AR = message.content.split(" ");
				if (AR.length > 1)
				{
					var IT = sim.inventoryManager.itemByID(AR[1]);
					if (IT === undefined) {message.reply("That item doesn't exist."); return;}
					var ACCT = sim.accountManager.fetchListAccount(message.author.id);
					
					if (sim.inventoryManager.giveItem(ACCT,AR[1])) {message.reply("You mysteriously found: `"+IT.item.inventoryProperties.itemName+"`.");}
					else {message.reply("That didn't work, maybe your inventory is full?");}
				}
			}},
			
			// LOG ACCOUNT LIST
			{secret: true, id:"!logaccounts", category: "Debug", description:"Logs the account list.", finale: function(sim,message) {
				var FS = "";
				
				for (var l=0; l<sim.accountManager.accounts.length; l++)
				{
					FS += util.inspect(sim.accountManager.accounts[l].template)+"\n\n";
				}
				message.reply(FS.slice(0,1900));
			}},
			
			// JSON TEST
			{secret: true, id:"!testjson", category: "Debug", description:"Tests JSON.", finale: function(sim,message) {
				var TEST = [];
				
				for (var l=0; l<50; l++)
				{
					TEST.push({name:"blah", rarity:0, test:"bleh"});
				}
				
				jsonfile.writeFile('./rpgmode/jsontest.json', TEST, function (err) {console.error(err)});
				
				message.reply("Saved");
			}},
			
			// SET ITEM PROPERTIES
			{secret: true, id:"!coreprop", category: "Debug", description:"Sets core properties for an account just in case. - WARNING: THIS CLEARS ALL PREVIOUS", finale: function(sim,message) {
				var AR = message.content.split(" ");
				if (AR.length < 2) {message.reply("Specify a username!"); return;}
				
				var TID = AR[1];
				
				var AIN = sim.accountManager.userByText(TID);
				
				if (AIN === undefined) {message.reply("That user doesn't exist!"); return;}
				
				AIN.template.stats.gold = 0;
				
				
				for (var l=0; l<AIN.template.backpack.length; l++)
				{
					var IT = sim.inventoryManager.itemByID(AIN.template.backpack[l].id);
					
					if (IT != undefined)
					{
						AIN.template.backpack[l].rarity = IT.item.inventoryProperties.rarity;
						AIN.template.backpack[l].prefixes = IT.item.inventoryProperties.prefixes;
						AIN.template.backpack[l].suffixes = IT.item.inventoryProperties.suffixes;
					}
					else
					{
						AIN.template.backpack[l].rarity = 0;
						AIN.template.backpack[l].prefixes = [];
						AIN.template.backpack[l].suffixes = [];
					}
				}
				
				for (var l=0; l<AIN.template.inventory.length; l++)
				{
					var IT = sim.inventoryManager.itemByID(AIN.template.inventory[l].item);
					
					if (IT != undefined)
					{
						AIN.template.inventory[l].rarity = IT.item.inventoryProperties.rarity;
						AIN.template.inventory[l].prefixes = IT.item.inventoryProperties.prefixes;
						AIN.template.inventory[l].suffixes = IT.item.inventoryProperties.suffixes;
					}
					else
					{
						AIN.template.inventory[l].rarity = 0;
						AIN.template.inventory[l].prefixes = [];
						AIN.template.inventory[l].suffixes = [];
					}
				}
				
				
				sim.accountManager.saveAccount(AIN.id);
				
				message.reply("Core properties set.");
			}},
			
			// PAIN
			{secret: true, id:"!pain", category: "Debug", description:"Takes away health.", finale: function(sim,message) {
				var AR = message.content.split(" ");
				if (AR.length > 1)
				{
					var HLT = parseInt(AR[1]);
					var AIN = sim.accountManager.fetchListAccount(message.author.id);
					
					AIN.template.stats.health -= HLT;
					message.reply("You took **"+HLT+"** damage. Your health is now **"+AIN.template.stats.health+"**.");
					
					sim.accountManager.saveAccount(message.author.id);
				}
				else {message.reply("Enter a number!");}
			}},
			
			// EXPERIENCE
			{secret: true, id:"!gainxp", category: "Debug", description:"Gives you experience.", finale: function(sim,message) {
				var AR = message.content.split(" ");
				if (AR.length > 1)
				{
					var XP = parseInt(AR[1]);
					var AIN = sim.accountManager.fetchListAccount(message.author.id);
					var GXP = sim.accountManager.giveUserXP(AIN,XP);
					
					if (!GXP.levelUp) {message.reply(GXP.msg);}
					else {message.reply("WOW YOU LEVELED UP");}
				}
				else {message.reply("Enter a number!");}
			}},
			
			//--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==
			//
			// -- == BATTLE COMMANDS == --
			//
			//--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==
			
			// SHOW MODIFIERS
			{secret: true, id:"!modifiers", category: "Debug", description:"Shows your modifiers. Use `!modifiers monster` to view the monster's", finale: function(sim,message) {
				var AIN = sim.accountManager.fetchListAccount(message.author.id);
				if (AIN === undefined) {message.reply(sim.accountManager.STRING_accountMissing); return;}
					
				var PRT = sim.accountManager.partyByName(AIN.template.information.party);
				if (PRT === undefined) {message.reply("You have to be in a party to participate!");}
					
				var IB = sim.monsterManager.getBattle(PRT);
				if (IB === undefined) {message.reply("Your party's not in a battle!"); return;}
				
				var MEM = IB.findBattleMember(AIN);
				if (MEM === undefined) {message.reply("You're not in the battle."); return;}
				
				var FS = "";
				var mon = false;
				
				var ARR = message.content.split(" ");
				if (ARR.length > 1)
				{
					if (ARR[1].toLowerCase() == "monster") {mon = true;}
				}
				
				if (!mon)
				{
					for (var l=0; l<MEM.modifiers.length; l++)
					{
						FS += util.inspect(MEM.modifiers[l])+"\n\n";
					}
				}
				else
				{
					FS += util.inspect(IB.monsterModifiers)+"\n\n";
				}
				
				message.reply("Returned modifiers:\n\n"+FS.slice(0,1900));
			}},
			
			// SHOW HEALTH
			{secret: true, id:"!mhealth", category: "Debug", description:"Shows the monster's health.", finale: function(sim,message) {
				var AIN = sim.accountManager.fetchListAccount(message.author.id);
				if (AIN === undefined) {message.reply(sim.accountManager.STRING_accountMissing); return;}
					
				var PRT = sim.accountManager.partyByName(AIN.template.information.party);
				if (PRT === undefined) {message.reply("You have to be in a party to participate!");}
					
				var IB = sim.monsterManager.getBattle(PRT);
				if (IB === undefined) {message.reply("Your party's not in a battle!"); return;}
				
				message.reply("Monster has "+IB.monster.information.health+"/"+IB.monster.information.maxHealth+" health");
			}},
			
			// ATTACK
			{secret: false, id:"!strike", category: "Battle", description:"Attacks the monster with your current weapon.", finale: function(sim,message) {
				
				if (sim.accountManager.isDead(message.author.id)) {message.reply("You can't do much when you're dead!"); return;}
				
				var AIN = sim.accountManager.fetchListAccount(message.author.id);
				if (AIN === undefined) {message.reply(sim.accountManager.STRING_accountMissing); return;}
					
				var PRT = sim.accountManager.partyByName(AIN.template.information.party);
				if (PRT === undefined) {message.reply("You have to be in a party to participate!");}
					
				var IB = sim.monsterManager.getBattle(PRT);
				if (IB === undefined) {message.reply("Your party's not in a battle!"); return;}
				
				// Do we have a weapon?
				var WP = sim.inventoryManager.itemInSlot("w",AIN,false);
				if (WP === undefined) 
				{
					message.reply("You can't attack without a weapon!").then(function(messg){
						setTimeout(function(){messg.delete();}.bind(this),3000);
					}.bind(this),function(){});
					
					return;
				}
				
				message.delete();
				IB.setMemberStatus(IB.findBattleMember(AIN),IB.STATE_ATTACK);
				
				//IB.playerAttack(message,AIN);
			}},
			
			// BLOCK
			{secret: false, id:"!block", category: "Battle", description:"Reduces damage if you wind up getting hit.", finale: function(sim,message) {
				
				if (sim.accountManager.isDead(message.author.id)) {message.reply("You can't do much when you're dead!"); return;}
				
				var AIN = sim.accountManager.fetchListAccount(message.author.id);
				if (AIN === undefined) {message.reply(sim.accountManager.STRING_accountMissing); return;}
					
				var PRT = sim.accountManager.partyByName(AIN.template.information.party);
				if (PRT === undefined) {message.reply("You have to be in a party to participate!");}
					
				var IB = sim.monsterManager.getBattle(PRT);
				if (IB === undefined) {message.reply("Your party's not in a battle!"); return;}
				
				message.delete();
				IB.setMemberStatus(IB.findBattleMember(AIN),IB.STATE_BLOCK);
				
				//IB.playerAttack(message,AIN);
			}},
			
			// FLEE
			{secret: false, id:"!flee", category: "Battle", description:"Attempts to run away from the battle.", finale: function(sim,message) {
				
				if (sim.accountManager.isDead(message.author.id)) {message.reply("You can't do much when you're dead!"); return;}
				
				var AIN = sim.accountManager.fetchListAccount(message.author.id);
				if (AIN === undefined) {message.reply(sim.accountManager.STRING_accountMissing); return;}
					
				var PRT = sim.accountManager.partyByName(AIN.template.information.party);
				if (PRT === undefined) {message.reply("You have to be in a party to participate!");}
					
				var IB = sim.monsterManager.getBattle(PRT);
				if (IB === undefined) {message.reply("Your party's not in a battle!"); return;}
				
				message.delete();
				IB.setMemberStatus(IB.findBattleMember(AIN),IB.STATE_FLEE);
				
				//IB.playerAttack(message,AIN);
			}}
			
		];
		
		console.log("[RPG] Created AccountManager: "+this.accountManager+"!");
		console.log("[RPG] "+this.environments.length+" environments loaded.");
		
		this.characters.setupCharacters();
	}
	
	commandPrep(sim,message)
	{
		var AIN = sim.accountManager.fetchListAccount(message.author.id);
		if (AIN === undefined) {message.reply(sim.accountManager.STRING_accountMissing); return;}
	
		if (AIN.template.information.party == "" || AIN.template.information.party === undefined) {return {allowed:false, AIN:AIN, PRT:PRT, msg:"You must be in a party to do that."};}
		
		var PRT = sim.accountManager.partyByName(AIN.template.information.party);
		if (PRT === undefined) {return {allowed:false, AIN:AIN, PRT:PRT, msg:"You have to be in a party to do that."};}
		
		return {allowed:true, AIN:AIN, PRT:PRT, msg:""};
	}
	
	findEnviron(id)
	{
		for (var l=0; l<this.environments.length; l++)
		{
			if (this.environments[l].id == id) {return this.environments[l];}
		}
		
		return this.environments[0];
	}
	
	// -- PRINT INFO ABOUT A CERTAIN ITEM
	printItemInfo(chan,card)
	{
		var BCG = new Image(imageDirectory+IMG_infoBack,"auto");
		
		var HT = 33;
		if (card.large) {HT = 33+32}
		if (card.showPrice) {HT +=15;}
		
		var BGG = IMG_charBack;
		if (card.large) {BGG = IMG_infoBackLarge}
		
		var BG = new Image(imageDirectory+BGG,"auto").resize(400,HT).loadFont(fontDirectory+'peepo.ttf','Peepo').loadFont(fontDirectory+'pixtech.ttf','PixTech').loadFont(fontDirectory+'8bit.ttf','8bit').draw(cxt => {
			
			if (!card.large)
			{
				BCG.ready(function(bmpp){
					cxt.drawImage(bmpp,0,0);
				}.bind(this));
			}
			
			this.infoCardDraw(card,0,0,cxt);
		}).save(imageDirectory+'dump.png').then(function(){
			console.log("send");
			chan.sendFile(imageDirectory+'dump.png');
		}.bind(this),function(){});
	}
	
	
	// -- PREPARE INVENTORY INFO FOR DRAWING - Returns an object with information
	infoCardPrep(itemID,rare,itemname,pref,suff,showPrice = false,buyPrice = -1,sellPrice = -1,allowLarge = false)
	{
		var PUSHER = {name:itemname,description:"",helper:"",rarity:rare,prefixes:pref,suffixes:suff,img:undefined,bmp:undefined,backimg:undefined,tags:undefined,rarities:undefined,large:false,Yoffset:0};
		
		var II = this.inventoryManager.getItemIcon(itemID,true,allowLarge);
		if (II != "") {PUSHER.img = new Image(II,"auto");}
		
		var ITM = this.inventoryManager.itemByID(itemID);
		
		if (ITM != undefined)
		{
			PUSHER.description = ITM.item.inventoryProperties.description;
			PUSHER.helper = ITM.item.inventoryProperties.helper;
		}
		
		var LT = "";
		if (allowLarge && ITM.item.inventoryProperties.inventoryIconLarge != undefined) {PUSHER.large = true; PUSHER.Yoffset = 32; LT = "_large";}
		
		
		var rarityImages = [];
		for (var l=0; l<9; l++){rarityImages.push({img: new Image(imageDirectory+'rarity_'+l.toString()+LT+'.png',"auto"), bmp:undefined});}
		rarityImages.forEach(function(element) {
			element.img.ready(function(bmpp){
				element.bmp = bmpp;
			}.bind(this));
		});
		
		var rarityTags = [];
		for (var l=0; l<9; l++){rarityTags.push({img: new Image(imageDirectory+'raretag_'+l.toString()+'.png',"auto"), bmp:undefined});}
		rarityTags.forEach(function(element) {
			element.img.ready(function(bmpp){
				element.bmp = bmpp;
			}.bind(this));
		});
		
		PUSHER.rarities = rarityImages;
		PUSHER.tags = rarityTags;
		
		PUSHER.buyPrice = buyPrice;
		PUSHER.sellPrice = sellPrice;
		PUSHER.showPrice = showPrice;
		
		
		
		if (PUSHER.large){PUSHER.backimg = new Image(imageDirectory+IMG_infoBackLarge,"auto");}
		else {PUSHER.backimg = new Image(imageDirectory+IMG_infoBack,"auto");}
		
		return PUSHER;
	}
	
	// -- ACTUALLY DRAW THE INFO CARD ONTO THE CANVAS
	infoCardDraw(card,x,y,ctx)
	{
		// DRAW THE BACKGROUND
		card.backimg.ready(function(bmpp){
			ctx.drawImage(bmpp,x,y);
		}.bind(this));
		
		// NOW DRAW AN INVENTORY ICON
		if (card.img != undefined)
		{
			card.img.ready(function(bmpp){
				
				var CN = card.name;
				
				for (var l=0; l<card.prefixes.length; l++) {CN = card.prefixes[l].message+" "+CN;}
				for (var l=0; l<card.suffixes.length; l++) {CN = CN+" "+card.suffixes[l];}
				
				ctx.drawImage(card.rarities[card.rarity].bmp,x+POS_infoIcon.x,y+POS_infoIcon.y);
				ctx.fillStyle = "#ffffff";
				ctx.setFont('PixTech',8);
				ctx.drawImage(bmpp,x+POS_infoIcon.x,y+POS_infoIcon.y);
				//ctx.fillText(CN,x+POS_infoName.x,y+POS_infoName.y);
				ctx.fillText(CN,x+POS_infoName.x,y+POS_infoName.y+1+card.Yoffset);
				ctx.setFont('Peepo',10);
				ctx.fillText(card.description,x+POS_infoDescription.x,y+POS_infoDescription.y+card.Yoffset);
				ctx.fillStyle = COL_helper;
				ctx.fillText(card.helper,x+POS_infoHelper.x,y+POS_infoHelper.y+card.Yoffset);
				ctx.drawImage(card.tags[card.rarity].bmp,x+POS_infoIcon.x,y+POS_infoIcon.y+card.Yoffset);
				
				// DRAW THE PRICES
				if (card.showPrice)
				{
					ctx.fillStyle = "#ffffaa";
					ctx.setFont('Peepo',10);
					var STR = "Purchase for: ";
					if (card.buyPrice <= -1) {STR = "Cannot buy";}
					var MS = ctx.measureText(STR);
					ctx.fillText(STR,x+POS_priceBuy.x,y+POS_priceBuy.y+card.Yoffset);
					
					if (card.buyPrice > -1)
					{
					ctx.setFont('PixTech',8);
					ctx.fillText(card.buyPrice.toString(),x+POS_priceBuy.x+MS.width,y+POS_priceBuy.y+card.Yoffset);
					}
					
					ctx.setFont('PixTech',8);
					var nextX = x+POS_priceSell.x;
					
					if (card.sellPrice > -1)
					{
						var STR = card.sellPrice.toString();
						var MS = ctx.measureText(STR);
						ctx.fillText(STR,x+POS_priceSell.x-MS.width,y+POS_priceSell.y+card.Yoffset);
						nextX -= MS.width;
					}
					
					ctx.setFont('Peepo',10);
					
					var STR = "Sells for: ";
					if (card.sellPrice <= -1) {STR = "Cannot sell"}
					
					var MS = ctx.measureText(STR);
					ctx.fillText(STR,nextX-MS.width,y+POS_priceSell.y+card.Yoffset);
				}
			}.bind(this));
		}
	}
	
	printCommands(message,showtext,thecat)
	{
		var CATS = [];
		var finalString = "";
		
		// Loop through all the commands
		for (var l=0; l<this.commands.length; l++)
		{
			if (this.commands[l].id == "!rpghelp") {continue;}
			if ((this.commands[l].secret && message.channel.name.toLowerCase().indexOf("developer") != -1) || !this.commands[l].secret)
			{
				var foundCom = false;
				
				for (var m=0; m<CATS.length; m++)
				{
					if (CATS[m].category == this.commands[l].category) {CATS[m].commands.push(this.commands[l]); foundCom = true;}
				}
				
				// No, make a new category
				if (!foundCom)
				{
					var CT = {category:this.commands[l].category, commands:[this.commands[l]]};
					
					CATS.push(CT);
				}
			}
		}
		
		// Now draw the final shit
		for (var o=0; o<CATS.length; o++)
		{
			if (showtext && CATS[o].category.toLowerCase() == thecat.toLowerCase())
			{
				finalString += "```"+CATS[o].category+"```";
				
				if (showtext)
				{
					for (var m=0; m<CATS[o].commands.length; m++)
					{
						finalString += "`"+CATS[o].commands[m].id+"` - *"+CATS[o].commands[m].description+"*\n";
					}
				}
			}
			else if (!showtext) {finalString += "`"+CATS[o].category+"`\n";}
		}
		
		return finalString;
	}
	
	// INITIALIZE THE SOUND BOT, PREPARE IT FOR PLAYING
	initializeBot()
	{
		if (!botInfo.enabled) {return;}
		
		console.log("[RPG] Attempting to log the bots in...");
		
		this.soundBot.login(soundBotInfo.username,soundBotInfo.pass).then(function()
			{
				console.log("[RPG] Soundbot has logged in.");
				this.soundBot.user.setStatus("online","RPG Simulator","");
				this.botJoinVoice(this.soundBot,true);
				
					this.soundBot.on("ready", function(){
						
						// CONSTANTLY CHECK IF WE'RE IN VOICE
						setInterval(function(){
							if (this.soundBot.voiceConnections.first() === undefined) {this.botJoinVoice(this.soundBot,true)}
						}.bind(this),10000);
						
					}.bind(this));
			}.bind(this),function(e){console.log(e)}
		).catch(function (err) {console.log(err);});
		
		this.musicBot.login(botInfo.username,botInfo.pass).then(function()
		{
			console.log("[RPG] Musicbot has logged in.");
			
			this.musicBot.on("ready", function(){
					// CONSTANTLY CHECK IF WE'RE IN VOICE
				setInterval(function(){
					if (this.musicBot.voiceConnections.first() === undefined) {this.botJoinVoice(this.musicbot,true)}
				}.bind(this),10000);
			}.bind(this));
			
			this.musicBot.user.setStatus("online","RPG Simulator","");
			this.botJoinVoice(this.musicBot,false);
		}.bind(this),function(e){console.log(e);}
		).catch(function (err) {
			console.log(err);
		});
	}
	
	// JOIN THE VOICE
	botJoinVoice(thebot,sound)
	{
		if (!botInfo.enabled) {return;}
		
		var GLD = thebot.guilds.find('id', primaryServer);
		if (GLD === undefined) {console.log("No guild"); return;}
		
		var CHN = GLD.channels.array();
		var VC = undefined;
		
		for (var l=0; l<CHN.length; l++)
		{
			if (CHN[l].type == "voice" && CHN[l].name.toLowerCase().indexOf(voiceChecker) != -1) {VC = CHN[l]; break;}
		}
		
		if (VC === undefined) {return;}
		
		console.log("Joining "+VC.name)
		
		VC.join().then(function(conn)
		{
			console.log("Joined voice");
			if (sound) {this.soundVoiceInfo.conn = conn;}
			else {this.voiceInfo.conn = conn;}
		}.bind(this),function(){});
	}
	
	// STOP MUSIC
	botStopMusic() 
	{
		if (!botInfo.enabled) {return;}
		
		console.log("botStopMusic");
		this.playingMusic = false;
		if (this.voiceInfo.strm != undefined) {this.voiceInfo.strm.end();}
	}
	
	// PLAY A MUSIC TRACK IN THE BOT
	botPlayMusic(snd, vol, atTime)
	{
		/*
		if (!botInfo.enabled) {return;}
		
		console.log("botPlayMusic");
		if (this.voiceInfo.conn != undefined)
		{
			this.playingMusic = true;
			
			this.voiceInfo.time = atTime;
			this.voiceInfo.track = snd;
			this.voiceInfo.strm = this.voiceInfo.conn.playFile(musicDirectory+snd, {seek: atTime, volume:vol});
			
			this.voiceInfo.strm.on("end",function(){
				if (!this.voiceInfo.playingSound && this.playingMusic && this.voiceInfo.strm.totalStreamTime/1000 > 1)
				{
					this.botPlayMusic(snd,vol,0);
				}
			}.bind(this),function(){});
		}
		*/
		
		if (this.voiceInfo.conn === undefined) {return;}
		
		this.voiceInfo.strm = this.voiceInfo.conn.playFile(musicDirectory+snd, {seek: atTime, volume:vol});
		this.voiceInfo.strm.on("end",function(){
		if (!this.voiceInfo.playingSound && this.playingMusic && this.voiceInfo.strm.totalStreamTime/1000 > 1)
		{
			this.botPlayMusic(snd,vol,0);
		}
		}.bind(this),function(){});
	}
	
	// PLAY A SOUND IN THE BOT
	botPlaySound(snd, vol)
	{
		if (!botInfo.enabled) {return;}
		
		if (this.soundVoiceInfo.conn === undefined) {return;}
		
		console.log("botPlaySound");
		/*
		if (this.voiceInfo.conn != undefined)
		{
			if (this.voiceInfo.strm != undefined)
			{
				console.log(this.voiceInfo.strm.totalStreamTime);
				this.voiceInfo.time = this.voiceInfo.strm.totalStreamTime/1000;
				
				this.voiceInfo.playingSound = true;
				this.voiceInfo.strm.end();
			
				this.voiceInfo.strm = this.voiceInfo.conn.playFile(snd, {volume:vol});
				
				this.voiceInfo.strm.on("end",function(){
					console.log("Sound ended");
					if (this.playingMusic)
					{
						this.voiceInfo.strm.end();
						this.voiceInfo.playingSound = false;
						this.botPlayMusic(this.voiceInfo.track,0.25,this.voiceInfo.time);
					}
				}.bind(this));
			}
			else
			{
				this.voiceInfo.playingSound = true;
				this.voiceInfo.strm = this.voiceInfo.conn.playFile(snd, {volume:vol});
				
				this.voiceInfo.strm.on("end",function(){
					if (this.playingMusic)
					{
						console.log("Resuming");
						this.voiceInfo.strm.end();
						this.voiceInfo.playingSound = false;
						this.botPlayMusic(this.voiceInfo.track,0.25,0);
					}
				}.bind(this));
			}
		}
		*/
		
		if (this.soundVoiceInfo.conn != undefined)
		{
			this.soundVoiceInfo.strm = this.soundVoiceInfo.conn.playFile(snd, {volume:vol});
		}
	}
	
	// -- DID WE EXECUTE ANY COMMANDS?
	parseCommands(message)
	{
		var msg = message.content.toLowerCase();
		
		// DID WE ENTER A BIOME?
		for (var l=0; l<this.environments.biomes.length; l++)
		{
			if (msg.indexOf(this.environments.biomes[l].id) != -1)
			{
				var sim = this;
				
				var AIN = sim.accountManager.fetchListAccount(message.author.id);
				if (AIN === undefined) {message.reply(sim.accountManager.STRING_accountMissing); return;}
				var PRT = sim.accountManager.partyByName(AIN.template.information.party);
				if (PRT === undefined) {message.reply("You can't explore without being in a party!"); return;}
				
				if (PRT.dungeonLevel > 0) {m.reply("You must be in town to explore!"); return;}
				
				PRT.biome = this.environments.biomes[l].id;
				PRT.dungeonLevel = this.environments.biomes[l].dungeonLevel;
				this.accountManager.writeParties();
				
				var FM = "\n:earth_americas: **You travel a distance, and enter "+this.environments.biomes[l].enterString+".** :leaves:\n*"+this.environments.biomes[l].description+"*";
				
				message.reply(FM);
				return;
			}
		}
		
		// CHECK THE RAW COMMANDS
		for (var l=0; l<this.commands.length; l++)
		{
			if (msg.indexOf(this.commands[l].id) != -1)
			{
				this.commands[l].finale(this,message);
				return;
			}
		}
		
		this.checkForName(message);
	}
	
	// --==--==--==--==--==--==--==--==--==
	// DID WE TYPE A CHARACTER'S NAME?
	// --==--==--==--==--==--==--==--==--==
	checkForName(message)
	{
		if (this.accountManager.currentCreator != undefined)
		{
			if (this.accountManager.currentCreator.state == 2)
			{
				var MSG = message.content.toLowerCase();
				for (var l=0; l<this.pageIcons.length; l++)
				{
					console.log(this.pageIcons[l].id);
					
					if (MSG.indexOf("!"+this.pageIcons[l].id) != -1)
					{
						this.accountManager.handleStates(message,true,this.pageIcons[l].id);
						return;
					}
				}
			}
		}
	}
	
	// --==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==
	// -- PRINT A PAGE OF CHARACTERS IN THE CHANNEL
	// --==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==
	printCharPage(chan,page)
	{
		var STRT = pageCharCount*page;
		var LEN = pageCharCount;
		var FIN = this.characters.characters.length;
		if (STRT+LEN >= FIN) {LEN = FIN - STRT;}
		
		var BBimage = new Image(imageDirectory+IMG_charBar,"auto");
		var IMGS = [];
		
		var CNTR = 0;
		
		var availableImages = 0;
		var TCNC = 0;
		
		// Push some images
		for (var l=STRT; l<FIN; l++) 
		{
			if (!this.characters.characters[l].cheat)
			{
				console.log(this.characters.characters[l].tinyIcon);
				IMGS.push({img:new Image(this.characters.characters[l].tinyIcon,"auto"), id:this.characters.characters[l].id, pos:TCNC, real:l, name:this.characters.characters[l].characterName});
				TCNC ++;
			}
		}
		
		this.pageIcons = IMGS;
		this.iconCounter = 0;
		
		// DRAW THE THINGY
		var totalHeight = IMGS.length*charBarSize;
		var BG = new Image(imageDirectory+IMG_charBack,"auto").resize(400,totalHeight+headerSize).loadFont(fontDirectory+'8bit.ttf','8bit').loadFont(fontDirectory+'pixel_maz.ttf','Gothic').loadFont(fontDirectory+'pixtech.ttf','PixTech').draw(cxt => {
		
		var CNTR = 0;
		var ICNT = 0;
		
		// DRAW THE BACKGROUNDS
		BBimage.ready(function(bmpp){
			console.log("bb");
			
			for (var l=STRT; l<FIN; l++)
			{
				cxt.drawImage(bmpp,0,headerSize+(CNTR*charBarSize));
				CNTR ++;
			}
		}.bind(this));
		
		// DRAW THE ICONS
		IMGS.forEach(function(element) {
			element.img.ready(function(bmpp){
				cxt.drawImage(bmpp,8,Math.floor(element.pos*charBarSize)+headerSize);
				
				cxt.fillStyle = "#FFFFFF";
				cxt.setFont('8bit',16);
				cxt.fillText(element.name,151,14+(element.pos*charBarSize)+headerSize);
				
				cxt.setFont('PixTech',9);
				
				var SPC = 12;
				
				// -- DRAW THE FONTS --
				var SB = this.characters.characters[element.real].characterStatBoost;
				for (var n=0; n<SB.length; n++)
				{
					cxt.fillStyle = "#000000";
					for (var o=-1; o<2; o++)
					{
						for (var p=-1; p<2; p++)
						{
						cxt.fillText(SB[n].toString(),48+(SPC*n)+o,14+(element.pos*charBarSize)+p+headerSize);
						}
					}
					cxt.fillStyle = "#FFFFFF";
					cxt.fillText(SB[n].toString(),48+(SPC*n),14+(element.pos*charBarSize)+headerSize);
				}
				
				cxt.setFont('Gothic',11);
				cxt.fillText("TYPE   !"+element.id.toUpperCase(),256,14+(element.pos*charBarSize)+headerSize);
				
			}.bind(this));	
		}.bind(this));

		}).save(imageDirectory+'dump.png').then(function(){
			console.log("send");
			chan.sendFile(imageDirectory+'dump.png');
		}.bind(this),function(){});
	}
	
	// --==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==
	// -- DISPLAY INVENTORY FOR A USER --
	// --==--==--==--=!=--==--==--==--==--==--==--==--==--==--==--==--==--==
	printInventory(chan,inventoryData)
	{
		// -- THE THREE INVENTORY IMAGES
		var IMG_eqW = undefined;
		var IMG_eqA = undefined;
		var IMG_eqB = undefined;
		
		var ID_eqW = this.inventoryManager.getItemIcon(inventoryData.wepItem.item,true);
		var ID_eqA = this.inventoryManager.getItemIcon(inventoryData.eqAItem.item,true);
		var ID_eqB = this.inventoryManager.getItemIcon(inventoryData.eqBItem.item,true);

		if (ID_eqW != "") {IMG_eqW = new Image(ID_eqW,"auto");}
		if (ID_eqA != "") {IMG_eqA = new Image(ID_eqA,"auto");}
		if (ID_eqB != "") {IMG_eqB = new Image(ID_eqB,"auto");}
		
		var iconImages = [];
		var snakeR = 0;
		var snakeH = 0;
		
		var rarityImages = [];
		for (var l=0; l<9; l++){rarityImages.push({img: new Image(imageDirectory+'rarity_'+l.toString()+'.png',"auto"), bmp:undefined});}
		rarityImages.forEach(function(element) {
			element.img.ready(function(bmpp){
				element.bmp = bmpp;
			}.bind(this));
		});
		
		for (var l=0; l<inventoryData.backpack.length; l++)
		{
			var PTH = this.inventoryManager.getItemIcon(inventoryData.backpack[l].id,true);
			var PUSHER = {
				path: PTH,
				row: snakeR,
				height: snakeH,
				rare: inventoryData.backpack[l].rarity
			};
			
			if (PTH != "") {PUSHER.img = new Image(PTH,"auto");}
			else {PUSHER.img = undefined;}
			
			iconImages.push(PUSHER);
			
			// Snake through the menu
			snakeR ++;
			if (snakeR >= invWidth)
			{
				snakeR = 0;
				snakeH ++;
			}
		}
		
		console.log(imageDirectory+IMG_invBack);
		var BG = new Image(path.join(imageDirectory,IMG_invBack),"auto").loadFont(fontDirectory+'pixel_maz.ttf','Gothic').loadFont(fontDirectory+'pixtech.ttf','PixTech').draw(cxt => {
			
			cxt.fillStyle = "#ffffff";
			cxt.setFont('PixTech',9);
			
			cxt.fillText("W",POS_invW.x+2,POS_invW.y+26)
			cxt.fillText("A",POS_invA.x+2,POS_invA.y+26)
			cxt.fillText("B",POS_invB.x+2,POS_invB.y+26)
			
			// -- DRAW THE THREE ICONS IN THE BOTTOM-LEFT
			if (IMG_eqW != undefined)
			{
				IMG_eqW.ready(function(bmpp){
					cxt.drawImage(rarityImages[inventoryData.wepItem.rarity].bmp,POS_invW.x,POS_invW.y);
					cxt.drawImage(bmpp,POS_invW.x,POS_invW.y);
					cxt.fillText("W",POS_invW.x+2,POS_invW.y+26)
				}.bind(this));
			}
			
			if (IMG_eqA != undefined)
			{
				IMG_eqA.ready(function(bmpp){
					cxt.drawImage(rarityImages[inventoryData.eqAItem.rarity].bmp,POS_invA.x,POS_invA.y);
					cxt.drawImage(bmpp,POS_invA.x,POS_invA.y);
					cxt.fillText("A",POS_invA.x+2,POS_invA.y+26)
				}.bind(this));
			}
			
			if (IMG_eqB != undefined)
			{
				IMG_eqB.ready(function(bmpp){
					cxt.drawImage(rarityImages[inventoryData.eqBItem.rarity].bmp,POS_invB.x,POS_invB.y);
					cxt.drawImage(bmpp,POS_invB.x,POS_invB.y);
					cxt.fillText("B",POS_invB.x+2,POS_invB.y+26)
				}.bind(this));
			}
			
			// DRAW THE ACTUAL INVENTORY ICONS - USE FOREACH TO AVOID TIMING AND SUCH
			iconImages.forEach(function(element) {
				var X1 = POS_invStart.x + (invBoxSize*element.row);
				var Y1 = POS_invStart.y + (invBoxSize*element.height);
				var TXT = (invWidth * element.height) + element.row;
				
				if (element.img != undefined)
				{
					element.img.ready(function(bmpp){
						cxt.drawImage(rarityImages[element.rare].bmp,X1,Y1);
						cxt.drawImage(bmpp,X1,Y1);
						cxt.fillText(TXT.toString(),X1,Y1+26)
					}.bind(this));	
				}

				cxt.fillText(TXT.toString(),X1,Y1+26)
			});
			
			cxt.fillStyle = "#ffffff";
			cxt.setFont('PixTech',9);
			cxt.fillText("INVENTORY FOR "+inventoryData.displayname.toUpperCase()+":",POS_inventoryTitle.x,POS_inventoryTitle.y);
			cxt.fillText(inventoryData.gold.toString(),POS_inventoryGold.x,POS_inventoryGold.y);
			
		}).save(imageDirectory+'dump.png').then(function(){
			chan.sendFile(imageDirectory+'dump.png');
		}.bind(this),function(){});
	}
	
	// --==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==
	// -- PRINT A BADGE IN THE CHANNEL --
	// --==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==
	printBadge(chan,badgeInfo)
	{
		var PP = "";
		var PPimage = undefined;
		
		// RARITY SLOTS
		var rarityImages = [];
		for (var l=0; l<9; l++){rarityImages.push({img: new Image(imageDirectory+'rarity_'+l.toString()+'.png',"auto"), bmp:undefined});}
		rarityImages.forEach(function(element) {
			element.img.ready(function(bmpp){
				element.bmp = bmpp;
			}.bind(this));
		});
		
		var ID_eqW = this.inventoryManager.getItemIcon(badgeInfo.wepItem.item,true);
		var ID_eqA = this.inventoryManager.getItemIcon(badgeInfo.eqItemA.item,true);
		var ID_eqB = this.inventoryManager.getItemIcon(badgeInfo.eqItemB.item,true);
		
		var ITW = this.inventoryManager.itemByID(badgeInfo.wepItem.item);
		var ITA = this.inventoryManager.itemByID(badgeInfo.eqItemA.item);
		var ITB = this.inventoryManager.itemByID(badgeInfo.eqItemB.item);
		
		var infoCardW = undefined;
		var infoCardA = undefined;
		var infoCardB = undefined;
		
		// -- PREPARE OUR ITEM CARDS
		if (ITW != undefined) {infoCardW = this.infoCardPrep(badgeInfo.wepItem.item,badgeInfo.wepItem.rarity,ITW.item.inventoryProperties.itemName,badgeInfo.wepItem.prefixes,badgeInfo.wepItem.suffixes);}
		if (ITA != undefined) {infoCardA = this.infoCardPrep(badgeInfo.eqItemA.item,badgeInfo.eqItemA.rarity,ITA.item.inventoryProperties.itemName,badgeInfo.eqItemA.prefixes,badgeInfo.eqItemA.suffixes);}
		if (ITB != undefined) {infoCardB = this.infoCardPrep(badgeInfo.eqItemB.item,badgeInfo.eqItemB.rarity,ITB.item.inventoryProperties.itemName,badgeInfo.eqItemB.prefixes,badgeInfo.eqItemB.suffixes);}

		var HT = 200;
		if (badgeInfo.wepItem.item != "") {HT += 33;}
		if (badgeInfo.eqItemA.item != "") {HT += 33;}
		if (badgeInfo.eqItemB.item != "") {HT += 33;}
		
		// -- FIND THE BADGE FOR THIS CHARACTER --
		for (var l=0; l<this.characters.characters.length; l++) {
			if (this.characters.characters[l].id == badgeInfo.character) {PP = this.characters.characters[l].previewIcon; break;}
		}
		
		if (PP != "") {PPimage = new Image(PP,"auto");}
		
		// -- THE THREE INVENTORY IMAGES
		var IMG_eqW = undefined;
		var IMG_eqA = undefined;
		var IMG_eqB = undefined;
		
		if (ID_eqW != "") {IMG_eqW = new Image(ID_eqW,"auto");}
		if (ID_eqA != "") {IMG_eqA = new Image(ID_eqA,"auto");}
		if (ID_eqB != "") {IMG_eqB = new Image(ID_eqB,"auto");}
		
		//var PHeader = new Image(imageDirectory+IMG_partyHeader,"auto");
		var PHeader = new Image(imageDirectory+IMG_partyHeader,"auto");
		var PIcon = undefined;
		
		if (!badgeInfo.owner) {PIcon = new Image(imageDirectory+IMG_partyPawn,"auto");}
		else {PIcon = new Image(imageDirectory+IMG_partyKing,"auto");}
		
		
		var SBAR = new Image(imageDirectory+IMG_skillBar,"auto");
		var OL = new Image(imageDirectory+IMG_profOverlay,"auto");
		
		// Load the image
		console.log(imageDirectory+IMG_profBack);
		var BG = new Image(path.join(imageDirectory,IMG_profBack),"auto").resize(Math.floor(400),Math.floor(HT)).loadFont(fontDirectory+'peepo.ttf','Peepo').loadFont(fontDirectory+'pixel-love.ttf','PixelMaz').loadFont(fontDirectory+'pixtech.ttf','PixTech').draw(cxt => {
			
			// -- CHARACTER 
			if (PPimage != undefined)
			{
				PPimage.ready(function(bmpp){
					var W = bmpp.width;
					var H = bmpp.height;
					
					var X1 = POS_character.x-Math.floor(W/2);
					var Y1 = POS_character.y-Math.floor(H/2);
					
					cxt.drawImage(bmpp,X1,Y1);
				}.bind(this));
			}
			
			OL.ready(function(bmpp){
				cxt.drawImage(bmpp,0,0);
			}.bind(this));
			
			// -- DRAW THE DISPLAY NAME
			cxt.fillStyle = "#FFFFFF";
			cxt.setFont('PixTech',8);
			cxt.fillText(badgeInfo.name, POS_displayName.x,POS_displayName.y);
			
			// -- DRAW THE BIOGRAPHY
			var WRP = wrap(badgeInfo.bio);
			var ARR = WRP.split("\n");
			cxt.setFont('Peepo',10);
			for (var l=0; l<ARR.length; l++){cxt.fillText(ARR[l], POS_biography.x,POS_biography.y+(14*l));}
			
			// -- DRAW SOME OF THE BARS
			// (EXPERIENCE)
			cxt.fillStyle = "#000000";
			var BW = Math.floor( (1.0 - (badgeInfo.xp / badgeInfo.xpgoal)) * POS_barXP.w);
			cxt.fillRect((POS_barXP.x + POS_barXP.w) - BW, POS_barXP.y, BW, POS_barXP.h);
			
			cxt.setFont('PixTech',8);
			cxt.fillStyle = "#FFFFFF";
			cxt.fillText(badgeInfo.xp+" / "+badgeInfo.xpgoal,POS_barXPText.x,POS_barXPText.y);
			
			// (LEVEL)
			cxt.fillText(badgeInfo.level.toString(),POS_barLevelText.x,POS_barLevelText.y);
			cxt.fillStyle = "#000000";
			var BW = Math.floor( (1.0 - (badgeInfo.level / maxBarLevel)) * POS_barLevel.w);
			if (BW < 0)
				BW = 0;
			cxt.fillRect((POS_barLevel.x + POS_barLevel.w) - BW, POS_barLevel.y, BW, POS_barLevel.h);
			
			// -- STAT BARS --
			for (var l=0; l<badgeInfo.statBars.length; l++)
			{
				cxt.fillStyle = "#000000";
				var BW = Math.floor( (1.0 - (badgeInfo.statBars[l].val / maxStatLevel)) * POS_statBarTop.w);
				if (BW < 0)
					BW = 0;
				cxt.fillRect((POS_statBarTop.x + POS_statBarTop.w) - BW, POS_statBarTop.y + (statBarPadding*l), BW, POS_statBarTop.h);
				
				cxt.setFont('PixTech',8);
				
				// Shadow
				cxt.fillStyle = "#000000";
				for (var m=-1; m<2; m++)
				{
						for (var n=-1; n<2; n++) {cxt.fillText(badgeInfo.statBars[l].val.toString(),POS_statBarTopText.x + m,POS_statBarTopText.y + (statBarPadding*l) + n);}
				}
				
				cxt.fillStyle = "#FFFFFF";
				cxt.fillText(badgeInfo.statBars[l].val.toString(),POS_statBarTopText.x,POS_statBarTopText.y + (statBarPadding*l));
			}
			
			// -- DRAW THE PARTY THINGY
			if (badgeInfo.party != "")
			{
				PHeader.ready(function(bmpp){
					cxt.drawImage(bmpp,0,0);
					cxt.fillStyle = "#FFFFFF";
					cxt.setFont('PixTech',8);
					cxt.fillText(badgeInfo.party,POS_partyName.x,POS_partyName.y);
				}.bind(this));
				
				if (PIcon != undefined)
				{
					PIcon.ready(function(bmpp){
					cxt.drawImage(bmpp,POS_partyIcon.x,POS_partyIcon.y);
					}.bind(this));
				}
			}
			
			// -- DRAW THE ICONS
			if (IMG_eqW != undefined)
			{
				IMG_eqW.ready(function(bmpp){
					cxt.drawImage(rarityImages[badgeInfo.wepItem.rarity].bmp,POS_badgeWep.x,POS_badgeWep.y);
					cxt.drawImage(bmpp,POS_badgeWep.x,POS_badgeWep.y);
				}.bind(this));
			}
			
			if (IMG_eqA != undefined)
			{
				IMG_eqA.ready(function(bmpp){
					cxt.drawImage(rarityImages[badgeInfo.eqItemA.rarity].bmp,POS_badgeEQA.x,POS_badgeEQA.y);
					cxt.drawImage(bmpp,POS_badgeEQA.x,POS_badgeEQA.y);
				}.bind(this));
			}
			
			if (IMG_eqB != undefined)
			{
				IMG_eqB.ready(function(bmpp){
					cxt.drawImage(rarityImages[badgeInfo.eqItemB.rarity].bmp,POS_badgeEQB.x,POS_badgeEQB.y);
					cxt.drawImage(bmpp,POS_badgeEQB.x,POS_badgeEQB.y);
				}.bind(this));
			}
			
			// DRAW SKILL POINTS
			if (badgeInfo.points > 0)
			{
				SBAR.ready(function(bmpp){
					cxt.drawImage(bmpp,0,0);
					cxt.fillStyle = "#FFFFFF";
					cxt.setFont('PixTech',8);
					cxt.fillText(badgeInfo.points.toString()+" SKILL POINTS",POS_skillText.x,POS_skillText.y);
				}.bind(this));
			}
			
			// FINALLY, DRAW THE CARDS
			var BH = 200;
			if (ITW != undefined) {this.infoCardDraw(infoCardW,0,BH,cxt); BH += 33;}
			if (ITA != undefined) {this.infoCardDraw(infoCardA,0,BH,cxt); BH += 33;}
			if (ITB != undefined) {this.infoCardDraw(infoCardB,0,BH,cxt);}
			
			cxt.setFont('PixTech',9);
			cxt.fillStyle = "#FFFFFF";
			cxt.fillText(badgeInfo.gold.toString(),POS_goldText.x,POS_goldText.y);
			
		}).save(path.join(imageDirectory,'dump.png')).then(function(){
			chan.sendFile(path.join(imageDirectory,'dump.png'));
		}.bind(this),function(){});
	}
}

module.exports = RPGSimulator;
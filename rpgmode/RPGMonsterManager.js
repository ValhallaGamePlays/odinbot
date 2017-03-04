// -- MANAGES INVENTORY
//--====================================================================--

// Required modules
const fileExists = require('file-exists');
const jsonfile = require('jsonfile');
const fs = require('fs');
const util = require('util');
const battler = require('./RPGBattle.js');
const Image = require('purified-image');
const environments = require('./RPGEnvironments.js');
const randomFrom = function(thelength){return Math.floor(Math.random() * thelength);}

const imageDirectory = './rpgmode/images/';
const environmentDirectory = './rpgmode/environments/';
const codexDirectory = './rpgmode/codex/monsters/';
const fontDirectory = './rpgmode/fonts/';
const IMG_codexBack = 'codex_background.png';
const IMG_chainTop = 'codex_chaintop.png';
const IMG_chainBottom = 'codex_chainbottom.png';
const IMG_bossTag = 'codex_bosstag.png';
const IMG_floor = 'floor.png';
const IMG_floorBoss = 'bossfloor.png';
const IMG_titleBG = 'codex_titleback.png';
const IMG_bottom = 'codex_bottom.png';
const wrap = require('wordwrap')(50);

const POS_bossTag = {x:0,y:157};
const POS_floor = {x:200, y:170};
const POS_monster = {x:200, y:160};
const POS_title = {x:200, y:22};
const POS_bio = {x:99, y:189};
const POS_stats = {x:217, y:196};
const POS_BG = {x:0, y:170};
const POS_bottom = {x:0, y:170};

class IManager {
	
	constructor() 
	{
		this.monsters = [];													// ALL of the monsters
		this.mainDirectory = './rpgmode/codex/monsters/';					// Main directory where the monsters are stored
		this.nodeDirectory = './codex/monsters/';							// Main directory where the monsters are stored
		this.core = undefined;
		this.battles = [];
		this.monsterVolume = 0.25;
		this.dungeonLevels = [];
		
		this.codex = [];
		
		// DID WE FIND A TEMPLE YET? FOR BOSSES
		this.templeParty = undefined;
		
		// DID WE FIND AN ENCHANT THING YET?
		this.enchantMembers = [];
		this.ascendMembers = [];
		this.descendMembers = [];
		
		this.populateMonsters();
		this.setupDungeon();
		console.log("[RPG] Monsters populated, "+this.monsters.length+" monsters found.");
	}
	
	// --==--==--==--==--==--==--==--==--==
	// READ ALL OF THE DUNGEON LEVELS
	// --==--==--==--==--==--==--==--==--==
	setupDungeon()
	{
		this.dungeonLevels.length = 0;
		var PRT = jsonfile.readFileSync('./rpgmode/dungeonLevels.json');
		var ENV = environments;
		
		for (var l=0; l<PRT.dungeonLevels.length; l++)
		{	
			var pusher = PRT.dungeonLevels[l];
			pusher.env = undefined;
			
			for (var m=0; m<ENV.length; m++)
			{
				if (ENV[m].id == PRT.dungeonLevels[l].dungeon.environment) {pusher.env = ENV[m]}
			}
			
			this.dungeonLevels.push(pusher);
		}
		
		console.log("[RPG] Updated dungeons: "+this.dungeonLevels.length+" dungeon levels exist.")
	}
	
	// --==--==--==--==--==--==--==--==--==
	// WE FOUND A NEW DUNGEON LEVEL, GENERATE ONE!
	// --==--==--==--==--==--==--==--==--==
	discoverDungeonLevel(theLevel)
	{
		var dun = this.core.calculator.generateDungeon(theLevel);
		
		console.log(dun);
		
		var dunEnv = this.core.environments[0];
		for (var l=0; l<this.core.environments.length; l++)
		{
			if (this.core.environments[l].id == dun.environment) {dunEnv = this.core.environments[l]; break;}
		}

		this.dungeonLevels.push({dungeon:dun,env:dunEnv});
		this.writeDungeons();
		
		return {env:dunEnv,dun:dun};
	}
	
	// --==--==--==--==--==--==--==--==--==
	// WRITE THE DUNGEONS
	// --==--==--==--==--==--==--==--==--==
	writeDungeons()
	{
		var writer = [];
		
		for (var l=0; l<this.dungeonLevels.length; l++)
		{
			var pusher = {dungeon:this.dungeonLevels[l].dungeon}
			writer.push(pusher);
		}
		
		jsonfile.writeFile('./rpgmode/dungeonLevels.json', {dungeonLevels:writer}, function (err) 
		{
			if (err != undefined){console.error(err)}
			this.setupDungeon();
		}.bind(this));
	}
	
	// --==--==--==--==--==--==--==--==--==
	// DID THIS USER FIND AN ENCHANT?
	// --==--==--==--==--==--==--==--==--==
	atEnchantStation(account)
	{
		for (var l=0; l<this.enchantMembers.length; l++) {if (this.enchantMembers[l] == account) {return true;}}
		return false;
	}
	
	// --==--==--==--==--==--==--==--==--==
	// WALK AWAY FROM AN ENCHANT STATION
	// --==--==--==--==--==--==--==--==--==
	enchantWalkAway(account)
	{
		// Remove it from the list
		for (var l=0; l<this.enchantMembers.length; l++) {if (this.enchantMembers[l] == account) {this.enchantMembers.splice(l,1);}}
		return "\n:urn: **You foolishly walk away from the sacred shrine. Maybe next time you will roll the dice...** :urn:";
	}
	
	// --==--==--==--==--==--==--==--==--==
	// TWEAK THE STAIR LISTS
	// --==--==--==--==--==--==--==--==--==
	addToAscend(account) {this.ascendMembers.push(account);}
	addToDescend(account) {this.descendMembers.push(account);}
	removeAscended(account)
	{
		for (var l=0; l<this.ascendMembers.length; l++) {if (this.ascendMembers[l] == account) {this.ascendMembers.splice(l,1);}}
	}
	removeDescended(account)
	{
		for (var l=0; l<this.descendMembers.length; l++) {if (this.descendMembers[l] == account) {this.descendMembers.splice(l,1);}}
	}
	
	// --==--==--==--==--==--==--==--==--==
	// IS THIS USER IN THE STAIR LISTS?
	// --==--==--==--==--==--==--==--==--==
	isAscending(account)
	{
		for (var l=0; l<this.ascendMembers.length; l++) {if (this.ascendMembers[l] == account) {return true;}}
		return false;
	}
	isDescending(account)
	{
		for (var l=0; l<this.descendMembers.length; l++) {if (this.descendMembers[l] == account) {return true;}}
		return false;
	}
	
	// --==--==--==--==--==--==--==--==--==
	// MAKE THIS USER FIND AN ENCHANT THING
	// --==--==--==--==--==--==--==--==--==
	findEnchant(account)
	{
		for (var l=0; l<this.enchantMembers.length; l++) {if (this.enchantMembers[l] == account) {return {pic:undefined,allowed:false,msg:""}}; }
		
		this.enchantMembers.push(account);
		
		return {pic:this.core.environments.enchantImage,allowed:true,msg:"\n:sparkles: **You found a mysterious looking shrine.** :sparkles:\nRumors say it may bless your items...\n\n*(Type `!enchant` to step away or `!enchant X` to test your fate)*"};
	}
	
	// --==--==--==--==--==--==--==--==--==
	// MAKE THIS PARTY FIND A TEMPLE
	// --==--==--==--==--==--==--==--==--==
	findTemple(party)
	{
		if (this.templeParty != undefined) {return {allowed:false,msg:""}}
		this.templeParty = party;
		
		var temple = this.core.environments.temples[randomFrom(this.core.environments.temples.length)];
		
		return {pic:temple.enterImage,allowed:true,msg:"\n:moyai: **You stumbled upon a "+temple.name.toLowerCase()+".** :moyai:\nDo you dare desecrate the sanctity of its slumber?\n\n*(Type `!entertemple` to enter or `!fleetemple` to run)*"};
	}
	
	// --==--==--==--==--==--==--==--==--==
	// IS THIS PARTY IN A BATTLE?
	// --==--==--==--==--==--==--==--==--==
	getBattle(party)
	{
		for (var l=0; l<this.battles.length; l++)
		{
			if (this.battles[l].starterParty == party) {return this.battles[l];}
		}
		
		return undefined;
	}
	
	// --==--==--==--==--==--==--==--==--==
	// IS THIS ID IN A BATTLE?
	// --==--==--==--==--==--==--==--==--==
	inBattleByID(id)
	{
		for (var l=0; l<this.battles.length; l++)
		{
			for (var m=0; m<this.battles[l].battleMembers.length; m++)
			{
				if (this.battles[l].battleMembers[m].account.id == id) {return this.battles[l];}
			}
		}
		
		return undefined;
	}
	
	// --==--==--==--==--==--==--==--==--==
	// STOP A BATTLE
	// --==--==--==--==--==--==--==--==--==
	stopBattle(battle)
	{
		this.core.playingMusic = false;
		
		for (var l=0; l<this.battles.length; l++)
		{
			if (this.battles[l] == battle) {this.battles.splice(l,1);}
		}
		
		this.core.botStopMusic();
	}
	
	// --==--==--==--==--==--==--==--==--==
	// START A BATTLE
	// --==--==--==--==--==--==--==--==--==
	startBattle(monsterID, party, message, environ = "hexen", randomized = false, boss = false, tag = "dungeon")
	{
		var BTL = new battler();
		var ENV = this.core.findEnviron(environ);
		var MNoriginal = this.monsters.slice(0);
		var MN = []
		
		if (!randomized)
		{
			var RM = this.monsterByID(monsterID);
			boss = RM.information.bossMonster;
		}
		
		for (var l=0; l<MNoriginal.length; l++)
		{
			var hasTag = false;
			
			for (var m=0; m<MNoriginal[l].information.tags.length; m++)
			{
				if (MNoriginal[l].information.tags[m] == tag) {hasTag = true; console.log(util.inspect(MNoriginal[l].information.tags))}
			}
			
			if (!MNoriginal[l].information.specificUse && hasTag) {MN.push(MNoriginal[l]);}
		}
		
		BTL.starterParty = party;
		BTL.core = this.core;
		BTL.battleChannel = message.channel;
		
		var MID = monsterID;
		
		// Surprise attack
		if (randomized)
		{
			// Find a random boss
			if (boss)
			{
				var BM = [];
				for (var l=0; l<MN.length; l++) 
				{
					var hasTag = false;
					
					for (var m=0; m<MN[l].information.tags.length; m++)
					{
						if (MN[l].information.tags[m] == tag) {hasTag = true; break;}
					}
					
					if (MN[l].information.bossMonster && hasTag) 
					{
						BM.push(MN[l]);
					} 
				}
				
				var FM = BM[randomFrom(BM.length)];
				MID = FM.information.id;
			}
			
			else 
			{
				var FM = MN[randomFrom(MN.length)];
				MID = FM.information.id;
			}
		}
		
		for (var l=0; l<party.members.length; l++)
		{
			var ACCT = this.core.accountManager.fetchListAccount(party.members[l]);
			if (ACCT == undefined) {return;}
			
			BTL.battleMembers.push({battle:BTL,account:ACCT,state:-1,blocking:false,pendingItem:-1,pendingSlot:"",message:undefined,modifiers:[]});
		}
		
		var theFinalMonster = this.core.monsterManager.monsterByID(MID);
		BTL.setupMonster(MID);
		BTL.background = ENV.BGpic;
		
		var trackList = ENV.tracks;
		
		// -- BIOMES AND TAGS ARE USUALLY RELATED SO LET'S TRY AND COMBINE THEM
		var BIM = this.core.environments.biomes;
		for (var l=0; l<BIM.length; l++)
		{
			for (var m=0; m<BIM[l].monsterTags.length; m++)
			{
				if (BIM[l].monsterTags[m] != "dungeon" && (BIM[l].monsterTags[m] == tag || BIM[l].monsterTags[m] == theFinalMonster.information.tags[0]))
				{
					if (!boss && BIM[l].musicTracks.length > 0) {trackList = BIM[l].musicTracks}
					else if (boss && BIM[l].bossTracks.length > 0) {trackList = BIM[l].bossTracks}
				}
			}
		}
		
		var TRK = trackList[randomFrom(trackList.length)];
		
		// DOES THE MONSTER HAVE TRACKS?
		if (boss && theFinalMonster.information.bossTracks.length > 0) {TRK = theFinalMonster.information.bossTracks[randomFrom(theFinalMonster.information.bossTracks.length)];}
		else if (!boss && theFinalMonster.information.musicTracks.length > 0) {TRK = theFinalMonster.information.musicTracks[randomFrom(theFinalMonster.information.musicTracks.length)];}
		
		console.log(TRK);
		
		if (!boss) {this.core.botPlayMusic(TRK, 0.25, 0);}
		
		this.battles.push(BTL);
	}
	
	// --==--==--==--==--==--==--==--==--==
	// GET A LIST OF ALL THE MONSTER FOLDERS
	// --==--==--==--==--==--==--==--==--==
	listMonsterFolders() {
	  return fs.readdirSync(this.mainDirectory).filter(function (file) {
		return fs.statSync(this.mainDirectory+file).isDirectory();
	  }.bind(this));
	}
	
	// --==--==--==--==--==--==--==--==--==
	// ACTUALLY POPULATE THE MONSTER LIST
	// --==--==--==--==--==--==--==--==--==
	populateMonsters() {
		var LIF = this.listMonsterFolders();
		for (var l=0; l<LIF.length; l++)
		{
			var PUSHER = {id:LIF[l], faker: require(this.nodeDirectory+LIF[l]+'/monster_'+LIF[l]+'.js')};
			PUSHER.item = new PUSHER.faker();
			PUSHER.item.information.id = LIF[l];
			
			this.monsters.push(PUSHER.item);
		}
		this.populateCodex();
	}
	
	// --==--==--==--==--==--==--==--==--==
	// ADD A MONSTER TO THE CODEX
	// --==--==--==--==--==--==--==--==--==
	addToCodex(monsterID)
	{
		var GCE = this.getCodexEntry(monsterID)
		if (GCE != undefined) 
		{
			GCE.killedSoFar ++;
			this.writeCodex();
			return false;
		}
		
		var pusher = {id:monsterID,killedSoFar:1}
		this.codex.push(pusher);
		this.writeCodex();
		
		return true;
	}
	
	// --==--==--==--==--==--==--==--==--==
	// GET A CODEX ENTRY BY ID
	// --==--==--==--==--==--==--==--==--==
	getCodexEntry(theID)
	{
		for (var l=0; l<this.codex.length; l++) {if (this.codex[l].id == theID) {return this.codex[l]}};
		return undefined;
	}
	
	// --==--==--==--==--==--==--==--==--==
	// NUKE THE CODEX
	// --==--==--==--==--==--==--==--==--==
	nukeCodex()
	{
		this.codex = []
		this.writeCodex();
	}
	
	// --==--==--==--==--==--==--==--==--==
	// THE CODEX OF MONSTERS WE'VE FOUND
	// --==--==--==--==--==--==--==--==--==
	populateCodex() {
		this.codex.length = 0;
		var codex = jsonfile.readFileSync('./rpgmode/codex.json');
		this.codex = codex.codex;
		
		console.log("[RPG] Codex file read, "+this.codex.length+" codex entries found.");
	}
	
	// --==--==--==--==--==--==--==--==--==
	// SAVE CODEX
	// --==--==--==--==--==--==--==--==--==
	writeCodex()
	{
		jsonfile.writeFile('./rpgmode/codex.json', {codex:this.codex}, function (err) 
		{
			if (err != undefined){console.error(err)}
		}.bind(this));
	}
	
	// --==--==--==--==--==--==--==--==--==
	// FIND A MONSTER BY ID
	// --==--==--==--==--==--==--==--==--==
	monsterByID(ID)
	{
		for (var l=0; l<this.monsters.length; l++)
		{
			if (this.monsters[l].information.id == ID) {return this.monsters[l];}
		}
		
		return undefined;
	}
	
	// --==--==--==--==--==--==--==--==--==
	// DEBUG A MONSTER
	// --==--==--==--==--==--==--==--==--==
	monsterDebug(channel, id)
	{
		var IT = this.monsterByID(id);
		if (IT == undefined) {channel.sendMessage("No such monster with ID `"+id+"` exists in codex.");}
		else 
		{
			channel.sendCode(util.inspect(IT));
		}
	}
	
	// --==--==--==--==--==--==--==--==--==
	// DRAW A CODEX THING FOR A MONSTER
	// --==--==--==--==--==--==--==--==--==
	drawCodexEntry(chan,monster,codex)
	{
		var CHNtop = new Image(imageDirectory+IMG_chainTop,"auto");
		var CHNbtm = new Image(imageDirectory+IMG_chainBottom,"auto");
		var bossTag = new Image(imageDirectory+IMG_bossTag,"auto");
		var titleBG = new Image(imageDirectory+IMG_titleBG,"auto");
		var bottom = new Image(imageDirectory+IMG_bottom,"auto");
		var floorImg = undefined;
		var floorPath = IMG_floor;
		if (monster.information.bossMonster) {floorPath = IMG_floorBoss;}
		
		if (monster.information.floorOverride.img != undefined) 
		{
			if ((monster.information.bossMonster && monster.information.floorOverride.onBoss) || !monster.information.bossMonster) {floorPath = monster.information.floorOverride.img;}
		}
		
		// -- SET THE BACKGROUND IMAGE --
		
		var BGimg = undefined;
		var BGpath = 'hexen.png';
		
		if (monster.information.backgroundOverride.img != undefined)
		{
			if (monster.information.bossMonster && monster.information.backgroundOverride.onBoss) {BGpath = monster.information.backgroundOverride.img;}
			else if (!monster.information.bossMonster) {BGpath = monster.information.backgroundOverride.img;}
		}
		
		floorImg = new Image(environmentDirectory+floorPath,"auto");
		BGimg = new Image(environmentDirectory+BGpath,"auto");
		
		var MP = codexDirectory+monster.information.id+"/";
		var monsterImg = new Image(MP+monster.images.sight[0],"auto");
		var bioText = wrap(monster.information.codexBio);
		var bioMessages = bioText.split("\n");
		
		var KSF = 0;
		if (codex != undefined) {KSF = codex.killedSoFar;}
		
		// -- FIGURE OUT THE STAT SHIT TO PUT ON THE RIGHT --
		var statShit = [];
		statShit.push({start:monster.information.baseMaxHealth+" ",end:"BASE HEALTH",gainColor:"#f77878"});
		
		if (monster.information.dungeonLevelMin <= 0 && monster.information.dungeonLevelMax >= 999) {statShit.push({start:"APPEARS ON ALL FLOORS",end:"",gainColor:"#ffffff"});}
		else {statShit.push({start:"APPEARS ON FLOORS "+monster.information.dungeonLevelMin+"-"+monster.information.dungeonLevelMax,end:"",gainColor:"#ffffff"});}
		
		var MSG = "MOVE";
		if (monster.moves.length > 1) {MSG += "S";}
		statShit.push({start:monster.moves.length+" POSSIBLE "+MSG,end:"",gainColor:"#ffffff"});
		
		var MSG = "DROP";
		if (monster.information.lootTable.length > 1) {MSG += "S";}
		statShit.push({start:monster.information.lootTable.length+" ",end:"POSSIBLE ITEM "+MSG,gainColor:"#f7d878"});
		statShit.push({start:"",end:"",gainColor:"#ffffff"});
		statShit.push({start:monster.information.baseXP+" ",end:"XP WHEN KILLED",gainColor:"#40ff56"});
		statShit.push({start:KSF+" ",end:"KILLED SO FAR",gainColor:"#40acff"});
		
		var BG = new Image(environmentDirectory+'bottombar.png',"auto").resize(400,300).loadFont(fontDirectory+'alagard.ttf','Alagard').loadFont(fontDirectory+'peepo.ttf','Peepo').loadFont(fontDirectory+'8bit.ttf','8bit').loadFont(fontDirectory+'pixtech.ttf','PixTech').draw(cxt => {
			
			BGimg.ready(function(bmpp){
				cxt.drawImage(bmpp,POS_bottom.x,POS_bottom.y-bmpp.height);
			}.bind(this));
			
			bottom.ready(function(bmpp){
				cxt.drawImage(bmpp,POS_bottom.x,POS_bottom.y);
				
				cxt.fillStyle = "#ffffff";
				cxt.setFont('Peepo',10);
				for (var l=0; l<bioMessages.length; l++)
				{
					var MS = cxt.measureText(bioMessages[l]);
					cxt.fillText(bioMessages[l],POS_bio.x - Math.floor(MS.width/2),POS_bio.y+(10*l));
				}
				
				cxt.setFont('8bit',16);
				for (var l=0; l<statShit.length; l++)
				{	
					cxt.fillStyle = statShit[l].gainColor;
					cxt.fillText(statShit[l].start,POS_stats.x,POS_stats.y+(12*l));
					
					cxt.fillStyle = "#ffffff";
					var MS = cxt.measureText(statShit[l].start);
					cxt.fillText(statShit[l].end,POS_stats.x+MS.width,POS_stats.y+(12*l));
				}
				
			}.bind(this));
			
			floorImg.ready(function(bmpp){
				cxt.drawImage(bmpp,POS_floor.x-Math.floor(bmpp.width/2),POS_floor.y-bmpp.height);
			}.bind(this));
			
			monsterImg.ready(function(bmpp){
				cxt.drawImage(bmpp,POS_monster.x-Math.floor(bmpp.width/2),POS_monster.y-bmpp.height);
			}.bind(this));
			
			if (monster.information.bossMonster)
			{
				bossTag.ready(function(bmpp){
					cxt.drawImage(bmpp,POS_bossTag.x,POS_bossTag.y);
				}.bind(this));
			}
			
			titleBG.ready(function(bmpp){
				cxt.drawImage(bmpp,0,0);
				
				cxt.fillStyle = "#ffffff";
				cxt.setFont('Alagard',16);
				var STR = monster.information.names[0];
				var MS = cxt.measureText(STR);
				console.log(MS);
				cxt.fillText(STR,POS_title.x-Math.floor(MS.width/2),POS_title.y);
				
			}.bind(this));

			CHNtop.ready(function(bmpp){
				cxt.drawImage(bmpp,0,0);
			}.bind(this));
			
			CHNbtm.ready(function(bmpp){
				cxt.drawImage(bmpp,0,150);
			}.bind(this));
			
		}).save(imageDirectory+'dump.png').then(function(){
			chan.sendFile(imageDirectory+'dump.png');
		}.bind(this),function(){});
	}
}

module.exports = IManager;
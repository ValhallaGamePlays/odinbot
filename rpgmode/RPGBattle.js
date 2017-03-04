// -- A BATTLE THAT'S CURRENTLY TAKING PLACE
//--====================================================================--

const util = require('util');

const Image = require('purified-image');
const fontDirectory = './rpgmode/fonts/';
const imageDirectory = './rpgmode/images/';
const itemDirectory = './rpgmode/codex/items/';

const IMG_floor = "floor.png";
const IMG_bossfloor = "bossfloor.png";
const IMG_bottombar = "bottombar.png";
const IMG_chainring = "chainring.png";
const IMG_chainringextra = "chainring_extra.png";
const IMG_book = "book.png";

const battleHelp = ["Type  !rpghelp battle  and check under","the header if you need help on what to do."];

const OFF_monster = {x:200, y:-12};
//const OFF_logText = {x:8, y:15};
const OFF_logText = {x:200, y:15};
const OFF_nameText = {x:16, y:-8};
const OFF_battleHelp = {x:9, y:12};

const wrap = require('wordwrap')(110);

// FOR BATTLE
const IMG_back = "char_bg_large.png";
const IMG_barBack = "battlebar.png";
const IMG_healthNone = "health_none.png";
const IMG_healthBoss = "health_boss.png";
const IMG_healthNormal = "health_normal.png";
const OFF_barName = {x:34, y:14};
const OFF_barLog = {x:33, y:25};
const OFF_barDamage = {x:330, y:11};
const OFF_healthName = {x:8, y:12};
const OFF_healthLevel = {x:297, y:12};
const OFF_buffStart = {x:169, y:9};
const OFF_smallBuffStart = {x:15,y:16};
const smallBuffHeight = 16;
const buffWidth = 16;
const heightBack = 32;

const STATE_NOTHING = -1;
const STATE_ATTACK = 0;
const STATE_FLEE = 1;
const STATE_BLOCK = 2;
const STATE_USING = 3;
const STATE_FORCED = -2;
const randomFrom = function(thelength){return Math.floor(Math.random() * thelength);}

class TheBattle {
	
	constructor() 
	{
		this.starterParty = undefined;
		this.monster = undefined;
		this.playerTurn = true;
		this.nodeDirectory = './codex/monsters/';
		this.battleChannel = undefined;
		this.core = undefined;
		this.background = "";
		this.backgroundDirectory = './rpgmode/environments/';
		this.statusMessage = undefined;
		this.battleMembers = [];
		this.timer = undefined;
		this.turnCard = undefined;
		this.floorImage = 'floor.png';
		this.monsterModifiers = [];
		
		// Which tracks to use when fighting a boss?
		this.bossTracks = ['bossbattle_1.mp3'];
		
		this.turnTimeout = 30;
		this.betweenTurnTime = 2;
		
		this.STATE_NOTHING = STATE_NOTHING;
		this.STATE_ATTACK = STATE_ATTACK;
		this.STATE_FLEE = STATE_FLEE;
		this.STATE_FORCED = STATE_FORCED;
		this.STATE_BLOCK = STATE_BLOCK;
		this.STATE_USING = STATE_USING;
		
		console.log("BATTLE STARTED");
	}
	
	// --==--==--==--==--==--==--==--==--==
	// ADD A MODIFIER TO A PLAYER
	// --==--==--==--==--==--==--==--==--==
	addModifier(id,mod,item,slot,monstermod = false,creator = undefined)
	{
		console.log("addModifier() - monstermod: "+monstermod);
		
		if (!monstermod)
		{
			for (var l=0; l<this.battleMembers.length; l++)
			{
				if (this.battleMembers[l].account.id == id) 
				{
					// PUSH A NEW MODIFIER
					var newMod = {}
					newMod.item = item;
					newMod.slot = slot;
					newMod.creator = creator;
					
					for(var keys = Object.keys(mod), m = keys.length; m; --m)
					{
					   newMod[ keys[m-1] ] = mod[ keys[m-1] ];
					}
					
					this.battleMembers[l].modifiers.push(newMod);

					newMod.applied(this.core,item,slot,this.battleMembers[l],newMod);
				}
			}
		}
		else
		{
			var hasModAlready = false;
			for (var l=0; l<this.monsterModifiers.length; l++) {if (this.monsterModifiers[l].buffName == mod.buffName) {hasModAlready = true; break;}}
			
			if (!mod.canStack && hasModAlready) {return;}
			
			// PUSH A NEW MODIFIER
			var newMod = {}
			newMod.item = item;
			newMod.slot = slot;
			newMod.creator = creator;
			
			for(var keys = Object.keys(mod), m = keys.length; m; --m)
			{
			   newMod[ keys[m-1] ] = mod[ keys[m-1] ];
			}
			
			this.monsterModifiers.push(newMod);
			newMod.applied(this.core,item,slot,this.monster,newMod);
		}
	}
	
	// --==--==--==--==--==--==--==--==--==
	// REMOVE A MODIFIER
	// --==--==--==--==--==--==--==--==--==
	removeModifier(mem,mod,monstermod = false)
	{
		if (monstermod)
		{
			for (var m=0; m<this.monsterModifiers.length; m++)
			{
				if (this.monsterModifiers[m] == mod) {this.monsterModifiers.splice(m,1);}
			}
		}
		else
		{
			for (var m=0; m<mem.modifiers.length; m++)
			{
				if (mem.modifiers[m] == mod) {mem.modifiers.splice(m,1);}
			}
		}
	}
	
	// --==--==--==--==--==--==--==--==--==
	// SETUP A TITLE CARD
	// --==--==--==--==--==--==--==--==--==
	setupCard(logging)
	{
		var cardInfo = {
			monsterImage: this.monster.behavior.getImage(this.monster,this.core),
			backgroundImage: this.backgroundDirectory+this.background,
			bottomOverride: this.monster.information.lowerOverride.img,
			monsterName: this.monster.behavior.getName(this.monster,this.core),
			monsterLog: logging,
			BGheight:128,
			boss:this.monster.information.bossMonster,
			floorImage:this.floorImage,
			offset:this.monster.information.verticalOffset
		}
		
		if (this.monster.information.backgroundOverride.img != undefined)
		{
			if (this.monster.information.bossMonster && this.monster.information.backgroundOverride.onBoss) {cardInfo.backgroundImage = this.backgroundDirectory+this.monster.information.backgroundOverride.img;}
			else if (!this.monster.information.bossMonster) {cardInfo.backgroundImage = this.backgroundDirectory+this.monster.information.backgroundOverride.img;}
		}
		
		if (this.monster.information.bossMonster) 
		{
			cardInfo.BGheight = 192;
			cardInfo.floorImage = 'bossfloor.png';
		}
		
		cardInfo.BGheight += this.monster.information.sizeAdder;
		
		if (this.monster.information.floorOverride.img != undefined)
		{
			if (this.monster.information.bossMonster && this.monster.information.floorOverride.onBoss) {cardInfo.floorImage = this.monster.information.floorOverride.img;}
			else if (!this.monster.information.bossMonster) {cardInfo.floorImage = this.monster.information.floorOverride.img;}
		}
		
		return cardInfo;
	}
	
	// --==--==--==--==--==--==--==--==--==
	// DRAW A MONSTER'S TITLECARD
	// --==--==--==--==--==--==--==--==--==
	drawMonsterCard(chan, cardInfo, isDeath, theSound)
	{
		// monsterImage
		// backgroundImage
		// monsterName
		// monsterLog
		
		var BGheight = cardInfo.BGheight;
		
		var FLR = new Image(this.backgroundDirectory+cardInfo.floorImage,"auto");
		
		var MIMG = new Image(cardInfo.monsterImage,"auto");
		var CRNG = new Image(this.backgroundDirectory+IMG_chainring,"auto");
		var BOOK = new Image(this.backgroundDirectory+IMG_book,"auto");
		var CRNGextra = new Image(this.backgroundDirectory+IMG_chainringextra,"auto");
		
		// -- LOG TEXT AND SHIT NIGGA --
		var ML = cardInfo.monsterLog.join(" ");
		console.log(ML);
		var WRP = wrap(ML);
		var MLR = WRP.split("\n");
		
		var HGT = BGheight+20+(12*(MLR.length-1));
		
		//var BBAR = new Image(this.backgroundDirectory+IMG_bottombar,"auto");
		var BGRN = new Image(cardInfo.backgroundImage,"auto");
		
		var BBP = IMG_bottombar;
		if (cardInfo.bottomOverride != undefined) {
			BBP = cardInfo.bottomOverride;
		}
		
		var BBAR = new Image(this.backgroundDirectory+BBP,"auto").resize(400,HGT+32).loadFont(fontDirectory+'peepo.ttf','Peepo').loadFont(fontDirectory+'alagard.ttf','Alagard').loadFont(fontDirectory+'pixel_maz.ttf','Gothic').loadFont(fontDirectory+'pixtech.ttf','PixTech').draw(cxt => {
			
			BGRN.ready(function(bmpp){
				cxt.drawImage(bmpp,0,BGheight-bmpp.height);
			}.bind(this));
			
			FLR.ready(function(bmpp){
				cxt.drawImage(bmpp,0,BGheight-bmpp.height);
			}.bind(this));
			
			//OFF_smallBuffStart
			
			MIMG.ready(function(bmpp){
				cxt.drawImage(bmpp,OFF_monster.x-Math.floor(bmpp.width/2),(BGheight + OFF_monster.y) - bmpp.height + cardInfo.offset);
				
				cxt.setFont('Alagard',16);
				cxt.fillStyle = "#4444aa";
				for (var l=-1; l<2; l++)
				{
					for (var m=-1; m<2; m++)
					{
						cxt.fillText(cardInfo.monsterName,OFF_nameText.x+l,BGheight+OFF_nameText.y+m);
					}
				}
				cxt.fillStyle = "#000000";
				cxt.fillText(cardInfo.monsterName,OFF_nameText.x-2,BGheight+OFF_nameText.y-2);
				cxt.fillStyle = "#ffffff";
				cxt.fillText(cardInfo.monsterName,OFF_nameText.x,BGheight+OFF_nameText.y);
			}.bind(this));
			
			
			cxt.fillStyle = "#ffffff";
			cxt.setFont('Peepo',10);
			
			for (var l=0; l<MLR.length; l++)
			{
				var MT = cxt.measureText(MLR[l]);
				cxt.fillText(MLR[l],OFF_logText.x-Math.floor(MT.width/2),BGheight + OFF_logText.y+(12*l));
			}
			
			CRNG.ready(function(bmpp){
				cxt.drawImage(bmpp,0,0);
			}.bind(this));
			
			
			
			if (BGheight > 128)
			{
				CRNGextra.ready(function(bmpp){
				cxt.drawImage(bmpp,0,128);
				}.bind(this));
			}
			
			BOOK.ready(function(bmpp){
				cxt.drawImage(bmpp,0,BGheight+32+(16*(cardInfo.monsterLog.length-1)));
				
				cxt.fillStyle = "#444444";
				cxt.setFont('Gothic',11);
				
				for (var l=0; l<battleHelp.length; l++)
				{
					cxt.fillText(battleHelp[l].toUpperCase(),OFF_battleHelp.x,HGT+OFF_battleHelp.y+(12*l));
				}
			}.bind(this));
			
			// EXECUTOR STUFF
			if (cardInfo.executors != undefined)
			{
				cardInfo.executors.forEach(function(element) {
					if (element.img != undefined)
					{
						element.img.ready(function(bmpp){
							cxt.drawImage(bmpp,OFF_smallBuffStart.x-Math.floor(bmpp.width/2),(OFF_smallBuffStart.y-Math.floor(bmpp.height/2)) + smallBuffHeight*element.pos);
							cxt.setFont('Peepo',10);
							
							console.log(element.string);
							
							cxt.fillStyle = "#000000";
							for (var l=-1; l<2; l++)
							{
								for (var m=-1; m<3; m++)
								{
									cxt.fillText(element.string,((OFF_smallBuffStart.x+Math.floor(bmpp.width/2))+4)+l,(OFF_smallBuffStart.y + 3.0 + smallBuffHeight*element.pos)+m);
								}
							}
							
							cxt.fillStyle = element.color;
							cxt.fillText(element.string,(OFF_smallBuffStart.x+Math.floor(bmpp.width/2))+4,OFF_smallBuffStart.y + 3.0 + smallBuffHeight*element.pos);
						}.bind(this));
					}
				});
			}
			
		}).save(imageDirectory+'dump.png').then(function(){
			chan.sendFile(imageDirectory+'dump.png').then(function(pic){
				if (theSound != undefined){this.monster.vocalize(this.core,[theSound])}
				
				this.turnCard = pic;
				this.postSendDecide(isDeath);
			}.bind(this),function(){});
		}.bind(this),function(){});
	}
	
	// --==--==--==--==--==--==--==--==--==
	// HAVE A PLAYER ATTACK THE MONSTER
	// --==--==--==--==--==--==--==--==--==
	playerAttack(account)
	{
		console.log("PlayerAttack");
		
		var ITM = this.core.inventoryManager.itemByID(account.template.inventory[0].item);

		if (ITM == undefined) {return "had no weapon, so did nothing.";}
		if (!ITM.item.inventoryProperties.isWeapon) {return "had no weapon, so did nothing.";}
		
		var missed = ITM.item.behavior.hasMissed(this.core,ITM.item,ITM.slot,this.monster,account);
		var AT = undefined;
		
		if (!missed.missed) {AT = ITM.item.behavior.attack(account, this.core, ITM.item, this.monster);}
		else {AT = {indicator: {damage:0}, msg:missed.msg};}
		
		// return {indicator: indicator, msg:item.weaponProperties.attackString};

		return {returned:AT,theItem:ITM};
	}
	
	// --==--==--==--==--==--==--==--==--==
	// SETUP THE MONSTER FOR BATTLING
	// --==--==--==--==--==--==--==--==--==
	setupMonster(monsterID,morph = false)
	{
		var oldHealth = 0;
		var oldHealthMax = 0;
		if (morph) {oldHealth = this.monster.information.health; oldHealthMax = this.monster.information.maxHealth;}
		
		var faker = require(this.nodeDirectory+monsterID+'/monster_'+monsterID+'.js');
		this.monster = new faker();
		this.monster.behavior.monster = this.monster;
		this.monster.information.id = monsterID;
		this.monster.behavior.generateName(this.monster, this.core);
		this.monster.behavior.generateLevel(this.monster, this.core, this);
		this.monster.behavior.setBaseHealth(this.monster, this.core, this);
		this.monster.battle = this;
		
		if (morph) {this.monster.information.health = oldHealth; this.monster.information.maxHealth = oldHealthMax;}
		
		if (!morph)
		{
			// -- IS THIS MONSTER A BOSS?
			if (this.monster.information.bossMonster)
			{
				this.battleChannel.sendMessage("**You feel the ground beneath your feet start to shake...**");
				this.core.playingMusic = false;
				console.log("Playing boss stinger");
				this.core.botPlaySound('./rpgmode/music/boss_stinger.mp3',0.35);
				setTimeout(function(){this.startBattle();}.bind(this),5000);
			}
			else
			{
				this.battleChannel.sendMessage("A monster approaches from the shadows...");
				setTimeout(function(){this.startBattle();}.bind(this),1000);
			}
		}
	}
	
	// --==--==--==--==--==--==--==--==--==
	// MONSTER CARD SENT, NOW WHAT?
	// --==--==--==--==--==--==--==--==--==
	postSendDecide(isDeath)
	{
		if (!isDeath)
		{
			this.printStatusMessage();
		}
		else {setTimeout(function(){
			// Give the loot
			var LT = this.monster.behavior.giveLoot(this.monster,this.core,this);
			
			// Now decide how much experience we got
			var XPtoGive = Math.floor(this.core.calculator.calculateMonsterXP(this.monster,this));
			
			var XPmessage = ":book: **Battle Experience:** :book:\n\n"
			
			for (var l=0; l<this.battleMembers.length; l++)
			{
				for (var m=0; m<this.battleMembers[l].modifiers.length; m++)
				{
					this.battleMembers[l].modifiers[m].wearOff(this.sim,this.battleMembers[l].modifiers[m].item,this.battleMembers[l].modifiers[m].slot,this.battleMembers[l],this.battleMembers[l].modifiers[m]);
				}
							
				var GXP = this.core.accountManager.giveUserXP(this.battleMembers[l].account,XPtoGive);
				
				// Did the user level up?
				if (GXP.levelUp)
				{
					XPmessage += "+ **"+this.battleMembers[l].account.template.information.displayname+"** - *+"+XPtoGive+" XP* `LEVEL UP!`\n";
				}
				else
				{
					XPmessage += "- **"+this.battleMembers[l].account.template.information.displayname+"** - *+"+XPtoGive+" XP*\n";
				}
			}
			
			var codexMessage = "";
			var entry = this.core.monsterManager.addToCodex(this.monster.information.id);
			
			if (entry)
			{
				codexMessage += "\n\n:pencil: **Monster added to codex!**"
			}
			
			this.battleChannel.sendMessage(LT+"\n\n"+XPmessage+codexMessage);
			
			this.core.monsterManager.stopBattle(this);
		}.bind(this),this.betweenTurnTime*1000);}
	}
	
	// --==--==--==--==--==--==--==--==--==
	// FIND A BATTLE MEMBER BY ACCOUNT
	// --==--==--==--==--==--==--==--==--==
	findBattleMember(account)
	{
		for (var l=0; l<this.battleMembers.length; l++)
		{
			if (this.battleMembers[l].account == account) {return this.battleMembers[l];}
		}
		
		return undefined;
	}
	
	// --==--==--==--==--==--==--==--==--==
	// SET A MEMBER'S STATUS
	// --==--==--==--==--==--==--==--==--==
	setMemberStatus(mem,status,msg = {content:"",id:"",author:undefined})
	{
		mem.state = status;
		mem.message = msg;
		
		if (!this.allMembersReady()) {this.printStatusMessage();}
	}
	
	getExecutors()
	{
		var executors = [];
		
		// NOW WE CAN CHECK THE MODIFIERS
		for (var l=0; l<this.monsterModifiers.length; l++)
		{
			var EXC = this.monsterModifiers[l].executor(this.core,this.monsterModifiers[l].item,"",this.monster,this.monsterModifiers[l]);
			
			if (EXC.allowed)
			{
				var pusher = {string:EXC.msg,color:EXC.color,img:new Image(itemDirectory+this.monsterModifiers[l].item.inventoryProperties.id+"/"+this.monsterModifiers[l].buffIcon,"auto"),pos:l};
				executors.push(pusher);
				
				this.monsterModifiers[l].currentTurn ++;
				if (this.monsterModifiers[l].currentTurn >= this.monsterModifiers[l].maxTurns) 
				{
					this.monsterModifiers[l].wearOff(this.core,this.monsterModifiers[l].item,"",this.monster,this.monsterModifiers[l]);
				}
			}
		}
		
		return executors;
	}
	
	allMembersReady()
	{
		for (var l=0; l<this.battleMembers.length; l++) {
			var UH = this.core.accountManager.finalStat(this.core,this.battleMembers[l].account,"hp");
			if (this.battleMembers[l].state == STATE_NOTHING && UH > 0) {return false;}
		}
		
		clearInterval(this.timer);
		
		this.turnCard.delete().then(function(){
			this.statusMessage.delete().then(function(){
			this.statusMessage = undefined;
			
			var fleers = [];
			var realFleers = [];
			
			// SHOULD WE FLEE THE BATTLE?
			for (var l=0; l<this.battleMembers.length; l++)
			{
				if (this.battleMembers[l].state == STATE_FLEE) {fleers.push(this.battleMembers[l]); realFleers.push("");}
				var UH = this.core.accountManager.finalStat(this.core,this.battleMembers[l].account,"hp");
				if (UH <= 0) {fleers.push(this.battleMembers[l]);}
			}
			
			// DID EVERYBODY FLEE? MAJORITY VOTE
			if (fleers.length >= this.battleMembers.length/2 && realFleers.length > 0)
			{
				this.battleChannel.sendMessage(":chicken: Your party fled the battle by majority vote! :chicken:");
				this.core.monsterManager.stopBattle(this);
				return;
			}
			
			this.postPlayerTurn();
			
			}.bind(this),function(){});
		}.bind(this),function(){});
		return true;
	}
	
	// --==--==--==--==--==--==--==--==--==
	// PRINT A STATUS MESSAGE
	// --==--==--==--==--==--==--==--==--==
	printStatusMessage()
	{
		this.playerTurn = true;
		
		var SM = this.getStatusMessage();
		
		// -- SHOW THE STATUS MESSAGE FOR THE FIRST TIME
		if (this.statusMessage == undefined) 
		{
			// -- LOOP THROUGH THE MEMBERS AND SET SOME THINGS
			for (var l=0; l<this.battleMembers.length; l++) 
			{
				this.battleMembers[l].state = STATE_NOTHING; this.battleMembers[l].blocking = false;
				for (var m=0; m<this.battleMembers[l].modifiers.length; m++)
				{
					if (this.battleMembers[l].account.template.health <= 0)
					{
						var MD = this.battleMembers[l].modifiers[m];
						MD[m].wearOff(this.sim,MD[m].item,MD[m].slot,this.battleMembers[l],MD[m]);
					}
					else
					{
						var MD = this.battleMembers[l].modifiers[m];
						if (!MD.executeOnCard)
						{
							MD.executor(this.core,MD.item,MD.slot,this.battleMembers[l],MD);
							MD.currentTurn ++;
							if (MD.currentTurn >= MD.maxTurns) 
							{
								var WO = MD.wearOff(this.sim,MD.item,MD.slot,this.battleMembers[l],MD);
								if (WO) {this.core.accountManager.saveAccount(this.battleMembers[l].id);}
							}
						}
					}
				}
			}
			
			this.turnSeconds = 0;
			SM = this.getStatusMessage();
			this.battleChannel.sendMessage(SM).then(function(mess){this.statusMessage = mess;}.bind(this),function(){})
			this.timer = setInterval(function(){this.turnTick()}.bind(this),1000);
		}
		else {this.statusMessage.edit(SM);}
	}
	
	// --==--==--==--==--==--==--==--==--==
	// TURN TIME
	// --==--==--==--==--==--==--==--==--==
	turnTick()
	{
		this.turnSeconds ++;
		if (this.turnSeconds >= this.turnTimeout)
		{
			this.forceTurnEnd();
			return;
		}
		
		if (this.turnSeconds % 5 == 0) {this.printStatusMessage()};
	}
	
	// --==--==--==--==--==--==--==--==--==
	// FORCEFULLY END A ROUND
	// --==--==--==--==--==--==--==--==--==
	forceTurnEnd()
	{
		for (var l=0; l<this.battleMembers.length; l++)
		{
			if (this.battleMembers[l].state == STATE_NOTHING) {this.battleMembers[l].state = STATE_FORCED;}
		}
		
		this.allMembersReady();
	}
	
	// --==--==--==--==--==--==--==--==--==
	// STATE TO STRING
	// --==--==--==--==--==--==--==--==--==
	stateToString(ST)
	{
		switch (ST)
		{
			case STATE_FORCED:
			return "Forced";
			break;
			
			case STATE_NOTHING:
			return "---";
			break;
			
			case STATE_ATTACK:
			return "Attacking";
			break;
			
			case STATE_FLEE:
			return "Fleeing";
			break;
			
			case STATE_BLOCK:
			return "Blocking";
			break;
			
			case STATE_USING:
			return "Using Item";
			break;
		}
		
		return "";
	}
	
	// --==--==--==--==--==--==--==--==--==
	// A PLAYER'S TURN HAS ACTUALLY ENDED, LET'S CALCULATE SOME THINGS
	// --==--==--==--==--==--==--==--==--==
	postPlayerTurn()
	{
		var turnString = "";
		var badgeInfo = [];
		
		for (var l=0; l<this.battleMembers.length; l++)
		{
			var memberItem = undefined;
			
			// -- EXECUTE MODIFIERS HERE, THEY HAVEN'T BEEN ADDED YET
			var MDF = this.battleMembers[l].modifiers;
			for (var m=0; m<MDF.length; m++)
			{
				if (this.battleMembers[l].account.template.health <= 0)
				{
					MDF[m].wearOff(this.sim,MDF[m].item,MDF[m].slot,this.battleMembers[l],MDF[m]);
				}
				else
				{
					if (MDF[m].executeOnCard)
					{
						MDF[m].executor(this.sim,MDF[m].item,MDF[m].slot,this.battleMembers[l],MDF[m]);
						MDF[m].currentTurn ++;
						
						if (MDF[m].currentTurn >= MDF[m].maxTurns) 
						{
							var WO = MDF[m].wearOff(this.sim,MDF[m].item,MDF[m].slot,this.battleMembers[l],MDF[m]);
							if (WO) {this.core.accountManager.saveAccount(this.battleMembers[l].id);}
						}
					}
				}
			}
			
			var PINF = {indicator:undefined, boss:false, health:1, healthMax:1, sound:undefined, iconOffset:0, modifiers:[]};
			
			PINF.modifiers = this.battleMembers[l].modifiers;
			
			var PRFX = this.battleMembers[l].account.template.information.displayname;
			var TS = "";
			
			var UH = this.core.accountManager.finalStat(this.core,this.battleMembers[l].account,"hp");
			
			if (UH > 0)
			{
				switch (this.battleMembers[l].state)
				{
					case STATE_ATTACK:
						var PAT = this.playerAttack(this.battleMembers[l].account);
						var AT = PAT.returned;
						var DMS = AT.msg;
						
						console.log("Hey look at me");
						memberItem = PAT.theItem;
						
						DMS = DMS.replace("MONSTER",this.monster.behavior.getName(this.monster,this.core));
						
						PINF.indicator = AT.indicator;
						
						TS += DMS;
					break;
					
					case STATE_FLEE:
						TS += "voted to flee the battle."
					break;
					
					case STATE_BLOCK:
						this.battleMembers[l].blocking = true;
						TS += "puts up their arms to block the next attack."
					break;
					
					case STATE_USING:
						var RS = this.battleMembers[l].pendingItem.item.behavior.consumed(this.battleMembers[l].account,this.battleMembers[l].message,this.core,this.battleMembers[l].pendingItem,this.battleMembers[l].pendingSlot,true);
						
						TS += RS;
						this.battleMembers[l].pendingItem = undefined;
						this.battleMembers[l].pendingSlot = "";
					break;
					
					default:
					case STATE_FORCED:
						TS += "did nothing at all."
					break;
				}
			}
			else {TS += "decomposes as a corpse."}
			
			PINF.stringy = TS;
			PINF.name = PRFX;
			PINF.icon = "";
			
			var CID = this.core.accountManager.finalCharacter(this.core,this.battleMembers[l].account);
			
			for (var m=0; m<this.core.characters.characters.length; m++) {
				if (this.core.characters.characters[m].id == CID) {PINF.icon = this.core.characters.characters[m].tinyIcon; break;}
			}
			
			PINF.itemIcon = "";
			
			PINF.boss = this.monster.information.bossMonster;
			
			if (this.battleMembers[l].account.template.inventory[0].item != "")
			{
				var IITM = this.battleMembers[l].account.template.inventory[0].item;
				
				var II = undefined;
				if (memberItem == undefined) {II = this.core.inventoryManager.itemByID(IITM);}
				else {II = memberItem;}
				
				if (II != undefined)
				{
					PINF.itemIcon = this.core.inventoryManager.getItemIcon(IITM, true, false, true);
					PINF.offset = II.item.inventoryProperties.combatIconOffset;
					
					if (this.battleMembers[l].state == STATE_ATTACK)
					{
						var GAS = II.item.behavior.getAttackSound(this.battleMembers[l].account,this.core,II.item,"w",this);
						
						if (GAS != undefined) {PINF.sound = itemDirectory+IITM+"/"+GAS;}
					}
				}
			}
			
			badgeInfo.push(PINF);
		}
		
		turnString += "\n\nMonster has "+this.monster.information.health+" health";
		
		this.drawPlayerTurncard(this.battleChannel,badgeInfo,this.monster);
	}
	
	// --==--==--==--==--==--==--==--==--==
	// DRAW A PLAYER TURNCARD
	// --==--==--==--==--==--==--==--==--==
	drawPlayerTurncard(chan, cardInfo, mons)
	{
		var ICNS = [];
		var ITICNS = [];
		
		for (var l=0; l<cardInfo.length; l++)
		{
			var IP = {
				img: undefined,
				pos: l
			};
			
			if (cardInfo[l].icon != "") {IP.img = new Image(cardInfo[l].icon,"auto");}
			ICNS.push(IP);
			
			var ITP = {
				img: undefined,
				pos: l,
				offset: 0,
			};
			
			ITP.offset = cardInfo[l].offset;
			
			if (cardInfo[l].itemIcon != "") {ITP.img = new Image(cardInfo[l].itemIcon,"auto");}
			ITICNS.push(ITP);
		}
		
		var BBCK = new Image(imageDirectory+IMG_barBack,"auto");
		
		var HLBR = undefined;
		var HLBK = new Image(imageDirectory+IMG_healthNone,"auto");
		if (cardInfo[0].boss) {HLBR = new Image(imageDirectory+IMG_healthBoss,"auto");}
		else {HLBR = new Image(imageDirectory+IMG_healthNormal,"auto");}
		
		// -- THE BUFF IMAGES
		var buffs = [];

		for (var m=0; m<cardInfo.length; m++)
		{
			var minibuff = [];
			
			for (var l=0; l<cardInfo[m].modifiers.length; l++)
			{
				if (cardInfo[m].modifiers[l].buffIcon != undefined)
				{
					var PUSHER = {img:undefined,turns:cardInfo[m].modifiers[l].maxTurns-cardInfo[m].modifiers[l].currentTurn,cardpos:m,pos:l};
					
					PUSHER.img = new Image(itemDirectory+cardInfo[m].modifiers[l].item.item.inventoryProperties.id+"/"+cardInfo[m].modifiers[l].buffIcon,"auto");
					
					minibuff.push(PUSHER);
				}
			}
			
			console.log(minibuff);
			buffs.push(minibuff);
		}
		
		console.log(util.inspect(buffs));
		
		var BBAR = new Image(imageDirectory+IMG_back,"auto").resize(400,cardInfo.length*heightBack+16).loadFont(fontDirectory+'8bit.ttf','8bit').loadFont(fontDirectory+'peepo.ttf','Peepo').loadFont(fontDirectory+'pixel_maz.ttf','Gothic').loadFont(fontDirectory+'pixtech.ttf','PixTech').draw(cxt => {
			
			BBCK.ready(function(bbmp){
				for (var l=0; l<cardInfo.length; l++)
				{
				cxt.drawImage(bbmp,0,l*heightBack);
				}
			}.bind(this));
			
				
			// -- DRAW IT HERE
			ITICNS.forEach(function(element) {
				if (element.img != undefined)
				{
					element.img.ready(function(bmpp){
						cxt.drawImage(bmpp,(400 - 34) + element.offset,Math.floor(element.pos*heightBack));
					}.bind(this));	
				}
			});
			
			// -- DRAW THE BUFF ICONS AND STUFF
			for (var l=0; l<buffs.length; l++)
			{
				buffs[l].forEach(function(elemental) {
					if (elemental.img != undefined)
					{
						elemental.img.ready(function(bmpp){
							cxt.setFont('Peepo',10);
							var MS = cxt.measureText("99");
							var starterX = OFF_buffStart.x + Math.floor(buffWidth*elemental.pos) + Math.floor((MS.width+4)*elemental.pos);
							
							//cxt.drawImage(bmpp,16,16);
							var X1 = (starterX-Math.floor(bmpp.width/2));
							var Y1 = (OFF_buffStart.y-Math.floor(bmpp.height/2)) + (elemental.cardpos*heightBack);
							cxt.drawImage(bmpp,X1,Y1);
							
							Y1 += Math.floor(bmpp.height/2) + 4;
							
							cxt.fillStyle = "#ffffff";
							cxt.setFont('Peepo',10);
							cxt.fillText(elemental.turns.toString(),starterX + Math.floor(bmpp.width/2) + 4,Y1);
						}.bind(this));	
					}
				});
			};
			
			ICNS.forEach(function(element) {
				if (element.img != undefined)
				{
					element.img.ready(function(bmpp){
						cxt.drawImage(bmpp,1,4 + Math.floor(element.pos*heightBack));
						
						cxt.setFont('PixTech',8);
						cxt.fillStyle = "#ffffff";
						cxt.fillText(cardInfo[element.pos].name.toUpperCase(),OFF_barName.x,OFF_barName.y+(element.pos*heightBack));
						
						if (cardInfo[element.pos].indicator != undefined)
						{
							cxt.fillStyle = "#000000";
							cxt.fillText("- "+cardInfo[element.pos].indicator.damage.toString().toUpperCase()+" HP",OFF_barDamage.x+1,OFF_barDamage.y+(element.pos*heightBack)+1);
							cxt.fillStyle = "#ef4646";
							cxt.fillText("- "+cardInfo[element.pos].indicator.damage.toString().toUpperCase()+" HP",OFF_barDamage.x,OFF_barDamage.y+(element.pos*heightBack));
						}
						
						cxt.setFont('Peepo',10);
						cxt.fillStyle = "#ffffff";
						cxt.fillText(cardInfo[element.pos].stringy,OFF_barLog.x,OFF_barLog.y+(element.pos*heightBack));
					}.bind(this));	
				}
				else
				{
					cxt.setFont('PixTech',8);
						cxt.fillStyle = "#ffffff";
						cxt.fillText(cardInfo[element.pos].name.toUpperCase(),OFF_barName.x,OFF_barName.y+(element.pos*heightBack));
						
						if (cardInfo[element.pos].indicator != undefined)
						{
							cxt.fillStyle = "#000000";
							cxt.fillText("- "+cardInfo[element.pos].indicator.damage.toString().toUpperCase()+" HP",OFF_barDamage.x+1,OFF_barDamage.y+(element.pos*heightBack)+1);
							cxt.fillStyle = "#ef4646";
							cxt.fillText("- "+cardInfo[element.pos].indicator.damage.toString().toUpperCase()+" HP",OFF_barDamage.x,OFF_barDamage.y+(element.pos*heightBack));
						}
						
						cxt.setFont('Peepo',10);
						cxt.fillStyle = "#ffffff";
						cxt.fillText(cardInfo[element.pos].stringy,OFF_barLog.x,OFF_barLog.y+(element.pos*heightBack));
				}
			});
			
			HLBR.ready(function(bbmp){
				cxt.drawImage(bbmp,0,(l*heightBack));
			}.bind(this));
			
			HLBK.ready(function(bbmp){
				var PCT = Math.floor( (parseInt(mons.information.health+1) / parseInt(mons.information.maxHealth+1)) * 400);
				if (PCT < 0) {PCT = 0;}
				cxt.drawImage(bbmp,PCT,(l*heightBack));
				
				cxt.setFont('8bit',16);
				cxt.fillStyle = "#ffffff";
				cxt.fillText(mons.behavior.getName(mons,this.core).toUpperCase(),OFF_healthName.x,(cardInfo.length*heightBack)+OFF_healthName.y);
				cxt.fillText("LEVEL "+mons.behavior.getLevel(mons,this.core).toString(),OFF_healthLevel.x,(cardInfo.length*heightBack)+OFF_healthLevel.y);
			}.bind(this));
			
		}).save(imageDirectory+'dump.png').then(function(){
			chan.sendFile(imageDirectory+'dump.png').then(function(pic){
				this.turnCard = pic;
				
				// DECIDE THE SOUND TO PLAY
				var S2P = undefined;
				for (var l=0; l<cardInfo.length; l++)
				{
					if (cardInfo[l].sound != undefined) {S2P = cardInfo[l].sound;}
				}
				
				// DOES A SOUND EXIST?
				if (S2P != undefined)
				{
					console.log("Played sound: "+S2P);
					this.core.botPlaySound(S2P,0.25);
				}
				
				setTimeout(function(){this.monsterThink();}.bind(this),this.betweenTurnTime*1000);
				//this.postSendDecide();
			}.bind(this),function(){});
		}.bind(this),function(){});
	}
	
	// --==--==--==--==--==--==--==--==--==
	// MONSTER THINKS
	// --==--==--==--==--==--==--==--==--==
	monsterThink()
	{
		this.playerTurn = false;
		
		if (this.monster.information.health <= 0)
		{
			var OD = this.monster.behavior.onDeath(this.monster, this.core);
			
			// ARE WE ALLOWED TO DIE?
			if (OD.allowed)
			{	
				var executors = this.getExecutors();
				var CI = this.setupCard(OD.msg);
				CI.executors = executors;
				this.drawMonsterCard(this.battleChannel,CI,true,OD.sound);
				return;
			}
		}

		this.battleChannel.sendMessage(":thinking: `"+this.monster.behavior.getName(this.monster,this.core)+"` is thinking of what to do next...");
		setTimeout(function(){this.monsterAct();}.bind(this),this.betweenTurnTime*1000);
	}
	
	// --==--==--==--==--==--==--==--==--==
	// MONSTER ACTUALLY ACTS
	// --==--==--==--==--==--==--==--==--==
	monsterAct()
	{
		// ARE ALL OF THE PLAYERS DEAD?
		var playersDead = true;
		for (var l=0; l<this.battleMembers.length; l++)
		{
			if (this.core.accountManager.finalStat(this.core,this.battleMembers[l].account,"hp",true) > 0) {playersDead = false; break;}
		}
		
		// Players are dead
		if (playersDead)
		{
			for (var l=0; l<this.battleMembers.length; l++)
			{
				this.battleMembers[l].account.template.stats.gold = 0;
				
				this.core.accountManager.giveHealth(this.battleMembers[l].account,100000,true);
				
				this.core.accountManager.saveAccount(this.battleMembers[l].account.id);
			}
			
			this.starterParty.dungeonLevel = 0;
			this.core.accountManager.writeParties();
			
			this.battleChannel.sendFile(imageDirectory+'partydied.png').then(function(){
			this.battleChannel.sendMessage(":skull_crossbones: **Your party has fallen!** :skull_crossbones:\n*Thankfully, Death has favored your crew and you find yourselves well again in the town. However, nothing in life is free...*");
			}.bind(this),function(){});
			
			this.core.monsterManager.stopBattle(this);
			return;
		}
		
		var executors = this.getExecutors();
		
		// AFTER ALL THE MODIFIERS HAPPENED, DID WE DIE?
		if (this.monster.information.health <= 0)
		{
			var OD = this.monster.behavior.onDeath(this.monster, this.core);
			
			// ARE WE ALLOWED TO DIE?
			if (OD.allowed)
			{	
				var CI = this.setupCard(OD.msg);
				CI.executors = executors;
				this.drawMonsterCard(this.battleChannel,CI,true,OD.sound);
				return;
			}
		}
		
		var decide = this.monster.behavior.decision(this.monster,this.core,this);
		var CI = this.setupCard(decide.msg);
		
		CI.executors = executors;
		
		this.drawMonsterCard(this.battleChannel,CI,false,decide.sound);
	}
	
	// --==--==--==--==--==--==--==--==--==
	// GET THE STATUS MESSAGE
	// --==--==--==--==--==--==--==--==--==
	getStatusMessage()
	{
		var SM = "**Players, take your turns:**\n\n";
		
		for (var l=0; l<this.battleMembers.length; l++)
		{
			var BM = this.battleMembers[l];
			// Add display name
			SM += ":white_check_mark: `"+BM.account.template.information.displayname+"` - ";
			// Add health
			var HLT = this.core.accountManager.finalStat(this.core,BM.account,"hp",true);
			var MHLT = this.core.accountManager.finalStat(this.core,BM.account,"maxhp",true);
			
			if (MHLT == undefined) {MHLT = 0;}
			
			if (HLT > 0)
			{
				SM += "**"+HLT+" / "+MHLT+" HP** - ";
				SM += "*"+this.stateToString(BM.state)+"*\n";
			}
			else {
				SM += "**DEAD** - *Decomposing*\n"
			}
		}
		
		SM += "\n:x: `"+this.monster.behavior.getName(this.monster,this.core)+"` - **"+this.monster.information.health+" / "+this.monster.information.maxHealth+" HP**";
		
		var MIN = this.turnTimeout-this.turnSeconds;
		
		if (!isNaN(MIN)) {SM += "\n\n*Turn forcefully ends in about "+(MIN).toString()+" seconds...*";}
		
		return SM;
	}
	
	// --==--==--==--==--==--==--==--==--==
	// THE BATTLE ACTUALLY STARTS
	// --==--==--==--==--==--==--==--==--==
	startBattle()
	{
		var boss = this.monster.information.bossMonster;
		var TRK = this.bossTracks[randomFrom(this.bossTracks.length)];
		
		if (boss && this.monster.information.bossTracks.length > 0) {TRK = this.monster.information.bossTracks[randomFrom(this.monster.information.bossTracks.length)];}
		else if (!boss && this.monster.information.musicTracks.length > 0) {TRK = this.monster.information.musicTracks[randomFrom(this.monster.information.musicTracks.length)];}
		
		if (this.monster.information.bossMonster)
		{
			this.core.botPlayMusic(TRK, 0.25, 0);
		}
		
		var OS = this.monster.behavior.onSight(this.monster, this.core);
		var CI = this.setupCard([OS.msg]);
		this.drawMonsterCard(this.battleChannel,CI,false,OS.sound);
	}
}

module.exports = TheBattle;
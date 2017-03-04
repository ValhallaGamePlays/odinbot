// BASIC MONSTER CLASS
const randomFrom = function(thelength){return Math.floor(Math.random() * thelength);}
const util = require('util');
	
class MonsterCoreClass {
	
	constructor() 
	{
		// Setup some of the basic item properties
		this.setupBaseProperties(this);
		this.randomFrom = randomFrom;
	}
	
	vocalize(sim, arr) {
		if (arr.length <= 0) {return;}
		sim.botPlaySound(sim.monsterManager.mainDirectory+this.information.id+"/"+arr[randomFrom(arr.length-1)],sim.monsterManager.monsterVolume);
	}
	
	setImage(sim, img) {
		console.log("Image set to "+img);
		this.information.image = sim.monsterManager.mainDirectory+this.information.id+"/"+img;
	}
	
	randomized(arr) {
		var RF = randomFrom(arr.length);
		if (RF >= arr.length) {RF = arr.length-1;}
		return arr[RF];
	}
	
	// {damage, type}
	takeDamage(sim, account, inflicted)
	{
		this.information.health -= inflicted.damage;
		this.lastInflicted = inflicted;
		
		this.behavior.onPain(this,sim,account,inflicted);
		
		return inflicted.damage;
	}
	
	replaceIt(str,sim,monster,target,dam)
	{
		var st = str.replace("PLAYER",target.account.template.information.displayname);
		var st = st.replace("DAMAGE",dam.toString());
		var st = st.replace("MONSTER",monster.behavior.getName(monster,sim));
		
		return st;
	}
	
	attackEveryone(monster,sim,members,target,battle,stringOne,stringTwo,dmg,img,snd,alldmg,canDodge = true,idleImage = monster.randomized(monster.images.idle))
	{
		if (target == undefined) {return {allowed:false, msg:["The monster had no target."], damage:0, sound:undefined};}
		var dam = dmg;
		var dmRet = 0;
					
		// Log messages
		var MSG = [];
		
		MSG.push(monster.replaceIt(stringOne,sim,monster,target,dmRet));
		
		monster.setImage(sim,img);
		
		if (dmg > 0)
		{
			var finalDamage = sim.calculator.calcMonsterDamage(monster,target,dmg);
			
			// BLOCKED COMPLETELY?
			if (finalDamage.dodged && canDodge) 
			{
				MSG[1] = "but missed entirely!";
				monster.setImage(sim,idleImage);
				return {allowed:false, msg:MSG, damage:finalDamage.hpt, sound:undefined};
			}
			
			if (finalDamage.hpt > 0) {
				finalDamage.hpt = sim.accountManager.takeHealth(target.account,Math.floor(finalDamage.hpt),true,true,monster)
				
				for (var l=0; l<battle.battleMembers.length; l++)
				{
					if (battle.battleMembers[l].account != target.account) {sim.accountManager.takeHealth(battle.battleMembers[l].account,Math.floor(alldmg),true,monster)}
				}
			}
			
			MSG.push(monster.replaceIt(stringTwo,sim,monster,target,finalDamage.hpt));
			// BLOCKED PARTIALLY
			if (finalDamage.blocked) {MSG.push("\nThe attack was partially blocked.");}
			
			dmRet = finalDamage.hpt;
		}
		else
		{
			MSG.push(monster.replaceIt(stringTwo,sim,monster,target,dmRet));
		}
		
		return {allowed:true, msg:MSG, damage:dmRet, sound:snd};
	}
	
	genericAttack(monster,sim,members,target,battle,stringOne,stringTwo,dmg,img,snd,idleImage = monster.randomized(monster.images.idle))
	{
		if (target == undefined) {return {allowed:false, msg:["The monster had no target."], damage:0, sound:undefined};}
		var dam = dmg;
		var dmRet = 0;
					
		// Log messages
		var MSG = [];
		
		MSG.push(monster.replaceIt(stringOne,sim,monster,target,dmRet));
		
		monster.setImage(sim,img);
		
		if (dmg > 0)
		{
			var finalDamage = sim.calculator.calcMonsterDamage(monster,target,dmg);
			
			// BLOCKED COMPLETELY?
			if (finalDamage.dodged) 
			{
				MSG[1] = "but missed entirely!";
				monster.setImage(sim,idleImage);
				return {allowed:false, msg:MSG, damage:finalDamage.hpt, sound:undefined};
			}
			
			if (finalDamage.hpt > 0) {finalDamage.hpt = sim.accountManager.takeHealth(target.account,Math.floor(finalDamage.hpt),true,true,monster)}
			
			MSG.push(monster.replaceIt(stringTwo,sim,monster,target,finalDamage.hpt));
			// BLOCKED PARTIALLY
			if (finalDamage.blocked) {MSG.push("\nThe attack was partially blocked.");}
			
			dmRet = finalDamage.hpt;
		}
		else
		{
			MSG.push(monster.replaceIt(stringTwo,sim,monster,target,dmRet));
		}
		
		return {allowed:true, msg:MSG, damage:dmRet, sound:snd};
	}
	
	setupBaseProperties(it)
	{
		it.vocalize = this.vocalize;
		it.setImage = this.setImage;
		it.takeDamage = this.takeDamage;
		it.replaceIt = this.replaceIt;
		it.genericAttack = this.genericAttack;
		it.attackEveryone = this.attackEveryone;
		it.randomized = this.randomized;
		
		// ALL OF THE CORE PROPERTIES THAT THIS MONSTER HAS
		it.information = {
			names: ["Dummy Monster"],
			name: "",
			spawnMessage: "The monster has spawned!",
			baseMaxHealth: 100,
			maxHealth: 0,
			codexPicture: undefined,
			verticalOffset: 0,
			sizeAdder: 0,
			baseXP: 50,
			dungeonLevelMin: 0,
			dungeonLevelMax: 999,
			baseLevel: 1,
			health: 0,
			level: 0,
			baseXP: 50,
			specificUse:false,
			prefixChoices: [],
			suffixChoices: [],
			prefixes: [],
			suffixes: [],
			image: "",
			id: "",
			tags: ["dungeon"],
			codexBio:"No information is known about the monster at this time.",
			floorOverride:{img:undefined,onBoss:true},
			backgroundOverride:{img:undefined,onBoss:true},
			lowerOverride:{img:undefined},
			musicTracks:[],
			bossTracks:[],
			enemyParty: undefined,
			lastInflicted: undefined,
			bossMonster: false,
			lootTable: [
				{item:"randomized", chance:0.5},
				{item:"randomized", chance:0.5}
			]
		};
		
		it.audios = {
			sight: [],
			death: [],
			pain: []
		};
		
		it.images = {
			sight: [],
			death: [],
			pain: [],
			idle: []
		}
		
		// THE VARIOUS AI CODING IN THE MONSTER
		it.behavior = {
			// -- CANTAKETURN
			// -- Can we even take a turn? If not, just skip
			canTakeTurn: function(monster,sim,members)
			{
				return {allowed:true, msg:""};
			},
			
			// -- SETHEALTH
			// -- Sets monster's initial health
			setBaseHealth: function(monster,sim,battle)
			{
				monster.information.maxHealth = sim.calculator.calcMonsterBaseHealth(monster,battle.battleMembers);
				monster.information.health = monster.information.maxHealth;
			},
			
			// -- GETLEVEL
			// -- Get level just in case
			getLevel: function(monster,sim)
			{
				return monster.information.level;
			},
			
			// -- GENERATE LEVEL
			// -- Set level just in case
			generateLevel: function(monster,sim,battle = undefined)
			{
				if (battle == undefined) {monster.information.level = monster.information.baseLevel;}
				else
				{
					var DUNG = battle.starterParty.dungeonLevel;
					monster.information.level = sim.calculator.calcMonsterLevel(monster.information.baseLevel,DUNG);
				}
			},
			
			// -- GENERATENAME
			// -- Sets monster's initial name
			generateName: function(monster,sim)
			{
				monster.information.name = monster.information.names[randomFrom(monster.information.names.length)];
			},
			
			// -- GETNAME
			// -- Get monster monster's name, just in case we morph into something, who knows
			getName: function(monster,sim)
			{
				return monster.information.prefixes.join(" ")+monster.information.name+monster.information.suffixes.join(" ");
			},
			
			// -- GETIMAGE
			// -- Returns the image that the monster should show
			getImage: function(monster,sim)
			{
				return monster.information.image;
			},
			
			// -- ONSIGHT
			// -- Happens when the battle is started
			onSight: function(monster,sim)
			{
				console.log("Monster played sight");
				monster.setImage(sim, monster.images.sight[randomFrom(monster.images.sight.length)]);
				
				var SND = monster.audios.sight[randomFrom(monster.audios.sight.length)];
				
				return {msg:monster.information.spawnMessage,sound:SND}
			},
			
			// -- ONPAIN
			// -- Happens when somebody hurts the monster
			onPain: function(monster, sim, account, inflicted)
			{
				console.log("Monster took pain - Inflicted: "+inflicted);
			},
			
			// -- ONDEATH
			// -- Happens when somebody kills the monster
			onDeath: function(monster, sim)
			{
				return {allowed:true, msg:["The monster died!"], sound:undefined};
			},
			
			// -- MOVES
			// -- ALL OF THE POSSIBLE MOVES THAT THIS MONSTER CAN TAKE IN THE BATTLE
			moves: [],
			
			// -- CHOOSETARGET
			// -- DECIDE WHICH TARGET TO DESTROY
			chooseTarget: function(monster,sim,members) {
				// Copy the array and filter out all dead members
				var available = members.slice(0);
				for (var l=0; l<available.length; l++) 
				{
					var UH = sim.accountManager.finalStat(sim,available[l].account,"hp");
					if (UH <= 0) {available.splice(l,1);}
				}
				
				return available[randomFrom(available.length)];
			},
			
			// -- CHOOSEMOVE
			// -- DECIDE WHICH MOVE TO TAKE
			chooseMove: function(monster,sim,members,target) {
				var MV = undefined;
				
				do {
					var testMove = monster.moves[randomFrom(monster.moves.length)];
					
					if (testMove.allowed(monster,sim,members,target,monster.battle)) {MV = testMove;}
				} while (MV == undefined)
				
				return MV;
			},
			
			// -- DECISION
			// -- WHEN IT IS OUR TURN, DECIDE WHAT TO DO
			decision: function(monster, sim, battle)
			{
				// Can we even attack?
				var CTT = monster.behavior.canTakeTurn(monster, sim, battle.battleMembers);
				if (!CTT.allowed) {return {allowed:false, msg:[CTT.msg], snd:undefined}};
				
				// Pick a target
				var theTarget = monster.behavior.chooseTarget(monster,sim,battle.battleMembers);
				
				// Pick which move to use
				var theMove = monster.behavior.chooseMove(monster,sim,battle.battleMembers,theTarget);
				
				// AT THIS POINT WE CAN DECIDE WHETHER OR NOT TO DODGE AND THINGS
				var ATR = theMove.processor(monster,sim,battle.battleMembers,theTarget,battle);
				
				return ATR;
			},
			
			// -- GETLOOT
			// -- A TABLE OF THE LOOT TO GIVE PLAYERS
			getLoot: function(monster, sim, battle)
			{
				var LOOT = [];
				
				for (var l=0; l<monster.information.lootTable.length; l++)
				{
					var PUSH = {};
					
					var nickelRoller = Math.random(1);
					if (nickelRoller >= monster.information.lootTable[l].chance)
					{
						if (monster.information.lootTable[l].item == "randomized")
						{
							var IT = sim.calculator.randomItem(1);
							PUSH.item = IT.item.inventoryProperties.id;
							PUSH.rarity = 0;
						}
						else
						{
							PUSH.item = monster.information.lootTable[l].item;
							PUSH.rarity = 0;
						}
						LOOT.push(PUSH);
					}
				}
				
				return LOOT;
			},
			
			// -- GIVELOOT
			// -- GIVE THE LOOT FROM THIS MONSTER
			giveLoot: function(monster, sim, battle)
			{
				var MEM = battle.battleMembers;
				var LM = ":moneybag: **Here's the loot you got:** :book:\n\n";
				
				for (var l=0; l<MEM.length; l++)
				{
					var LOOT = monster.behavior.getLoot(monster,sim,battle);
					
					LM += "```"+MEM[l].account.template.information.displayname+"```";
					
					if (LOOT.length > 0)
					{
						for (var m=0; m<LOOT.length; m++)
						{
							LM += "**"+sim.inventoryManager.getItemName(LOOT[m].item)+"**\n";
							sim.inventoryManager.giveItem(MEM[l].account, LOOT[m].item, undefined, undefined, undefined, false);
						}
						sim.accountManager.saveAccount(MEM[l].account.id);
					}
					else {LM += "**No loot for you, maybe next time!**\n";}
				}
				
				return LM;
			}
		};
		
		it.core = "";
	}
}

module.exports = MonsterCoreClass;
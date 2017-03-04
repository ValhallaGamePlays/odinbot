// BASIC ITEM CLASS
class ItemCoreClass {
	
	constructor() 
	{
		// Setup some of the basic item properties
		this.setupBaseProperties(this);
	}
	
	randomFrom(thelength){return Math.floor(Math.random() * thelength);}

	setupBaseProperties(it)
	{
		it.randomFrom = this.randomFrom;
		
		// FOR MODIFYING STATS
		it.behavior = {
			hasMissed: function(sim, item, slot, monster, account){
				var finalChance = item.weaponProperties.missChance;
				
				finalChance = sim.calculator.calcMissChance(finalChance,sim.accountManager.finalStat(sim,account,"precision"));
				
				if (Math.random(1) >= finalChance) {return {missed:true,msg:"tried to attack the enemy but missed!"}}
				return {missed:false,msg:""};
			},
			statModifier: function(initial, type, sim, item, slot){return initial},																				// -- MODIFY SOME STATS
			damageModifier: function(initial, sim, item, slot, isMonster, monster, account){return initial},
			canConsume: function(statNumber, message, sim, item, slot){return {allowed:false, msg:"That item can't be used."};},						// -- MODIFY SOME STATS
			consumed: function(account, message, sim, item, slot, inBattle){message.reply("Nothing happened.");},													// -- MODIFY A USER'S HEALTH OR SOMETHING
			getAttackSound: function(account, sim, item, slot, battle)
			{
				return item.weaponProperties.attackSounds[item.randomFrom(item.weaponProperties.attackSounds.length)];
			},
			attack: function(account, sim, item, monster)
			{
				var DMG = item.behavior.calculateDamage(account,sim,item,monster);
				
				var indicator = {damage:DMG};
				var takeDam = monster.takeDamage(sim, account, indicator);
				
				indicator.damage = takeDam;
				
				return {indicator: indicator, msg:item.weaponProperties.attackString};
			},
			calculateDamage: function(account, sim, item, monster,BMIN = item.weaponProperties.baseDamage, BMAX = item.weaponProperties.baseDamage)
			{
				if (item.weaponProperties.baseDamageMax > -1) {BMAX = item.weaponProperties.baseDamageMax;}
				
				var finalDMG = BMIN + (Math.random(1) * (BMAX-BMIN));
				
				var SM = sim.calculator.strengthMultiply;
				var PM = sim.calculator.precisionMultiply;
				
				if (item.weaponProperties.strengthMultiply)
				{
					var finalSM = 1.0 + (SM*sim.accountManager.finalStat(sim,account,"strength"));
					finalDMG *= finalSM;
				}
				
				if (item.weaponProperties.precisionMultiply)
				{
					var finalPM = 1.0 + (SM*sim.accountManager.finalStat(sim,account,"precision"));
					finalDMG *= finalPM;
				}
				
				if (item.weaponProperties.wisdomMultiply)
				{
					var finalWM = 1.0 + (SM*sim.accountManager.finalStat(sim,account,"wisdom"));
					finalDMG *= finalWM;
				}
				
				return Math.floor(finalDMG);
			}
		};
		
		// PROPERTIES FOR INVENTORY ITEMS
		it.inventoryProperties = {
			isWeapon: false,
			isPowerup: true,
			prefixes: [],
			suffixes: [],
			battleModifiers: [],
			enemyModifiers: [],
			allowedPrefixes: [
				{
					chance: 0.5,
					rarityBonus:1,
					messages: ["Nice", "Cool", "Unique", "New"]
				},
				
				{
					chance: 0.4,
					rarityBonus:2,
					messages: ["Clean", "Rare", "Shiny", "Tasteful"]
				},
				
				{
					chance: 0.3,
					rarityBonus:3,
					messages: ["Golden", "Mint", "Polished", "Desired", "Wicked"]
				},
				
				{
					chance: 0.3,
					rarityBonus:4,
					messages: ["Cursing", "Vengeful", "Scary", "Fierce", "Wrathful"]
				},
				
				{
					chance: 0.3,
					rarityBonus:5,
					messages: ["Demonic", "Hellish", "Magical", "Twisted", "Fiendish"]
				},
				
				{
					chance: 0.3,
					rarityBonus:6,
					messages: ["Alien", "Impossible", "Peculiar", "Mystical", "Ascended", "Atmospheric"]
				},
				
				{
					chance: 0.2,
					rarityBonus:7,
					messages: ["Godlike", "Giger's", "God's", "Untouchable", "Shamanic", "Cheated", "Sinful"]
				}
			],
			allowedSuffixes: [
				"of Doom", 
				"of Death", 
				"of Infernos", 
				"of Cancer", 
				"of Jesus", 
				"of Zedek", 
				"of Anarchist", 
				"of Janus", 
				"of Faggotry", 
				"of Jews", 
				"of Fire",
				"of Killing",
				"from Hell",
				"of Bones",
				"of Iron",
				"of Smashing",
				"of Lust"
			],
			rarity: 0,
			buyPrice: 20,
			sellPrice: 10,
			dungeonLevelMin: 0,
			dungeonLevelMax: 999,
			description: "This is a simple item.",
			helper: "",
			findChance: 0.0,
			inventoryIconLarge: undefined,
			inventoryIconCombat: undefined,
			combatIconOffset: 0,
			inventoryIcon: 'icon.png',
			itemName: "Magic Mushroom",
			tags: ["normal"],
			equipClasses: [],
			characterOverride: ""
		};
		
		// PROPERTIES FOR WEAPONS
		it.weaponProperties = {
			baseDamage: 0,
			baseDamageMax: -1,
			flameChance: 0,
			poisonChance: 0,
			missChance:0.88,
			strengthMultiply: true,
			precisionMultiply: false,
			wisdomMultiply: false,
			attackSounds: [],
			attackString: "attacked MONSTER with a dummy item"
		};
	}
}

module.exports = ItemCoreClass;
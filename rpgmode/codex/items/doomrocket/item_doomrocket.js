// NAZI GUNS

const IC = require('../ItemCore.js');

class ItemClassifier 
{
	constructor() 
	{
		// INHERIT BASE PROPERTIES FROM THE ITEM CORE
		this.core = new IC();
		this.core.setupBaseProperties(this);
		
		// CHANGE PROPERTIES AS NEEDED
		this.behavior.canConsume = function(statNumber, message, sim, item, slot){return {allowed:false, msg:"You can use this spell in battle."};}
		
		this.inventoryProperties.itemName = "Rocket Launcher";
		this.inventoryProperties.isWeapon = true;
		this.inventoryProperties.rarity = 2;
		this.inventoryProperties.findChance = 0.98;
		this.inventoryProperties.combatIconOffset = -32;
		this.inventoryProperties.inventoryIconLarge = 'icon_large.png';
		this.inventoryProperties.inventoryIconCombat = 'icon_combat.png';
		this.inventoryProperties.description = "An oddly phallic launcher capable of shooting rockets, of all things.";
		this.inventoryProperties.helper = "225 base damage against enemy";
		
		this.inventoryProperties.tags.push("firearm");
		this.inventoryProperties.equipClasses = ["wspecial"]
		
		this.weaponProperties.baseDamage = 250;
		this.weaponProperties.strengthMultiply = false;
		this.weaponProperties.precisionMultiply = true;
		this.weaponProperties.attackString = "shot a large, explosive rocket at the enemy and blew them up."
		this.weaponProperties.attackSounds = ['DSRLAUNC.wav']
	}
}

module.exports = ItemClassifier;
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
		
		this.inventoryProperties.itemName = "Super Shotgun";
		this.inventoryProperties.isWeapon = true;
		this.inventoryProperties.rarity = 1;
		this.inventoryProperties.findChance = 0.92;
		this.inventoryProperties.combatIconOffset = -32;
		this.inventoryProperties.inventoryIconLarge = 'icon_large.png';
		this.inventoryProperties.inventoryIconCombat = 'icon_combat.png';
		this.inventoryProperties.description = "It's just like the normal shotgun, but it's \"super\" for some reason.";
		this.inventoryProperties.helper = "150 base damage against enemy";
		
		this.inventoryProperties.tags.push("firearm");
		this.inventoryProperties.equipClasses = ["wspecial"]
		
		this.weaponProperties.baseDamage = 150;
		this.weaponProperties.strengthMultiply = false;
		this.weaponProperties.precisionMultiply = true;
		this.weaponProperties.attackString = "blew the enemy away with a Super Shotgun blast."
		this.weaponProperties.attackSounds = ['DSDSHTGN.wav']
	}
}

module.exports = ItemClassifier;
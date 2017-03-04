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
		
		this.inventoryProperties.itemName = "Plasma Rifle";
		this.inventoryProperties.isWeapon = true;
		this.inventoryProperties.rarity = 4;
		this.inventoryProperties.findChance = 1.1;
		this.inventoryProperties.combatIconOffset = -32;
		this.inventoryProperties.inventoryIconLarge = 'icon_large.png';
		this.inventoryProperties.inventoryIconCombat = 'icon_combat.png';
		this.inventoryProperties.description = "The plasma rifle's tan covering is oddly bumpy. Shoots very quickly.";
		this.inventoryProperties.helper = "275 base damage against enemy";
		
		this.inventoryProperties.tags.push("firearm");
		this.inventoryProperties.equipClasses = ["wspecial"]
		
		this.weaponProperties.baseDamage = 275;
		this.weaponProperties.strengthMultiply = false;
		this.weaponProperties.precisionMultiply = true;
		this.weaponProperties.attackString = "spewed a small barrage of plasma balls at the enemy."
		this.weaponProperties.attackSounds = ['DSPLASMA.wav']
	}
}

module.exports = ItemClassifier;
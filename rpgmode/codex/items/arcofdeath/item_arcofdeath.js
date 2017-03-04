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
		
		this.inventoryProperties.itemName = "Arc of Death";
		this.inventoryProperties.isWeapon = true;
		this.inventoryProperties.findChance = 0.95;
		this.inventoryProperties.rarity = 2;
		this.inventoryProperties.description = "A powerful tome of knowledge, containing a deadly electricity spell.";
		this.inventoryProperties.helper = "100 base damage against enemy";
		
		this.inventoryProperties.tags.push("magical");
		
		this.weaponProperties.baseDamage = 100;
		this.weaponProperties.strengthMultiply = false;
		this.weaponProperties.wisdomMultiply = true;
		this.weaponProperties.attackString = "released a powerful arc of lightning toward the enemy!"
		this.weaponProperties.attackSounds = ['LITE2.wav']
	}
}

module.exports = ItemClassifier;
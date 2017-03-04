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
		
		this.inventoryProperties.itemName = "Frost Shards";
		this.inventoryProperties.isWeapon = true;
		this.inventoryProperties.findChance = 0.9;
		this.inventoryProperties.description = "One of the mage's most basic spells.";
		this.inventoryProperties.helper = "50 base damage against enemy";
		
		this.inventoryProperties.tags.push("magical");
		
		this.weaponProperties.baseDamage = 50;
		this.weaponProperties.strengthMultiply = false;
		this.weaponProperties.wisdomMultiply = true;
		this.weaponProperties.attackString = "projected icy shards at the fiend"
		this.weaponProperties.attackSounds = ['CONE3.wav']
	}
}

module.exports = ItemClassifier;
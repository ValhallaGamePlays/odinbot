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
		
		this.inventoryProperties.itemName = "Bloodscourge";
		this.inventoryProperties.isWeapon = true;
		this.inventoryProperties.findChance = 0.995;
		this.inventoryProperties.rarity = 4;
		this.inventoryProperties.inventoryIconLarge = 'icon_large.png';
		this.inventoryProperties.description = "A long staff with a skull on the end, holding a swirl of souls.";
		this.inventoryProperties.helper = "200 base damage against enemy";
		
		this.inventoryProperties.tags.push("magical");
		
		this.weaponProperties.baseDamage = 200;
		this.weaponProperties.strengthMultiply = false;
		this.weaponProperties.wisdomMultiply = true;
		this.weaponProperties.precisionMultiply = true;
		this.weaponProperties.attackString = "released bladed fireballs which tear and mangle the fiend!"
		this.weaponProperties.attackSounds = ['MAGE4.wav']
	}
}

module.exports = ItemClassifier;
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
		this.behavior.canConsume = function(statNumber, message, sim, item, slot){return {allowed:false, msg:"You can use this weapon in battle."};}
		
		this.inventoryProperties.itemName = "Brass Knuckles";
		this.inventoryProperties.isWeapon = true;
		this.inventoryProperties.findChance = 0.9;
		this.inventoryProperties.description = "A simple yet sturdy pair of brass knuckles, illegal in some areas.";
		this.inventoryProperties.helper = "10 base damage against enemy";
		
		this.weaponProperties.baseDamage = 10;
		this.weaponProperties.strengthMultiply = true;
		this.weaponProperties.attackString = "punched the enemy in the face!"
		this.weaponProperties.attackSounds = ['DSPUNCH.wav']
	}
}

module.exports = ItemClassifier;
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
		this.behavior.canConsume = function(statNumber, message, sim, item, slot){return {allowed:false, msg:"Use this item in battle and follow your leader!"};}
		this.inventoryProperties.itemName = "MP-40 SMG";
		this.inventoryProperties.isWeapon = true;
		this.inventoryProperties.description = "A classic SMG used by German forces.";
		this.inventoryProperties.helper = "50 base damage against enemy";
		this.weaponProperties.baseDamage = 50;
		this.inventoryProperties.findChance = 0.9;
		this.weaponProperties.strengthMultiply = false;
		this.weaponProperties.precisionMultipy = true;
		this.weaponProperties.attackString = "sprayed some bullets at the fiend"
		this.weaponProperties.attackSounds = ['mp40_Fire.wav']
	}
}

module.exports = ItemClassifier;
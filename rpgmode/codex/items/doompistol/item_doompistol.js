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
		
		this.inventoryProperties.itemName = "Peashooter Pistol";
		this.inventoryProperties.isWeapon = true;
		this.inventoryProperties.findChance = 5000;
		this.inventoryProperties.description = "A fairly weak side-arm, but this is all the UAC had.";
		this.inventoryProperties.helper = "40 base damage against enemy";
		
		this.inventoryProperties.tags.push("traderomit");
		this.inventoryProperties.tags.push("firearm");
		this.inventoryProperties.equipClasses = ["wspecial"]
		
		this.weaponProperties.baseDamage = 40;
		this.weaponProperties.strengthMultiply = false;
		this.weaponProperties.precisionMultiply = true;
		this.weaponProperties.attackString = "popped a shot at the enemy with their pistol."
		this.weaponProperties.attackSounds = ['DSPISTOL.wav']
	}
}

module.exports = ItemClassifier;
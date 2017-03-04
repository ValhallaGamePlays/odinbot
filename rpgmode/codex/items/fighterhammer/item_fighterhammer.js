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
		this.behavior.canConsume = function(statNumber, message, sim, item, slot){return {allowed:false, msg:"You can use this item in battle."};}
		
		this.inventoryProperties.itemName = "Hammer of Retribution";
		this.inventoryProperties.isWeapon = true;
		this.inventoryProperties.findChance = 0.98;
		this.inventoryProperties.rarity = 3;
		this.inventoryProperties.inventoryIconLarge = 'icon_large.png';
		this.inventoryProperties.sellPrice = 250;
		this.inventoryProperties.buyPrice = 500;
		this.inventoryProperties.description = "A massive hammer which can only be wielded by the mightiest.";
		this.inventoryProperties.helper = "200 base damage against enemy";
		
		this.weaponProperties.baseDamage = 200;
		this.weaponProperties.strengthMultiply = true;
		this.weaponProperties.attackString = "smashed the fiend's bones with the Hammer of Retribution!"
		this.weaponProperties.attackSounds = ['HMHIT1A.wav']
	}
}

module.exports = ItemClassifier;
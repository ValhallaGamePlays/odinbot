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
		
		this.inventoryProperties.itemName = "Timon's Axe";
		this.inventoryProperties.isWeapon = true;
		this.inventoryProperties.findChance = 0.95;
		this.inventoryProperties.rarity = 2;
		this.inventoryProperties.inventoryIconLarge = 'icon_large.png';
		this.inventoryProperties.sellPrice = 100;
		this.inventoryProperties.buyPrice = 200;
		
		// FIGHTER ONLY
		this.inventoryProperties.equipClasses = ["fighter"];
		
		this.inventoryProperties.description = "A bulky yet powerful axe that delivers a powerful blow.";
		this.inventoryProperties.helper = "100 base damage against enemy";
		
		this.weaponProperties.baseDamage = 100;
		this.weaponProperties.strengthMultiply = true;
		this.weaponProperties.attackString = "gave a blow to the fiend with Timon's Axe!"
		this.weaponProperties.attackSounds = ['AXE5.wav']
	}
}

module.exports = ItemClassifier;
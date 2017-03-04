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
		this.behavior.canConsume = function(statNumber, message, sim, item, slot){return {allowed:false, msg:"This gun is a kid's toy and probably wouldn't do too great in battle."};}
		this.inventoryProperties.itemName = "Squirt Pistol";
		this.inventoryProperties.isWeapon = true;
		this.inventoryProperties.description = "A classic squirt pistol, made for kids. Shoots water.";
		this.inventoryProperties.helper = "2 damage against enemy, gets them wet";
		this.weaponProperties.baseDamage = 2;
		this.inventoryProperties.findChance = 5000;
		this.inventoryProperties.sellPrice = 25;
		this.inventoryProperties.buyPrice = 50;
		this.inventoryProperties.tags.push("traderomit");
		
		this.weaponProperties.strengthMultiply = false;
		this.weaponProperties.precisionMultipy = true;
		this.weaponProperties.attackString = "squirted the enemy with some water"
		this.weaponProperties.attackSounds = ['squirt.wav']
	}
}

module.exports = ItemClassifier;
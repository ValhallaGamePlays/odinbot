// JOSHY'S GONNA GET MAGIC MUSHROOMS

const IC = require('../ItemCore.js');

class ItemClassifier 
{
	constructor() 
	{
		// INHERIT BASE PROPERTIES FROM THE ITEM CORE
		this.core = new IC();
		this.core.setupBaseProperties(this);
		
		// CHANGE PROPERTIES AS NEEDED
		this.behavior.canConsume = function(statNumber, message, sim, item, slot){return {allowed:false, msg:"Use this item in battle, lil gangsta nigga"};}
		this.inventoryProperties.itemName = "Uzi Pistol";
		this.inventoryProperties.description = "Gangstas use this shit, cuz";
		this.inventoryProperties.helper = "40 base damage against enemy";
		this.inventoryProperties.isWeapon = true;
		this.inventoryProperties.findChance = 0.9;
		
		this.weaponProperties.attackSounds = ['fire_1.wav','fire_2.wav'];
		this.weaponProperties.baseDamage = 40;
		this.weaponProperties.strengthMultiply = false;
		this.weaponProperties.precisionMultiply = true;
		this.weaponProperties.attackString = "popped a cap in the monster's fat ass"
	}
}

module.exports = ItemClassifier;
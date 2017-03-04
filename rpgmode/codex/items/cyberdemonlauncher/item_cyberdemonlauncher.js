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
		this.behavior.canConsume = function(statNumber, message, sim, item, slot){return {allowed:false, msg:"**Torn straight from the dead corpse of a cyberdemon, the rocket launcher.** Use this in battle to vanquish your foes."};}
		this.inventoryProperties.itemName = "Cyberdemon Launcher";
		this.inventoryProperties.description = "A cybernetic arm enhancement.";
		this.inventoryProperties.helper = "150 base damage against enemy";
		this.inventoryProperties.isWeapon = true;
		this.inventoryProperties.findChance = 5000;
		this.inventoryProperties.rarity = 3;
		
		this.weaponProperties.attackSounds = ['DSRLAUNC.wav'];
		this.weaponProperties.baseDamage = 150;
		this.weaponProperties.strengthMultiply = false;
		this.weaponProperties.precisionMultiply = true;
		this.weaponProperties.attackString = "shot a hefty missile at the fiend"
	}
}

module.exports = ItemClassifier;
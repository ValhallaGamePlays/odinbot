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
		
		this.inventoryProperties.itemName = "Shotgun";
		this.inventoryProperties.isWeapon = true;
		this.inventoryProperties.findChance = 0.9;
		this.inventoryProperties.combatIconOffset = -32;
		this.inventoryProperties.inventoryIconLarge = 'icon_large.png';
		this.inventoryProperties.inventoryIconCombat = 'icon_combat.png';
		this.inventoryProperties.description = "Your standard everyday shotgun, nothing too special about it.";
		this.inventoryProperties.helper = "80 base damage against enemy";
		
		this.inventoryProperties.tags.push("firearm");
		this.inventoryProperties.equipClasses = ["wspecial"]
		
		this.weaponProperties.baseDamage = 80;
		this.weaponProperties.strengthMultiply = false;
		this.weaponProperties.precisionMultiply = true;
		this.weaponProperties.attackString = "blasted the enemy with a forceful shot from their shotgun."
		this.weaponProperties.attackSounds = ['DSSHOTGN.wav']
	}
}

module.exports = ItemClassifier;
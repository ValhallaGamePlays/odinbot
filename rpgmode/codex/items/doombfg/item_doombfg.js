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
		
		this.inventoryProperties.itemName = "BFG 9000";
		this.inventoryProperties.isWeapon = true;
		this.inventoryProperties.rarity = 6;
		this.inventoryProperties.findChance = 1.25;
		this.inventoryProperties.combatIconOffset = -32;
		this.inventoryProperties.inventoryIconLarge = 'icon_large.png';
		this.inventoryProperties.inventoryIconCombat = 'icon_combat.png';
		this.inventoryProperties.description = "The BFG 9000, or \"Big Fucking Gun\" as it's commonly called. Annihilate some demons.";
		this.inventoryProperties.helper = "400 base damage against enemy";
		
		this.inventoryProperties.tags.push("firearm");
		this.inventoryProperties.equipClasses = ["wspecial"]
		
		this.weaponProperties.baseDamage = 400;
		this.weaponProperties.strengthMultiply = false;
		this.weaponProperties.precisionMultiply = true;
		this.weaponProperties.attackString = "let the BFG 9000's power loose on the enemy!"
		this.weaponProperties.attackSounds = ['DSBFG.wav']
	}
}

module.exports = ItemClassifier;
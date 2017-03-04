// WOW, TURN YOURSELF INTO A NAZI!

const IC = require('../ItemCore.js');

class ItemClassifier 
{
	constructor() 
	{
		// INHERIT BASE PROPERTIES FROM THE ITEM CORE
		this.core = new IC();
		this.core.setupBaseProperties(this);
		
		this.inventoryProperties.rarity = 5;
		this.inventoryProperties.description = "A mysterious looking potion...";
		this.inventoryProperties.helper = "Embraces German culture";
		
		// Must be at least awareness level 25 to even remotely be able to find this
		this.inventoryProperties.findChance = 1.25;
		
		// CHANGE PROPERTIES AS NEEDED
		this.inventoryProperties.itemName = "Himmler's German Brew";
		
		this.behavior.canConsume = function(statNumber, message, sim, item, slot){return {allowed:true, msg:""};}
		
		this.behavior.consumed = function(account, message, sim, item, slot, inBattle) {
			account.template.information.character = "nazi";
			
			sim.inventoryManager.itemInSlot(slot,account,true);
			
			if (!inBattle) {return "You drink the potion and...\n\n**HOLY SHIT! You turned into a fucking nazi!**";}
			else {return "drank brew and became a nazi!";}
		}
	}
}

module.exports = ItemClassifier;
const IC = require('../ItemCore.js');

class ItemClassifier 
{
	constructor() 
	{
		// INHERIT BASE PROPERTIES FROM THE ITEM CORE
		this.core = new IC();
		this.core.setupBaseProperties(this);
		
		// CHANGE PROPERTIES AS NEEDED
		this.inventoryProperties.itemName = "Porkalator";
		this.inventoryProperties.description = "A strange golden pig statue.";
		this.inventoryProperties.helper = "Turns enemy into a pig";
		this.inventoryProperties.rarity = 4;
		this.inventoryProperties.findChance = 0.9;
		this.inventoryProperties.tags.push("magical");
		
		this.behavior.canConsume = function(statNumber, message, sim, item, slot){return {allowed:true, msg:""};}
		
		this.behavior.consumed = function(account, message, sim, item, slot, inBattle) {
			if (!inBattle){return "You can only use this item in a battle.";}
			
			sim.inventoryManager.itemInSlot(slot,account,true); 
			
			// FIND THE BATTLE THIS PLAYER IS IN
			var PRT = sim.accountManager.partyByName(account.template.information.party);
			var BTL = sim.monsterManager.getBattle(PRT);
			
			BTL.setupMonster("piggy",true);
			
			return "used a porkalator!";
		}
	}
}

module.exports = ItemClassifier;
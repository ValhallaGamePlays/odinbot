const IC = require('../ItemCore.js');

class ItemClassifier 
{
	constructor() 
	{
		// INHERIT BASE PROPERTIES FROM THE ITEM CORE
		this.core = new IC();
		this.core.setupBaseProperties(this);
		
		// CHANGE PROPERTIES AS NEEDED
		this.inventoryProperties.itemName = "Awareness Buff";
		this.inventoryProperties.description = "A hefty white liquid flask.";
		this.inventoryProperties.rarity = 3;
		this.inventoryProperties.helper = "Permanent +2 awareness";
		this.inventoryProperties.findChance = 1.0;
		
		this.inventoryProperties.tags.push("potion");
		this.inventoryProperties.tags.push("consumable");
		
		this.behavior.canConsume = function(statNumber, message, sim, item, slot){return {allowed:true, msg:""};}
		
		this.behavior.consumed = function(account, message, sim, item, slot, inBattle) {
			var RARE = sim.inventoryManager.slotRarity(slot, account);
			var finalHealth = sim.inventoryManager.healthByRarity(2,2,RARE,3);
			
			account.template.stats.awareness += finalHealth;
			sim.accountManager.saveAccount(account.id);

			sim.inventoryManager.itemInSlot(slot,account,true); 
			
			if (inBattle){return "drank a buff, +"+finalHealth+" awareness!";}
			else{return "You drink from the large white flask, and your **awareness** has been permanently raised by 2 points!";}
		}
	}
}

module.exports = ItemClassifier;
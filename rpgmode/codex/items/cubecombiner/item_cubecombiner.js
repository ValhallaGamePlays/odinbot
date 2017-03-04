const IC = require('../ItemCore.js');
const randomFrom = function(thelength){return Math.floor(Math.random() * thelength);}

class ItemClassifier 
{
	constructor() 
	{
		// INHERIT BASE PROPERTIES FROM THE ITEM CORE
		this.core = new IC();
		this.core.setupBaseProperties(this);
		
		// CHANGE PROPERTIES AS NEEDED
		this.inventoryProperties.itemName = "Cube Mold";
		this.inventoryProperties.description = "This mold looks as if it can hold cubes.";
		this.inventoryProperties.helper = "May be a useful tool.";
		this.inventoryProperties.rarity = 1;
		this.inventoryProperties.findChance = 0.95;
		
		this.behavior.canConsume = function(statNumber, message, sim, item, slot){return {allowed:true, msg:""};}
		
		this.behavior.consumed = function(account, message, sim, item, slot, inBattle) {
			if (inBattle) {return"You can't use this combiner in battle."};
			
			var cubes = [];
			var BPK = account.template.backpack;
			
			for (var l=0; l<BPK.length; l++)
			{
				if (BPK[l].id == "scourgecube" && cubes.length < 3)
				{
					cubes.push(l);
				}
			}
			
			if (cubes.length < 3) {return "You do not have enough parts to use this mold.";}
			
			
			for (var l=0; l<cubes.length; l++) {sim.inventoryManager.itemInSlot(cubes[l],account,true,false,false);}
			
			sim.inventoryManager.itemInSlot(slot,account,true,false,false); 
			sim.inventoryManager.giveItem(account,"scourgeconfiguration");
			
			
			
			return "\n:package: *You put three of your scourge cubes in the mold, and...* **you receive a Scourge Configuration.**";
		}
	}
}

module.exports = ItemClassifier;
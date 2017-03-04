// SLURP SLURP SLURPIN IT UP

const IC = require('../ItemCore.js');

class ItemClassifier 
{
	constructor() 
	{
		// INHERIT BASE PROPERTIES FROM THE ITEM CORE
		this.core = new IC();
		this.core.setupBaseProperties(this);
		
		//--==--==--==--==--==--==--==--==--==--==--==
		// -- CHANGE PROPERTIES AS NEEDED --
		//--==--==--==--==--==--==--==--==--==--==--==
		
		// Set the item name, description, and helper for info
		this.inventoryProperties.itemName = "Town Portal Scroll";
		this.inventoryProperties.description = "An essential scroll for teleportation.";
		this.inventoryProperties.helper = "Transports the party to town";
		this.inventoryProperties.rarity = 1;
		this.inventoryProperties.tags.push("magical");
		
		// Any time the randomizer lands on this item, there is a 10% chance of finding it (not including awareness)
		this.inventoryProperties.findChance = 0.9;
		
		// The function that is called when we try to consume it, returns true or false as well as a message
		this.behavior.canConsume = function(statNumber, message, sim, item, slot)
		{
			// Find the account manager's account by the ID of the author that typed this message
			var AIN = sim.accountManager.fetchListAccount(message.author.id);
			// With that account, find the party he's in
			var PRT = sim.accountManager.partyByName(AIN.template.information.party);
			
			// Is this party in town? Level 0 or below
			if (PRT.dungeonLevel <= 0) {return {allowed:false, msg:"You cannot use this scroll in town."};}
			
			// Figure out if this party is in a battle or not
			var IB = sim.monsterManager.getBattle(PRT);
			if (IB != undefined) {return {allowed:false, msg:"You can't use that scroll in battle!"}}
			
			// If none of these failed, then we can definitely use it
			return {allowed:true, msg:""};
		}
		
		// Called when we actually consume the item
		this.behavior.consumed = function(account, message, sim, item, slot, inBattle) {
			// Remove the item from your inventory
			sim.inventoryManager.itemInSlot(slot,account,true); 
			
			// Find the party of the user that typed the message, we already know the account
			var PRT = sim.accountManager.partyByName(account.template.information.party);
			
			// Set the dungeon level of the party to town (0) and then save the parties to the file
			PRT.dungeonLevel = 0;
			sim.accountManager.writeParties();
			
			// We can't use this in battle so inBattle isn't really used, the bottom one will be shown
			if (inBattle){return "used a scroll, somehow";}
			else{return "You used the scroll, and your party is now in town again! :high_brightness:";}
		}
	}
}

module.exports = ItemClassifier;
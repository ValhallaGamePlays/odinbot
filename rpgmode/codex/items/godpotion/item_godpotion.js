const IC = require('../ItemCore.js');

class ItemClassifier 
{
	constructor() 
	{
		// INHERIT BASE PROPERTIES FROM THE ITEM CORE
		this.core = new IC();
		this.core.setupBaseProperties(this);
		
		this.inventoryProperties.tags.push("potion");
		this.inventoryProperties.tags.push("consumable");
		
		// CHANGE PROPERTIES AS NEEDED
		this.inventoryProperties.itemName = "God's Potion";
		this.inventoryProperties.description = "A sacred and holy amber drink.";
		this.inventoryProperties.rarity = 4;
		this.inventoryProperties.helper = "Revives a dead partymate";
		this.inventoryProperties.findChance = 0.95;
		
		this.behavior.canConsume = function(statNumber, message, sim, item, slot)
		{
			var AR = message.content.split(" ");
			
			if (AR.length < 3) {return {allowed:false, msg:"**You must type in a user to use this on!**"}}
			
			AR.shift();
			AR.shift();
			
			// Find the person to use this item on
			var usrText = AR.join(" ");
			var USR = sim.accountManager.userByText(usrText);
			if (USR == undefined) {return {allowed:false, msg:"**That user doesn't have an account!** If it's a real person, tell them to make one with `!register`."}}
			
			var usrHealth = sim.accountManager.finalStat(sim,USR,"hp");
			if (usrHealth > 0) {return {allowed:false,msg:"**That user is alive and well, no need!**"}}
			
			return {allowed:true, msg:""};
		}
		
		this.behavior.consumed = function(account, message, sim, item, slot, inBattle) {
			
			var AR = message.content.split(" ");
			
			if (AR.length < 3) {return {allowed:false, msg:"**You must type in a user to use this on!**"}}
			
			AR.shift();
			AR.shift();
			
			// Find the person to use this item on
			var usrText = AR.join(" ");
			var USR = sim.accountManager.userByText(usrText);
			if (USR == undefined) {return "**That user doesn't have an account!** If it's a real person, tell them to make one with `!register`."}
			
			// Remove the item from the slot
			sim.inventoryManager.itemInSlot(slot,account,true); 
			var GH = sim.accountManager.giveHealth(USR,500000,true);			// It'll automatically cap this off
			sim.accountManager.saveAccount(USR.id);
			
			if (inBattle){return "revived "+USR.template.information.displayname+"!";}
			else{return ":tada: You pour the holy potion on the remains of the corpse, and **"+USR.template.information.displayname+"** comes back to life!";}
		}
	}
}

module.exports = ItemClassifier;
// WOW, TURN YOURSELF INTO A NAZI!

const IC = require('../ItemCore.js');

class ItemClassifier 
{
	constructor() 
	{
		// INHERIT BASE PROPERTIES FROM THE ITEM CORE
		this.core = new IC();
		this.core.setupBaseProperties(this);
		
		this.inventoryProperties.rarity = 7;
		this.inventoryProperties.description = "Filled with Cleetus' fresh skoal dip";
		this.inventoryProperties.helper = "Drink it and git r dun, brother";
		
		// Must be at least awareness level 25 to even remotely be able to find this
		this.inventoryProperties.findChance = 1.35;
		
		// CHANGE PROPERTIES AS NEEDED
		this.inventoryProperties.itemName = "Dip Juice";
		
		this.behavior.canConsume = function(statNumber, message, sim, item, slot){return {allowed:true, msg:""};}
		
		this.behavior.consumed = function(account, message, sim, item, slot, inBattle) {
			account.template.information.character = "redneck";
			
			sim.inventoryManager.itemInSlot(slot,account,true);
			
			if (!inBattle) {return "You drink the raunchy dip juice and...\n\n:flag_us: **YEEHAW BOY, GIT R DUN!** :flag_us:\n\n*AFTER DRINKIN THAT SKO JUICE, YOU WENT OUT ON SUNDEE FOR A DAY OF MUDDIN WITH THE BOYS. YOU REALIZED THAT YOU AIN'T NO CITY SLICKER NO MORE, YOU'S A RADNECK AND YOU NEED TA SMASH THEM WASPERS ON YER WINDER! YEEEEEHAW*\n\n**GIT R DUN**";}
			else {return "drank dip juice and went muddin!";}
		}
	}
}

module.exports = ItemClassifier;
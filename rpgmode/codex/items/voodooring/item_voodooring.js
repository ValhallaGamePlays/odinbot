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
		this.behavior.canConsume = function(statNumber, message, sim, item, slot){return {allowed:false, msg:"**Use the voodoo ring in battle.** *The ring will suck life out of the enemy and give health to all players*"};}
		
		this.inventoryProperties.itemName = "Voodoo Ring";
		this.inventoryProperties.isWeapon = true;
		this.inventoryProperties.findChance = 5000;
		this.inventoryProperties.sellPrice = 200;
		this.inventoryProperties.buyPrice = 400;
		this.inventoryProperties.tags.push("traderomit");
		this.inventoryProperties.rarity = 1;
		this.inventoryProperties.description = "A strange ring with a crudely painted skull on it. Has magical power.";
		this.inventoryProperties.helper = "Sucks life and gives it to party";
		
		this.weaponProperties.baseDamage = 5;
		this.weaponProperties.baseDamageMax = 100;

		this.weaponProperties.wisdomMultiply = true;
		this.weaponProperties.attackString = "cast a voodoo spell on the monster, healing everyone."
		this.weaponProperties.attackSounds = ['CONE3.wav']
		
		this.behavior.attack = function(account, sim, item, monster)
		{
			var DMG = item.behavior.calculateDamage(account,sim,item,monster);

			// Redistribute the health between players
			var BM = monster.battle.battleMembers;
			var distribute = 5;
			
			var indicator = {damage:DMG};
			var takeDam = monster.takeDamage(sim, account, indicator);
			
			indicator.damage = takeDam;
			
			for (var l=0; l<BM.length; l++)
			{
				sim.accountManager.giveHealth(BM[l].account,distribute,false);
			}
			
			return {indicator: indicator, msg:item.weaponProperties.attackString};
		}
	}
}

module.exports = ItemClassifier;
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
		this.behavior.canConsume = function(statNumber, message, sim, item, slot){return {allowed:false, msg:"**Use the shrunken head in battle.** *The head will suck life out of the enemy and partially redistribute it to all available party members. Amplified by the power of `Scourge Cubes`.*"};}
		
		this.inventoryProperties.itemName = "Shrunken Head";
		this.inventoryProperties.isWeapon = true;
		this.inventoryProperties.findChance = 1.10;
		this.inventoryProperties.rarity = 4;
		this.inventoryProperties.description = "A cursed head, imbued with voodoo";
		this.inventoryProperties.helper = "Sucks life and gives it to party - +50 dmg per scourge";
		this.inventoryProperties.tags.push("magical");
		
		this.weaponProperties.baseDamage = 20;
		this.weaponProperties.baseDamageMax = 200;
		this.weaponProperties.strengthMultiply = false;
		this.weaponProperties.wisdomMultiply = true;
		this.weaponProperties.attackString = "sucked life essence and redistributed"
		this.weaponProperties.attackSounds = ['head_1.wav', 'head_2.wav', 'head_3.wav', 'head_4.wav']
		
		this.behavior.attack = function(account, sim, item, monster)
		{
			var DMG = item.behavior.calculateDamage(account,sim,item,monster);
			
			// AMPLIFY BY SCOURGE CUBES
			var cubeCount = sim.inventoryManager.countBackpackItems(account,"scourgecube");
			// For every cube, add an extra 50 damage
			DMG += 50*cubeCount;
			
			var configCount = sim.inventoryManager.countBackpackItems(account,"scourgeconfiguration");
			DMG += 250*configCount;
			
			// Redistribute the health between players
			var BM = monster.battle.battleMembers;
			var distribute = Math.floor((DMG/BM.length) * 0.5);
			
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
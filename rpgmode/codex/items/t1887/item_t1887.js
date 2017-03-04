const AMMO_12G = -1;
const AMMO_SLUG = 0;
const AMMO_FLAME = 1;

const GOLD_HE = 0;
const GOLD_SLUG = 0;
const GOLD_FLAME = 0;

const DMG_SLUG = 200;
const DMG_FLAME = 275;

const SND_12G = 't1887_fire.wav'
const SND_SLUG = 't1887_fire.wav'
const SND_FLAME = 't1887_flame.wav'

const AS_SLUG = "blasted the enemy with 12-gauge slugs rounds!";
const AS_FLAME = "incinerated the enemy with dragon's breath rounds!";

const IC = require('../ItemCore.js');

class ItemClassifier 
{
	constructor() 
	{
		// INHERIT BASE PROPERTIES FROM THE ITEM CORE
		this.core = new IC();
		this.core.setupBaseProperties(this);
		
		// CHANGE PROPERTIES AS NEEDED
		this.behavior.canConsume = function(statNumber, message, sim, item, slot){return {allowed:false, msg:"You can use this shotgun in battle. Different kinds of shells may fit in this."};}
		
		this.inventoryProperties.itemName = "T-1887 Lever-Action Shotgun";
		this.inventoryProperties.isWeapon = true;
		this.inventoryProperties.findChance = 1.02;
		this.inventoryProperties.inventoryIconLarge = 'icon_large.png';
		this.inventoryProperties.inventoryIconCombat = 'icon_combat.png';
		this.inventoryProperties.combatIconOffset = -32;
		this.inventoryProperties.rarity = 2;
		this.inventoryProperties.sellPrice = 500;
		this.inventoryProperties.buyPrice = 1000;
		this.inventoryProperties.description = "The T-1887 \"Terminator\" lever-action shotgun, spin it around like in the movies.";
		this.inventoryProperties.helper = "100 base damage against enemy";
		
		this.inventoryProperties.equipClasses = ["wspecial"];
		
		this.inventoryProperties.tags.push("firearm");
		
		this.weaponProperties.baseDamage = 100;
		this.weaponProperties.strengthMultiply = false;
		this.weaponProperties.precisionMultiply = true;
		this.weaponProperties.attackString = "blasted the enemy with the T-1887 12-gauge!"
		this.weaponProperties.attackSounds = ['t1887_fire.wav']
		
		this.ammoMode = -1;
		
		this.behavior.getAttackSound = function(account, sim, item, slot, battle)
		{
			switch (item.ammoMode)
			{
				case AMMO_FLAME:
				return SND_FLAME;
				break;
				
				case AMMO_SLUG:
				return SND_SLUG;
				break;
				
				default:
				case AMMO_12G:
				return SND_12G;
				break;
			}
		}
		
		// -- USE DIFFERENT GRENADES
		this.behavior.attack = function(account, sim, item, monster)
		{
			// THE BASE DAMAGE
			var TDMG = -1;
			var DMG = 0;
			var MSG = "";
			var GLD = 0;
			
			// -- INCENDIARY GRENADES TAKE PRIORITY --
			if ((account.template.inventory[1].item == "shell_flame" || account.template.inventory[2].item == "shell_flame") && account.template.stats.gold >= GOLD_FLAME)
			{
				item.ammoMode = AMMO_FLAME;
				TDMG = DMG_FLAME;
				MSG = AS_FLAME;
				GLD = GOLD_FLAME;
				
				monster.battle.addModifier(monster,item.dragonBreathModifier,item,"w",true,account);
			}
			
			// -- FLECHETTES
			else if ((account.template.inventory[1].item == "shell_slug" || account.template.inventory[2].item == "shell_slug") && account.template.stats.gold >= GOLD_SLUG)
			{
				item.ammoMode = AMMO_SLUG;
				TDMG = DMG_SLUG;
				MSG = AS_SLUG;
				GLD = GOLD_SLUG;
			}
			
			// -- HIGH-EXPLOSIVE
			else
			{
				item.ammoMode = AMMO_12G;
				TDMG = item.weaponProperties.baseDamage;
				MSG = item.weaponProperties.attackString;
			}
			
			DMG = item.behavior.calculateDamage(account,sim,item,monster,TDMG,TDMG);
			
			var indicator = {damage:DMG};
			var takeDam = monster.takeDamage(sim, account, indicator);
			
			indicator.damage = takeDam;
			
			if (GLD > 0)
			{
				account.template.stats.gold -= GLD;
				sim.accountManager.saveAccount(account.id);
			}
			
			return {indicator: indicator, msg:MSG};
		}
		
		// --== B A T T L E   M O D I F I E R S ==--
		this.dragonBreathModifier = 
		{
				buffIcon:'monsterbuff.png',
				buffName:"Dragon's Breath",
				maxTurns:3,
				currentTurn:0,		// Dynamically changed
				statBoosters:[],	
				canStack:false,
				
				// HAPPENS WHEN WE APPLY THE ITEM, JUST IN CASE
				// IN THIS CASE, "MEMBER" IS THE MONSTER WE'RE APPLYING IT TO
				applied: function(sim,item,slot,member,mod) {},
				
				// EVERY TIME THIS MODIFIER IS CALLED
				// NOTE: MEMBER IS THE MONSTER
				executor: function(sim,item,slot,member,mod) {
					// -- 5 FLAME DAMAGE PER PRECISION
					var FLMD = 25 + (5*sim.accountManager.finalStat(sim,mod.creator,"precision"));
					
					member.information.health -= FLMD;
					
					return {allowed:true, msg:"-"+FLMD+" HP",color:"#ffb400"};
				},
				
				// WHEN THE MODIFIER WEARS OFF
				wearOff: function(sim,item,slot,member,mod) {
					member.battle.removeModifier(member,mod,true);
					return true;
				}
		}
	}
}

module.exports = ItemClassifier;
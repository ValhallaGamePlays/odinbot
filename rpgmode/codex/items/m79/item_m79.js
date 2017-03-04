// M79 GRENADE LAUNCHER

const IC = require('../ItemCore.js');

const AMMO_HE = -1;
const AMMO_FLAME = 0;
const AMMO_FLECHETTE = 1;
const AMMO_BUCKSHOT = 2;

const GOLD_HE = 0;
const GOLD_FLAME = 0;
const GOLD_FLECHETTE = 0;
const GOLD_BUCKSHOT = 0;

const DMG_FLAME = 400;
const DMG_FLECHETTE = 350;
const DMG_BUCKSHOT = 300;

const SND_HE = 'm79_fire.wav'
const SND_FLAME = 'm79_fire_flame.wav'
const SND_FLECHETTE = 'm79_fire_nails.wav'
const SND_BUCKSHOT = 'm79_fire_shell.wav'

const AS_FLAME = "thumped an incendiary 40mm grenade at the enemy!";
const AS_FLECHETTE = "blew open a 40mm flechette nade!";
const AS_BUCKSHOT = "released the contents of a 40mm beehive round!";

class ItemClassifier 
{
	constructor() 
	{
		// INHERIT BASE PROPERTIES FROM THE ITEM CORE
		this.core = new IC();
		this.core.setupBaseProperties(this);
		
		// CHANGE PROPERTIES AS NEEDED
		this.behavior.canConsume = function(statNumber, message, sim, item, slot){return {allowed:false, msg:"Use the M79 grenade launcher to blow up your enemies."};}
		
		this.inventoryProperties.itemName = "M79 Grenade Launcher";
		this.inventoryProperties.isWeapon = true;
		this.inventoryProperties.findChance = 0.995;
		this.inventoryProperties.inventoryIconLarge = 'icon_large.png';
		this.inventoryProperties.inventoryIconCombat = 'icon_combat.png';
		this.inventoryProperties.combatIconOffset = -32;
		this.inventoryProperties.rarity = 3;
		this.inventoryProperties.sellPrice = 1000;
		this.inventoryProperties.buyPrice = 2000;
		this.inventoryProperties.description = "The M79 \"Thumper\" grenade launcher shoots 40mm grenades. Perfect for area damage.";
		this.inventoryProperties.helper = "250 base damage against enemy";
		
		this.inventoryProperties.equipClasses = ["wspecial"];
		
		this.inventoryProperties.tags.push("firearm");
		
		this.weaponProperties.baseDamage = 250;
		this.weaponProperties.strengthMultiply = false;
		this.weaponProperties.precisionMultiply = true;
		this.weaponProperties.attackString = "thumped an explosive 40mm grenade at the enemy!"
		this.weaponProperties.attackSounds = ['m79_fire.wav']
		
		this.ammoMode = -1;
		
		this.behavior.getAttackSound = function(account, sim, item, slot, battle)
		{
			switch (item.ammoMode)
			{
				case AMMO_FLAME:
				return SND_FLAME;
				break;
				
				case AMMO_FLECHETTE:
				return SND_FLECHETTE;
				break;
				
				case AMMO_BUCKSHOT:
				return SND_BUCKSHOT;
				break;
				
				default:
				case AMMO_HE:
				return SND_HE;
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
			if ((account.template.inventory[1].item == "40mm_flame" || account.template.inventory[2].item == "40mm_flame") && account.template.stats.gold >= GOLD_FLAME)
			{
				item.ammoMode = AMMO_FLAME;
				TDMG = DMG_FLAME;
				MSG = AS_FLAME;
				GLD = GOLD_FLAME;
				
				monster.battle.addModifier(monster,item.dragonBreathModifier,item,"w",true,account);
			}
			
			// -- FLECHETTES
			else if ((account.template.inventory[1].item == "40mm_nails" || account.template.inventory[2].item == "40mm_nails") && account.template.stats.gold >= GOLD_FLECHETTE)
			{
				item.ammoMode = AMMO_FLECHETTE;
				TDMG = DMG_FLECHETTE;
				MSG = AS_FLECHETTE;
				GLD = GOLD_FLECHETTE;
			}
			
			// -- BUCKSHOT
			else if ((account.template.inventory[1].item == "40mm_shell" || account.template.inventory[2].item == "40mm_shell") && account.template.stats.gold >= GOLD_BUCKSHOT)
			{
				item.ammoMode = AMMO_BUCKSHOT;
				TDMG = DMG_BUCKSHOT;
				MSG = AS_BUCKSHOT;
				GLD = GOLD_BUCKSHOT;
			}
			
			// -- HIGH-EXPLOSIVE
			else
			{
				item.ammoMode = AMMO_HE;
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
		},
		
		// --== B A T T L E   M O D I F I E R S ==--
		this.dragonBreathModifier = 
		{
				buffIcon:'monsterbuff.png',
				buffName:"Incendiary",
				maxTurns:6,
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
					var FLMD = 45 + (10*sim.accountManager.finalStat(sim,mod.creator,"precision"));
					
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
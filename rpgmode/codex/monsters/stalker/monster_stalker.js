const IC = require('../MonsterCore.js');

class MonsterClassifier 
{
	constructor() 
	{
		// INHERIT BASE PROPERTIES FROM THE ITEM CORE
		this.core = new IC();
		this.core.setupBaseProperties(this);
		
		this.information.names = ["Stalker"];
		this.information.baseMaxHealth = 150;
		this.information.baseXP = 100;
		
		this.information.codexBio = "The common stalker is a reptilian creature who lurks in the murky pools of the dungeon's swamp muck. It varies from other creatures in the sense that it is able to dive under the water and prevent itself from being hurt.\n\nWhen encountering a stalker, strike when the time is right and use the downtime to use items. Beware the stalker's vicious slash, as it can down a party member quickly."
		
		this.audios.sight = ['stalker_sight.wav'];
		
		// -- DAMAGES
		this.baseDamage_smack = 10;
		
		this.images = {
			dive: ['stalker_dive.png'],
			lurk: ['stalker_lurk.png'],
			slash: ['stalker_slash.png'],
			death: ['stalker_die.png'],
			idle: ['stalker_idle.png'],
			sight: ['stalker_sight.png']
		}
		
		this.information.floorOverride = {img:'floor_swampwater.png',onBoss:true};
		
		this.sound_emerge = 'stalker_surface.wav';
		this.sound_lurk = 'stalker_lurk.wav';
		this.sound_dive = 'stalker_dive.wav';
		this.sound_slash = 'stalker_swipe.wav';
		this.sound_death = 'stalker_death.wav';
		
		// Keep the original loot table, but add stalker head to it
		this.information.lootTable.push( {item:"stalkerhead",chance:0.75} );
		
		// STALKER-SPECIFIC
		this.lurking = false;
		
		// -- OVERRIDE THE DAMAGE THAT WE TAKE IF WE'RE LURKING --
		this.takeDamage = function(sim, account, inflicted)
		{
			// Lurking? Don't take any damage at all, we're invincible
			if (this.lurking) {return 0;}
			
			// We're above the surface, so take damage (copied from default behavior)
			else
			{
				this.information.health -= inflicted.damage;
				this.lastInflicted = inflicted;
				
				this.behavior.onPain(this,sim,account,inflicted);
				
				return inflicted.damage;
			}
		}
		
		// ALL OF THE MONSTER'S MOVES
		this.moves = [
		
			// -- EMERGE AND SLASH A PLAYER --
			{
				name: "Slash",
				processor: function(monster,sim,members,target,battle)
				{
					var MSG1 = "MONSTER emerges and claws PLAYER...";
					var MSG2 = "and scarred their skin for DAMAGE damage!";
					var DMG = monster.baseDamage_smack;
					var IMG = monster.randomized(monster.images.slash);
					var SND = monster.sound_slash;
					
					// We're not lurking anymore
					monster.lurking = false;
					
					return monster.genericAttack(monster,sim,members,target,battle,MSG1,MSG2,DMG,IMG,SND);
				},
				
				allowed: function(monster,sim,members,target,battle) {return monster.lurking}
			},
			
			// -- DIVE INTO THE WATER AND START LURKING
			{
				name: "Dive",
				processor: function(monster,sim,members,target,battle)
				{
					var MSG1 = "MONSTER dives back into the water";
					var MSG2 = "and begins lurking in the deep...";
					var IMG = monster.randomized(monster.images.dive);
					var SND = monster.sound_dive;
					
					// We're lurking now
					monster.lurking = true;
					
					return monster.genericAttack(monster,sim,members,target,battle,MSG1,MSG2,0,IMG,SND);
				},
				
				// Only allow diving into the water if we're not lurking already
				allowed: function(monster,sim,members,target,battle) {return !monster.lurking && Math.random(1) >= 0.5}
			},
			
			// -- LURK AROUND
			{
				name: "Lurk",
				processor: function(monster,sim,members,target,battle)
				{
					var MSG1 = "MONSTER lurks in the murky water,";
					var MSG2 = "striking at any moment...";
					var IMG = monster.randomized(monster.images.lurk);
					var SND = monster.sound_lurk;
					
					return monster.genericAttack(monster,sim,members,target,battle,MSG1,MSG2,0,IMG,SND);
				},
				allowed: function(monster,sim,members,target,battle) {return monster.lurking;}
			},
			
			// -- DON'T DO ANYTHING
			{
				name: "Idle",
				processor: function(monster,sim,members,target,battle)
				{
					var MSG1 = "MONSTER rests above the surface,";
					var MSG2 = "deciding what to do...";
					var IMG = monster.randomized(monster.images.idle);

					return monster.genericAttack(monster,sim,members,target,battle,MSG1,MSG2,0,IMG,undefined);
				},
				
				// 75% chance to skip this move, don't do it that often at all (Plus we can't be lurking)
				allowed: function(monster,sim,members,target,battle) {return !monster.lurking && Math.random(1) >= 0.75;}
			}
		]
		
		this.behavior.onDeath = function(monster, sim)
		{
			monster.setImage(sim,monster.randomized(monster.images.death));
			return {allowed:true, msg:["The stalker falls dead, into the water!"], sound:monster.sound_death};
		}
	}
}

module.exports = MonsterClassifier;
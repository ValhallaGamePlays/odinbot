const IC = require('../MonsterCore.js');

class MonsterClassifier 
{
	constructor() 
	{
		// INHERIT BASE PROPERTIES FROM THE ITEM CORE
		this.core = new IC();
		this.core.setupBaseProperties(this);
		
		var beachSetup = require('../shortcutBeach.js')(this);
		
		this.information.names = ["Tropical Pig"];
		this.information.baseMaxHealth = 100;
		this.information.baseXP = 50;
		
		this.audios.sight = ['PIGRG.wav'];
		
		// -- DAMAGES
		this.baseDamage_gun = 35;
		
		this.images = {
			lay: ['beachpig_lay.png'],
			shoot: ['beachpig_fire.png'],
			layshoot: ['beachpig_layfire.png'],
			death: ['beachpig_die.png'],
			idle: ['beachpig_idle.png'],
			sight: ['beachpig_sight.png']
		}

		this.information.codexBio = "Even the members of the L.A.R.D. have to take a vacation every once in a while. The tropical pigs are harmless while they're having fun in the sun, but will quickly pull out their shotgun if disturbed. The pigs are also able to lie down in the harsh sand, taking half damage.\n\nTropical pigs may be a marginal threat, but at least you can slaughter them to Hawaiian tunes!"
		
		this.sound_lay = 'PIGPN.wav';
		this.sound_idle = 'PIGRM.wav';
		this.sound_shotgun = 'SHOTGUN7.wav';
		this.sound_death = 'PIGDY.wav';
		
		// STALKER-SPECIFIC
		this.lying = false;
		
		// -- OVERRIDE THE DAMAGE THAT WE TAKE IF WE'RE LURKING --
		this.takeDamage = function(sim, account, inflicted)
		{
			var ID = inflicted.damage;
			if (this.lying) {ID = Math.floor(ID*0.5);}
			
			this.information.health -= ID;
			this.lastInflicted = inflicted;
			
			this.behavior.onPain(this,sim,account,inflicted);
			
			return ID;
		}
		
		// ALL OF THE MONSTER'S MOVES
		this.moves = [
		
			// -- SHOOT A PLAYER --
			{
				name: "Shotgun Blast",
				processor: function(monster,sim,members,target,battle)
				{
					var MSG1 = "MONSTER takes steady aim at PLAYER...";
					var MSG2 = "and blasts them for DAMAGE damage!";
					var DMG = monster.baseDamage_gun;
					var SND = monster.sound_shotgun;
					var IMG = undefined;
					
					if (monster.lying) {IMG = monster.randomized(monster.images.layshoot);}
					else {IMG = monster.randomized(monster.images.shoot);}
					
					return monster.genericAttack(monster,sim,members,target,battle,MSG1,MSG2,DMG,IMG,SND);
				},
				
				allowed: function(monster,sim,members,target,battle) {return Math.random(1) >= 0.5}
			},
			
			// -- GET THE FUCK DOWN
			{
				name: "Lie Down",
				processor: function(monster,sim,members,target,battle)
				{
					var MSG1 = "MONSTER gets down onto the sandy";
					var MSG2 = "and lies on its stomach...";
					var IMG = monster.randomized(monster.images.lay);
					var SND = monster.sound_lay;
					
					// We're lying now
					monster.lying = true;
					
					return monster.genericAttack(monster,sim,members,target,battle,MSG1,MSG2,0,IMG,SND);
				},
				
				// Only allow lying if we're standing up
				allowed: function(monster,sim,members,target,battle) {return !monster.lying}
			},
			
			// -- DO NOTHING
			{
				name: "Idle",
				processor: function(monster,sim,members,target,battle)
				{
					var MSG1 = "MONSTER waits around for a moment,";
					var MSG2 = "deciding what to do...";
					var IMG = undefined;
					var SND = monster.sound_idle;
					
					if (monster.lying) {IMG = monster.randomized(monster.images.lay);}
					else {IMG = monster.randomized(monster.images.idle);}
					
					return monster.genericAttack(monster,sim,members,target,battle,MSG1,MSG2,0,IMG,SND);
				},
				allowed: function(monster,sim,members,target,battle) {return Math.random(1) >= 0.75;}
			},
			
			// -- DON'T DO ANYTHING
			{
				name: "Stand Up",
				processor: function(monster,sim,members,target,battle)
				{
					var MSG1 = "MONSTER gets up on its feet,";
					var MSG2 = "ready to walk again.";
					var IMG = monster.randomized(monster.images.idle);

					monster.lying = false;
					
					return monster.genericAttack(monster,sim,members,target,battle,MSG1,MSG2,0,IMG,undefined);
				},
				

				allowed: function(monster,sim,members,target,battle) {return monster.lying && Math.random(1) >= 0.5}
			}
		]
		
		this.behavior.onDeath = function(monster, sim)
		{
			monster.setImage(sim,monster.randomized(monster.images.death));
			return {allowed:true, msg:["The piggy falls dead, into the sand!"], sound:monster.sound_death};
		}
	}
}

module.exports = MonsterClassifier;
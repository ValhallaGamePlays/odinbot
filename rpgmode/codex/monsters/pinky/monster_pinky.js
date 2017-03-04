const IC = require('../MonsterCore.js');

class MonsterClassifier 
{
	constructor() 
	{
		// INHERIT BASE PROPERTIES FROM THE ITEM CORE
		this.core = new IC();
		this.core.setupBaseProperties(this);
		
		this.information.names = ["Pinky"];
		this.information.baseMaxHealth = 50;
		this.information.baseXP = 35;
		
		this.information.codexBio = "Named \"Pinkies\" due to their pink skin tone. Nobody is quite sure how the pinky demons found themselves in the depths of the dungeon, although they can be found very commonly in the upper levels.\n\nPinkies are not often a threat and should rarely ever be taken as such. Although their mandibles may deliver a powerful bite, it takes more than several to down a party member."
		
		this.audios.sight = ['DSSGTSIT.wav'];
		
		// -- DAMAGES
		this.baseDamage_bite = 5;
		
		this.images = {
			bite: ['demonbite.png'],
			death: ['demondie.png'],
			idle: ['demonidle.png'],
			sight: ['demonsight.png']
		}
		
		this.sound_bite = 'DSSGTATK.wav';
		this.sound_death = 'DSSGTDTH.wav';
		
		// ALL OF THE MONSTER'S MOVES
		this.moves = [
		
			//-- SMACK --
			{
				name: "Bite",
				processor: function(monster,sim,members,target,battle)
				{
					var MSG1 = "MONSTER chomped on PLAYER...";
					var MSG2 = "and took a bite worth DAMAGE damage!";
					var DMG = monster.baseDamage_bite;
					var IMG = monster.randomized(monster.images.bite);
					var SND = monster.sound_bite;
					
					return monster.genericAttack(monster,sim,members,target,battle,MSG1,MSG2,DMG,IMG,SND);
				},
				allowed: function(monster,sim,members,target,battle) {return true;}
			},
			
			//-- IDLE --
			{
				name: "Idling",
				processor: function(monster,sim,members,target,battle)
				{
					var MSG1 = "MONSTER stood still for a moment";
					var MSG2 = "and did nothing.";
					var IMG = monster.randomized(monster.images.idle);
					
					return monster.genericAttack(monster,sim,members,target,battle,MSG1,MSG2,0,IMG,undefined);
				},
				allowed: function(monster,sim,members,target,battle) {return Math.random(1) >= 0.5}
			}
		]
		
		this.behavior.onDeath = function(monster, sim)
		{
			monster.setImage(sim,monster.randomized(monster.images.death));
			return {allowed:true, msg:["The pinky falls backwards onto the ground, dead!"], sound:monster.sound_death};
		}
	}
}

module.exports = MonsterClassifier;
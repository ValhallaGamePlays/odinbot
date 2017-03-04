const IC = require('../MonsterCore.js');

class MonsterClassifier 
{
	constructor() 
	{
		// INHERIT BASE PROPERTIES FROM THE ITEM CORE
		this.core = new IC();
		this.core.setupBaseProperties(this);
		
		this.information.names = ["Training Dummy"];
		this.information.baseMaxHealth = 100000;
		this.information.baseXP = 0;
		this.information.codexBio = "You fucking OP piece of shit bastard how did you kill one of these?"
		
		this.audios.sight = ['silence.wav'];

		this.images = {
			death: ['dummy.png'],
			idle: ['dummy.png'],
			sight: ['dummy.png']
		}
		
		this.sound_death = 'silence.wav';
		this.sound_grunt = 'silence.wav';
		
		// ALL OF THE MONSTER'S MOVES
		this.moves = [
		
			//-- SMACK --
			{
				name: "Stand",
				processor: function(monster,sim,members,target,battle)
				{
					var MSG1 = "MONSTER didn't do anything,";
					var MSG2 = "test your debug stuff.";
					
					var MSG = [];
					MSG.push(monster.replaceIt(MSG1,sim,monster,target,0));
					MSG.push(monster.replaceIt(MSG2,sim,monster,target,0));
					
					monster.setImage(sim,monster.images.idle[0]);
					
					return {allowed:true, msg:MSG, damage:0, sound:undefined};
				},
				allowed: function(monster,sim,members,target,battle) {return true;}
			}
		]
		
		this.behavior.onDeath = function(monster, sim)
		{
			monster.setImage(sim,monster.randomized(monster.images.death));
			return {allowed:true, msg:["WHAT IN TARNATION???"], sound:undefined};
		}
	}
}

module.exports = MonsterClassifier;
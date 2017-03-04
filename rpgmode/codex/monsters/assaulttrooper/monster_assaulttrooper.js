const IC = require('../MonsterCore.js');

const setupAssault = function(mon)
{
	// INHERIT BASE PROPERTIES FROM THE ITEM CORE
	mon.core = new IC();
	mon.core.setupBaseProperties(mon);
	
	mon.information.names = ["Assault Trooper"];
	mon.information.baseMaxHealth = 50;
	mon.information.baseXP = 35;
	
	mon.audios.sight = ['trooper_pn.wav'];
	
	// -- DAMAGES
	mon.baseDamage_gun = 20;
	mon.baseDamage_gun = 30;
	
	mon.images = {
		hover: ['trooper_hover.png'],
		shoot: ['trooper_fire.png'],
		snapshot: ['trooper_snapshot.png'],
		hovershoot: ['trooper_hovershot.png'],
		death: ['trooper_die.png'],
		gib: ['trooper_gib.png'],
		choke: ['trooper_choke.png'],
		idle: ['trooper_idle.png'],
		sight: ['trooper_sight.png']
	}
	

	mon.information.codexBio = "Stealing babes is hard work, but mindless for assault trooper fodder. In groups, they can be quite a threat. Even alone, one should beware.\n\nThe assault trooper is equipped with a jetpack which it uses to hover and fly great distances. It also carries around a blaster pistol which shoots a scorching hot blast. Assault troopers have a powerful will, and may not die as easily as other monsters."

	mon.sound_hover = 'trooper_jetpack.wav';
	mon.audios.idle = ['trooper_roam.wav','trooper_roam2.wav','trooper_roam3.wav'];
	mon.sound_blaster = 'trooper_blast.wav';
	mon.sound_death = 'trooper_die.wav';
	mon.sound_choke = 'trooper_choke.wav';
	mon.sound_gib = 'trooper_gib.wav';
	
	// USING JETPACK?
	mon.hovering = false;
	
	// -- OVERRIDE THE DAMAGE THAT WE TAKE IF WE'RE LURKING --
	mon.takeDamage = function(sim, account, inflicted)
	{
		var ID = inflicted.damage;
		if (mon.hovering) {ID = Math.floor(ID*0.5);}
		
		mon.information.health -= ID;
		mon.lastInflicted = inflicted;
		
		mon.behavior.onPain(mon,sim,account,inflicted);
		
		return ID;
	}
	
	// ALL OF THE MONSTER'S MOVES
	mon.moves = [
	
		// -- SHOOT A PLAYER --
		{
			name: "Blaster Shot",
			processor: function(monster,sim,members,target,battle)
			{
				var MSG1 = "MONSTER takes steady aim at PLAYER...";
				var MSG2 = "and blasts them for DAMAGE damage!";
				var DMG = monster.baseDamage_gun;
				var SND = monster.sound_blaster;
				var IMG = undefined;
				
				if (Math.random(1) >= 0.25) {monster.hovering = false;}
				
				if (monster.hovering) {IMG = monster.randomized(monster.images.hovershoot);}
				else {IMG = monster.randomized(monster.images.shoot);}
				
				return monster.genericAttack(monster,sim,members,target,battle,MSG1,MSG2,DMG,IMG,SND);
			},
			
			allowed: function(monster,sim,members,target,battle) {return Math.random(1) >= 0.5 && !monster.choking}
		},
		
		// -- SHOOT A PLAYER --
		{
			name: "Snap Shot",
			processor: function(monster,sim,members,target,battle)
			{
				var MSG1 = "MONSTER prepares a snap shot for PLAYER...";
				var MSG2 = "and blasts them for DAMAGE damage!";
				var DMG = monster.baseDamage_snapshot;
				var SND = monster.sound_blaster;
				var IMG = undefined;
				
				if (Math.random(1) >= 0.25) {monster.hovering = false;}
				
				IMG = monster.randomized(monster.images.snapshot);
				
				return monster.genericAttack(monster,sim,members,target,battle,MSG1,MSG2,DMG,IMG,SND);
			},
			
			allowed: function(monster,sim,members,target,battle) {return Math.random(1) >= 0.5 && !monster.hovering && !monster.choking}
		},
		
		// -- START HOVERING
		{
			name: "Hover",
			processor: function(monster,sim,members,target,battle)
			{
				var MSG1 = "MONSTER turns on its jetpack";
				var MSG2 = "and starts hovering in the air...";
				var IMG = monster.randomized(monster.images.hover);
				var SND = monster.sound_hover;
				
				// We're lying now
				monster.hovering = true;
				
				return monster.genericAttack(monster,sim,members,target,battle,MSG1,MSG2,0,IMG,SND);
			},
			
			// Only allow lying if we're standing up
			allowed: function(monster,sim,members,target,battle) {return !monster.hovering && !monster.choking}
		},
		
		// -- DO NOTHING
		{
			name: "Idle",
			processor: function(monster,sim,members,target,battle)
			{
				var MSG1 = "MONSTER waits around for a moment,";
				var MSG2 = "deciding what to do...";
				var IMG = undefined;
				
				if (Math.random(1) >= 0.25) {monster.hovering = false;}
				
				var SND = monster.randomized(monster.audios.idle);
				if (monster.hovering) {SND = monster.sound_hover}
				
				if (monster.hovering) {IMG = monster.randomized(monster.images.hover);}
				else {IMG = monster.randomized(monster.images.idle);}
				
				return monster.genericAttack(monster,sim,members,target,battle,MSG1,MSG2,0,IMG,SND);
			},
			allowed: function(monster,sim,members,target,battle) {return Math.random(1) >= 0.75 && !monster.choking}
		},
		
		// -- CHOKE
		{
			name: "Choke",
			processor: function(monster,sim,members,target,battle)
			{
				var MSG1 = "MONSTER kneels on the ground,";
				var MSG2 = "choking and bleeding...";
				var IMG = undefined;
				var SND = monster.sound_choke;
				
				IMG = monster.randomized(monster.images.choke);
				
				return monster.genericAttack(monster,sim,members,target,battle,MSG1,MSG2,0,IMG,SND);
			},
			allowed: function(monster,sim,members,target,battle) {return monster.choking}
		}
	]
	
	mon.behavior.onDeath = function(monster, sim)
	{
		if (!monster.choking)
		{
			// 50% chance to choke
			if (Math.random(1) >= 0.5)
			{
				monster.information.health = 1;
				monster.choking = true;
				monster.setImage(sim,monster.randomized(monster.images.choke));
				return {allowed:false, msg:["The trooper is ready to be gibbed"], sound:monster.sound_choke}
			}
			
			// Otherwise, just die
			else
			{
				monster.choking = false;
				monster.setImage(sim,monster.randomized(monster.images.death));
				return {allowed:true, msg:["The trooper falls dead!"], sound:monster.sound_death};
			}
		}
		
		// Are we choking? gib
		else
		{
			monster.choking = false;
			monster.setImage(sim,monster.randomized(monster.images.gib));
			return {allowed:true, msg:["The trooper explodes into giblets!"], sound:monster.sound_gib};
		}
	}
}

class MonsterClassifier 
{
	constructor() {setupAssault(this);}
}

module.exports = MonsterClassifier;
module.exports.setupAssault = setupAssault;
//--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==
// THE FINAL BOSS FOR THE RPG SIMULATOR
//--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==

const IC = require('../MonsterCore.js');

class MonsterClassifier 
{
	constructor() 
	{
		// INHERIT BASE PROPERTIES FROM THE ITEM CORE
		this.core = new IC();
		this.core.setupBaseProperties(this);
		
		this.stageTwoMusic = 'monkey.mp3';
		
		// -- BASIC INFORMATION --
		this.information.names = ["Mancubus Horrors"];
		//this.information.baseMaxHealth = 2000;
		this.information.baseMaxHealth = 2000;
		this.information.baseXP = 100000;
		this.information.musicTracks = ['abyss.mp3'];
		this.information.bossTracks = ['abyss.mp3'];
		this.information.bossMonster = true;
		this.information.verticalOffset = -28;
		this.information.sizeAdder = 24;
		this.audios.sight = ['boss_sighted.wav'];
		this.information.codexPicture = 'necro_duality.png';
		this.information.floorOverride = {img:'finalbossfloor.png',onBoss:true};
		this.information.spawnMessage = "Entering the large chamber, you look up in awe as the almighty STEREOTYPICAL NAME stares down ominously from his pedestal!";
		// this.information.backgroundOverride = {img:'beach.png',onBoss:true};
		
		// -- FALLBACK INFORMATION FOR TRANSFORMATIONS
		this.sorcerorBaseHealth = 10000;
		this.sorcerorHealth = this.sorcerorBaseHealth;
		this.sorcerorNames = ["Nigger Beheader"];			// TODO: DECIDE ON AN ACTUAL NAME
		this.impBaseHealth = 500;
		this.impNames = ["Muckfiend Duo"];
		this.summoned = true;
		this.mancubusStage = true;
		this.impStage = false;
		
		// -- PLAYER TRANSFORMATIONS
		this.transformer = -1;
		this.playerTransforms = [
			{
				painimage:'trans_fighter_pain.png',
				idleimage:'trans_fighter_idle.png',
				transformimage:'trans_fighter.png',
				name:"Fighter",
				painsound:'trans_fighterpain.wav'
			},
			
			{
				painimage:'trans_mage_pain.png',
				idleimage:'trans_mage_idle.png',
				transformimage:'trans_mage.png',
				name:"Mage",
				painsound:'trans_magepain.wav'
			},
			
			{
				painimage:'trans_cleric_pain.png',
				idleimage:'trans_cleric_idle.png',
				transformimage:'trans_cleric.png',
				name:"Cleric",
				painsound:'trans_clericpain.wav'
			}
		];
		
		this.playerTransformHealth = 100;
		
		// -- DAMAGES FOR DIFFERENT THINGS
		this.damageScaling = 0.5;
		this.baseDamage_duality = 500;
		this.baseDamage_flamewall = 1000;
		this.baseDamage_flamewall_shared = 200;
		this.baseDamage_greenflame = 500;
		this.baseDamage_iceblast = 300;
		this.baseDamage_lightning = 1000;
		this.baseDamage_selfheal = 500;
		this.baseDamage_selfhealMax = 1000;
		this.baseDamage_shieldbreak = 100;
		this.fatDamage_fire = 500;
		this.fatDamage_both = 1000;
		this.impDamage_fire = 250;
		this.impDamage_both = 500;
		
		// -- ALL THE DIFFERENT BOSS IMAGES WE CAN USE
		this.bossImages = {
			sight: ['necro_duality.png'],
			flamewall: ['necro_flamewall.png'],
			duality: ['necro_duality.png'],
			death: ['necro_finaldeath.png'],
			greenflame: ['necro_greenflame.png'],
			iceblast: ['necro_iceblast.png'],
			lightning: ['necro_lightning.png'],
			selfheal: ['necro_selfheal.png'],
			shieldbreak: ['necro_si_break.png']
		}
		
		this.bossAudios = {
			flamewall: ['boss_flamewall.wav'],
			duality: ['boss_transform.wav'],
			death: ['boss_killed.wav'],
			greenflame: ['boss_greenvoodoo.wav'],
			iceblast: ['boss_iceshards.wav'],
			lightning: ['boss_lightning.wav'],
			selfheal: ['boss_selfheal.wav'],
			shieldbreak: ['boss_breakshield.wav']
		}
		
		// -- START AS FATSO, SO USE THESE IMAGES
		this.images = {
			death: ['necro_si_died.png'],
			idle: ['necro_si_idle.png'],
			sight: ['necro_si_idle.png'],
			shootleft: ['necro_si_leftfire.png'],
			shootright: ['necro_si_rightfire.png'],
			shootboth: ['necro_si_fireboth.png']
		}
		
		this.fatsoAudios = {
			death: ['fatso_dead.wav'],
			shootboth: ['fatso_dualfire.wav'],
			shoot: ['fatso_singlefire.wav', 'fatso_singlefire2.wav'],
			idle: ['fatso_idle.wav']
		}
		
		// -- USE THESE WHEN WE SUMMON THE IMPS
		this.impImages = {
			death: ['necro_ls_dead.png'],
			idle: ['necro_ls_idle.png'],
			sight: ['necro_ls_summon.png'],
			shootleft: ['necro_ls_fireleft.png'],
			shootright: ['necro_ls_fireright.png'],
			shootboth: ['necro_ls_fireboth.png']
		}
		
		this.impAudios = {
			summon: ['boss_summonimp.wav'],
			death: ['imps_die1.wav', 'imps_die2.wav'],
			shootboth: ['imps_dualfire.wav'],
			shoot: ['imps_fire1.wav', 'imps_fire2.wav'],
			idle: ['imps_idle1.wav', 'imps_idle2.wav']
		}

		this.information.codexBio = "Holy fucking shit it's the final boss"
		
		// -- OVERRIDE THE DAMAGE THAT WE TAKE IF WE'RE LURKING --
		this.takeDamage = function(sim, account, inflicted)
		{
			var ID = inflicted.damage;
			
			if (this.transformer != -1)
			{
				sim.accountManager.takeHealth(account,Math.floor(ID),true,true,this);
				return -ID;
			}
			
			this.information.health -= ID;
			this.lastInflicted = inflicted;
			
			this.behavior.onPain(this,sim,account,inflicted);
			
			return ID;
		}
		
		//--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==
		//
		// W E   A R E   T R A N S F O R M E D   I N T O   A   P L A Y E R
		//
		//--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==
		
		this.playerMoves = [			
			// -- DO NOTHING, *VERY* SMALL CHANCE --
			{
				name: "Player Pain",
				processor: function(monster,sim,members,target,battle)
				{
					var MSG1 = "MONSTER shudders in fear,";
					var MSG2 = "being puppeteered by mysterious forces";
					var SND = monster.playerTransforms[monster.transformer].painsound;
					var IMG = monster.playerTransforms[monster.transformer].painimage;

					return monster.genericAttack(monster,sim,members,target,battle,MSG1,MSG2,0,IMG,SND);
				},
				
				allowed: function(monster,sim,members,target,battle) {return true;}
			},
			
			// -- TRANSFORM BACK INTO THE NORMAL BOSS
			{
				name: "Boss Transform",
				processor: function(monster,sim,members,target,battle)
				{
					var MSG1 = "MONSTER transforms back into his original form,";
					var MSG2 = "shedding his fake skin behind.";
					var SND = monster.bossAudios.duality;
					var IMG = monster.randomized(monster.bossImages.duality);
					
					monster.transformer = -1;
					monster.moves = monster.bossMoves;
					monster.information.health = monster.sorcerorHealth;
					monster.information.maxHealth = monster.sorcerorBaseHealth;
					monster.information.name = monster.sorcerorNames[0];

					return monster.genericAttack(monster,sim,members,target,battle,MSG1,MSG2,0,IMG,SND);
				},
				
				allowed: function(monster,sim,members,target,battle) {return Math.floor(1) >= 0.8;}
			}
			
		]
		
		//--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==
		//
		// S U M M O N E D   M U C K F I E N D   I M P S ,   U S E   T H E I R   M O V E S
		//
		//--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==
		
		this.impMoves = [
		
			// -- SHOOT A PLAYER --
			{
				name: "Imp Blast",
				processor: function(monster,sim,members,target,battle)
				{
					var MSG1 = "MONSTER has PLAYER in its sights";
					
					var firingBoth = false;
					
					// 40% chance to let both of the monsters fire
					if (Math.random(1) >= 0.6) {firingBoth = true;}
					
					var MSG2 = "and one torches them for DAMAGE damage!";
					var DMG = monster.impDamage_fire;
					var SND = monster.randomized(monster.impAudios.shoot);
					
					if (firingBoth) {
						MSG2 = "and both torch them for DAMAGE damage!";
						DMG = monster.impDamage_both;
						SND = monster.randomized(monster.impAudios.shootboth);
					}
					
					var IMG = undefined;
					
					if (firingBoth) {IMG = monster.randomized(monster.impImages.shootboth);}
					else 
					{
						// 50% chance to pick left 
						if (Math.random(1) >= 0.5){IMG = monster.randomized(monster.impImages.shootleft);}
						else{IMG = monster.randomized(monster.impImages.shootright);}
					}
					
					return monster.genericAttack(monster,sim,members,target,battle,MSG1,MSG2,DMG,IMG,SND);
				},
				
				allowed: function(monster,sim,members,target,battle) {return true;}
			},
			
			// -- DO NOTHING, *VERY* SMALL CHANCE --
			{
				name: "Imp Idle",
				processor: function(monster,sim,members,target,battle)
				{
					var MSG1 = "MONSTER floats above the vivid magma,";
					var MSG2 = "ominously staring at the party...";
					var SND = monster.randomized(monster.impAudios.idle);
					var IMG = monster.randomized(monster.impImages.idle);

					return monster.genericAttack(monster,sim,members,target,battle,MSG1,MSG2,0,IMG,SND);
				},
				
				allowed: function(monster,sim,members,target,battle) {return Math.random(1) >= 0.9;}
			}
			
		]
		
		//--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==
		//
		// A C T U A L   M O V E S   T H E   B O S S   W I L L   T A K E
		//
		//--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==
		
		this.bossMoves = [
					
			// -- SUMMON SOME IMPS --
			{
				name: "Imp Summon",
				processor: function(monster,sim,members,target,battle)
				{
					var MSG1 = monster.sorcerorNames[0]+" holds his skeletal arms out,";
					var MSG2 = "summoning two horrendous muckfiends!";
					var SND = monster.randomized(monster.impAudios.summon);
					var IMG = monster.randomized(monster.impImages.sight);
					
					monster.sorcerorHealth = monster.information.health;
					monster.summoned = true;
					monster.fatsoStage = false;
					monster.moves = monster.impMoves;
					monster.information.health = monster.impBaseHealth;
					monster.information.maxHealth = monster.impBaseHealth;
					monster.information.name = monster.impNames[0];

					return monster.genericAttack(monster,sim,members,target,battle,MSG1,MSG2,0,IMG,SND);
				},
				
				allowed: function(monster,sim,members,target,battle) {return Math.random(1) >= 0.8;}
			},
			
			// -- SELF-HEALING --
			{
				name: "Self Heal",
				processor: function(monster,sim,members,target,battle)
				{
					var MSG1 = "MONSTER raises his claw and summons fiendish powers,";
					
					var healAmount = monster.baseDamage_selfheal + Math.floor(Math.random(monster.baseDamage_selfhealMax - monster.baseDamage_selfheal));
					
					var MSG2 = "healing himself for "+healAmount+" health!";
					var DMG = 0;
					var SND = monster.randomized(monster.bossAudios.selfheal);
					var IMG = monster.randomized(monster.bossImages.selfheal);
					
					monster.information.health += healAmount;
					if (monster.information.health > monster.sorcerorBaseHealth) {monster.information.health = monster.sorcerorBaseHealth;}
					
					return monster.genericAttack(monster,sim,members,target,battle,MSG1,MSG2,0,IMG,SND);
				},
				
				allowed: function(monster,sim,members,target,battle) {return Math.random(1) >= 0.75 && monster.information.health < monster.sorcerorBaseHealth;}
			},
			
			// -- ICE BLAST --
			{
				name: "Ice Blast",
				processor: function(monster,sim,members,target,battle)
				{
					var MSG1 = "MONSTER thrusts his bony hands at PLAYER";
					var MSG2 = "and projects ice shards for DAMAGE damage!";
					var DMG = monster.baseDamage_iceblast;
					var SND = monster.randomized(monster.bossAudios.iceblast);
					var IMG = monster.randomized(monster.bossImages.iceblast);
					
					return monster.genericAttack(monster,sim,members,target,battle,MSG1,MSG2,DMG,IMG,SND);
				},
				
				allowed: function(monster,sim,members,target,battle) {return true;}
			},
			
			// -- CUBE: LIGHTNING STRIKE --
			{
				name: "Lightning Strike",
				processor: function(monster,sim,members,target,battle)
				{
					var MSG1 = "MONSTER uses the power of the Soul cube on PLAYER";
					var MSG2 = "and electrocutes them for DAMAGE damage!";
					var DMG = monster.baseDamage_lightning;
					var SND = monster.randomized(monster.bossAudios.lightning);
					var IMG = monster.randomized(monster.bossImages.lightning);
					
					return monster.genericAttack(monster,sim,members,target,battle,MSG1,MSG2,DMG,IMG,SND);
				},
				
				allowed: function(monster,sim,members,target,battle) {return true;}
			},
			
			// -- CUBE: FLAME WALL --
			{
				name: "Flame Wall",
				processor: function(monster,sim,members,target,battle)
				{
					var MSG1 = "MONSTER uses the power of the Power cube";
					var MSG2 = "and incinerates the party for DAMAGE damage!";
					var DMG = monster.baseDamage_flamewall;
					var SND = monster.randomized(monster.bossAudios.flamewall);
					var IMG = monster.randomized(monster.bossImages.flamewall);
					
					return monster.attackEveryone(monster,sim,members,target,battle,MSG1,MSG2,DMG,IMG,SND,monster.baseDamage_flamewall_shared,monster.randomized(monster.bossImages.sight));
				},
				
				allowed: function(monster,sim,members,target,battle) {return true;}
			},
			
			// -- CUBE: MIND --
			{
				name: "Mind Cube",
				processor: function(monster,sim,members,target,battle)
				{
					var MSG1 = "MONSTER uses the power of the Mind cube on PLAYER";
					var MSG2 = "and sucks DAMAGE points from their life essence!";
					var DMG = monster.baseDamage_greenflame;
					var SND = monster.randomized(monster.bossAudios.greenflame);
					var IMG = monster.randomized(monster.bossImages.greenflame);
					
					monster.information.health += DMG;
					if (monster.information.health > monster.sorcerorBaseHealth) {monster.information.health = monster.sorcerorBaseHealth;}
					
					return monster.genericAttack(monster,sim,members,target,battle,MSG1,MSG2,DMG,IMG,SND);
				},
				
				allowed: function(monster,sim,members,target,battle) {return Math.floor(1) >= 0.5;}
			},
			
			// -- CUBE: REALITY --
			{
				name: "Reality Cube",
				processor: function(monster,sim,members,target,battle)
				{
					var MSG1 = "MONSTER uses the power of the Reality cube,";
					var SND = monster.randomized(monster.bossAudios.duality);
					
					var trns = Math.round(Math.random(2));
					if (trns > 2) {trns = 2;}			// Failsafe
					
					monster.transformer = trns;
					var IMG = monster.playerTransforms[trns].transformimage;
					
					var MSG2 = "and transforms into a "+monster.playerTransforms[trns].name+"!";
					
					monster.sorcerorHealth = monster.information.health;
					monster.moves = monster.playerMoves;
					monster.information.health = monster.playerTransformHealth;
					monster.information.maxHealth = monster.playerTransformHealth;
					monster.information.name = monster.playerTransforms[trns].name;
					
					return monster.genericAttack(monster,sim,members,target,battle,MSG1,MSG2,0,IMG,SND);
				},
				
				allowed: function(monster,sim,members,target,battle) {return Math.floor(1) >= 0.5;}
			}
			
		]
		
		//--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==
		//
		// W H E N   W E   K I L L   T H E   I M P S
		//
		//--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==
		
		this.impDeathMoves = [
			{
				name: "Imp Dead",
				processor: function(monster,sim,members,target,battle)
				{
					var MSG1 = "MONSTER lets his powerful flame shield fall,";
					var MSG2 = "both of his muckfiends sinking into the void!";
					var SND = monster.randomized(monster.impAudios.death);
					var IMG = monster.randomized(monster.impImages.death);
					
					monster.summoned = false;
					monster.fatsoStage = false;
					monster.moves = monster.bossMoves;
					monster.information.health = monster.sorcerorHealth;
					monster.information.maxHealth = monster.sorcerorBaseHealth;
					monster.information.name = monster.sorcerorNames[0];

					return monster.attackEveryone(monster,sim,members,target,battle,MSG1,MSG2,0,IMG,SND,0,false);
				},
				
				allowed: function(monster,sim,members,target,battle) {return Math.random(1) >= 0.9;}
			}
		]
		
		//--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==
		//
		// W H E N   W E   B R E A K   O U T   O F   O U R   S H I E L D
		//
		//--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==
		
		this.shieldMoves = [
			{
				name: "Shield Break",
				processor: function(monster,sim,members,target,battle)
				{
					var MSG1 = "MONSTER viciously breaks out of the shield,";
					var MSG2 = "hurting everybody for DAMAGE damage!";
					var SND = monster.randomized(monster.bossAudios.shieldbreak);
					var IMG = monster.randomized(monster.bossImages.shieldbreak);
					var DMG = monster.baseDamage_shieldbreak;
					
					sim.botPlayMusic(monster.stageTwoMusic,0.2,0);
					
					monster.summoned = false;
					monster.fatsoStage = false;
					monster.moves = monster.bossMoves;
					monster.information.health = monster.sorcerorBaseHealth;
					monster.information.maxHealth = monster.sorcerorBaseHealth;
					monster.information.name = monster.sorcerorNames[0];

					return monster.attackEveryone(monster,sim,members,target,battle,MSG1,MSG2,DMG,IMG,SND,DMG,false);
				},
				
				allowed: function(monster,sim,members,target,battle) {return Math.random(1) >= 0.9;}
			}
		]
		
		//--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==
		//
		// I N   T H E   F A T S O   S T A G E   ( F I R S T   S T A G E )
		//
		//--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==
		
		this.fatsoMoves = [
		
			// -- SHOOT A PLAYER --
			{
				name: "Fatso Blast",
				processor: function(monster,sim,members,target,battle)
				{
					var MSG1 = "MONSTER have PLAYER in their sights...";
					
					var firingBoth = false;
					
					// 40% chance to let both of the monsters fire
					if (Math.random(1) >= 0.6) {firingBoth = true;}
					
					var MSG2 = "and one torches them for DAMAGE damage!";
					var DMG = monster.fatDamage_fire;
					var SND = monster.randomized(monster.fatsoAudios.shoot);
					
					if (firingBoth) {
						MSG2 = "and both torch them for DAMAGE damage!";
						DMG = monster.fatDamage_both;
						SND = monster.randomized(monster.fatsoAudios.shootboth);
					}
					
					var IMG = undefined;
					
					if (firingBoth) {IMG = monster.randomized(monster.images.shootboth);}
					else 
					{
						// 50% chance to pick left 
						if (Math.random(1) >= 0.5){IMG = monster.randomized(monster.images.shootleft);}
						else{IMG = monster.randomized(monster.images.shootright);}
					}
					
					return monster.genericAttack(monster,sim,members,target,battle,MSG1,MSG2,DMG,IMG,SND);
				},
				
				allowed: function(monster,sim,members,target,battle) {return true;}
			},
			
			// -- DO NOTHING, *VERY* SMALL CHANCE --
			{
				name: "Fatso Idle",
				processor: function(monster,sim,members,target,battle)
				{
					var MSG1 = "MONSTER hovers above the vivid magma,";
					var MSG2 = "ominously staring at the party...";
					var SND = monster.randomized(monster.fatsoAudios.idle);
					var IMG = monster.randomized(monster.images.idle);

					return monster.genericAttack(monster,sim,members,target,battle,MSG1,MSG2,0,IMG,SND);
				},
				
				allowed: function(monster,sim,members,target,battle) {return Math.random(1) >= 0.9;}
			}
			
		]
		
		this.moves = this.fatsoMoves;
		
		this.behavior.onDeath = function(monster, sim)
		{
			if (monster.summoned)
			{
				if (monster.mancubusStage)
				{
					monster.summoned = false;
					monster.mancubusStage = false;
					monster.information.health = 20;
					monster.moves = monster.shieldMoves;
					monster.images.idle = [monster.bossImages.idle];
					return {allowed:false, msg:[], sound:undefined};
				}
				else
				{
					monster.summoned = false;
					monster.mancubusStage = false;
					monster.information.health = 20;
					monster.moves = monster.impDeathMoves;
					return {allowed:false, msg:[], sound:undefined};
				}
			}
			else
			{
				sim.botStopMusic();
				monster.setImage(sim,monster.randomized(monster.bossImages.death));
				return {allowed:true, msg:["The fiendish demon from hell explodes and dies!"], sound:monster.randomized(monster.bossAudios.death)};
			}
		}
	}
}

module.exports = MonsterClassifier;
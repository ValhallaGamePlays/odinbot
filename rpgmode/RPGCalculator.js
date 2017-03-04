// -- CALCULATES VARIOUS THINGS
//--====================================================================--

const randomFrom = function(thelength){return Math.floor(Math.random() * thelength);}

// How much each vitality point adds to the main health
const vitalityAdd = 10;
const maxHealthBase = 100;

// For monster health
const scalePerPlayer = 0.2;
const scalePerLevel = 0.05;

// 5% chance to dodge normally
const defaultDodgeChance = 0.95;
const dodgePerStat = 0.01;

const blockReduce = 0.5;

// Increase the XP goal by 10% each time
const goalIncrease = 0.1;
// Add an extra 50 per level because why not
const perLevelIncrease = 20;

// How much experience does a monster's level give us?
const XPperLevel = 15;
// How much do we multiply the XP by if it's a boss?
const bossXPmult = 1.5;
// TODO: How much to multiply this monster's experience per level
const XPperDungeonLevel = 0.05;

// Chance to pick two prefixes instead of one
const pickTwoChance = 0.75;

// Chance to add a suffixes
const suffixChance = 0.5;

// Per awareness level, how much should we multiply the find chance by? - DEPRECATED
//const awareMultiply = 0.95;
// Per awareness level, how much to SUBTRACT from the find chance
const awareSubtract = 0.01;

// HOW MUCH GOLD SHOULD WE GIVE BY DEFAULT?
const goldMin = 5;
const goldMax = 50;
// HOW MUCH TO MULTIPLY PER AWARENESS?
const goldMultiply = 1.05;
// HOW MUCH TO MULTIPLY PER LEVEL?
const dungeonLevelMultiply = 1.1;

// Range of monster levels to use
const dungeonLevelRange = 2;

const missPerPrecision = 0.5;

// Width and height of the dungeon
const dungeonWidth = 6;
const dungeonHeight = 6;

// WHAT WILL WE FIND WHEN WE SEARCH?
const searchFindings = [
	{id:"gold",chance:0.5,dungeonOnly:false},
	{id:"nothing",chance:0.25,dungeonOnly:false},
	{id:"item",chance:0.25,dungeonOnly:false},
	{id:"monster",chance:0.5,dungeonOnly:false},
	{id:"enchant",chance:0.7,dungeonOnly:false}
	//{id:"stairs",chance:0.5,dungeonOnly:true},
	//{id:"upstairs",chance:0.5,dungeonOnly:true},
	//{id:"temple",chance:0.9,dungeonOnly:false}
];

const squareFindings = [
	{id:"stairs",chance:0.5,dungeonOnly:true},
	{id:"upstairs",chance:0.5,dungeonOnly:true},
	{id:"temple",chance:0.9,dungeonOnly:false},
	{id:"normal",chance:0.0,dungeonOnly:false}
];

const moveFindings = [
	{id:"nothing",chance:0.25},
	{id:"monster",chance:0.75}
];

class CManager {
	
	constructor() 
	{
		this.core = undefined;
		
		// Copy constants to access them elsewhere
		this.searchFindings = searchFindings;
		this.squareFindings = squareFindings;
		this.moveFindings = moveFindings;
		
		this.dungeonWidth = dungeonWidth;
		this.dungeonHeight = dungeonHeight;
		
		// Every time we search, what are the chances of finding a boss?
		this.templeChance = 0.05;
		
		// How much should strength multiply the damage a weapon does?
		this.strengthMultiply = 0.05;
		this.precisionMultiply = 0.05;
		this.wisdomMultiply = 0.05;
	}
	
	// --==--==--==--==--==--==--==--==--==
	// TURN A DUNGEON STRING INTO EMOTES
	// --==--==--==--==--==--==--==--==--==
	levelToEmotes(dung,currentspot = 0)
	{
		var STR = "";
		
		for (var l=0; l<dungeonWidth+2; l++) {STR += ":black_small_square:"}
		STR += "\n";
		
		STR += ":black_small_square:";
		var c = 0;
		var r = 0;
		
		for (var l=0; l<dung.levels.length; l++)
		{
			if (dung.levels[l].visited)
			{
				switch (dung.levels[l].type)
				{
					case "temple":
					STR += ":u5408:";
					break;
					
					case "stairs":
						if (currentspot != l){STR += ":arrow_heading_down:";}
						else {STR += ":small_red_triangle_down:";}
					break;
					
					case "upstairs":
						if (currentspot != l){STR += ":arrow_heading_up:";}
						else {STR += ":small_red_triangle:";}
					break;
					
					default:
					case "normal":
						if (currentspot != l){STR += ":small_blue_diamond:";}
						else {STR += ":o:";}
					break;
				}
			}
			else
			{
				if (currentspot != l){STR += ":white_small_square:";}
				else {STR += ":o:";}
			}
			
			c ++;
			if (c >= dungeonWidth)
			{
				c = 0;
				r ++;
				STR += ":black_small_square:\n";
				
				if (r < dungeonHeight) {STR += ":black_small_square:"}
			}
		}
		
		for (var l=0; l<dungeonWidth+2; l++) {STR += ":black_small_square:"}
		
		STR += "\n";
		
		// LEGEND
		STR += ":white_small_square: - **Unexplored**\n";
		STR += ":small_blue_diamond: - **Explored**\n";
		STR += ":arrow_heading_down: - **Descending Stairs**\n";
		STR += ":arrow_heading_up: - **Ascending Stairs**\n";
		STR += ":u5408: - **Temple Entrance**\n";
		STR += ":o: - **You Are Here**\n";
		
		return STR;
	}
	
	// --==--==--==--==--==--==--==--==--==
	// WHEN WE WALK INTO A SQUARE, WHAT KIND OF ID WILL WE USE?
	// --==--==--==--==--==--==--==--==--==
	squareSearch()
	{
		var theFinding = undefined;
		var RTRN = undefined;
		
		var SF = moveFindings.slice(0);

		do {
			var FN = randomFrom(SF.length+1);
			if (FN >= SF.length) {FN = SF.length-1;}
			var theFinding = SF[FN];

			if (Math.random(1) >= theFinding.chance) {RTRN = theFinding.id;}
		} while (RTRN == undefined);
		
		return RTRN;
	}
	
	// --==--==--==--==--==--==--==--==--==
	// GENERATE AN ACTUAL DUNGEON LEVEL
	// --==--==--==--==--==--==--==--==--==
	generateDungeon(level)
	{
		var dung = {environment:this.pickEnvironment(level).id,levels:[]};
		var hasAscend = false;
		var hasDescend = false;
		var hasTemple = false;

		for (var l=0; l<dungeonWidth*dungeonHeight; l++)
		{
			var lvl = {type:"normal",visited:false}
			dung.levels.push(lvl);
		}
		
		// Now that we have the levels, we need to place the ascend
		do {
			var RN = randomFrom(dung.levels.length);
			if (dung.levels[RN].type != "upstairs") {dung.levels[RN].visited = true; dung.levels[RN].type = "upstairs"; hasAscend = true;}
		} while (hasAscend = false);
		
		// Now that we have the levels, we need to place the descend
		do {
			var RN = randomFrom(dung.levels.length);
			if (dung.levels[RN].type != "upstairs") {dung.levels[RN].type = "stairs"; hasDescend = true;}
		} while (hasDescend = false);
		
		// Now that we have the levels, we need to place the temple
		do {
			var RN = randomFrom(dung.levels.length);
			if (dung.levels[RN].type != "temple") {dung.levels[RN].type = "temple"; hasTemple = true;}
		} while (hasTemple = false);
		
		return dung;
	}
	
	// --==--==--==--==--==--==--==--==--==
	// CALCULATE MISS CHANCE
	// --==--==--==--==--==--==--==--==--==
	calcMissChance(initial, precision)
	{
		var finalChance = initial;
		
		finalChance += missPerPrecision*precision;
		
		return finalChance;
	}
	
	// --==--==--==--==--==--==--==--==--==
	// FIND AN ENVIRONMENT BASED ON DUNGEON LEVEL
	// --==--==--==--==--==--==--==--==--==
	pickEnvironment(dungeonLevel)
	{
		var RTRN = undefined;
		var ENV = this.core.environments;
		
		do {
			var theEnviron = ENV[randomFrom(ENV.length)];
			
			// If level 0, forcefully use town
			if (dungeonLevel <= 0 && theEnviron.id == "town") {RTRN = theEnviron;}
			
			// Otherwise, just pick one
			else if (theEnviron.id != "town")
			{
				if (dungeonLevel >= theEnviron.levelMin && dungeonLevel <= theEnviron.levelMax) {RTRN = theEnviron;}
			}
			
		} while (RTRN == undefined);
		
		return RTRN;
	}
	
	// --==--==--==--==--==--==--==--==--==
	// DECIDE HOW MUCH GOLD TO GIVE
	// --==--==--==--==--==--==--==--==--==
	decideGoldAmount(awareness,dungeonLevel)
	{
		var baseAmount = Math.floor(goldMin + (Math.random()*(goldMax-goldMin)));
		
		for (var l=0; l<awareness; l++){ baseAmount *= goldMultiply; }		
		for (var l=0; l<dungeonLevel; l++){ baseAmount *= dungeonLevelMultiply; }
		
		return Math.floor(baseAmount);
	}
	
	// --==--==--==--==--==--==--==--==--==
	// SELECT A RANDOM ITEM FROM THE DATABASE
	// --==--==--==--==--==--==--==--==--==
	randomItem(awareness, ignoreTags = [], itemTags = ["normal"])
	{
		var ITM = this.core.inventoryManager.items;
		var RTRN = undefined;
		
		do {
			var theFinding = ITM[randomFrom(ITM.length)];
			var findChanceCheck = theFinding.item.inventoryProperties.findChance;
			var omit = false;
			var hasTag = false;
			
			for (var l=0; l<theFinding.item.inventoryProperties.tags.length; l++)
			{
				for (var m=0; m<ignoreTags.length; m++)
				{
					if (theFinding.item.inventoryProperties.tags[l].toLowerCase() == ignoreTags[m]) {omit = true;}
				}
				
				for (var m=0; m<itemTags.length; m++)
				{
					if (theFinding.item.inventoryProperties.tags[l].toLowerCase() == itemTags[m]) {hasTag = true;}
				}
			}
			
			// Apply awareness
			for (var l=0; l<awareness; l++) {findChanceCheck -= awareSubtract;}
			
			if (Math.random(1) >= findChanceCheck && theFinding.item.inventoryProperties.rarity < 8 && !omit && hasTag) {RTRN = theFinding;}
		} while (RTRN == undefined);
		
		return RTRN;
	}
	
	// --==--==--==--==--==--==--==--==--==
	// WE TRIED SEARCHING, WHAT WILL WE FIND?
	// --==--==--==--==--==--==--==--==--==
	searchAttempt(dungeonLevel,extras = [],specialOnly = false)
	{
		var theFinding = undefined;
		var RTRN = undefined;
		
		var SF = searchFindings.slice(0);
		if (specialOnly) {SF = [];}
		
		for (var l=0; l<extras.length; l++) {SF.push({id:extras[l].id,chance:extras[l].chance,dungeonOnly:false})}
		
		do {
			var FN = randomFrom(SF.length+1);
			if (FN >= SF.length) {FN = SF.length-1;}
			var theFinding = SF[FN];

			if (Math.random(1) >= theFinding.chance && ((dungeonLevel > 0 && theFinding.dungeonOnly) || (dungeonLevel <= 0 && !theFinding.dungeonOnly))) {RTRN = theFinding.id;}
		} while (RTRN == undefined);
		
		return RTRN;
	}
	
	// --==--==--==--==--==--==--==--==--==
	// PICK SOME PREFIXES TO USE
	// --==--==--==--==--==--==--==--==--==
	pickPrefixes(poss)
	{
		var PRFX = [];
		var lengthGoal = 1;

		if (Math.random(1) >= pickTwoChance) {lengthGoal = 2;}
		
		do {
			for (var l=0; l<poss.length+1; l++)
			{
				// -- YEAH, LET'S USE THIS ONE
				if (Math.random() >= poss[l].chance)
				{
					var MSG = poss[l].messages[randomFrom(poss[l].messages.length)];
					PRFX.push({message:MSG, bonus:poss[l].rarityBonus});
					break;
				}
			}
		} while (PRFX.length < lengthGoal);
		
		return PRFX;
	}
	
	// --==--==--==--==--==--==--==--==--==
	// PICK SOME SUFFIXES TO USE
	// --==--==--==--==--==--==--==--==--==
	pickSuffixes(poss)
	{
		var SUFF = [];
		
		if (Math.random(1) <= suffixChance) {return SUFF;}
		
		SUFF.push(poss[randomFrom(poss.length-1)]);
		
		return SUFF;
	}
	
	// --==--==--==--==--==--==--==--==--==
	// HOW MUCH EXPERIENCE SHOULD THIS MONSTER GIVE?
	// TODO: Access dungeon level from battle
	// --==--==--==--==--==--==--==--==--==
	calculateMonsterXP(monster,battle)
	{
		var BXP = monster.information.baseXP;
		var levelXP = XPperLevel*monster.behavior.getLevel(monster,this.core);
		var dungeonXP = (XPperDungeonLevel*BXP) * 1;
		var BM = 1.0;
		
		if (monster.information.bossMonster) {BM = bossXPmult;}
		
		return (Math.floor(BXP + levelXP + dungeonXP)) * BM;
	}
	
	// --==--==--==--==--==--==--==--==--==
	// CALCULATE THE NEW EXPERIENCE GOAL
	// --==--==--==--==--==--==--==--==--==
	newExperienceGoal(current,level)
	{
		var CG = current;
		CG += (current*goalIncrease);
		CG += level*perLevelIncrease;
		
		return Math.floor(CG);
	}
	
	// --==--==--==--==--==--==--==--==--==
	// CALCULATE MONSTER'S LEVEL
	// --==--==--==--==--==--==--==--==--==
	calcMonsterLevel(base,dunglevel)
	{
		var ADDER = Math.floor(Math.random()*dungeonLevelRange);
		if (Math.random() > 0.5) {ADDER *= -1;}
		
		var LVL =  base + (dunglevel+ADDER);
		if (LVL < 1) {LVL = 1;}
		
		return Math.floor(LVL);
	}
	
	// --==--==--==--==--==--==--==--==--==
	// CALCULATE A MONSTER'S MAXIMUM HEALTH
	// --==--==--==--==--==--==--==--==--==
	calcMonsterBaseHealth(monster,members)
	{
		var BH = monster.information.baseMaxHealth;
		var levelScale = 1.0 + (scalePerLevel * monster.behavior.getLevel(monster,this.core));
		var playerScale = (scalePerPlayer*BH) * (members.length-1);
		
		console.log(members);
		
		console.log(BH+","+levelScale+","+playerScale);
		
		return Math.floor((BH*levelScale) + playerScale);
	}
	
	// --==--==--==--==--==--==--==--==--==
	// CALCULATE A USER'S MAX HEALTH BASED ON VITALITY
	// --==--==--==--==--==--==--==--==--==
	getMaxHealth(vitality) {return maxHealthBase + (vitalityAdd * vitality);}
	
	// --==--==--==--==--==--==--==--==--==
	// CALCULATE THE CHANCE THAT A PLAYER WILL DODGE
	// --==--==--==--==--==--==--==--==--==
	dodgeChance(target)
	{
		var BC = defaultDodgeChance;
		BC -= dodgePerStat * this.core.accountManager.finalStat(this.core,target.account,"dexterity");
		
		if (BC < 0) {BC = 0;}
		
		return BC;
	}
	
	// --==--==--==--==--==--==--==--==--==
	// CALCULATE THE DAMAGE A MONSTER DOES
	// --==--==--==--==--==--==--==--==--==
	calcMonsterDamage(monster,target,dmg)
	{
		var dodge = false;
		var block = false;
		// Add one or two to the basic damage
		var DAMAGE = dmg;
		DAMAGE += Math.floor( Math.random() * (2 - (-2)) + -2 );
		
		if (target.blocking) {DAMAGE *= blockReduce; block = true;}
		
		// Is the target going to dodge this attack? Miss entirely
		var DC = this.dodgeChance(target);
		if (Math.random(1) >= DC) {DAMAGE = 0; dodge = true;}
		
		return {hpt:DAMAGE, dodged:dodge, blocked:block}
	}
}

module.exports = CManager;
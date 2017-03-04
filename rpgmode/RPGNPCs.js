// --==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==
// ALL OF THE POSSIBLE NPCS THAT YOU CAN MEET IN THE TOWN
// --==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==--==

const randomFrom = function(thelength){return Math.floor(Math.random() * thelength);}
const Image = require('purified-image');
const wrap = require('wordwrap')(19);

const NPCwidth = 8;

const NPCdirectory = './rpgmode/images/npcs/';
const fontDirectory = './rpgmode/fonts/';
const imageDirectory = './rpgmode/images/';

// IMAGES
const IMG_NPCback = 'npc_background.png';
const IMG_counter = 'counter.png';
const IMG_merchant = 'merchant.png';
const IMG_chain = 'chains.png';
const IMG_chain2 = 'chains_bottom.png';
// OFFSETS
const POS_NPCname = {x:334,y:138};
const POS_NPCtitle = {x:334,y:149};
const POS_counter = {x:272,y:78};
const POS_sweetener = {x:272,y:7};
const POS_character = {x:333,y:128};
const POS_greeting = {x:338, y:174};
const POS_merchant = {x:11, y:0};
const POS_merchantGold = {x:42, y:284};

var members = [


		// POTION SELLER I NEED YOUR STRONGEST POTIONS
		{
			nameArray:["Baratus", "Menelkir", "Archon", "Kingsworth", "Duke", "Xanthor"],
			titles:["Potion Seller"],
			greetings: [
				"Greetings, traveler!\n\nYou may not be able to handle my strongest potions... but I'm selling them to you anyway!",
				"Hello, stranger!\n\nI have the finest potions around, take your pick. I am sure you will not be disappointed.",
				"Welcome!\n\nTake your pick from my rare and unique potions, you may like what you find."
			],
			type:"merchant",
			ignoredTags:["traderomit"],
			itemTags:["potion"],
			selectiveItems:[],
			counterImages:['deskitems_potions.png', 'deskitems_potions2.png'],
			backgroundImages:['background_generic.png'],
			characterImages:['npc_heresy.png', 'npc_wizard.png', 'npc_gremlin.png']
		},
		
		// SELLS A BUNCH OF MAGIC STUFF
		{
			nameArray:["Menelkir", "Adalfarus", "Acacius", "Druxikron", "Otrius", "Ostalius"],
			titles:["Wizard"],
			greetings: [
				"Hello, traveler.\n\nMy magic is fit to kill the strongest of immortals, but you may test your fate...",
				"Come in.\n\nLook around my magic shop, see if my curses and witchcraft suit your fancy.",
				"Welcome.\n\nIf you wish to become a master spellcaster like me, you must start very small."
			],
			type:"merchant",
			ignoredTags:["traderomit"],
			itemTags:["magical"],
			selectiveItems:[],
			counterImages:['deskitems_potions.png', 'deskitems_potions2.png'],
			backgroundImages:['background_generic.png'],
			characterImages:['npc_magic1.png','npc_magic3.png','npc_magic4.png']
		},
		
		// FAST FOOD YO
		{
			nameArray:["Bobby","Derrick","Rick","James","Smithy","Tom","Ricky","Dave","Jimmy","Elliot","Roger","Swanson"],
			titles:["Cashier"],
			greetings: [
				"Hello, welcome to Flabby's, may I take your order?\n\nIf I were you, I would take number 8, the Jumbo Slappy Shitburger. It comes with extra mayonnaise.",
				"Hello, welcome to Flabby's, may I take your order?\n\nJust a forewarning, we may spit in your food every once in a while.",,
				"Hello, welcome to Flabby's, may I take your order?\n\nAs company policy, I'm required to tell you up front that our doughnuts are made from cow feces.",
				"Hello, welcome to Flabby's, may I take your order?\n\nMaybe you can enjoy our 2-Ton Mega Glug drink. It comes free with a purchase of 50 Anusburgers."
			],
			type:"merchant",
			ignoredTags:["traderomit"],
			itemTags:["fastfood"],
			selectiveItems:[
				{id:"ff_doughnuts",price:10},
				{id:"ff_doughnuts",price:10},
				{id:"ff_doughnuts",price:10},
				{id:"ff_doughnuts",price:10},
				{id:"ff_doughnuts_p",price:10},
				{id:"ff_doughnuts_p",price:10},
				{id:"ff_doughnuts_p",price:10},
				{id:"ff_doughnuts_p",price:10},
				{id:"ff_anusburger",price:25},
				{id:"ff_anusburger",price:25},
				{id:"ff_anusburger",price:25},
				{id:"ff_anusburger",price:25},
				{id:"ff_smoothie",price:25},
				{id:"ff_smoothie",price:25},
				{id:"ff_smoothie",price:25},
				{id:"ff_smoothie",price:25},
				{id:"ff_happymeal",price:50},
				{id:"ff_happymeal",price:50},
				{id:"ff_happymeal",price:50},
				{id:"ff_happymeal",price:50},
				{id:"ff_fries",price:10},
				{id:"ff_fries",price:10},
				{id:"ff_fries",price:10},
				{id:"ff_fries",price:10}
			],
			counterImages:['deskitems_food.png', 'deskitems_food2.png'],
			backgroundImages:['background_fastfood.png'],
			characterImages:['npc_fastfood1.png','npc_fastfood2.png']
		}
		
];
	
// Generate a new NPC for that account
function generateNPC(townsfolk,IM)
{
	var theMainNPC = townsfolk[randomFrom(townsfolk.length)];
	var clone = {};
	
	for(var keys = Object.keys(theMainNPC), l = keys.length; l; --l) {clone[ keys[l-1] ] = theMainNPC[ keys[l-1] ];}
	
	// Set the name and such
	clone.name = clone.nameArray[randomFrom(clone.nameArray.length)];
	clone.title = clone.titles[randomFrom(clone.titles.length)];
	clone.greeting = clone.greetings[randomFrom(clone.greetings.length)];
	clone.counterImage = clone.counterImages[randomFrom(clone.counterImages.length)];
	clone.backgroundImage = clone.backgroundImages[randomFrom(clone.backgroundImages.length)];
	clone.characterImage = clone.characterImages[randomFrom(clone.characterImages.length)];
	
	clone.items = [];
	
	// ITEMS YO
	if (clone.type == "merchant")
	{
		if (clone.selectiveItems.length > 0)
		{
			for (var l=0; l<clone.selectiveItems.length; l++)
			{
				var PUS = {id:clone.selectiveItems[l].id,price:clone.selectiveItems[l].price};
				PUS.icon = IM.getItemIcon(PUS.id,true);
				
				var ITM = IM.itemByID(PUS.id);
				PUS.rarity = ITM.item.inventoryProperties.rarity;

				clone.items.push(PUS);
			}
		}
		else
		{
			for (var l=0; l<30 + Math.floor(Math.random(1)*34); l++)
			{
				var TID = IM.core.calculator.randomItem(0,clone.ignoredTags,clone.itemTags);
				
				var PUS = {id:TID.item.inventoryProperties.id,price:TID.item.inventoryProperties.buyPrice};
				PUS.icon = IM.getItemIcon(PUS.id,true);
				
				var ITM = IM.itemByID(PUS.id);
				PUS.rarity = ITM.item.inventoryProperties.rarity;

				clone.items.push(PUS);
			}
		}
	}
	
	return clone;
}

// Actually draw the NPC card
function drawNPCcard(chan,theNPC,gold)
{
	var counterImage = new Image(NPCdirectory+IMG_counter,"auto");
	var backSweetener = new Image(NPCdirectory+theNPC.backgroundImage,"auto");
	var counterTop = new Image(NPCdirectory+theNPC.counterImage,"auto");
	var charImage = new Image(NPCdirectory+theNPC.characterImage,"auto");
	var chainImage = new Image(NPCdirectory+IMG_chain,"auto");
	var chainImageB = new Image(NPCdirectory+IMG_chain2,"auto");
	
	this.items = [];
	
	var rarityImages = [];
	for (var l=0; l<9; l++){rarityImages.push({img: new Image(imageDirectory+'rarity_'+l.toString()+'.png',"auto"), bmp:undefined});}
	rarityImages.forEach(function(element) {
		element.img.ready(function(bmpp){
			element.bmp = bmpp;
		}.bind(this));
	});
	this.rarityImages = rarityImages;
	
	var RW = 0;
	var CL = 0;
	for (var l=0; l<theNPC.items.length; l++)
	{
		var IMG = new Image(theNPC.items[l].icon,"auto");
		
		this.items.push({id:theNPC.items[l].id,price:theNPC.items[l].price,row:RW,column:CL,img:IMG,rarity:theNPC.items[l].rarity});
		
		CL ++;
		if (CL >= NPCwidth)
		{
			CL = 0;
			RW ++;
		}
	}
	
	// DIFFERENT STUFF
	this.merchantImage = new Image(NPCdirectory+IMG_merchant,"auto");
	
	var BBAR = new Image(NPCdirectory+IMG_NPCback,"auto").loadFont(fontDirectory+'8bit.ttf','8bit').loadFont(fontDirectory+'pixtech.ttf','PixTech').draw(cxt => {
		
		// Background sweetener
		backSweetener.ready(function(bmpp){
			cxt.drawImage(bmpp,POS_sweetener.x,POS_sweetener.y);
		}.bind(this));
		
		// Actual character
		charImage.ready(function(bmpp){
			cxt.drawImage(bmpp,POS_character.x-Math.floor(bmpp.width/2),POS_character.y-bmpp.height);
		}.bind(this));
		
		// Counter
		counterImage.ready(function(bmpp){
			cxt.drawImage(bmpp,POS_counter.x,POS_counter.y);
		}.bind(this));
		
		// Top is drawn after, in case we want to draw something ON the counter
		counterTop.ready(function(bmpp){
			cxt.drawImage(bmpp,POS_sweetener.x,POS_sweetener.y);
		}.bind(this));
		
		cxt.fillStyle="#000000";
		cxt.setFont('PixTech',8);
		var MES = cxt.measureText(theNPC.name);
		cxt.fillText(theNPC.name,POS_NPCname.x-Math.floor(MES.width/2),POS_NPCname.y);
		
		cxt.setFont('8bit',16);
		var MES = cxt.measureText(theNPC.title.toUpperCase());
		cxt.fillText(theNPC.title.toUpperCase(),POS_NPCtitle.x-Math.floor(MES.width/2),POS_NPCtitle.y);
		
		var greetings = [];
		
		if (theNPC.greeting != undefined) {var WRP = wrap(theNPC.greeting);}
		else {var WRP = "";}
		
		greetings = WRP.split("\n");
		
		for (var l=0; l<greetings.length; l++)
		{
			var MES = cxt.measureText(greetings[l].toUpperCase());
			cxt.fillText(greetings[l].toUpperCase(),POS_greeting.x-Math.floor(MES.width/2)-4,POS_greeting.y+(10*l));
		}
		
		// DRAW DIFFERENT THINGS BY TYPE
		switch (theNPC.type)
		{
			case "merchant":
			this.drawMerchantStuff(cxt,theNPC,gold);
			break;
		}
		
		chainImage.ready(function(bmpp){
			cxt.drawImage(bmpp,0,0);
		}.bind(this));
		
		chainImageB.ready(function(bmpp){
			cxt.drawImage(bmpp,0,300-bmpp.height);
		}.bind(this));
		
	}).save(imageDirectory+'dump.png').then(function(){
		chan.sendFile(imageDirectory+'dump.png');
	}.bind(this),function(){});
}

function drawMerchantStuff(cxt,theNPC,gold)
{
	this.merchantImage.ready(function(bmpp){
		cxt.drawImage(bmpp,POS_merchant.x,POS_merchant.y);
		cxt.fillStyle="#ffffff";
		cxt.setFont('8bit',16);
		cxt.fillText(gold.toString(),POS_merchantGold.x,POS_merchantGold.y);
	}.bind(this));
	
	this.items.forEach(function(element) {
		element.img.ready(function(bmpp){
			var X1 = POS_merchant.x+(32*element.column);
			var Y1 = POS_merchant.y+10+(32*element.row);
			
			cxt.drawImage(this.rarityImages[element.rarity].bmp,X1,Y1);
			cxt.drawImage(bmpp,X1,Y1);
			
			var NUM = (NPCwidth*element.row)+element.column;
			cxt.fillStyle = "#000000";
			cxt.fillText(NUM.toString(),X1+5,Y1+9);
			cxt.fillStyle = "#ffffff";
			cxt.fillText(NUM.toString(),X1+4,Y1+8);
		}.bind(this));
	}.bind(this));
}
	
module.exports = members;
module.exports.NPCdirectory = NPCdirectory;
module.exports.generateNPC = generateNPC;
module.exports.drawNPCcard = drawNPCcard;
module.exports.drawMerchantStuff = drawMerchantStuff;
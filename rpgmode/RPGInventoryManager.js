// -- MANAGES INVENTORY
//--====================================================================--

// Required modules
const fileExists = require('file-exists');
const jsonfile = require('jsonfile');
const fs = require('fs');
const util = require('util');

class IManager {
	
	constructor() 
	{
		this.items = [];												// ALL of the items
		this.mainDirectory = './rpgmode/codex/items/';					// Main directory where the items are stored
		this.nodeDirectory = './codex/items/';							// Main directory where the items are stored
		this.core = undefined;
		
		this.populateItems();
	}
	
	// --==--==--==--==--==--==--==--==--==
	// A FULL ITEM NAME, INCLUDING PREFIXES AND SUFFIXES
	// --==--==--==--==--==--==--==--==--==
	fullName(base,prefixes,suffixes)
	{
		var FS = base;
		for (var l=0; l<prefixes.length; l++) {FS = prefixes[l].message+" "+FS;}
		for (var l=0; l<suffixes.length; l++) {FS = FS + " " + suffixes[l];}
		
		return FS;
	}
	
	// --==--==--==--==--==--==--==--==--==
	// GET A LIST OF ALL THE ITEM FOLDERS
	// --==--==--==--==--==--==--==--==--==
	listItemFolders() {
	  return fs.readdirSync(this.mainDirectory).filter(function (file) {
		return fs.statSync(this.mainDirectory+file).isDirectory();
	  }.bind(this));
	}
	
	// --==--==--==--==--==--==--==--==--==
	// ACTUALLY POPULATE THE ITEM LIST
	// --==--==--==--==--==--==--==--==--==
	populateItems() {
		var LIF = this.listItemFolders();
		for (var l=0; l<LIF.length; l++)
		{
			var PUSHER = {id:LIF[l], faker: require(this.nodeDirectory+LIF[l]+'/item_'+LIF[l]+'.js')};
			PUSHER.item = new PUSHER.faker();
			
			PUSHER.item.inventoryProperties.id = LIF[l];
			
			this.items.push(PUSHER);
		}
	}
	
	// --==--==--==--==--==--==--==--==--==
	// CONVERT A TEMPLATE TO INVENTORY INFO FOR DRAWING
	// --==--==--==--==--==--==--==--==--==
	toInventoryInfo(temp)
	{
		var invInfo = {
			wepItem: temp.inventory[0],
			eqAItem: temp.inventory[1],
			eqBItem: temp.inventory[2],
			
			gold:temp.stats.gold,
			
			displayname: temp.information.displayname,
			
			// Copy the backpack over
			backpack: temp.backpack
		};
		
		return invInfo;
	}
	
	// --==--==--==--==--==--==--==--==--==
	// FIND AN ITEM BY ID
	// --==--==--==--==--==--==--==--==--==
	itemByID(ID)
	{
		for (var l=0; l<this.items.length; l++)
		{
			if (this.items[l].id == ID) {return this.items[l];}
		}
		
		return undefined;
	}
	
	// --==--==--==--==--==--==--==--==--==
	// PARSE A NUMBER WE ENTERED FOR AN ITEM
	// --==--==--==--==--==--==--==--==--==
	parseEnteredNumber(num)
	{
		var LL = num.toLowerCase();
		
		// Probably a number
		if (!isNaN(parseInt(num))) {return num;}
		
		// Letters?
		if (LL == "w" || LL == "a" || LL == "b") {return LL;}
		
		// None of these
		return undefined;
	}
	
	// --==--==--==--==--==--==--==--==--==
	// IS THERE A FREE SPOT IN THIS USER'S BACKPACK?
	// --==--==--==--==--==--==--==--==--==
	findFreeSpot(account)
	{
		var INV = account.template.backpack;
		
		for (var l=0; l<INV.length; l++)
		{
			if (INV[l].id == "") {return l;}
		}
		
		return -1;
	}
	
	// --==--==--==--==--==--==--==--==--==
	// ADD AN ITEM TO THE FIRST AVAILABLE SPOT
	// --==--==--==--==--==--==--==--==--==
	giveItem(account,itemID,rarity = undefined, prefixes = undefined, suffixes = undefined, saveAfter = true)
	{
		var slot = this.findFreeSpot(account);
		
		// No free spots in this user's inventory, didn't work
		if (slot == -1) {return false;}
		
		var IT = this.itemByID(itemID);
		
		account.template.backpack[slot].id = itemID;
		
		if (rarity == undefined){account.template.backpack[slot].rarity = IT.item.inventoryProperties.rarity;}
		else {account.template.backpack[slot].rarity = rarity;}
		
		if (prefixes == undefined){account.template.backpack[slot].prefixes = IT.item.inventoryProperties.prefixes;}
		else {account.template.backpack[slot].prefixes = prefixes;}
		
		if (suffixes == undefined){account.template.backpack[slot].suffixes = IT.item.inventoryProperties.suffixes;}
		else {account.template.backpack[slot].suffixes = suffixes;}
		
		if (saveAfter){this.core.accountManager.saveAccount(account.id)};
		return true;
	}
	
	// --==--==--==--==--==--==--==--==--==
	// NAME FROM A DECISION
	// --==--==--==--==--==--==--==--==--==
	decisionName(dec)
	{
		if (dec.backpack) {return {item:dec.num.id,rarity:dec.num.rarity,prefixes:dec.num.prefixes,suffixes:dec.num.suffixes}}
		return {item:dec.num.item,rarity:dec.num.rarity,prefixes:dec.num.prefixes,suffixes:dec.num.suffixes};
	}
	
	// --==--==--==--==--==--==--==--==--==
	// SET A DECISION'S ID
	// --==--==--==--==--==--==--==--==--==
	decisionSet(dec, setter)
	{
		if (dec.backpack) {dec.num.id = setter.item}
		else {dec.num.item = setter.item};
		
		dec.num.rarity = setter.rarity;
		dec.num.prefixes = setter.prefixes;
		dec.num.suffixes = setter.suffixes;
	}
	
	// --==--==--==--==--==--==--==--==--==
	// SWAP TWO ITEM SPOTS
	// --==--==--==--==--==--==--==--==--==
	swapItems(account,itemID,itemIDtwo)
	{
		var IDone = this.itemDecide(account,itemID);
		if (IDone == undefined) {return {allowed:false, msg:"You don't have an item in that slot."}}
		
		var IDtwo = this.itemDecide(account,itemIDtwo);
		if (IDtwo == undefined) {return {allowed:false, msg:"You don't have an item in that slot."}}
		
		var NAMEone = this.decisionName(IDone);
		var NAMEtwo = this.decisionName(IDtwo);
		
		this.decisionSet(IDone,NAMEtwo);
		this.decisionSet(IDtwo,NAMEone);
		
		this.core.accountManager.saveAccount(account.id);
		
		return {allowed:true, msg:"Swapped slots **"+itemID+"** and **"+itemIDtwo+"**."};
	}
	
	// --==--==--==--==--==--==--==--==--==
	// TRANSFER AN ITEM FROM ONE USER TO ANOTHER
	// --==--==--==--==--==--==--==--==--==
	transferItem(itemID,giver,receiver)
	{
		var ID = this.itemDecide(giver,itemID);
		if (ID == undefined) {return {allowed:false, msg:"You don't have an item in that slot."}}
		
		var NM = "";
		if (ID.backpack) {NM = ID.num.id;}
		else {NM = ID.num.item;}
		
		if (NM == "") {return {allowed:false, msg:"You don't have an item in that slot."}}
		
		var FS = this.findFreeSpot(receiver);
		if (FS == -1) {return {allowed:false, msg:"That person doesn't have any free inventory space!"};}
		
		// Remove the item from the giver's inventory
		this.itemInSlot(itemID,giver,true);
		
		// Give the item to the receiver
		this.giveItem(receiver,NM,ID.num.rarity,ID.num.prefixes,ID.num.suffixes);
		
		return {allowed:true, msg:"You gave `"+this.fullName(this.getItemName(NM),ID.num.prefixes,ID.num.suffixes)+"` to **"+receiver.template.information.displayname+"**."};
	}
	
	// --==--==--==--==--==--==--==--==--==
	// HOW MANY OF THIS ITEM DOES A USER HAVE IN HIS INVENTORY?
	// --==--==--==--==--==--==--==--==--==
	countBackpackItems(account,type)
	{
		var finalCount = 0;
		var BP = account.template.backpack;
		
		console.log(BP[0]);
		
		for (var l=0; l<BP.length; l++) {if (BP[l].id == type) {finalCount ++;}}
		
		return finalCount;
	}
	
	// --==--==--==--==--==--==--==--==--==
	// REMOVE AN ITEM FROM THE USER'S INVENTORY
	// --==--==--==--==--==--==--==--==--==
	removeItem(account,slot)
	{
		account.template.backpack[slot].id = "";
	}
	
	// --==--==--==--==--==--==--==--==--==
	// DECIDE WHICH ITEM WE'RE GOING TO MODIFY
	// --==--==--==--==--==--==--==--==--==
	itemDecide(account,id)
	{
		var PI = parseInt(id);
		var RTR = undefined;
		
		if (!isNaN(PI)) {
			
			RTR = {backpack:true, rawnum: PI, num:account.template.backpack[PI], id:account.template.backpack[PI].id};
		}
		else
		{
			switch (id.toLowerCase())
			{
				case "w":
					RTR = {backpack:false, rawnum: 0, num:account.template.inventory[0], id:account.template.inventory[0].item};
				break;
				
				case "a":
					RTR = {backpack:false, rawnum: 1, num:account.template.inventory[1], id:account.template.inventory[1].item};
				break;
				
				case "b":
					RTR = {backpack:false, rawnum:2, num:account.template.inventory[2], id:account.template.inventory[2].item};
				break;
			}
		}
		
		return RTR;
	}
	
	// --==--==--==--==--==--==--==--==--==
	// FOR POTIONS, HEALTH BY RARITY
	// --==--==--==--==--==--==--==--==--==
	healthByRarity(baseHealth,perRarity,rarity,baseRarity)
	{
		// FinalHealth
		var FH = baseHealth;
		
		// Increase final health by 10 per rarity
		var RARE = rarity;
		
		// Since this item has a base rarity of 1, subtract 1 from what we get
		RARE -= baseRarity;
		if (RARE < 0) {RARE = 0;}
		
		// Actually apply the rarity, 20 per rarity
		FH += (perRarity*RARE);
		
		return FH;
	}
	
	// --==--==--==--==--==--==--==--==--==
	// RETURN AN ITEM'S RARITY
	// --==--==--==--==--==--==--==--==--==
	slotRarity(itemID, account)
	{
		var ID = this.itemDecide(account,itemID);
		if (ID == undefined) {return undefined;}
		return ID.num.rarity;
	}
	
	// --==--==--==--==--==--==--==--==--==
	// RETURN AN ITEM FROM A SLOT
	// --==--==--==--==--==--==--==--==--==
	itemInSlot(itemID, account, removeIt, full = false, save = true)
	{
		var ID = this.itemDecide(account,itemID);
		if (ID == undefined) {return undefined;}
		
		// REMOVE THE ITEM
		if (removeIt)
		{
			if (ID.backpack) {ID.num.id = "";}
			else {ID.num.item = "";}
			
			if (save){this.core.accountManager.saveAccount(account.id);}
		}
		else
		{
			if (!full)
			{
				if (ID.backpack) {return this.itemByID(ID.num.id);}
				else {return this.itemByID(ID.num.item);}
			}
			else
			{
				var RTRN = {id: undefined, item: undefined, rarity:0, prefixes:[], suffixes:[]};
				
				if (ID.backpack) {RTRN.item = this.itemByID(ID.num.id); RTRN.id = ID.num.id;}
				else {RTRN.item = this.itemByID(ID.num.item); RTRN.id = ID.num.item;}
				
				RTRN.rarity = ID.num.rarity;
				RTRN.prefixes = ID.num.prefixes;
				RTRN.suffixes = ID.num.suffixes;
				
				return RTRN;
			}
		}
	}
	
	// --==--==--==--==--==--==--==--==--==
	// SWITCH ITEMS IN TWO DIFFERENT SLOTS
	// --==--==--==--==--==--==--==--==--==
	itemSwap(itemID, account)
	{
		var ID = this.itemDecide(account,itemID);
		if (ID == undefined) {return undefined;}
		
		// REMOVE THE ITEM
		if (removeIt)
		{
			if (ID.backpack) {ID.num.id = "";}
			else {ID.num.item = "";}
			
			this.core.accountManager.saveAccount(account.id);
		}
		else
		{
			if (ID.backpack) {return ID.num.id;}
			else {return ID.num.item;}
		}
	}
	
	// --==--==--==--==--==--==--==--==--==
	// ACTUALLY ENCHANT AN ITEM
	// --==--==--==--==--==--==--==--==--==
	enchantItem(itemID, account)
	{	
		var NAM = "";
		var ID = this.itemDecide(account,itemID);
		if (ID == undefined) {return "Something went wrong, maybe you typed in the wrong number?";}
		
		var ITM = this.itemByID(ID.id);
		if (ITM == undefined) {return "There is no item in that slot.";}
		
		if (ID.num.prefixes.length > 0) {return "That item has already been enchanted.";}

		var PRFX = this.core.calculator.pickPrefixes(ITM.item.inventoryProperties.allowedPrefixes);
		
		// -- DECIDE FINAL RARITY --
		var RR = -1;
		for (var l=0; l<PRFX.length; l++) {if (PRFX[l].bonus > RR) {RR = PRFX[l].bonus}}
		
		var SUFF = this.core.calculator.pickSuffixes(ITM.item.inventoryProperties.allowedSuffixes);
		
		if (ID.backpack) 
		{
			account.template.backpack[ID.rawnum].prefixes = PRFX;
			account.template.backpack[ID.rawnum].rarity = RR;
			account.template.backpack[ID.rawnum].suffixes = SUFF;
		}
		else 
		{
			account.template.inventory[ID.rawnum].prefixes = PRFX;
			account.template.inventory[ID.rawnum].rarity = RR;
			account.template.inventory[ID.rawnum].suffixes = SUFF;
		}
		
		var MSG = [];
		for (var l=0; l<PRFX.length; l++) {MSG.push(PRFX[l].message);}
		
		this.core.accountManager.saveAccount(account.id);
		
		var MESS = ":gem: **Your item has been enchanted!** :gem:\nA mystic power has blessed your `"+ITM.item.inventoryProperties.itemName+"` and turned it to `"+this.fullName(ITM.item.inventoryProperties.itemName,PRFX,SUFF)+"`.";
		
		return MESS;
	}
	
	// --==--==--==--==--==--==--==--==--==
	// USER WANTS TO DROP ONE OF THEIR ITEMS
	// --==--==--==--==--==--==--==--==--==
	dropItem(message, itemID, account)
	{	
		var NAM = "";
		var ID = this.itemDecide(account,itemID);
		if (ID == undefined) {return undefined;}
		
		if (ID.backpack) {NAM = this.getItemName(ID.num.id);}
		else {NAM = this.getItemName(ID.num.item);}
		
		var NM = this.fullName(NAM,ID.num.prefixes,ID.num.suffixes);
		
		console.log(ID);
		
		// Remove the item once we got the name
		this.itemInSlot(itemID,account,true);

		message.reply("You dropped `"+NM+"`.");
	}
	
	// --==--==--==--==--==--==--==--==--==
	// GET AN ICON FOR AN ITEM
	// Absolute returns the file path, otherwise just returns the PNG name
	// --==--==--==--==--==--==--==--==--==
	getItemIcon(ID, absolute, allowLarge = false, useCombat = false)
	{
		var TI = this.itemByID(ID);
		if (TI == undefined) {return "";}
		
		if (!absolute)
		{
			if (allowLarge && TI.item.inventoryProperties.inventoryIconLarge != undefined) {return TI.item.inventoryProperties.inventoryIconLarge;}
			if (useCombat && TI.item.inventoryProperties.inventoryIconCombat != undefined) {return TI.item.inventoryProperties.inventoryIconCombat;}
			return TI.item.inventoryProperties.inventoryIcon;
		}
		else 
		{
			if (allowLarge && TI.item.inventoryProperties.inventoryIconLarge != undefined) {return this.mainDirectory+ID.toLowerCase()+'/'+TI.item.inventoryProperties.inventoryIconLarge;}
			if (useCombat && TI.item.inventoryProperties.inventoryIconCombat != undefined) {return this.mainDirectory+ID.toLowerCase()+'/'+TI.item.inventoryProperties.inventoryIconCombat;}
			return this.mainDirectory+ID.toLowerCase()+'/'+TI.item.inventoryProperties.inventoryIcon;
		}
	}
	
	// --==--==--==--==--==--==--==--==--==
	// GET AN ITEM'S NAME
	// --==--==--==--==--==--==--==--==--==
	getItemName(ID)
	{
		var TI = this.itemByID(ID);
		if (TI == undefined) {return "UNKNOWN";}
		
		return TI.item.inventoryProperties.itemName;
	}
	
	// --==--==--==--==--==--==--==--==--==
	// DEBUG AN ITEM
	// --==--==--==--==--==--==--==--==--==
	itemDebug(channel, id)
	{
		var IT = this.itemByID(id);
		if (IT == undefined) {channel.sendMessage("No such item with ID `"+id+"` exists in codex.");}
		else 
		{
			channel.sendCode(util.inspect(IT));
			channel.sendFile(this.mainDirectory+id+'/'+IT.item.inventoryProperties.inventoryIcon)
		}
	}
}

module.exports = IManager;
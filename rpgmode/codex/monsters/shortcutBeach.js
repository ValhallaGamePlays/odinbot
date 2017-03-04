// SHORTCUT TO SET UP THE BEACH MONSTERS

function setupBeach(it)
{
	it.information.floorOverride = {img:'beachfloor.png',onBoss:true};
	it.information.backgroundOverride = {img:'beach.png',onBoss:true};
	
	it.information.lootTable.push({item:"squirtpistol",chance:0.5})
	it.information.lootTable.push({item:"voodooring",chance:0.9})
	
	it.information.tags = ["beach"];
}

module.exports = setupBeach;
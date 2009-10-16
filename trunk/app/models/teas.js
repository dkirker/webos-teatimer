/******************************************************************************
 * 
 * Copyright (C) 2009 by Richard Ferguson <fergus420@gmail.com>
 * 
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
 * 
 *****************************************************************************/

var Teas = Class.create ({
	initialize: function() {
		this.list = []; //this.getDefaultList();
	},
	
	getDefaultList: function() {
		var returnList = [];
		
		if (isUSRegion()) {
			returnList[0] = { name: "Black",   time: 300, temp: 212 };
			returnList[1] = { name: "Oolong",  time: 360, temp: 190 };
			returnList[2] = { name: "White",   time: 240, temp: 180 };
			returnList[3] = { name: "Green",   time: 180, temp: 160 };
			returnList[4] = { name: "Rooibos", time: 300, temp: 212 };
		} else {
			returnList[0] = { name: "Black",   time: 300, temp: 100 };
			returnList[1] = { name: "Oolong",  time: 360, temp: 90  };
			returnList[2] = { name: "White",   time: 240, temp: 80  };
			returnList[3] = { name: "Green",   time: 180, temp: 70  };
			returnList[4] = { name: "Rooibos", time: 300, temp: 100 };
		}
		return returnList;
	},
	
	eraseDB: function() {
		Mojo.Log.info("eraseDB:");
		this.db.removeAll(
			this.eraseDBSuccess.bind(this),
			this.eraseDBFailure.bind(this)
		);
	},
	
	eraseDBSuccess: function() {
		Mojo.Log.info("eraseDB: erased!");
	},
	
	eraseDBFailure: function(result) {
		Mojo.Log.warn("eraseDB: failed! ", result);	
	},
	
	storeDB: function() {
		Mojo.Log.info("storeDB: data>> %j", this.list);
		//return;
		this.db.add("teas", this.list, 
			this.storeDBSuccess.bind(this),
			this.storeDBFailure.bind(this)			
		);
	},
	
	storeDBSuccess: function() {
		Mojo.Log.info("storeDB: list saved!");
	},
	
	storeDBFailure: function(result) {
		Mojo.Log.warn("storeDB: store failed! ", result);	
	},
	
	loadDB: function() {
		Mojo.Log.info("loadDB");
		this.db = new Mojo.Depot(
			{
			name: "teaDB",
			version: 1,
			estimatedSize: 2000
			},
			this.loadDBOpenSuccess.bind(this),
			this.loadDBOpenFailure.bind(this)
		);
	},
	
	loadDBOpenSuccess: function(result) {
		Mojo.Log.info("loadDBOpenSucess: Teas database opened!");
		this.db.get("teas",
			this.getDBSuccess.bind(this),
			this.useDefaultDB.bind(this)
		);
	},
	
	loadDBOpenFailure: function(result) {
		Mojo.Log.warn("loadDBOpenFailure: Can't open teas database!");
	},
	
	getDBSuccess: function(data) {
		if (data === null) {
			Mojo.Log.warn("getDBSuccess: Returned empty record!");
			this.useDefaultDB();
		} else {
			Mojo.Log.info("getDBSuccess: data>> %j", data);
			this.list = data;
			
			// migrate time from min to sec
			Mojo.Log.info("getDBSuccess: ", Calesco.lastVersion);
			if (Calesco.lastVersion == "0.3.0" ||
				Calesco.lastVersion == "0.4.0" ||
				Calesco.lastVersion == "0.4.1" ||
				Calesco.lastVersion == "0.5.0" ||
				Calesco.lastVersion == "0.5.1") {
			
				Mojo.Log.info("getDBSuccess: Migrating to seconds...");
				for (var i=0; i<this.list.length; i++) {
					//Mojo.Log.info(this.list[i].time, ">", this.list[i].time * 60);
					this.list[i].time = parseInt(this.list[i].time * 60);
				}
			}
				
			Mojo.Log.info("getDBSuccess: data loaded!");
			Mojo.Controller.getAppController().sendToNotificationChain({
				action: "update-tea-list"
			});
			Mojo.Log.info("getDBSuccess: Notification sent");
		}	
	},
	
	useDefaultDB: function() {
		Mojo.Log.warn("useDefaultDB:");
		
		this.list = this.getDefaultList();
		Mojo.Controller.getAppController().sendToNotificationChain({
			type: "update"
		});
		
		Mojo.Log.info("useDefaultDB: Notification sent");
	}
 });

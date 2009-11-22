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

//Mojo.Log.info("appInfo: %j", Mojo.appInfo);

// Namespace
Calesco = {};

Calesco.appId = Mojo.appInfo.id;
Calesco.appName = Mojo.appInfo.title;
Calesco.appVersion = Mojo.appInfo.version;

Calesco.mainStageName = "calescoMain";
Calesco.dashboardStageName = "calescoDashboard";

// Preference Globals
// see prefences.js

// Application Menu
Calesco.MenuAttr = { omitDefaultItems: true};
Calesco.MenuModel = {
	visible : true,
	items: [
	//	{label: "Erase all data", command: "do-Erase"},
		Mojo.Menu.editItem,
		{label: $L("Preferences"), command: "do-Preferences"},
		{label: $L("Help"), command: "do-Help"}
	]
};

function AppAssistant() {
	
}

AppAssistant.prototype.setup = function() {
	Mojo.Log.info("AppAssistant.setup:");
	
	this.teas = new Teas(); 
};

AppAssistant.prototype.handleLaunch = function(params){
	Mojo.Log.info("handleLaunch:");
	
	var cardStageController = this.controller.getStageController(Calesco.mainStageName);
	var appController = Mojo.Controller.getAppController();
	
	if (!params) {
		if (cardStageController) {
			Mojo.Log.info("handleLaunch: main stage exists");
			//cardStageController.popScenesTo("main");
			cardStageController.activate();
		} else {
			Mojo.Log.info("handleLaunch: create main stage");
			var pushMainScene = function(stageController) {
				stageController.pushScene("tea-list-view", this.teas);
			};
			var stageArguments = {
				name: Calesco.mainStageName,
				lightweight: true
			};
			this.controller.createStageWithCallback(stageArguments,
					pushMainScene.bind(this), "card");
		}
	} else {
		switch (params.action) {
			case "notification":
				Mojo.Log.info("handleLaunch: notification");
				if (cardStageController) {
					Mojo.Log.info("handleLaunch: main stage exists");
					cardStageController.activate();
				} else {
					Mojo.Log.info("handleLaunch: create main stage");
					var pushMainSceneN = function(stageController) {
						stageController.pushScene("tea-list-view", this.teas);
					};
					var stageArgumentsN = {
						name: Calesco.mainStageName,
						lightweight: true
					};
					this.controller.createStageWithCallback(stageArgumentsN,
							pushMainSceneN.bind(this), "card");
				}
			break;
		}
	}	
};

AppAssistant.prototype.handleCommand = function(event) {
	var stageController = this.controller.getActiveStageController();
	var currentScene = stageController.activeScene();
	
	if (event.type == Mojo.Event.command) {
		switch(event.command){
			case "do-Help":
				stageController.pushAppSupportInfoScene();
			break;
			case "do-Preferences":
				stageController.pushScene("preferences", this.teas);
			break;
			//case "do-Erase":
			//	this.teas.eraseDB();
			//	Calesco.Prefs.erase();				
			//break;
		}
	}
};

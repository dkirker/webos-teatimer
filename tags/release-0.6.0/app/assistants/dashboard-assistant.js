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

function DashboardAssistant(name, date) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	this.name = name;
	this.date = date;
}

DashboardAssistant.prototype.updateDashboard = function(name, date) {
	Mojo.Log.info("updateDashboard:");
	
	this.name = name;
	this.date = date;
	this.displayDashboard();
};

DashboardAssistant.prototype.displayDashboard = function(name, date) {
	Mojo.Log.info("displayDashboard:");
	
	var hrs = this.date.getHours();
	var min = this.date.getMinutes();
	var m = "am";
	var c = ":";
	if (hrs > 12) {
		hrs -= 12;
		m = "pm";
	}
	if (min < 10) {	c += "0"; }
	
	var title = "Your tea was ready at " + hrs + c + min + " " + m;
	var msg = "";
//	if (name != "Timer Preset") {
//		msg += this.name;
//	}
	
	var info = { title: title, message: msg};
	var renderedInfo = Mojo.View.render({
		object: info,
		template: "dashboard/infoTemplate"
	});
	this.controller.get("dashboardinfo").innerHTML = renderedInfo;
};

DashboardAssistant.prototype.launchMain = function() {
	Mojo.Log.info("launchMain:");
	
	// Re-focus application
	var appController = Mojo.Controller.getAppController();
	appController.assistant.handleLaunch({action: "notification"});
	
	// remove dashboard
	this.controller.window.close();
};

//DashboardAssistant.prototype.activateStage = function(event) {
//};

DashboardAssistant.prototype.setup = function() {
	Mojo.Log.info("dashboard setup:");
	/* this function is for setup tasks that have to happen when the scene is first created */
	this.displayDashboard();
	
	/* use Mojo.View.render to render view templates and add them to the scene, if needed. */
	
	/* setup widgets here */
	
	/* add event handlers to listen to events from widgets */
	this.switchHandler = this.launchMain.bindAsEventListener(this);
	
	this.stageDocument = this.controller.stageController.document;
	this.controller.listen("dashboardinfo", Mojo.Event.tap, this.switchHandler);
};

DashboardAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};


DashboardAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

DashboardAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	
	// Stop Alarm
	Mojo.Controller.getAppController().sendToNotificationChain({
		action: "stop-alarm"
	});
    
	// Cleanup event listeners
	this.controller.stopListening("dashboardinfo", Mojo.Event.tap, this.switchHandler);
};

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

function TimerViewAssistant(is_tea, teas, item) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	
	this.alreadyStarted = 0;
	  
	this.is_tea = is_tea;
	this.teas = teas;
	this.item = item;
	  
	this.init_seconds = item.time;
	this.timer_seconds = item.time;
	this.is_running = 0;
	this.tea_name = item.name;
}

TimerViewAssistant.prototype.startTimer = function() {
	this.start_date = new Date();
	this.timer = this.controller.window.setInterval(this.handleInterval.bind(this), 1000);
	this.is_running = 1;
};

TimerViewAssistant.prototype.stopTimer = function() {
	cur = new Date();
	this.timer_seconds = this.timer_seconds - ((cur.getTime() - this.start_date.getTime()) / 1000).toFixed(0);
	// stop timer
	this.controller.window.clearInterval(this.timer);
	this.is_running = 0;
};

TimerViewAssistant.prototype.resetTimer = function () {
	this.timer_seconds = this.init_seconds;
};

TimerViewAssistant.prototype.updateTimerView = function(seconds) {
	this.controller.get("timeRemaining").innerHTML = sec2str(seconds);
};

TimerViewAssistant.prototype.setViewActive = function () {
	this.btnStartModel.label = $L("Stop");	
	this.btnStartModel.buttonClass = "negative";
	this.controller.modelChanged(this.btnStartModel);
	this.btnResetModel.disabled = true;
	this.controller.modelChanged(this.btnResetModel);
};

TimerViewAssistant.prototype.setViewInactive = function () {
	this.btnStartModel.label = $L("Start");	
	this.btnStartModel.buttonClass = "affirmative";
	this.controller.modelChanged(this.btnStartModel);
	this.btnResetModel.disabled = false;
	this.controller.modelChanged(this.btnResetModel);
};

TimerViewAssistant.prototype.timeup = function() {

	if (!this.controller.stageController.isActiveAndHasScenes()) {
//	if (true) {
		Mojo.Log.info("Timeup: Send notificaiton");
		appController = Mojo.Controller.getAppController();
		
		bannerParams = {
			messageText: $L("Your tea is ready."),
			icon: "../images/icon_32x32.png"
		};
		appController.showBanner(bannerParams, {}, "timer");
		
		Mojo.Log.info("Timeup: Launch dashboard");
		var stageController = this.controller.stageController;
		var dashboardStageController = appController.getStageProxy(Calesco.dashboardStageName);
		if (!dashboardStageController) {
			Mojo.Log.info("Timeup: New dashboard stage");
			
			name = this.tea_name;
			var stopAlarmHandler = this.stopAlarm.bind(this);
			var pushDashboard = function (stageController) {
				stageController.pushScene("dashboard", name, new Date(), stopAlarmHandler);
			};
			appController.createStageWithCallback({
				name: Calesco.dashboardStageName,
				lightweight: true
				}, 
				pushDashboard, "dashboard"
			);
			Mojo.Log.info("Timeup: dashboard created!");
		} else {
			Mojo.Log.info("Timeup: Existing dashboard");
			dashboardStageController.delegateToSceneAssistant("updateDashboard", this.tea_name, new Date(), this.stopAlarm.bind(this));
		}
	} else {
		// Show Alert Dialog
		Mojo.Log.info("Timeup: Show Alert Dialog");
		this.controller.showAlertDialog({
			onChoose: this.stopAlarm.bind(this),
			title : $L("Tea Timer"),
			message: $L("Your tea is ready."),
			choices: [{label: $L("OK")}]
		});
	}

	Mojo.Log.info("Timeup: Play sound");
	// Play Sound
	this.alarm.play();
};

TimerViewAssistant.prototype.stopAlarm = function () {
	this.alarm.stop();
	this.power.uninhibit();
};

TimerViewAssistant.prototype.handleInterval = function () {
	cur = new Date();
	sec_left = this.timer_seconds - ((cur.getTime() - this.start_date.getTime()) / 1000).toFixed(0);
	this.updateTimerView(sec_left);
	
	if (sec_left <= 0) {
		this.stopTimer();
		this.resetTimer();
		this.updateTimerView(this.timer_seconds);
		this.setViewInactive();
		this.timeup();
	}
};

TimerViewAssistant.prototype.handleBtnReset = function() {
	this.resetTimer();
	this.updateTimerView(this.timer_seconds);
};

TimerViewAssistant.prototype.handleBtnStart = function () {
	Mojo.Log.info("handleBtnStart:");
	if (!this.is_running) {
		this.startTimer();
		this.setViewActive();
		this.power.inhibit(this.timer_seconds + 60);
	} else {
		this.stopTimer();
		this.setViewInactive();
		this.power.uninhibit();
	}
};

//TimerViewAssistant.prototype.considerForNotification = function(params) {
//	Mojo.Log.info("considerForNotification:");
//	if (params && params.action == "stop-alarm") {
//		this.stopAlarm();
//	}
//};

TimerViewAssistant.prototype.setTitleStr = function() {
	// construct title str
	var titleStr = this.tea_name;
	var firstParam = 1;
	if (this.item.temp) {
		if (firstParam) {
			titleStr += "<br/>";
			firstParam = 0;
		} else {
			titleStr += " - ";
		}
		titleStr += this.item.temp;
		if (!hasUnit(this.item.temp)) {
			titleStr += "'" + Calesco.teaTempUnit;
		}
	}
	if (this.item.amnt) {
		if (firstParam) {
			titleStr += "<br/>";
			firstParam = 0;
		} else {
			titleStr += " - ";
		}
		titleStr += this.item.amnt;	
		if (!hasUnit(this.item.amnt)) {
			titleStr += Calesco.teaAmntUnit;
		}
	}
	if (this.item.wvol) {
		if (firstParam) {
			titleStr += "<br/>";
			firstParam = 0;
		} else {
			titleStr += " - ";
		}
		titleStr += this.item.wvol;	
		if (!hasUnit(this.item.wvol)) {
			titleStr += Calesco.teaWvolUnit;
		}
	}
    this.controller.get("teaName").innerHTML = titleStr;
	
};

TimerViewAssistant.prototype.setup = function() {
	Mojo.Log.info("TimerViewAssisant: setup");
	
	/* this function is for setup tasks that have to happen when the scene is first created */
		
	/* use Mojo.View.render to render view templates and add them to the scene, if needed. */
	this.controller.setupWidget(Mojo.Menu.appMenu, Calesco.MenuAttr, Calesco.MenuModel);
	
	/* setup widgets here */
	this.setTitleStr();
	
	this.controller.get("grouplabel-timer").innerHTML = $L("Time Remaining");
	this.controller.setupWidget("btnStart",
	{},
	this.btnStartModel = {
		label : $L("Start"),
		buttonClass: "affirmative", 
		disabled : false
	});
	this.controller.setupWidget("btnReset",
	{},
	this.btnResetModel = {
		label : $L("Reset"),
		disabled : false
	});
	
	this.controller.get("timeRemaining").innerHTML = sec2str(this.init_seconds);
	
	/* add event handlers to listen to events from widgets */
	this.btnStartHandler = this.handleBtnStart.bind(this);
	this.btnResetHandler = this.handleBtnReset.bind(this);
	
	// bind the button to its handler
    this.controller.listen('btnStart', Mojo.Event.tap, this.btnStartHandler);
    this.controller.listen('btnReset', Mojo.Event.tap, this.btnResetHandler);
	
	// Initialize Alarm & Power controllers 
	this.alarm = new CalescoAlarm(this.controller,"audioElement");
	this.power = new CalescoPower(this.controller);
};

TimerViewAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	
	this.setTitleStr();
	
	// Autostart
	if (Calesco.timerAutostart && !this.alreadyStarted) {
		this.alreadyStarted = 1;
		this.startTimer();
		this.setViewActive();
		this.power.inhibit(this.timer_seconds + 60);
	}
};

TimerViewAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

TimerViewAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
  	this.controller.stopListening('btnStart', Mojo.Event.tap, this.btnStartHandler);
  	this.controller.stopListening('btnReset', Mojo.Event.tap, this.btnResetHandler);
	
	if (this.is_running) {
		Mojo.Log.info("TimerViewAssistant.cleanup: Stopping active timer and power inhibit");
		this.stopTimer();
		this.power.uninhibit();
	}
	
	this.alarm.cleanup();
};

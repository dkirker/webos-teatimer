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

function TeaListViewAssistant(teas) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	this.teas = teas;
	this.filtering = 0;
}

TeaListViewAssistant.prototype.handleLstTeaTap = function (event) {
	
	var targetClass = event.originalEvent.target.className;
	if (targetClass.indexOf("edit-tea-target") === 0) {
		this.controller.stageController.pushScene("tea-view", this.teas, event.item, true);
	} else {
		this.controller.stageController.pushScene("timer-view", true, this.teas, event.item);
	}	
};

TeaListViewAssistant.prototype.handleLstTeaDelete = function(event){
	Mojo.Log.info("handleLstTeaDelete");
	var index = this.teas.list.indexOf(event.item);
	this.teas.list.splice(index,1);
	this.teas.storeDB();
	
	this.controller.modelChanged(this.teasModel);
	this.updateFilterListModel(false);
};

TeaListViewAssistant.prototype.handleLstTeaReorder = function(event){
	var fromIndex = this.teas.list.indexOf(event.item);
	var toIndex = event.toIndex;
	Mojo.Log.info(fromIndex, toIndex);
	this.teas.list.splice(fromIndex,1);
	this.teas.list.splice(toIndex,0,event.item);	
	this.teas.storeDB();
};

//TeaListViewAssistant.prototype.considerForNotification = function(params) {
//	Mojo.Log.info("considerForNotification:");
//	if (params && params.action == "update-tea-list") {
//		Mojo.Log.info("considerForNotification: database load update %j", this.teas.list);
//		this.teasModel.items = this.teas.list;
//		this.controller.modelChanged(this.teasModel);
//	}
//};

TeaListViewAssistant.prototype.tempFormatter = function(value) {
	if (value) {
		return "- " + value + "'" + Calesco.teaTempUnit;
	}
	return "";
};

TeaListViewAssistant.prototype.amntFormatter = function(value) {
	if (value) {
		return "- " + value + Calesco.teaAmntUnit;
	}
	return "";
};

TeaListViewAssistant.prototype.wvolFormatter = function(value) {
	if (value) {
		return "- " + value + Calesco.teaWvolUnit;
	}
	return "";
};

TeaListViewAssistant.prototype.timeFormatter = function(value) {
	if (value) {
		return sec2str(value);
	}
	return "";
};

TeaListViewAssistant.prototype.handleCommand = function(event) {
	if(event.type == Mojo.Event.command) {
		switch(event.command) {
			case "do-Add":
				Mojo.Log.info("do-Add");
				this.controller.stageController.pushScene("tea-view", this.teas, event.item, false);	
			break;
			case "preset-30s":
				this.controller.stageController.pushScene("timer-view", false, false, {
					time: 30, name: $L("Timer Preset")
				});
			break;
			case "preset-1m":
				this.controller.stageController.pushScene("timer-view", false, false, {
					time: 60, name: $L("Timer Preset")
				});
			break;
			case "preset-2m":
				this.controller.stageController.pushScene("timer-view", false, false, {
					time: 120, name: $L("Timer Preset")
				});
			break;
			case "preset-3m":
				this.controller.stageController.pushScene("timer-view", false, false, {
					time: 180, name: $L("Timer Preset")
				});
			break;
			case "preset-4m":
				this.controller.stageController.pushScene("timer-view", false, false, {
					time: 240, name: $L("Timer Preset")
				});
			break;
			case "preset-5m":
				this.controller.stageController.pushScene("timer-view", false, false, {
					time: 300, name: $L("Timer Preset")
				});
			break;
		}
	}
};

TeaListViewAssistant.prototype.updateFilterListModel = function (fast) {
	Mojo.Log.info("updateFilterListModel:");
	
	if (this.filtering) {
		if (fast) {
			this.filterListWidget.mojo.noticeUpdatedItems(this.filterOffset, this.filterSubset);
		} else {
			this.filterTeas(this.filterString, this.filterListWidget, this.filterOffset, this.filterCount);
		}
	}
};

TeaListViewAssistant.prototype.filterTeas  = function(filterString, listWidget, offset, count)    {
    Mojo.Log.info("filterTeas:");
	
	var subset = [];
    var totalSubsetSize = 0;
    
    //    If search string is null, then return empty list, otherwise build results list
    if (filterString !== "") {
		Mojo.Log.info("filterTeas: filtering... %s", filterString);
		
		// Search database for stories with the search string; push matches
		var items = [];
		
		// Comparison function for matching strings in next for loop
		var hasString = function(query, s){
			if (s.name.toUpperCase().indexOf(query.toUpperCase()) >= 0) {
				return true;
			}
			if (s.time.toString().toUpperCase().indexOf(query.toUpperCase()) >= 0) {
				return true;
			}
			if (s.temp.toString().toUpperCase().indexOf(query.toUpperCase()) >= 0) {
				return true;
			}
			return false;
		};
		
		for (var i = 0; i < this.teas.list.length; i++) {
			Mojo.Log.info("checking: ", this.teas.list[i].name);
			if (hasString(filterString, this.teas.list[i])) {
				var tea = this.teas.list[i];
				items.push(tea);		
			}
		}
	
    	Mojo.Log.info("Search list asked for items: filter=",
        	filterString, " offset=", offset, " limit=", count);

	    // Cut down the list results to just the window asked for by the filterList widget
   		var cursor = 0;
        while (true) {
            if (cursor >= items.length) {
                break;
            }
            
			if (subset.length < count && totalSubsetSize >= offset) {
                subset.push(items[cursor]);
            }
            totalSubsetSize++;
            cursor++;
        }
    }
	
	this.filterString = filterString;
	this.filterListWidget = listWidget;
	this.filterOffset = offset;
	this.filterCount = count;
	this.filterSubset = subset;

    // Update List
    listWidget.mojo.noticeUpdatedItems(offset, subset);

    // Update filter field count of items found
    listWidget.mojo.setLength(totalSubsetSize);
    listWidget.mojo.setCount(totalSubsetSize);
};

TeaListViewAssistant.prototype.filterFilter = function(event) {
	Mojo.Log.info("filterFilter: ", event.filterString);
    var teaListMainElement = this.controller.get("teaListMain");
    if (event.filterString !== "")    {
        //    Hide rest of feedList scene to make room for search results
        teaListMainElement.hide();
		this.cmdMenuModel.items[0].items[0].disabled = true;
		this.controller.modelChanged(this.cmdMenuModel);
		this.filtering = 1;
    } else {
        //    Restore scene when search string is null
        teaListMainElement.show();
		this.cmdMenuModel.items[0].items[0].disabled = false;
		this.controller.modelChanged(this.cmdMenuModel);
		this.filtering = 0;
    }
};

TeaListViewAssistant.prototype.setup = function() {
	Mojo.Log.info("TeaListViewAssistant: setup");
	/* this function is for setup tasks that have to happen when the scene is first created */
	this.controller.setupWidget(Mojo.Menu.appMenu, Calesco.MenuAttr, Calesco.MenuModel);
			
	/* use Mojo.View.render to render view templates and add them to the scene, if needed. */
	this.cmdMenuModel = {
		visible: true,
		items: [{
			items: [{
				disabled: false,
				icon: "new",
				command: "do-Add"
			}]
		},{},{
			items: [{
				disabled: false,
				label: $L("Presets"),
				submenu: "presets-menu"
			}]
		}]
	};
	
	this.controller.get("headerlabel").innerHTML = $L("Tea List");
	
	this.controller.setupWidget(Mojo.Menu.commandMenu, undefined, this.cmdMenuModel);
	this.controller.setupWidget("presets-menu", undefined, this.presetsModel = {
		items: [
			{ label: $L("30 Seconds"), command: "preset-30s"},
			{ label: $L("1 Minute"),   command: "preset-1m"},
			{ label: $L("2 Minutes"),  command: "preset-2m"},
			{ label: $L("3 Minutes"),  command: "preset-3m"},
			{ label: $L("4 Minutes"),  command: "preset-4m"},
			{ label: $L("5 Minutes"),  command: "preset-5m"}
		]
	});
		
	/* setup widgets here */
	this.controller.setupWidget("filterTeaList",
		{
			itemTemplate: "tea-list-view/teaRowTemplate",
			listTemplate: "tea-list-view/teaListTemplate",		
			filterFunction: this.filterTeas.bind(this),
			formatters: { temp: this.tempFormatter.bind(this),
						  amnt: this.amntFormatter.bind(this),
						  wvol: this.wvolFormatter.bind(this),
						  time: this.timeFormatter.bind(this)},
			swipeToDelete: true
		},
		this.filterTeasModel = { 
			disabled: false
		}
	);

	this.controller.setupWidget("lstTea",
		{
			itemTemplate: "tea-list-view/teaRowTemplate",
			listTemplate: "tea-list-view/teaListTemplate",		
			//addItemLabel: "Add...",
			swipeToDelete: true,
			autoconfirmDelete: false,
			reorderable: true,
			formatters: { temp: this.tempFormatter.bind(this),
						  amnt: this.amntFormatter.bind(this),
						  wvol: this.wvolFormatter.bind(this),
						  time: this.timeFormatter.bind(this)}
		},
		this.teasModel = { 
			items : this.teas.list
		}
	);
	/* add event handlers to listen to events from widgets */
		
	this.filterFilterHandler = this.filterFilter.bind(this);
	
	this.lstTapHandler = this.handleLstTeaTap.bind(this);
	this.lstDeleteHandler = this.handleLstTeaDelete.bind(this);
	this.lstReorderHandler = this.handleLstTeaReorder.bind(this);
	
	this.controller.listen("filterTeaList", Mojo.Event.filter, this.filterFilterHandler);
	this.controller.listen('filterTeaList', Mojo.Event.listTap, this.lstTapHandler);	
	this.controller.listen('filterTeaList', Mojo.Event.listDelete, this.lstDeleteHandler);
	this.controller.listen('lstTea', Mojo.Event.listTap, this.lstTapHandler);
	this.controller.listen('lstTea', Mojo.Event.listDelete, this.lstDeleteHandler);
	this.controller.listen('lstTea', Mojo.Event.listReorder, this.lstReorderHandler);
	
	this.controller.setupWidget("spnLoading",
		{spinnerSize: 'large'},
		this.spnLoadingModel = {spinning: true}
	);
	
	this.timer = this.controller.window.setInterval(this.delayedLoading.bind(this), 500);
	this.teas.loadDB();
};

TeaListViewAssistant.prototype.delayedLoading = function() {
	if (this.teas.loaded) {
		Mojo.Log.info("delayedLoading: database load update %j", this.teas.list);
		
		Calesco.Prefs.initialize();
		
		this.teasModel.items = this.teas.list;
		this.controller.modelChanged(this.teasModel);
		this.controller.window.clearInterval(this.timer);
		
		this.spnLoadingModel.spinning = false;
		this.controller.modelChanged(this.spnLoadingModel);
		this.controller.get("scrim").hide();
	}
};

TeaListViewAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
 	this.controller.modelChanged(this.teasModel);
};

TeaListViewAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

TeaListViewAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	
	this.controller.stopListening("filterTeaList", Mojo.Event.filter, this.filterFilterHandler);
	this.controller.stopListening('filterTeaList', Mojo.Event.listTap, this.lstTapHandler);
	this.controller.stopListening('filterTeaList', Mojo.Event.listDelete, this.lstDeleteHandler);
	this.controller.stopListening('lstTea', Mojo.Event.listTap, this.lstTapHandler);
	this.controller.stopListening('lstTea', Mojo.Event.listDelete, this.lstDeleteHandler);
	this.controller.stopListening('lstTea', Mojo.Event.listReorder, this.lstReorderHandler);
};

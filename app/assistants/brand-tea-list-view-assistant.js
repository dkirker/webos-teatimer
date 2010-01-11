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

function BrandTeaListViewAssistant(brand, style, teas) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	
	
	this.brandteas = [];
	this.brand = brand;
	this.style = style;
	this.teas = teas;
	this.filtering = 0;
}

BrandTeaListViewAssistant.prototype.handleLstTeaTap = function (event) {
	
	var targetClass = event.originalEvent.target.className;
	if (targetClass.indexOf("edit-tea-target") === 0) {
		// Open brand website
		this.controller.serviceRequest("palm://com.palm.applicationManager", {
			method: "open",
			parameters:  {
				id: 'com.palm.app.browser',
				params: {
					target: event.item.url
				}
			}
		});
	} else {
		this.controller.stageController.pushScene("timer-view", true, this.teas, event.item);
	}	
};

BrandTeaListViewAssistant.prototype.tempFormatter = function(value) {
	var str = "";
	if (value) {
		str = "- " + value;
		if (!hasUnit(value)) {
			str += "'" + Calesco.teaTempUnit;
		}
	}
	return str;
};

BrandTeaListViewAssistant.prototype.amntFormatter = function(value) {
	var str = "";
	if (value) {
		str = "- " + value;
		if (!hasUnit(value)) {
			str += Calesco.teaAmntUnit;
		}
	}
	return str;
};

BrandTeaListViewAssistant.prototype.wvolFormatter = function(value) {
	var str = "";
	if (value) {
		str = "- " + value;
		if (!hasUnit(value)) {
			str += Calesco.teaWvolUnit;
		}
	}
	return str;
};

BrandTeaListViewAssistant.prototype.timeFormatter = function(value) {
	if (value) {
		return sec2str(value);
	}
	return "";
};

BrandTeaListViewAssistant.prototype.updateFilterListModel = function (fast) {
	Mojo.Log.info("updateFilterListModel:");
	
	if (this.filtering) {
		if (fast) {
			this.filterListWidget.mojo.noticeUpdatedItems(this.filterOffset, this.filterSubset);
		} else {
			this.filterTeas(this.filterString, this.filterListWidget, this.filterOffset, this.filterCount);
		}
	}
};

BrandTeaListViewAssistant.prototype.filterTeas  = function(filterString, listWidget, offset, count)    {
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
			if (s.type.toString().toUpperCase().indexOf(query.toUpperCase()) >= 0) {
				return true;
			}
			return false;
		};
		
		for (var i = 0; i < this.brandteas.length; i++) {
			Mojo.Log.info("checking: ", this.brandteas[i].name);
			if (hasString(filterString, this.brandteas[i])) {
				var tea = this.brandteas[i];
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

BrandTeaListViewAssistant.prototype.filterFilter = function(event) {
	Mojo.Log.info("filterFilter: ", event.filterString);
    var brandListMainElement = this.controller.get("brandListMain");
    if (event.filterString !== "")    {
        //    Hide rest of feedList scene to make room for search results
        brandListMainElement.hide();
		this.filtering = 1;
    } else {
        //    Restore scene when search string is null
        brandListMainElement.show();
		this.filtering = 0;
    }
};

BrandTeaListViewAssistant.prototype.listDivider = function(item) {
	return item.type;
};

BrandTeaListViewAssistant.prototype.handleCommand = function(event) {
	if(event.type == Mojo.Event.command) {
		switch(event.command) {
			case "do-Add":
				Mojo.Log.info("do-Add");
				
				// find marked teas and add to local list
				var added = 0;
				for (var i = 0; i < this.brandteas.length; i++) {
					if (this.brandteas[i].marked) {
						delete this.brandteas[i].marked; // remove marker before adding to list
						
						Mojo.Log.info("Marked Tea: %s", this.brandteas[i].name);
						var pushtea = {};
						if (this.brandteas[i].type) { pushtea.type = this.brandteas[i].type; }
						if (this.brandteas[i].time) { pushtea.time = this.brandteas[i].time; }
						if (this.brandteas[i].temp) { pushtea.temp = this.brandteas[i].temp; }
						if (this.brandteas[i].amnt) { pushtea.amnt = this.brandteas[i].amnt; }
						if (this.brandteas[i].wvol) { pushtea.wvol = this.brandteas[i].wvol; }
						
						pushtea.brand = this.brand.brand;
//						pushtea.name = this.brand.brand + " " + this.brandteas[i].name;
						pushtea.name = this.brandteas[i].name;
						if (pushtea.name.search(/\bTea\b/) < 0) {
							pushtea.name += " " + this.brandteas[i].type;
						}
						this.teas.list.push(pushtea);
						added += 1;
					}
				}
				if (added) {
					this.controller.modelChanged(this.brandsModel);
					
					this.teas.storeDB();
					if (Calesco.teaSort) {
						this.teas.sort();
					}
					
					var msg;
					if (added == 1) {
						msg = $L("One tea was added to your local list!");
					} else {
						msg = $L("#{num} teas were added to your local list!").interpolate({num: added});
					}
					this.controller.showAlertDialog({
						onChoose: function(value) {},
						title: $L("Success"),
						message: msg,
						choices:[
							{label: $L('OK'), value:'ok', type:'color'}    
						]
					});	  
				}
			break;
		}
	}
};

BrandTeaListViewAssistant.prototype.setup = function() {
	Mojo.Log.info("BrandTeaListViewAssistant: setup");
	/* this function is for setup tasks that have to happen when the scene is first created */
	
	this.appMenuModel = {
		visible : true,
		items: [
		//	{label: "Erase all data", command: "do-Erase"},
			Mojo.Menu.editItem,
			{label: $L("Help"), command: "do-Help"}
		]
	};
	this.controller.setupWidget(Mojo.Menu.appMenu, Calesco.MenuAttr, this.appMenuModel);
	
	this.cmdMenuModel = {
		visible: true,
		items: [{},{},{
			items: [{
				disabled: false,
				icon: "new",
				command: "do-Add"
			}]
		}]
	};
	this.controller.setupWidget(Mojo.Menu.commandMenu, undefined, this.cmdMenuModel);
	this.controller.get("headerlabel").innerHTML = this.brand.brand;
			
	/* setup widgets here */
	this.controller.setupWidget("filterBrandList",
		{
			itemTemplate: "brand-tea-list-view/brandRowTemplate",
			listTemplate: "brand-tea-list-view/brandListTemplate",		
			dividerTemplate: "brand-tea-list-view/divider",
			dividerFunction: this.listDivider.bind(this),
			formatters: { temp: this.tempFormatter.bind(this),
						  amnt: this.amntFormatter.bind(this),
						  wvol: this.wvolFormatter.bind(this),
						  time: this.timeFormatter.bind(this)},
			filterFunction: this.filterTeas.bind(this)
		},
		this.filterTeasModel = { 
			disabled: false
		}
	);

	this.controller.setupWidget("lstBrand",
		this.teasAttr = {
			itemTemplate: "brand-tea-list-view/brandRowTemplate",
			listTemplate: "brand-tea-list-view/brandListTemplate",
			dividerTemplate: "brand-tea-list-view/divider",
			dividerFunction: this.listDivider.bind(this),
			formatters: { temp: this.tempFormatter.bind(this),
						  amnt: this.amntFormatter.bind(this),
						  wvol: this.wvolFormatter.bind(this),
						  time: this.timeFormatter.bind(this)},
			renderLimit: 200,
			lookAhead: 100
		},
		this.brandsModel = { 
			items : this.brandteas
		}
	);
	this.controller.setupWidget("addCheck",
		this.addCheckAttr = {
			modelProperty: "marked"
		}
	);
	/* add event handlers to listen to events from widgets */
		
	this.filterFilterHandler = this.filterFilter.bind(this);
	this.lstTapHandler = this.handleLstTeaTap.bind(this);
	
	this.controller.listen("filterBrandList", Mojo.Event.filter, this.filterFilterHandler);
	this.controller.listen('filterBrandList', Mojo.Event.listTap, this.lstTapHandler);	
	this.controller.listen('lstBrand', Mojo.Event.listTap, this.lstTapHandler);
	
	this.controller.setupWidget("spnLoading",
		{spinnerSize: 'large'},
		this.spnLoadingModel = {spinning: true}
	);
	
	this.timer = this.controller.window.setTimeout(this.loadingTimeout.bind(this), 15000);
	this.loadBrandTeas();
};

BrandTeaListViewAssistant.prototype.loadBrandTeas = function() {
	Mojo.Log.info("blva.loadBrandTeas");

	var url;
	if (this.style == 1) {
		url = this.brand.jsonUrlBag;
	} else {
		url = this.brand.jsonUrlLoose;
	}
	
	var req = new Ajax.Request(url,
		{
			method: 'get',
			onSuccess: this.brandsLoaded.bind(this),
			onFailure: this.brandsFailure.bind(this)
		}
	);
};

BrandTeaListViewAssistant.prototype.brandsFailure = function(transport) {
	Mojo.Log.info("blva.brandsFailure:");

	// kill scrim
	this.spnLoadingModel.spinning = false;
	this.controller.modelChanged(this.spnLoadingModel);
	this.controller.get("scrim").hide();
	
	// show error
	this.controller.showAlertDialog({
	    onChoose: function(value) {
			this.controller.stageController.popScene({});
		},
		title: $L("Error"),
		message: $L("An error occurred while fetching a list of teas to browse.  Please try again later."),
		choices:[
			{label: $L('OK'), value:'ok', type:'color'}    
		]
	});
};

BrandTeaListViewAssistant.prototype.brandsLoaded = function(transport) {
	Mojo.Log.info("blva.brandsLoaded:");
	Mojo.Log.info("%s", transport.responseText);
	
	this.brandteas = eval(transport.responseText);
	
	// convert tea units if necessary
	for (var i = 0; i < this.brandteas.length; i++) {
		if (this.brandteas[i].temp && !hasUnit(this.brandteas[i].temp) && Calesco.teaTempUnit == 'C') {
			this.brandteas[i].temp = f2c(this.brandteas[i].temp);
		}
		if (this.brandteas[i].amnt && !hasUnit(this.brandteas[i].temp) && Calesco.teaAmntUnit == 'g') {
			delete this.brandteas[i].amnt;
			if (this.brandteas[i].wvol) {
				delete this.brandteas[i].wvol; // water volume doens't make sense without tea volume
			}
		}
		if (this.brandteas[i].wvol && !hasUnit(this.brandteas[i].wvol) && Calesco.teaWvolUnit == 'ml') {
			this.brandteas[i].wvol = oz2ml(this.brandteas[i].wvol);
		}
	}
	
	this.brandsModel.items = this.brandteas;	
	this.controller.modelChanged(this.brandsModel);
	
	this.controller.window.clearTimeout(this.timer);
	this.spnLoadingModel.spinning = false;
	this.controller.modelChanged(this.spnLoadingModel);
	this.controller.get("scrim").hide();
};

BrandTeaListViewAssistant.prototype.loadingTimeout = function() {
	this.brandsFailure("");
};

BrandTeaListViewAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
 	this.controller.modelChanged(this.brandModel);
};

BrandTeaListViewAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

BrandTeaListViewAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	
	this.controller.stopListening("filterBrandList", Mojo.Event.filter, this.filterFilterHandler);
	this.controller.stopListening('filterBrandList', Mojo.Event.listTap, this.lstTapHandler);
	this.controller.stopListening('lstBrand', Mojo.Event.listTap, this.lstTapHandler);
};

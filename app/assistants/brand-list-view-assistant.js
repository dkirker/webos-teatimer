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

function BrandListViewAssistant(teas) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	
	this.brands = [];
	
	this.teas = teas;
	this.filtering = 0;
}

BrandListViewAssistant.prototype.handleLstTeaTap = function (event) {
	
	var targetClass = event.originalEvent.target.className;
	if (targetClass.indexOf("brand-target") === 0) {
		// Open brand website
		this.controller.serviceRequest("palm://com.palm.applicationManager", {
			method: "open",
			parameters:  {
				id: 'com.palm.app.browser',
				params: {
					target: event.item.brandUrl
				}
			}
		});
	} else {
		if (event.item.hasLoose && event.item.hasBag) {
			this.controller.showAlertDialog({
				onChoose: function(value) {
					if (value) {
						this.controller.stageController.pushScene("brand-tea-list-view", event.item, value, this.teas);
					}
				},
				title: event.item.brand,
				message: $L("Please select the style of tea to browse."),
				choices: [
					{label: "Tea Bag", value: 1, type: "affirmative"},
					{label: "Loose Leaf", value: 2, type: "affirmative"},
					{label: "Cancel", value: 0, type: "dismiss"},
				]
			});
		} else if (event.item.hasBag) {
			this.controller.stageController.pushScene("brand-tea-list-view", event.item, 1, this.teas);
		} else {
			this.controller.stageController.pushScene("brand-tea-list-view", event.item, 2, this.teas);
		}
	}	
};

BrandListViewAssistant.prototype.updateFilterListModel = function (fast) {
	Mojo.Log.info("updateFilterListModel:");
	
	if (this.filtering) {
		if (fast) {
			this.filterListWidget.mojo.noticeUpdatedItems(this.filterOffset, this.filterSubset);
		} else {
			this.filterTeas(this.filterString, this.filterListWidget, this.filterOffset, this.filterCount);
		}
	}
};

BrandListViewAssistant.prototype.filterTeas  = function(filterString, listWidget, offset, count)    {
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
			if (s.brand.toUpperCase().indexOf(query.toUpperCase()) >= 0) {
				return true;
			}
			if (s.brandUrl.toUpperCase().indexOf(query.toUpperCase()) >= 0) {
				return true;
			}
			return false;
		};
		
		for (var i = 0; i < this.brands.length; i++) {
			Mojo.Log.info("checking: ", this.brands[i].brand);
			if (hasString(filterString, this.brands[i])) {
				var tea = this.brands[i];
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

BrandListViewAssistant.prototype.filterFilter = function(event) {
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

BrandListViewAssistant.prototype.setup = function() {
	Mojo.Log.info("BrandListViewAssistant: setup");
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
	this.controller.get("headerlabel").innerHTML = $L("Tea Brands");
			
	/* setup widgets here */
	this.controller.setupWidget("filterBrandList",
		{
			itemTemplate: "brand-list-view/brandRowTemplate",
			listTemplate: "brand-list-view/brandListTemplate",		
			filterFunction: this.filterTeas.bind(this)
		},
		this.filterTeasModel = { 
			disabled: false
		}
	);

	this.controller.setupWidget("lstBrand",
		this.teasAttr = {
			itemTemplate: "brand-list-view/brandRowTemplate",
			listTemplate: "brand-list-view/brandListTemplate",		
			renderLimit: 20
		},
		this.brandsModel = { 
			items : this.brands
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
	this.loadBrands();
};

BrandListViewAssistant.prototype.loadBrands = function() {
	Mojo.Log.info("blva.loadBrands");
	
	var req = new Ajax.Request('http://www.ferguslabs.com/teatimer/data/brands.json',
		{
			method: 'get',
			onSuccess: this.brandsLoaded.bind(this),
			onFailure: this.brandsFailure.bind(this)
		}
	);
};

BrandListViewAssistant.prototype.brandsFailure = function(transport) {
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
			{label: $L("OK"), value:'ok', type:'color'}    
		]
	});	  
};

BrandListViewAssistant.prototype.brandsLoaded = function(transport) {
	Mojo.Log.info("blva.brandsLoaded:");
	Mojo.Log.info("%s", transport.responseText);
	
	this.brands = eval(transport.responseText);
	this.brandsModel.items = this.brands;	
	
	this.controller.modelChanged(this.brandsModel);
	this.controller.window.clearTimeout(this.timer);
	
	this.spnLoadingModel.spinning = false;
	this.controller.modelChanged(this.spnLoadingModel);
	this.controller.get("scrim").hide();
};

BrandListViewAssistant.prototype.loadingTimeout = function() {
	this.brandsFailure("");
};

BrandListViewAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
 	this.controller.modelChanged(this.brandModel);
};

BrandListViewAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

BrandListViewAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	
	this.controller.stopListening("filterBrandList", Mojo.Event.filter, this.filterFilterHandler);
	this.controller.stopListening('filterBrandList', Mojo.Event.listTap, this.lstTapHandler);
	this.controller.stopListening('lstBrand', Mojo.Event.listTap, this.lstTapHandler);
};

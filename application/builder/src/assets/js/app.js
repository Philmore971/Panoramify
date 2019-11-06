/*!
  iPanorama 360 - jQuery Virtual Tour
  @name app.js
  @description The Online Builder for the Creation of Virtual Tours That Empowers Your Visitors And Clients
  @version 1.2.0
  @author Max Lawrence 
  @site http://www.avirtum.com
  @copyright (c) 2016 Max Lawrence (http://www.avirtum.com)
*/
'use strict';


//=========================================================
// Application Model Data 
// see the services.js and controllers.js script
//=========================================================
var _iPanoramaAppData = {
	VERSION: '1.2.0',
	
	// Parameters and configs
	config: {
		version: '1.2.0',
		panoramaSize: 'none',
		panoramaWidth: 0,
		panoramaHeight: 0,
		customCSS: false,
		customCSSContent: '',
		theme: 'ipnrm-theme-default',
		imagePreview: true,
		imagePreviewUrl: '',
		autoLoad: false,
		autoRotate: false,
		autoRotateInactivityDelay: 3000,
		mouseWheelRotate: false,
		mouseWheelRotateCoef: 0.2,
		mouseWheelZoom: false,
		mouseWheelZoomCoef: 0.05,
		hoverGrab: false,
		hoverGrabYawCoef: 20,
		hoverGrabPitchCoef: 20,
		grab: true,
		grabCoef: 0.1,
		showControlsOnHover: false,
		showSceneThumbsCtrl: false,
		showSceneMenuCtrl: false,
		showSceneNextPrevCtrl: true,
		showShareCtrl: false,
		showZoomCtrl: true,
		showFullscreenCtrl: true,
		sceneThumbsVertical: true,
		title: true,
		compass: false,
		keyboardNav: true,
		keyboardZoom: true,
		sceneNextPrevLoop: false,
		popover: true,
		popoverTemplate: '<div class="ipnrm-popover">\n<div class="ipnrm-close"></div>\n<div class="ipnrm-arrow"></div>\n<div class="ipnrm-content"></div>\n</div>',
		popoverPlacement: 'top',
		hotSpotBelowPopover: true,
		popoverShowTriggerHover: true,
		popoverShowTriggerClick: false,
		popoverHideTriggerLeave: true,
		popoverHideTriggerClick: false,
		popoverHideTriggerGrab: false,
		popoverHideTriggerManual: false,
		popoverShowClass: null,
		popoverHideClass: null,
		pitchLimits: true,
		mobile: false,
		sceneId: null,
		sceneFadeDuration: 3000,
		scenes: []
	},
	
	scene: {
		selected: null,
		dragged: null,
		dirty: false
	},
	
	hotspot: {
		selected: null,
		dragged: null,
		dirty: false
	},
	
	tabPanel: {
		general : {
			id: 'general', // should be the same as the sidebar item menu id
			isActive: true,
			popoverShowClass: {
				modalTemplateUrl: 'assets/views/modal-getshowclass.html'
			},
			popoverHideClass: {
				modalTemplateUrl: 'assets/views/modal-gethideclass.html'
			}
		},
		scenes : {
			id: 'scenes',
			isActive: false
		},
		hotspots : {
			id: 'hotspots',
			isActive: false
		}
	},
	
	mainMenu: {
		getcode: {
			isModal: true,
			modalTemplateUrl: 'assets/views/modal-getcode.html'
		},
		save: {
			isModal: true,
			modalTemplateUrl: 'assets/views/modal-save.html'
		},
		load: {
			isModal: true,
			modalTemplateUrl: 'assets/views/modal-load.html'
		}
	},
	
	upload: {
		getFilesUrl: 'file-get.php',
		deleteFileUrl: 'file-delete.php',
		uploadFileUrl: 'file-upload.php',
		uploadFolder: 'upload',
		modalTemplateUrl: 'assets/views/modal-upload.html',
		files: [],
		selectedFile: null,
		uploadFile: null,
		isActive: false
	},
	
	storage: {
		configName: 'New Config',
		configs: [],
		selectedConfig: null
	},
	
	// Interface
	panoramaCfg: null,
	panoramaReady: false,
	panorama: null,
	modal: false,
	winHeight: 0,
	winWidth: 0,
	preview: false,
	targetTool: false, // on/off the target tool
	selectedPopoverClass: null, // popver animation class (show/hide)
	imageId: null,
	uploadUrl: '',
	
	fn: {
		mainMenuItemInit: function(scope, element, attrs) {
			element.on('click', function() {
				scope.appData.fn.mainMenuItemClick(scope);
			});
		},
		mainMenuItemClick: function(scope) {
			// scope.id      - menu item id (see directives.js)
			// scope.appData - reference to appData (see directives.js)
			var items = scope.appData.mainMenu,
			item = items[scope.id];
			
			if(item.isModal) {
				scope.appData.fn.showModal(scope, item.modalTemplateUrl, prettyPrint);
			}
		},
		tabPanelItemInit: function(scope, element, attrs) {
			element.on('click', function(e) {
				e.preventDefault();
				scope.appData.fn.tabPanelItemClick.call(this, scope); // pass the element context
			});
		},
		tabPanelItemClick: function(scope) {
			// scope.id      - menu item id (see directives.js)
			// scope.appData - reference to appData (see directives.js)
			if(!scope.appData.tabPanel[scope.id].isActive) {
				var obj = scope.appData.tabPanel;
				for (var property in obj) {
					if (obj.hasOwnProperty(property)) {
						obj[property].isActive = false;
					}
				}
				scope.appData.tabPanel[scope.id].isActive = true;
				scope.$root.safeApply();
			}
		},
		selectImageInit: function(scope, element, attrs) {
			element.on('click', function(e) {
				e.preventDefault();
				scope.appData.fn.selectImageClick.call(this, scope); // pass the element context
			});
		},
		selectImageClick: function(scope) {
			scope.appData.imageId = scope.id;
			scope.appData.fn.upload.showModal(scope);
		},
		selectPopoverShowClass: function(scope, element, attrs) {
			element.on('click', function() {
				scope.appData.fn.getPopoverShowClass(scope);
			});
		},
		selectPopoverHideClass: function(scope, element, attrs) {
			element.on('click', function() {
				scope.appData.fn.getPopoverHideClass(scope);
			});
		},
		getPopoverShowClass: function(scope) {
			scope.appData.selectedPopoverClass = null;
			scope.appData.fn.showModal(scope, scope.appData.tabPanel.general.popoverShowClass.modalTemplateUrl, scope.appData.fn.getPopoverClassInit);
		},
		getPopoverHideClass: function(scope) {
			scope.appData.selectedPopoverClass = null;
			scope.appData.fn.showModal(scope, scope.appData.tabPanel.general.popoverHideClass.modalTemplateUrl, scope.appData.fn.getPopoverClassInit);
		},
		getPopoverClassInit: function() {
			var animationEvent = function() {
				var el = document.createElement('fakeelement');

				var animations = {
					'animation'      : 'animationend',
					'MSAnimationEnd' : 'msAnimationEnd',
					'OAnimation'     : 'oAnimationEnd',
					'MozAnimation'   : 'mozAnimationEnd',
					'WebkitAnimation': 'webkitAnimationEnd'
				}
	
				for (var i in animations){
					if (el.style[i] !== undefined){
						return animations[i];
					}
				}
			};

			jQuery('.ipnrm-ui-btn[data-fx-name]').on('click', function(e) {
				var $btn = jQuery(e.target),
				fx = $btn.data('fx-name');
				$btn.removeClass(fx).addClass(fx);
			});

			jQuery('.ipnrm-ui-btn[data-fx-name]').on(animationEvent(), function(e) {
				var $btn = jQuery(e.target),
				fx = $btn.data('fx-name');

				if($btn.hasClass(fx)) {
					$btn.removeClass(fx);
				}
			});
		},
		showModal: function(scope, templateUrl, callback) {
			var url = templateUrl;
			scope.appData.srv.$templateRequest(url).then(
				function(html) {
					// convert the html to an actual DOM node
					var template = angular.element(html);
					// append it to the directive element
					jQuery('#ipnrm-ui-modal-data').empty().append(template);
					// and let Angular $compile it
					scope.appData.srv.$compile(template)(scope);
					// show modal dialog
					scope.appData.modal = true;
					
					if (callback && typeof callback == 'function') { // make sure the callback is a function
						callback.call(this); // brings the scope to the callback
					}
				}, 
				function() {
					// an error has occurred here
				}
			);
		},
		getImageFullPath: function(appData, imageUrl) {
			if(imageUrl) {
				return appData.uploadUrl + imageUrl;
			}
			return '';
		},
		getSceneKeyById: function(sceneId) {
			return sceneId.replace(/ /g,'').toLowerCase();
		},
		getConfig: function(appData) {
			var cfg = {};
			
			cfg.theme = appData.config.theme;
			
			if(appData.config.imagePreview && appData.config.imagePreviewUrl) {
				cfg.imagePreview = appData.config.imagePreviewUrl;
			}
			
			cfg.autoLoad = appData.config.autoLoad;
			cfg.autoRotate = appData.config.autoRotate;
			cfg.autoRotateInactivityDelay = appData.config.autoRotateInactivityDelay;
			cfg.mouseWheelRotate = appData.config.mouseWheelRotate;
			cfg.mouseWheelRotateCoef = appData.config.mouseWheelRotateCoef;
			cfg.mouseWheelZoom = appData.config.mouseWheelZoom;
			cfg.mouseWheelZoomCoef = appData.config.mouseWheelZoomCoef;
			cfg.hoverGrab = appData.config.hoverGrab;
			cfg.hoverGrabYawCoef = appData.config.hoverGrabYawCoef;
			cfg.hoverGrabPitchCoef = appData.config.hoverGrabPitchCoef;
			cfg.grab = appData.config.grab;
			cfg.grabCoef = appData.config.grabCoef;
			cfg.showControlsOnHover = appData.config.showControlsOnHover;
			cfg.showSceneThumbsCtrl = appData.config.showSceneThumbsCtrl;
			cfg.showSceneMenuCtrl = appData.config.showSceneMenuCtrl;
			cfg.showSceneNextPrevCtrl = appData.config.showSceneNextPrevCtrl;
			cfg.showShareCtrl = appData.config.showShareCtrl;
			cfg.showZoomCtrl = appData.config.showZoomCtrl;
			cfg.showFullscreenCtrl = appData.config.showFullscreenCtrl;
			cfg.sceneThumbsVertical = appData.config.sceneThumbsVertical;
			cfg.title = appData.config.title;
			cfg.compass = appData.config.compass;
			cfg.keyboardNav = appData.config.keyboardNav;
			cfg.keyboardZoom = appData.config.keyboardZoom;
			cfg.sceneNextPrevLoop = appData.config.sceneNextPrevLoop;
			cfg.popover = appData.config.popover;
			if(appData.config.popover) {
				
				var template = appData.config.popoverTemplate;
				template = template.replace(/(?:\r\n|\r|\n)/g,'');
				template = template.replace(/ /g,'');
				if(template != '<divclass="ipnrm-popover"><divclass="ipnrm-close"></div><divclass="ipnrm-arrow"></div><divclass="ipnrm-content"></div></div>') {
					cfg.popoverTemplate = appData.config.popoverTemplate;
				}
				
				cfg.popoverPlacement = appData.config.popoverPlacement;
				cfg.hotSpotBelowPopover = appData.config.hotSpotBelowPopover;
				cfg.popoverShowTrigger = (appData.config.popoverShowTriggerHover  ? 'hover '  : '') + // (click, hover)
										 (appData.config.popoverShowTriggerClick  ? 'click '  : '');
				cfg.popoverHideTrigger = (appData.config.popoverHideTriggerLeave  ? 'leave '  : '') + // (click, leave, grab, manual)
										 (appData.config.popoverHideTriggerClick  ? 'click '  : '') +
										 (appData.config.popoverHideTriggerGrab   ? 'grab '   : '') +
										 (appData.config.popoverHideTriggerManual ? 'manual ' : '');
				
				cfg.popoverShowTrigger = cfg.popoverShowTrigger.trim();
				cfg.popoverHideTrigger = cfg.popoverHideTrigger.trim();
				
				if(appData.config.popoverShowClass && appData.config.popoverShowClass.length > 0) {
					cfg.popoverShowClass = appData.config.popoverShowClass;
				}
				
				if(appData.config.popoverHideClass && appData.config.popoverHideClass.length > 0) {
					cfg.popoverHideClass = appData.config.popoverHideClass;
				}
			} 
			
			cfg.pitchLimits = appData.config.pitchLimits;
			cfg.mobile = appData.config.mobile;
			
			if( appData.config.scenes.length > 0 ) {
				cfg.sceneId = appData.fn.getSceneKeyById(appData.config.scenes[0].id);
				cfg.sceneFadeDuration = appData.config.sceneFadeDuration;
			}
			
			// create the structure for scenes
			var scenes = {};
			for(var i=0;i<appData.config.scenes.length;i++) {
				var scene_current = appData.config.scenes[i],
				scene = {};
				
				if(!scene_current.isVisible)
					continue;
				
				scene.type = scene_current.config.type;
				
				if(scene_current.config.type == 'cube') {
					scene.image = {
						front:  scene_current.config.imageFront,
						back:   scene_current.config.imageBack,
						left:   scene_current.config.imageLeft,
						right:  scene_current.config.imageRight,
						top:    scene_current.config.imageTop,
						bottom: scene_current.config.imageBottom
					};
				} else {
					scene.image = scene_current.config.imageFront;
				}
				
				if(scene_current.config.thumb) {
					scene.thumb = scene_current.config.thumb;
					scene.thumbImage = scene_current.config.thumbImage;
				}
				
				if(scene_current.config.yaw != 0) {
					scene.yaw = scene_current.config.yaw;
				}
				
				if(scene_current.config.pitch != 0) {
					scene.pitch = scene_current.config.pitch;
				}
				
				if(scene_current.config.zoom != 75) {
					scene.zoom = scene_current.config.zoom;
				}
				
				if(scene_current.config.compassNorthOffset) {
					scene.compassNorthOffset = scene_current.config.compassNorthOffset;
				}
				
				if(scene_current.config.title) {
					scene.title = scene_current.config.title;
					scene.titleHtml = scene_current.config.titleHtml;
					scene.titleSelector = scene_current.config.titleSelector;
				}
				
				
				if(scene_current.config.hotspots.length > 0) {
					var hotspots = [];
					for(var j=0;j<scene_current.config.hotspots.length;j++) {
						var hotspot_current = scene_current.config.hotspots[j],
						hotspot = {};
						
						if(!hotspot_current.isVisible)
							continue;
						
						hotspot.yaw = hotspot_current.config.yaw;
						hotspot.pitch = hotspot_current.config.pitch;
						
						if(hotspot_current.config.sceneId != 'none') {
							hotspot.sceneId = hotspot_current.config.sceneId;
						}
						
						if(hotspot_current.config.custom) {
							hotspot.className = hotspot_current.config.customClassName;
							hotspot.content = hotspot_current.config.customContent;
						}
						
						if(hotspot_current.config.popover) {
							hotspot.popoverHtml = hotspot_current.config.popoverHtml;
							hotspot.popoverContent = hotspot_current.config.popoverContent;
							hotspot.popoverSelector = hotspot_current.config.popoverSelector;
							hotspot.popoverLazyload = hotspot_current.config.popoverLazyload;
							hotspot.popoverShow = hotspot_current.config.popoverShow;
							
							if(hotspot_current.config.popoverPlacement != 'default') {
								hotspot.popoverPlacement = hotspot_current.config.popoverPlacement;
							}
							
							if(hotspot_current.config.popoverWidth) {
								hotspot.popoverWidth = hotspot_current.config.popoverWidth;
							}
						}
						
						hotspots.push(hotspot);
					}
					
					scene.hotSpots = hotspots;
				}
				
				var sceneId = appData.fn.getSceneKeyById(scene_current.id);
				scenes[sceneId] = scene;
			}
			
			cfg.scenes = scenes;
			
			return cfg;
		},
		updateConfigUrls: function(appData, cfg) {
			if(cfg.hasOwnProperty('imagePreview')) {
				cfg.imagePreview = appData.uploadUrl + cfg.imagePreview;
			}
			
			for (var key in cfg.scenes) {
				if (cfg.scenes.hasOwnProperty(key)) {
					var scene = cfg.scenes[key];
					if(scene.type == 'cube') {
						scene.image.front  = appData.uploadUrl + scene.image.front;
						scene.image.back   = appData.uploadUrl + scene.image.back;
						scene.image.left   = appData.uploadUrl + scene.image.left;
						scene.image.right  = appData.uploadUrl + scene.image.right;
						scene.image.top    = appData.uploadUrl + scene.image.top;
						scene.image.bottom = appData.uploadUrl + scene.image.bottom;
					} else {
						scene.image = appData.uploadUrl + scene.image;
					}
				}
			}
			
			return cfg;
		},
		preview: function(appData) {
			var cfg = appData.fn.getConfig(appData),
			cfg = appData.fn.updateConfigUrls(appData, cfg);
			
			jQuery('#ipnrm-ui-preview-canvas').ipanorama(cfg);
			appData.preview = true;
		},
		previewClose: function(appData) {
			jQuery('#ipnrm-ui-preview-canvas').ipanorama("destroy");
			appData.preview = false;
		},
		getConfigCode: function(appData) {
			var code = '$("#mypanorama").ipanorama(' +
			JSON.stringify( appData.fn.getConfig(appData), null, 2 ) +
			');';
			return code;
		},
		trunc: function(str, n) {
			return ((str && str.length > n) ? str.substr(0,n-1)+'...' : str);
		},
		
		upload: {
			init: function(scope) {
				scope.appData.fn.upload.getFileNames(scope.appData);
			},
			showModal: function(scope) {
				scope.appData.fn.showModal(scope, scope.appData.upload.modalTemplateUrl);
			},
			getFileNames: function(appData) {
				appData.srv.$http.get(appData.upload.getFilesUrl).success(function(response) {
					appData.upload.files = response;
				}); 
			},
			doUpload: function(appData) {
				if(!appData.upload.uploadFile) {
					return;
				}
				
				appData.upload.isActive = true;
				
				var formData = new FormData();
				formData.append('file', appData.upload.uploadFile);
				
				appData.srv.$http({
					url: appData.upload.uploadFileUrl,
					method: 'POST',
					data: formData,
					headers: { 'Content-Type': undefined }
				}).success(function(response) {
					if(response.success) {
						appData.srv.growl.success(response.msg, {title: 'Success!'});
						
						var found = false;
						for(var i=appData.upload.files.length;i--;) {
							var file = appData.upload.files[i];
							if(file.filename == response.filename) {
								found = true;
								break;
							}
						}
						if(!found) {
							appData.upload.files.push({filename:response.filename}); // add the uploaded file name to the list
						}
					} else {
						appData.srv.growl.error(response.msg, {title: 'Error!'});
					}
				}).finally(function() {
					appData.upload.isActive = false;
				});
			},
			selectFile: function(appData) {
				if(appData.upload.selectedFile) {
					var url = appData.upload.uploadFolder + '/' + appData.upload.selectedFile.filename;
					
					if(appData.imageId == 'preview') {
						appData.config.imagePreviewUrl = url;
					} else if(appData.imageId == 'front') {
						appData.scene.selected.config.imageFront = url;
					} else if(appData.imageId == 'back') {
						appData.scene.selected.config.imageBack = url;
					} else if(appData.imageId == 'left') {
						appData.scene.selected.config.imageLeft = url;
					} else if(appData.imageId == 'right') {
						appData.scene.selected.config.imageRight = url;
					} else if(appData.imageId == 'top') {
						appData.scene.selected.config.imageTop = url;
					} else if(appData.imageId == 'bottom') {
						appData.scene.selected.config.imageBottom = url;
					} else if(appData.imageId == 'thumb') {
						appData.scene.selected.config.thumbImage = url;
					}
				}
			},
			deleteFile: function(appData) {
				if(appData.upload.selectedFile) {
					appData.srv.$http({
						url: appData.upload.deleteFileUrl,
						method: 'POST',
						data: 'filename=' + appData.upload.selectedFile.filename,
						headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
					}).success(function(response) {
						if(response.success) {
							appData.srv.growl.success(response.msg, {title: 'Success!'});
							
							for(var i=appData.upload.files.length;i--;) {
								var file = appData.upload.files[i];
								if(file.filename == response.filename) {
									appData.upload.files.splice(i, 1);
									break;
								}
							}
						} else {
							appData.srv.growl.error(response.msg, {title: 'Error!'});
						}
					});
				}
			}
		},
		
		storage: {
			init: function(scope) {
				scope.appData.storage.configs = scope.appData.fn.storage.getConfigNames(scope.appData);
				scope.$root.safeApply();
			},
			filterData: function(data) {
				var result = [];
				for (var key in data) {
					if (key.indexOf('ipanorama_config__') === 0) {
						result.push(angular.fromJson(data[key]));
					}
				}
				return result;
			},
			sanitizeName: function(str) {
				return str.toLowerCase().replace(/\s/g, "_");
			},
			getConfigId: function(appData, name) {
				return 'ipanorama_config__' + appData.fn.storage.sanitizeName(name);
			},
			getConfigObjectForSave: function(appData) {
				var cfgName = appData.storage.configName,
				cfgId = appData.fn.storage.getConfigId(appData, cfgName),
				cfgObject = {
					id: cfgId,
					name: cfgName,
					config: angular.merge({}, appData.config)
				};
				
				return cfgObject;
			},
			saveConfig: function(appData) {
				var cfgObject = appData.fn.storage.getConfigObjectForSave(appData),
				cfgData = angular.toJson(cfgObject);
				appData.fn.storage.save(cfgObject.cfgId, cfgData);
				
				appData.storage.configs = appData.fn.storage.getConfigNames(appData);
			},
			save: function(id, data) {
				window.localStorage.setItem(id, data);
			},
			saveAs: function(appData) {
				appData.fn.storage.saveConfig(appData);
			},
			getConfig: function(id) {
				return window.localStorage[id];
			},
			getConfigs:function(appData){
				return appData.fn.storage.filterData(window.localStorage);
			},
			getConfigNames: function(appData) {
				var configs = appData.fn.storage.getConfigs(appData);
				var result = [];
				for (var i = 0; i< configs.length; i++) {
					result.push({
						id: configs[i].id,
						name: configs[i].name
					});
				}
				return result;
			},
			load: function(appData) {
				if(appData.storage.selectedConfig) {
					var json = appData.fn.storage.getConfig(appData.storage.selectedConfig.id);
					appData.fn.storage.loadJson(appData, json);
				}
			},
			remove: function(appData) {
				if(appData.storage.selectedConfig) {
					window.localStorage.removeItem(appData.storage.selectedConfig.id);
					appData.storage.configs = appData.fn.storage.getConfigNames(appData);
				}
			},
			saveToFile: function(appData) {
				var cfgObject = appData.fn.storage.getConfigObjectForSave(appData),
				cfgData = angular.toJson(cfgObject),
				file = new File([cfgData], appData.storage.configName + ".json", {type: "application/json;charset=utf-8"});
				saveAs(file);
			},
			loadFromFile: function(appData) {
				var el = jQuery('#ipnrm-load-from-file').off("change");
				el.on("change", jQuery.proxy(function(e) {
					var file = e.target.files[0],
					fileReader = new FileReader();
					
					fileReader.onload = (jQuery.proxy(function(e) {
						var json = e.target.result;
						appData.fn.storage.loadJson(appData, json);
						
						jQuery(window).trigger("resize");
					}, this));
					
					fileReader.readAsText(file);
				}, appData));
				el.click();
			},
			loadJson: function(appData, json) {
				if(json) {
					var data = angular.fromJson(json);
					
					// reset settings
					appData.scene.selected = null;
					appData.hotspot.selected = null;
					appData.tabPanel.general.isActive = true;
					appData.tabPanel.scenes.isActive = false;
					appData.tabPanel.hotspots.isActive = false;
					
					// restore settings
					appData.storage.configName = data.name;
					appData.config = angular.merge({}, data.config);
					
					for(var i = appData.config.scenes.length; i--;) {
						var scene = appData.config.scenes[i];
						if(scene.isSelected) {
							appData.scene.selected = scene;
							
							for(var i = appData.scene.selected.config.hotspots.length; i--;) {
								var hotspot = appData.scene.selected.config.hotspots[i];
								if(hotspot.isSelected) {
									appData.hotspot.selected = hotspot;
									break;
								}
							}
							break;
						}
					}
					
					appData.fn.workspace.layout(appData);
					appData.fn.workspace.refreshScene(appData);
				}
			}
		},
		
		workspace: {
			init: function(scope, element, attrs) {
				// load config
				var json = jQuery('#ipnrm-ui-meta-ui-cfg').val();
				if(json) {
					var cfg = angular.fromJson(json);
					scope.appData.config = angular.merge(scope.appData.config, cfg);
				}
				
				jQuery(window).on('resize', jQuery.proxy(function() {
					this.appData.fn.workspace.resize(this);
				}, scope));
				
				scope.appData.panoramaCfg = {
					autoLoad: true,
					autoRotate: false,
					showZoomCtrl: false,
					showFullscreenCtrl: false,
					onCameraUpdate: jQuery.proxy(scope.appData.fn.workspace.onCameraUpdate, scope),
					onHotSpotSetup: jQuery.proxy(scope.appData.fn.workspace.onHotspotSetup, scope),
					hotSpotSetup: false
				};
				scope.appData.panorama = jQuery('#ipnrm-ui-canvas');
				
				scope.$watchGroup([
					'appData.scene.selected', 
					'appData.scene.selected.config.type',
					'appData.scene.selected.config.imageFront',
					'appData.scene.selected.config.imageBack',
					'appData.scene.selected.config.imageLeft',
					'appData.scene.selected.config.imageRight',
					'appData.scene.selected.config.imageTop',
					'appData.scene.selected.config.imageBottom'], 
					jQuery.proxy(function() {
						this.appData.scene.dirty = true;
				}, scope));
				
				scope.$watchGroup([
					'appData.hotspot.selected',
					'appData.hotspot.selected.isVisible',
					'appData.hotspot.selected.config.yaw',
					'appData.hotspot.selected.config.pitch'],
					jQuery.proxy(function() {
						this.appData.fn.workspace.updateHotspots(this.appData);
				}, scope));
				
				scope.appData.fn.workspace.layout(scope.appData);
				scope.appData.fn.workspace.refreshScene(scope.appData);
			},
			resize: function(scope) {
				scope.appData.fn.workspace.layout(scope.appData);
				scope.$root.safeApply();
			},
			layout: function(appData) {
				var $win = jQuery(window);
				appData.winWidth = $win.outerWidth();
				appData.winHeight = $win.outerHeight();
			},
			refreshScene: function(appData) {
				if(appData.scene.dirty) {
					appData.fn.workspace.updateScene(appData);
					appData.scene.dirty = false;
				}
				setTimeout(appData.fn.workspace.refreshScene, 2000, appData);
			},
			onCameraUpdate: function(cameraYaw, cameraPitch, cameraZoom) {
				if(!this.appData.scene.dirty) {
					this.appData.scene.selected.yaw = Math.round( cameraYaw * 1e5 ) / 1e5;
					this.appData.scene.selected.pitch = Math.round( cameraPitch * 1e5 ) / 1e5;
					this.appData.scene.selected.zoom = Math.round( cameraZoom * 1e5 ) / 1e5;
					
					this.$root.safeApply();
				}
			},
			onHotspotSetup: function(yaw, pitch, cameraYaw, cameraPitch, cameraZoom, e) {
				if(e.ctrlKey) {
					if(this.appData.targetTool) {
						this.appData.fn.hotspots.add(this.appData, yaw, pitch);
					} else if(this.appData.hotspot.selected) {
						this.appData.hotspot.selected.config.yaw = yaw;
						this.appData.hotspot.selected.config.pitch = pitch;
						this.appData.hotspot.dirty = true;
					}
				}
			},
			updateScene: function(appData) {
				if(appData.panoramaReady) {
					appData.panorama.ipanorama("destroy");
					appData.panoramaReady = false;
				}
				
				if(appData.scene.selected) {
					appData.panoramaCfg.sceneId = 'main';
					
					if(appData.scene.selected.config.type == 'cube') {
						appData.panoramaCfg.scenes = {
							main: {
								type: 'cube',
								yaw: appData.scene.selected.yaw,
								pitch: appData.scene.selected.pitch,
								zoom: appData.scene.selected.zoom,
								image: {
									front:  appData.fn.getImageFullPath(appData, appData.scene.selected.config.imageFront),
									back:   appData.fn.getImageFullPath(appData, appData.scene.selected.config.imageBack),
									left:   appData.fn.getImageFullPath(appData, appData.scene.selected.config.imageLeft),
									right:  appData.fn.getImageFullPath(appData, appData.scene.selected.config.imageRight),
									top:    appData.fn.getImageFullPath(appData, appData.scene.selected.config.imageTop),
									bottom: appData.fn.getImageFullPath(appData, appData.scene.selected.config.imageBottom)
								}
							}
						}
					} else if(appData.scene.selected.config.type == 'sphere') {
						appData.panoramaCfg.scenes = {
							main: {
								type: 'sphere',
								yaw: appData.scene.selected.yaw,
								pitch: appData.scene.selected.pitch,
								zoom: appData.scene.selected.zoom,
								image: appData.fn.getImageFullPath(appData, appData.scene.selected.config.imageFront)
							}
						}
					} else if(appData.scene.selected.config.type == 'cylinder') {
						appData.panoramaCfg.scenes = {
							main: {
								type: 'cylinder',
								yaw: appData.scene.selected.yaw,
								pitch: appData.scene.selected.pitch,
								zoom: appData.scene.selected.zoom,
								image: appData.fn.getImageFullPath(appData, appData.scene.selected.config.imageFront)
							}
						}
					}
					
					appData.panorama.ipanorama(appData.panoramaCfg);
					appData.panoramaReady = true;
					appData.hotspot.dirty = true;
					
					appData.fn.workspace.updateHotspots(appData);
				}
			},
			updateHotspots: function(appData) {
				if(appData.panoramaReady && appData.hotspot.dirty) {
					var hotspots = [];
					for(var i=0;i<appData.scene.selected.config.hotspots.length;i++) {
						var hotspot = appData.scene.selected.config.hotspots[i],
						hs = {};
						
						if(hotspot.isVisible) {
							hs.yaw = hotspot.config.yaw;
							hs.pitch = hotspot.config.pitch;
							hs.className = 'ipnrm-ui-hotspot';
							hs.content = '<div class="ipnrm-ui-hotspot-label">' + hotspot.id + '</div>';
							
							hotspots.push(hs);
						}
					}
					
					appData.panorama.ipanorama("loadhotspots", {sceneId: "main", hotSpots: hotspots});
					
					appData.hotspot.dirty = false;
				}
			}
		},
		
		scenes: {
			add: function(appData) {
				var scene_new = {
					id: appData.fn.scenes.newName(appData),
					isSelected: false,
					isVisible: true,
					yaw: 0,
					pitch: 0,
					zoom: 75,
					config: {
						title: null,
						titleHtml: false,
						titleSelector: null,
						type: "sphere", // cube, sphere, cylinder
						thumb: false,
						thumbImage: '',
						imageFront: '',
						imageBack: '',
						imageLeft: '',
						imageRight: '',
						imageTop: '',
						imageBottom: '',
						yaw: 0,
						pitch: 0,
						zoom: 75,
						compassNorthOffset: null,
						hotspots: []
					}
				};
				
				appData.config.scenes.splice(appData.config.scenes.indexOf(appData.scene.selected)+1, 0, scene_new);
				appData.fn.scenes.select(appData, scene_new);
			},
			copy: function(appData, scene) {
				if(scene) {
					var scene_new = angular.copy(scene);
					scene_new.id = appData.fn.scenes.newName(appData); // ID should be unique
					scene_new.isSelected = false;
					
					appData.config.scenes.splice(appData.config.scenes.indexOf(appData.scene.selected)+1, 0, scene_new);
					appData.fn.scenes.select(appData, scene_new);
				}
			},
			copySelected: function(appData) {
				appData.fn.scenes.copy(appData, appData.fn.scenes.getSelected(appData));
			},
			remove: function(appData, scene) {
				if(scene) {
					var i = appData.config.scenes.length;
					while (i--) {
						if(appData.config.scenes[i] === scene) {
							appData.config.scenes.splice(i, 1);
							break;
						}
					}
					
					if(appData.scene.selected == scene) {
						appData.scene.selected = null;
					}
					
					// select something after deleting
					var scene_current = (appData.config.scenes[i] ? appData.config.scenes[i] : appData.config.scenes[i-1]);
					appData.fn.scenes.select(appData, scene_current);
				}
			},
			removeSelected: function(appData) {
				appData.fn.scenes.remove(appData, appData.fn.scenes.getSelected(appData));
			},
			updown: function(appData, scene, direction) {
				if(scene) {
					var len = appData.config.scenes.length,
					i = len;
					while (i--) {
						if(appData.config.scenes[i] === scene) {
							
							if(direction == 1 && i > 0) {
								appData.config.scenes[i] = appData.config.scenes[i-1];
								appData.config.scenes[i-1] = scene;
							} else if(direction == -1 && i < (len-1)) {
								appData.config.scenes[i] = appData.config.scenes[i+1];
								appData.config.scenes[i+1] = scene;
							}
							
							break;
						}
					}
				}
			},
			upSelected: function(appData) {
				appData.fn.scenes.updown(appData, appData.fn.scenes.getSelected(appData), 1);
			},
			downSelected: function(appData) {
				appData.fn.scenes.updown(appData, appData.fn.scenes.getSelected(appData), -1);
			},
			newName: function(appData){
				var i = 1,
				sceneName,
				checkName = function(name, arr) {
					for (var j = arr.length; j--;) {
						var item = arr[j];
						if( item.id == name ) {
							return true;
						}
					}
					return false;
				};
				
				while (i) {
					sceneName = 'Scene ' + i;
					if (!checkName(sceneName, appData.config.scenes)) {
						return sceneName;
					}
					i++;
				}
			},
			unselect: function(appData) {
				for(var i = appData.config.scenes.length; i--;) {
					var scene = appData.config.scenes[i];
					if(scene.isSelected) {
						scene.isSelected = false;
						return;
					}
				}
			},
			select: function(appData, scene) {
				if(scene) {
					appData.fn.scenes.unselect(appData);
					scene.isSelected = true;
				}
				appData.fn.scenes.onSelect(appData, scene);
			},
			getSelected: function(appData) {
				for(var i = appData.config.scenes.length; i--;) {
					var scene = appData.config.scenes[i];
					if(scene.isSelected) {
						return scene;
					}
				}
				return false;
			},
			onSelect: function(appData, scene) {
				appData.scene.selected = scene;
				
				if(!scene) {
					return;
				}
				
				var hotspot_selected = null;
				for(var i = appData.scene.selected.config.hotspots.length; i--;) {
					var hotspot = appData.scene.selected.config.hotspots[i];
					if(hotspot.isSelected) {
						hotspot_selected = hotspot;
						break;
					}
				}
				appData.hotspot.selected = hotspot_selected;
			},
			dragStart: function(e, scope, element, attrs) {
				scope.appData.scene.dragged = scope.dragElement;
				scope.appData.fn.scenes.select(scope.appData, scope.dragElement); // select before dragging
				scope.$root.safeApply();
			},
			dragOver: function(e, scope, element, attrs) {
				e.preventDefault();
				element.addClass('ipnrm-ui-drag-over');
			},
			dragLeave: function(e, scope, element, attrs) {
				e.preventDefault();
				element.removeClass('ipnrm-ui-drag-over');
			},
			dropScene: function(e, scope, element, attrs) {
				e.preventDefault();
				element.removeClass('ipnrm-ui-drag-over');
				
				if(scope.appData.scene.dragged) {
					var scene = angular.copy(scope.appData.scene.dragged);
					scope.appData.config.scenes.splice(scope.appData.config.scenes.indexOf(scope.appData.scene.dragged),1);
					scope.appData.scene.dragged = null;
					scope.appData.config.scenes.splice(scope.appData.config.scenes.indexOf(scope.dragOverElement), 0, scene);
					
					scope.$root.safeApply();
				}
			}
		},
		
		hotspots: {
			add: function(appData, yaw, pitch) {
				var hotspot_new = {
					id: appData.fn.hotspots.newName(appData),
					isSelected: false,
					isVisible: true,
					config: {
						yaw: (yaw ? yaw : appData.scene.selected.yaw),
						pitch: (pitch ? pitch : appData.scene.selected.pitch),
						sceneId: 'none',
						popover: false,
						popoverLazyload: true,
						popoverShow: false,
						popoverContent: null,
						popoverHtml: true,
						popoverSelector: null,
						popoverPlacement: 'default',
						popoverWidth: null,
						custom: false,
						customClassName: null,
						customContent: null
					}
				};
				
				appData.hotspot.dirty = true;
				
				appData.scene.selected.config.hotspots.splice(appData.scene.selected.config.hotspots.indexOf(appData.hotspot.selected)+1, 0, hotspot_new);
				appData.fn.hotspots.select(appData, hotspot_new);
			},
			copy: function(appData, hotspot) {
				if(hotspot) {
					var hotspot_new = angular.copy(hotspot);
					hotspot_new.id = appData.fn.hotspots.newName(appData); // ID should be unique
					hotspot_new.isSelected = false;
					
					appData.hotspot.dirty = true;
					
					appData.scene.selected.config.hotspots.splice(appData.scene.selected.config.hotspots.indexOf(appData.hotspot.selected)+1, 0, hotspot_new);
					appData.fn.hotspots.select(appData, hotspot_new);
				}
			},
			copySelected: function(appData) {
				appData.fn.hotspots.copy(appData, appData.fn.hotspots.getSelected(appData));
			},
			remove: function(appData, hotspot) {
				if(hotspot) {
					var i = appData.scene.selected.config.hotspots.length;
					while (i--) {
						if(appData.scene.selected.config.hotspots[i] === hotspot) {
							appData.scene.selected.config.hotspots.splice(i, 1);
							break;
						}
					}
					
					if(appData.hotspot.selected == hotspot) {
						appData.hotspot.selected = null;
					}
					
					appData.hotspot.dirty = true;
					
					// select something after deleting
					var hotspot_current = (appData.scene.selected.config.hotspots[i] ? appData.scene.selected.config.hotspots[i] : appData.scene.selected.config.hotspots[i-1]);
					appData.fn.hotspots.select(appData, hotspot_current);
				}
			},
			removeSelected: function(appData) {
				appData.fn.hotspots.remove(appData, appData.fn.hotspots.getSelected(appData));
			},
			updown: function(appData, hotspot, direction) {
				if(hotspot) {
					var len = appData.scene.selected.config.hotspots.length,
					i = len;
					while (i--) {
						if(appData.scene.selected.config.hotspots[i] === hotspot) {
							
							if(direction == 1 && i > 0) {
								appData.scene.selected.config.hotspots[i] = appData.scene.selected.config.hotspots[i-1];
								appData.scene.selected.config.hotspots[i-1] = hotspot;
							} else if(direction == -1 && i < (len-1)) {
								appData.scene.selected.config.hotspots[i] = appData.scene.selected.config.hotspots[i+1];
								appData.scene.selected.config.hotspots[i+1] = hotspot;
							}
							
							break;
						}
					}
				}
			},
			upSelected: function(appData) {
				appData.fn.hotspots.updown(appData, appData.fn.hotspots.getSelected(appData), 1);
			},
			downSelected: function(appData) {
				appData.fn.hotspots.updown(appData, appData.fn.hotspots.getSelected(appData), -1);
			},
			newName: function(appData){
				var i = 1,
				hotspotName,
				checkName = function(name, arr) {
					for (var j = arr.length; j--;) {
						var item = arr[j];
						if( item.id == name ) {
							return true;
						}
					}
					return false;
				};
				
				while (i) {
					hotspotName = 'Hotspot ' + i;
					if (!checkName(hotspotName, appData.scene.selected.config.hotspots)) {
						return hotspotName;
					}
					i++;
				}
			},
			unselect: function(appData) {
				for(var i = appData.scene.selected.config.hotspots.length; i--;) {
					var hotspot = appData.scene.selected.config.hotspots[i];
					if(hotspot.isSelected) {
						hotspot.isSelected = false;
						return;
					}
				}
			},
			select: function(appData, hotspot) {
				if(hotspot) {
					appData.fn.hotspots.unselect(appData);
					hotspot.isSelected = true;
				}
				appData.fn.hotspots.onSelect(appData, hotspot);
			},
			getSelected: function(appData) {
				for(var i = appData.scene.selected.config.hotspots.length; i--;) {
					var hotspot = appData.scene.selected.config.hotspots[i];
					if(hotspot.isSelected) {
						return hotspot;
					}
				}
				return false;
			},
			onSelect: function(appData, hotspot) {
				appData.hotspot.selected = hotspot;
			},
			dragStart: function(e, scope, element, attrs) {
				scope.appData.hotspot.dragged = scope.dragElement;
				scope.appData.fn.hotspots.select(scope.appData, scope.dragElement); // select before dragging
				scope.$root.safeApply();
			},
			dragOver: function(e, scope, element, attrs) {
				e.preventDefault();
				element.addClass('ipnrm-ui-drag-over');
			},
			dragLeave: function(e, scope, element, attrs) {
				e.preventDefault();
				element.removeClass('ipnrm-ui-drag-over');
			},
			dropScene: function(e, scope, element, attrs) {
				e.preventDefault();
				element.removeClass('ipnrm-ui-drag-over');
				
				if(scope.appData.hotspot.dragged) {
					var hotspot = angular.copy(scope.appData.hotspot.dragged);
					scope.appData.scene.selected.config.hotspots.splice(scope.appData.scene.selected.config.hotspots.indexOf(scope.appData.hotspot.dragged),1);
					scope.appData.hotspot.dragged = null;
					scope.appData.scene.selected.config.hotspots.splice(scope.appData.scene.selected.config.hotspots.indexOf(scope.dragOverElement), 0, hotspot);
					
					scope.$root.safeApply();
				}
			}
		}
	},

	// AngularJS services (see controllers.js)
	srv : {
		$compile: null,
		$timeout: null,
		$templateRequest: null,
		$http: null,
		growl: null
	}
};


//=========================================================
// Angular Application
//=========================================================
angular.module('ngiPanoramaApp', [
	'ngiPanoramaApp.services',
	'ngiPanoramaApp.controllers',
	'ngiPanoramaApp.directives',
	'ngiPanoramaApp.filters',
	'angular-growl'
]).
config(['growlProvider', function(growlProvider) {
	growlProvider.globalPosition('bottom-right');
	growlProvider.globalTimeToLive(9000);
	growlProvider.globalDisableCloseButton(false);
}]).
run(['$rootScope', function($rootScope) {
	$rootScope.safeApply = function safeApply(operation) {
		var phase = this.$root.$$phase;
		if (phase !== '$apply' && phase !== '$digest') {
			this.$apply(operation);
			return;
		}

		if (operation && typeof operation === 'function')
			operation();
	};
}]);
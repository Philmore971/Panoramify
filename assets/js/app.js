(function(window, angular, $) {
	"use strict";
	
	//=========================================================
	// Application Model Data 
	// see the services.js and controllers.js script
	//=========================================================
	var _fastpanoAppData = {
		VERSION: '1.1.0',
		inprocess: 0,
		winWidth: 0,
		winHeight: 0,
		
		mainMenu: {
			virtualtour : {
				id: 'virtualtour',
				isActive: true,
				templateUrl: 'templates/virtualtour.html',
				refresh: function(appData) {
					appData.virtualTourManager.fn.itemsRefresh(appData);
				}
			},
			filemanager : {
				id: 'filemanager',
				isActive: false,
				templateUrl: 'templates/filemanager.html',
				refresh: function(appData) {
					appData.fileManager.fn.itemsRefresh(appData);
				}
			}
		},
		
		fileManager: {
			items: [],
			itemsTotal: 0,
			itemsPerPage: 50,
			page: 0,
			pages: [],
			selectedAll: false,
			path: [],
			rootUrl: '',
			clipboard: {
				operation: null,
				items: []
			},
			
			fn: {
				itemsInit: function(appData) {
					appData.fileManager.fn.itemsRefresh(appData);
				},
				itemsRefresh: function(appData) {
					var path = appData.fileManager.fn.getCurrentPath(appData),
					page = appData.fileManager.page;
					appData.fileManager.fn.getItems(appData, page, path);
				},
				selectAll: function(appData, flag) {
					for (var index = 0, len = appData.fileManager.items.length; index < len; ++index) {
						appData.fileManager.items[index].selected = flag;
					}
				},
				selectRow: function(appData, item) {
					item.selected = !item.selected;
				},
				isSelected: function(appData) {
					for (var index = 0, len = appData.fileManager.items.length; index < len; ++index) {
						if(appData.fileManager.items[index].selected)
							return true;
					}
					return false;
				},
				isSelectedAll: function(appData) {
					for (var index = 0, len = appData.fileManager.items.length; index < len; ++index) {
						if(!appData.fileManager.items[index].selected) {
							return false;
						}
					}
					if(appData.fileManager.items.length > 0) {
						return true;
					}
					return false;
				},
				getSelectedItems: function(appData) {
					var items = [],
					path = appData.fileManager.fn.getCurrentPath(appData);
					for (var index = 0, len = appData.fileManager.items.length; index < len; ++index) {
						if(appData.fileManager.items[index].selected) {
							var item = {
								id: appData.fileManager.items[index].id,
								type: appData.fileManager.items[index].type,
								name: appData.fileManager.items[index].name,
								path: path
							}
							items.push(item);
						}
					}
					return items;
				},
				getItems: function(appData, page, path) {
					var postData = {
						action: 'list',
						page: page,
						itemsPerPage: appData.fileManager.itemsPerPage,
						path: path
					};
					appData.inprocess++;
					
					appData.service.$http.post('filemanager', postData).success(function(data, code) {
						var items = [];
						if(data.items) {
							for (var i = 0, len = data.items.length; i < len; ++i) {
								var item = angular.merge({}, data.items[i]);
								item.selected = false;
								//item.id
								//item.name
								//item.link
								//item.size
								item.created_at = appData.fn.parseDate(item.created_at);
								item.updated_at = appData.fn.parseDate(item.updated_at);
								items.push(item);
							}
						}
						
						var pageCount = Math.ceil(data.total / data.itemsPerPage),
						pages = new Array (pageCount);
						for (var i = 0; i < pageCount; i++) {
							pages[i] = i + 1;
						}
						
						appData.fileManager.items = items;
						appData.fileManager.itemsTotal = data.total;
						appData.fileManager.page = data.page;
						appData.fileManager.path = data.path;
						appData.fileManager.pages = pages;
					}).error(function(data, code) {
						appData.service.growl.error("The list operation failed");
						console.log('Error %s - response error, please check the ajax response.'.replace('%s', code));
					})['finally'](function() {
						appData.inprocess--;
					});
				},
				getFolderItems: function(appData, item) {
					var path = appData.fileManager.fn.getCurrentPath(appData);
					path = path + (path == '' ? '' : '/') + item.name;
					appData.fileManager.fn.getItems(appData, 0, path);
				},
				getFolderItemsBreadcrumb: function(appData, item) {
					appData.fileManager.fn.getItems(appData, 0, item.path);
				},
				getPrevPage: function(appData) {
					var page = appData.fileManager.page - 1;
					if(page < 0)
						return;
					
					var path = appData.fileManager.fn.getCurrentPath(appData);
					appData.fileManager.fn.getItems(appData, page, path);
				},
				getNextPage: function(appData) {
					var page = appData.fileManager.page + 1;
					if(page >= appData.fileManager.pages.length)
						return;
					
					var path = appData.fileManager.fn.getCurrentPath(appData);
					appData.fileManager.fn.getItems(appData, page, path);
				},
				getPage: function(appData, page) {
					var path = appData.fileManager.fn.getCurrentPath(appData);
					appData.fileManager.fn.getItems(appData, page, path);
				},
				getCurrentPath: function(appData) {
					var path = '';
					for (var i = 1, len = appData.fileManager.path.length; i < len; ++i) {
						path += appData.fileManager.path[i].name + (i+1 == len ? '' : '/');
					}
					return path;
				},
				removeItemsConfirm: function(appData) {
					if(!appData.fileManager.fn.isSelected(appData)) {
						appData.service.growl.warning("You should select items to delete");
						return;
					}
					
					var modalData = {
						content: 'Are you sure to delete selected items?'
					}
					appData.modal.fn.show(appData, 'templates/modal-confirm.html', modalData).then(function(result) {
						appData.modal.fn.close(appData, modalData.id);
						
						if(result == 'close') {
							return;
						}
						
						if(result) {
							appData.fileManager.fn.removeItems(appData);
						}
					});
				},
				removeItems: function(appData) {
					var path = appData.fileManager.fn.getCurrentPath(appData),
					items = appData.fileManager.fn.getSelectedItems(appData),
					itemsCount = items.length,
					postData = {
						action: 'delete',
						items: items,
						path: path
					};
					appData.inprocess++;
					
					appData.service.$http.post('filemanager', postData).success(function(data, code) {
						if(data.processed && data.processed.length == itemsCount) {
							appData.service.growl.success("The delete operation successful");
						} else {
							appData.service.growl.warning("Not all selected items are deleted");
							console.log(data.error);
						}
						appData.fileManager.fn.itemsRefresh(appData);
					}).error(function(data, code) {
						appData.service.growl.error("The delete operation failed");
						console.log('Error %s - response error, please check the ajax response.'.replace('%s', code));
					})['finally'](function() {
						appData.inprocess--;
					});
				},
				createFolderConfirm: function(appData) {
					var modalData = {
						folderName: null
					};
					appData.modal.fn.show(appData, 'templates/modal-create-folder.html', modalData).then(function(result) {
						appData.modal.fn.close(appData, modalData.id);
						
						if(result == 'close') {
							return;
						}
						
						if(result) {
							appData.fileManager.fn.createFolder(appData, modalData.folderName);
						}
					});
				},
				createFolder: function(appData, name) {
					var path = appData.fileManager.fn.getCurrentPath(appData),
					postData = {
						action: 'mkdir',
						name: name,
						path: path
					};
					appData.inprocess++;
					
					appData.service.$http.post('filemanager', postData).success(function(data, code) {
						if(data.result && data.item) {
							appData.service.growl.success("The create folder operation successful");
							
							var item = angular.merge({}, data.item);
							item.selected = false;
							//item.id
							//item.name
							//item.link
							item.size = item.size;
							item.created_at = appData.fn.parseDate(item.created_at);
							item.updated_at = appData.fn.parseDate(item.updated_at);
							appData.fileManager.items.push(item);
							
							appData.fileManager.itemsTotal++;
						} else {
							appData.service.growl.error("The create folder operation failed");
							console.log(data.error);
						}
					}).error(function(data, code) {
						appData.service.growl.error("The create folder operation failed");
						console.log('Error %s - response error, please check the ajax response.'.replace('%s', code));
					})['finally'](function() {
						appData.inprocess--;
					});
				},
				uploadFileConfirm: function(appData) {
					var path = '/' + appData.fileManager.fn.getCurrentPath(appData);
					var modalData = {
						inprocess: 0,
						path: path,
						files: [],
						fn: {
							select: function(modalData, files) {
								modalData.files = files;
							},
							close: function(modalData) {
								var i = modalData.files.length;
								while (i--) {
									modalData.fn.remove(modalData, i);
								}
								modalData.deferred.resolve('close');
							},
							remove: function(modalData, index) {
								var file = modalData.files[index];
								if(file && file.xhr && file.xhr.readyState != 4) {
									file.xhr.abort();
								}
								modalData.files.splice(index, 1);
							},
							upload: function(modalData) {
								var path = modalData.appData.fileManager.fn.getCurrentPath(modalData.appData);
								for(var index = 0; index < modalData.files.length; ++index) {
									var f = modalData.files[index];
									f.error = false;
									f.progress = 0;
									
									(function(file) {
										var postData = {
											action: 'upload',
											file: file,
											path: path
										};
										modalData.inprocess++;
										
										modalData.appData.service.upload.upload({
											url: 'filemanager', 
											data: postData
										}).progress(function(e) {
											file.progress = Math.min(100, parseInt(100.0 * e.loaded / e.total)) - 1;
										}).success(function(data, code) {
											if(typeof(data.result) !== "boolean" || !data.result) {
												file.error = true;
											}
										}).error(function(data, code) {
											file.error = true;
											console.log('Error %s - response error, please check the ajax response.'.replace('%s', code));
										}).xhr(function(xhr) {
											file.xhr = xhr;
										})['finally'](function() {
											modalData.inprocess--;
											
											setTimeout(function() {
												if(file.error) {
													file.progress = 0;
													console.log('Response error, please check the ajax response.');
												} else {
													file.progress = 100;
												}
												
												modalData.appData.service.$root.safeApply();
											}, 1 + 100 * modalData.inprocess);
										});
									})(f);
								}
							}
						}
					};
					appData.modal.fn.show(appData, 'templates/modal-upload-file.html', modalData).then(function(result) {
						appData.modal.fn.close(appData, modalData.id);
						
						if(result == 'close') {
							appData.fileManager.fn.itemsRefresh(modalData.appData);
							return;
						}
					});
				},
				editItemOpen: function(appData, item) {
					item.tmpname = item.name;
					item.edit = true;
				},
				renameItem: function(appData, item) {
					var path = appData.fileManager.fn.getCurrentPath(appData),
					postData = {
						action: 'rename',
						oldname: item.name,
						newname: item.tmpname,
						path: path
					};
					appData.inprocess++;
					
					appData.service.$http.post('filemanager', postData).success(function(data, code) {
						if(data.result) {
							item.tmpname = null;
							item.edit = false;
							item.name = data.name;
							appData.service.growl.success("The rename operation successful");
						} else {
							appData.service.growl.error("The rename operation failed");
							console.log(data.error);
						}
					}).error(function(data, code) {
						appData.service.growl.error("The rename operation failed");
						console.log('Error %s - response error, please check the ajax response.'.replace('%s', code));
					})['finally'](function() {
						appData.inprocess--;
					});
				},
				editItemClose: function(appData, item) {
					item.tmpname = null;
					item.edit = false;
				},
				cutItems: function(appData) {
					var items = appData.fileManager.fn.getSelectedItems(appData);
					if(items.length > 0) {
						appData.fileManager.clipboard.operation = 'cut';
						appData.fileManager.clipboard.items = items;
					}
				},
				copyItems: function(appData) {
					var items = appData.fileManager.fn.getSelectedItems(appData);
					if(items.length > 0) {
						appData.fileManager.clipboard.operation = 'copy';
						appData.fileManager.clipboard.items = items;
					}
				},
				pasteItemsConfirm: function(appData) {
					var modalData = {
						content: 'Are you sure to ' + appData.fileManager.clipboard.operation + ' items?',
					}
					appData.modal.fn.show(appData, 'templates/modal-confirm.html', modalData).then(function(result) {
						appData.modal.fn.close(appData, modalData.id);
						
						if(result == 'close') {
							return;
						}
						
						if(result) {
							appData.fileManager.fn.pasteItems(appData);
						}
					});
				},
				pasteItems: function(appData) {
					var path = appData.fileManager.fn.getCurrentPath(appData),
					items = appData.fileManager.clipboard.items,
					itemsCount = items.length,
					operation = appData.fileManager.clipboard.operation,
					postData = {
						action: 'paste',
						items: items,
						operation: operation,
						path: path
					};
					appData.inprocess++;
					
					appData.service.$http.post('filemanager', postData).success(function(data, code) {
						if(data.processed && data.processed.length == itemsCount) {
							appData.service.growl.success("The paste operation successful");
						} else {
							appData.service.growl.warning("Not all items are processed");
							console.log(data.error);
						}
						
						if(postData.operation == 'cut') {
							appData.fileManager.clipboard.operation = null;
							appData.fileManager.clipboard.items = [];
						}
						
						appData.fileManager.fn.itemsRefresh(appData);
					}).error(function(data, code) {
						appData.service.growl.error("The paste operation failed");
						console.log('Error %s - response error, please check the ajax response.'.replace('%s', code));
					})['finally'](function() {
						appData.inprocess--;
					});
				}
			}
		},
		
		virtualTourManager: {
			items: [],
			itemsTotal: 0,
			itemsPerPage: 50,
			page: 0,
			pages: [],
			selectedAll: false,
			order: 'created_desc', // title_asc, title_desc, created_asc, created_desc, updated_asc, updated_desc, updated_asc
			clipboard: {
				operation: null,
				items: []
			},
			
			builder: {
				dragged: null,
				panoramaConfigTemplates: { // templates for a new panorama config
					virtualTour: {
						type: 'VirtualTour',
						title: null,
						scenes: []
					},
					scene: {
						title: null,
						yaw: null,
						pitch: null,
						zoom: null,
						image: {
							isCustom: false,
							url: null
						},
						imageThumb: {
							isCustom: false,
							url: null
						}
					}
				},
				panoramaConfig: { // config for a current editing virtual tour
				},
				// The Example
				/*
					type: 'VirtualTour',
					title: 'MyPanorama',
					scenes: [
						{
							title: 'My scene 01',
							image: {
								isCustom: false,
								url: 'tucson.jpg'
								//url: 'http://127.0.0.1/victor/upload/tucson.jpg'
							},
							imageThumb: {
								isCustom: false,
								url: 'tucson.jpg'
								//url: 'http://127.0.0.1/victor/upload/tucson.jpg'
							}
						}
					]
				*/
				fn: {
					getPanoramaConfig: function(appData, itemName) {
						var deferred = appData.service.$q.defer();
						
						appData.virtualTourManager.builder.fn.resetPanoramaConfig(appData);
						
						if(itemName == null) {
							var config = appData.virtualTourManager.builder.panoramaConfig;
							deferred.resolve(config);
							
							return deferred.promise;
						}

						var postData = {
							action: 'get',
							name: itemName
						};
						appData.inprocess++;
						
						appData.service.$http.post('virtualtourmanager', postData).success(function(data, code) {
							if(data.result) {
								var config = angular.merge({}, appData.virtualTourManager.builder.panoramaConfigTemplates.virtualTour, data.config);
								for(var i=0;i < config.scenes.length; i++) {
									var scene = angular.merge({}, appData.virtualTourManager.builder.panoramaConfigTemplates.scene, config.scenes[i]);
									config.scenes[i] = scene;
								}
								appData.virtualTourManager.builder.panoramaConfig = config;
								
								deferred.resolve(config);
							} else {
								appData.service.growl.error(data.error);
							}
						}).error(function(data, code) {
							appData.service.growl.error('Error %s - response error, please check the ajax response.'.replace('%s', code));
						})['finally'](function() {
							appData.inprocess--;
						});
						
						return deferred.promise;
					},
					resetPanoramaConfig: function(appData) {
						appData.virtualTourManager.builder.panoramaConfig = angular.merge({}, appData.virtualTourManager.builder.panoramaConfigTemplates.virtualTour);
					},
					isSelected: function(appData) {
						for (var index = 0, len = appData.virtualTourManager.builder.panoramaConfig.scenes.length; index < len; ++index) {
							if(appData.virtualTourManager.builder.panoramaConfig.scenes[index].selected)
								return true;
						}
						return false;
					},
					getSelectedItems: function(appData) {
						var items = [];
						for (var index = 0, len = appData.virtualTourManager.builder.panoramaConfig.scenes.length; index < len; ++index) {
							var scene = appData.virtualTourManager.builder.panoramaConfig.scenes[index];
							if(scene.selected) {
								var item = angular.copy(scene);
								items.push(item);
							}
						}
						return items;
					},
					removeItemsConfirm: function(appData) {
						var modalData = {
							content: 'Are you sure to delete selected items?'
						}
						appData.modal.fn.show(appData, 'templates/modal-confirm.html', modalData).then(function(result) {
							appData.modal.fn.close(appData, modalData.id);
							
							if(result == 'close') {
								return;
							}
						
							if(result) {
								appData.virtualTourManager.builder.fn.removeItems(appData);
							}
						});
					},
					removeItems: function(appData) {
						var i = appData.virtualTourManager.builder.panoramaConfig.scenes.length;
						while (i--) {
							var scene = appData.virtualTourManager.builder.panoramaConfig.scenes[i];
							if(scene.selected) {
								appData.virtualTourManager.builder.panoramaConfig.scenes.splice(i, 1);
							}
						}
					},
					setUrlConfirm: function(appData, imageObj) {
						var modalData = {
							url: imageObj.url
						};
						appData.modal.fn.show(appData, 'templates/modal-set-url.html', modalData).then(function(result) {
							appData.modal.fn.close(appData, modalData.id);
							
							if(result == 'close') {
								return;
							}
							
							if(result) {
								appData.virtualTourManager.builder.fn.setUrl(appData, imageObj, modalData.url, true);
							}
						});
					},
					setUrl: function(appData, imageObj, url, isCustom) {
						if(url == imageObj.url)
							return;
						
						imageObj.url = url;
						imageObj.isCustom = isCustom;
					},
					getImageUrl: function(appData, imageObj) {
						if(!imageObj)
							return;
						
						var url = '';
						if(imageObj.isCustom) {
							url = imageObj.url;
						} else if(imageObj.url && imageObj.url.length > 0) {
							url = appData.fileManager.rootUrl + '/' + imageObj.url;
						}
						return url;
					},
					selectImageConfirm: function(appData, dst) {
						var modalData = {
							multiSelect: false
						};
					
						appData.modal.fn.show(appData, 'templates/modal-filemanager.html', modalData).then(function(result) {
							appData.modal.fn.close(appData, modalData.id);
						
							if(result == 'close') {
								return;
							}
						
							if(typeof(result) !== 'boolean') {
								var item = result,
								path = appData.fileManager.fn.getCurrentPath(appData),
								path = path + (path == '' ? '' : '/') + item.name;
								appData.virtualTourManager.builder.fn.setUrl(appData, dst, path, false);
							}
						});
					},
					addItemsConfirm: function(appData) {
						var modalData = {
							multiSelect: true
						};
						
						appData.modal.fn.show(appData, 'templates/modal-filemanager.html', modalData).then(function(result) {
							appData.modal.fn.close(appData, modalData.id);
						
							if(result == 'close') {
								return;
							}
							
							if(typeof(result) !== 'boolean') {
								appData.fileManager.fn.selectAll(appData, false);
								result.selected = true;
							}
							
							var items = appData.fileManager.fn.getSelectedItems(appData);
							appData.virtualTourManager.builder.fn.addItems(appData, items);
						});
					},
					addItems: function(appData, items) {
						for(var index = 0, len = items.length; index < len; ++index) {
							var item = items[index];
							
							if(item.type == 'folder')
								continue;
							
							var path = appData.fileManager.fn.getCurrentPath(appData),
							path = path + (path == '' ? '' : '/') + item.name,
							scene = angular.copy(appData.virtualTourManager.builder.panoramaConfigTemplates.scene);
							
							appData.virtualTourManager.builder.fn.setUrl(appData, scene.image, path, false);
							appData.virtualTourManager.builder.panoramaConfig.scenes.push(scene);
						}
					}
				}
			},
			
			fn: {
				itemsInit: function(appData) {
					appData.virtualTourManager.fn.itemsRefresh(appData);
				},
				itemsRefresh: function(appData) {
					var page = appData.virtualTourManager.page;
					appData.virtualTourManager.fn.getItems(appData, page);
				},
				setOrder: function(appData, order) {
					var newOrder = appData.virtualTourManager.order;
					
					if(order == 'title') {
						if(newOrder == 'title_asc') {
							newOrder = 'title_desc';
						} else {
							newOrder = 'title_asc';
						}
					}
					
					if(order == 'created') {
						if(newOrder == 'created_asc') {
							newOrder = 'created_desc';
						} else {
							newOrder = 'created_asc';
						}
					}
					
					if(order == 'updated') {
						if(newOrder == 'updated_asc') {
							newOrder = 'updated_desc';
						} else {
							newOrder = 'updated_asc';
						}
					}
					
					appData.virtualTourManager.order = newOrder;
					appData.virtualTourManager.fn.itemsRefresh(appData);
				},
				selectAll: function(appData) {
					for (var index = 0, len = appData.virtualTourManager.items.length; index < len; ++index) {
						appData.virtualTourManager.items[index].selected = appData.virtualTourManager.selectedAll;
					}
				},
				selectRow: function(appData, item) {
					item.selected = !item.selected;
				},
				isSelected: function(appData) {
					for (var index = 0, len = appData.virtualTourManager.items.length; index < len; ++index) {
						if(appData.virtualTourManager.items[index].selected)
							return true;
					}
					return false;
				},
				isSelectedAll: function(appData) {
					for (var index = 0, len = appData.virtualTourManager.items.length; index < len; ++index) {
						if(!appData.virtualTourManager.items[index].selected) {
							return false;
						}
					}
					if(appData.virtualTourManager.items.length > 0) {
						return true;
					}
					return false;
				},
				getSelectedItems: function(appData) {
					var items = [];
					for (var index = 0, len = appData.virtualTourManager.items.length; index < len; ++index) {
						if(appData.virtualTourManager.items[index].selected) {
							var item = {
								id: appData.virtualTourManager.items[index].id,
								name: appData.virtualTourManager.items[index].name
							}
							items.push(item);
						}
					}
					return items;
				},
				getItems: function(appData, page) {
					var postData = {
						action: 'list',
						page: page,
						order: appData.virtualTourManager.order,
						itemsPerPage: appData.virtualTourManager.itemsPerPage
					};
					appData.inprocess++;
					
					appData.service.$http.post('virtualtourmanager', postData).success(function(data, code) {
						var items = [];
						if(data.items) {
							for (var i = 0, len = data.items.length; i < len; ++i) {
								var item = angular.merge({}, data.items[i]);
								item.selected = false;
								//item.id
								//item.name
								//item.title
								//item.scenes
								//item.link
								//item.size
								item.created_at = appData.fn.parseDate(item.created_at);
								item.updated_at = appData.fn.parseDate(item.updated_at);
								items.push(item);
							}
						}
						
						var pageCount = Math.ceil(data.total / data.itemsPerPage),
						pages = new Array (pageCount);
						for (var i = 0; i < pageCount; i++) {
							pages[i] = i + 1;
						}
						
						appData.virtualTourManager.items = items;
						appData.virtualTourManager.itemsTotal = data.total;
						appData.virtualTourManager.page = data.page;
						appData.virtualTourManager.pages = pages;
					}).error(function(data, code) {
						appData.service.growl.error('Error %s - response error, please check the ajax response.'.replace('%s', code));
					})['finally'](function() {
						appData.inprocess--;
					});
				},
				getPrevPage: function(appData) {
					var page = appData.virtualTourManager.page - 1;
					if(page < 0)
						return;
					
					appData.virtualTourManager.fn.getItems(appData, page);
				},
				getNextPage: function(appData) {
					var page = appData.virtualTourManager.page + 1;
					if(page >= appData.virtualTourManager.pages.length)
						return;
					
					appData.virtualTourManager.fn.getItems(appData, page);
				},
				getPage: function(appData, page) {
					appData.virtualTourManager.fn.getItems(appData, page);
				},
				createVirtualTourConfirm: function(appData) {
					appData.virtualTourManager.fn.updateVirtualTourConfirm(appData, null);
				},
				updateVirtualTourConfirm: function(appData, itemName) {
					appData.virtualTourManager.builder.fn.getPanoramaConfig(appData, itemName).then(function(config){
						var modalData = {
							isNewItem: (itemName ? false : true),
							name: itemName,
							panoramaConfig: config
						};
						appData.modal.fn.show(appData, 'templates/modal-update-virtualtour.html', modalData).then(function(result) {
							appData.modal.fn.close(appData, modalData.id);
							
							if(result == 'close') {
								return;
							}
							
							if(result) {
								appData.virtualTourManager.fn.updateVirtualTour(appData, modalData.name, modalData.panoramaConfig);
							}
						});
					});
				},
				updateVirtualTour: function(appData, name, config) {
					var postData = {
						action: 'update',
						name: name,
						config: config
					};
					appData.inprocess++;
					
					appData.service.$http.post('virtualtourmanager', postData).success(function(data, code) {
						if(data.result) {
							appData.virtualTourManager.fn.itemsRefresh(appData);
							appData.service.growl.success("The update operation successful");
						} else {
							appData.service.growl.error(data.error);
						}
					}).error(function(data, code) {
						appData.service.growl.error('Error %s - response error, please check the ajax response.'.replace('%s', code));
					})['finally'](function() {
						appData.inprocess--;
					});
				},
				removeItemsConfirm: function(appData) {
					if(!appData.virtualTourManager.fn.isSelected(appData)) {
						appData.service.growl.warning("You should select items to delete");
						return;
					}
						
					var modalData = {
						content: 'Are you sure to delete selected items?'
					}
					appData.modal.fn.show(appData, 'templates/modal-confirm.html', modalData).then(function(result) {
						appData.modal.fn.close(appData, modalData.id);
						
						if(result == 'close') {
							return;
						}
						
						if(result) {
							appData.virtualTourManager.fn.removeItems(appData);
						}
					});
				},
				removeItems: function(appData) {
					var items = appData.virtualTourManager.fn.getSelectedItems(appData),
					itemsCount = items.length,
					postData = {
						action: 'delete',
						items: items
					};
					appData.inprocess++;
					
					appData.service.$http.post('virtualtourmanager', postData).success(function(data, code) {
						if(data.processed && data.processed.length == itemsCount) {
							appData.service.growl.success("The delete operation successful");
						} else {
							appData.service.growl.warning("Not all selected items are deleted");
							console.log(data.error);
						}
						appData.virtualTourManager.fn.itemsRefresh(appData);
					}).error(function(data, code) {
						appData.service.growl.error('Error %s - response error, please check the ajax response.'.replace('%s', code));
					})['finally'](function() {
						appData.inprocess--;
					});
				},
				editItemOpen: function(appData, item) {
					item.tmptitle = item.title;
					item.edit = true;
				},
				renameItem: function(appData, item) {
					var postData = {
						action: 'rename',
						name: item.name,
						oldtitle: item.title,
						newtitle: item.tmptitle
					};
					appData.inprocess++;
					
					appData.service.$http.post('virtualtourmanager', postData).success(function(data, code) {
						if(data.result) {
							item.tmptitle = null;
							item.edit = false;
							item.title = data.title;
							appData.service.growl.success("The rename operation successful");
						} else {
							appData.service.growl.error(data.error);
						}
					}).error(function(data, code) {
						appData.service.growl.error('Error %s - response error, please check the ajax response.'.replace('%s', code));
					})['finally'](function() {
						appData.inprocess--;
					});
				},
				editItemClose: function(appData, item) {
					item.tmptitle = null;
					item.edit = false;
				},
			}
		},
		
		modal: {
			count: 0,
			items: [],
			
			fn: {
				show: function(appData, templateUrl, modalData, callback) {
					var id = ++appData.modal.count,
					deferred = appData.service.$q.defer();
					
					appData.modal.items.push(id);
					appData.inprocess++;
					
					appData.service.$templateRequest(templateUrl).then(function(html) {
						var template = angular.element(html); // convert the html to an actual DOM node
						
						// append it to the directive element
						jQuery('body').addClass('fstpn-ui-modal-open');
						
						if(modalData.easyClose == undefined || modalData.easyClose) {
							template.on('click', function(e) {
								scope.modalData.deferred.resolve('close');
							});
						}
						
						template.find(".fstpn-ui-modal-dialog").on('click', function(e) {
							e.preventDefault();
							return false;
						});
						
						template.on('click', function(e) {
							appData.modal.fn.close(appData, id);
						});
						
						template.addClass('fstpn-ui-modal-hidden'); // css3 animation
						jQuery('.fstpn-ui-modals').append(template);
						
						// create a new isolated scope
						var scope = appData.service.$root.$new(true);
						scope.modalData = modalData;
						scope.modalData.id = id;
						scope.modalData.deferred = deferred;
						scope.modalData.appData = appData;
						
						// and let Angular $compile it
						appData.service.$compile(template)(scope);
						
						// css3 animation
						setTimeout(function() {template.removeClass('fstpn-ui-modal-hidden');},1);
					})['finally'](function() {
						if (callback && typeof callback == 'function') { // make sure the callback is a function
							callback.call(this); // brings the scope to the callback
						}
						appData.inprocess--;
					});
					
					return deferred.promise;
				},
				close: function(appData, id) {
					jQuery('#fstpn-ui-modal-' + id).remove();
					
					var index = appData.modal.items.indexOf(id);
					appData.modal.items.splice(index, 1);
					if(appData.modal.items.length == 0) {
						jQuery('body').removeClass('fstpn-ui-modal-open');
					}
				}
			}
		},
		
		fn: {
			init: function(appData) {
				appData.fn.initRootUrl(appData);
				
				jQuery(window).on('resize', jQuery.proxy(function() {
					this.fn.resize(this);
				}, appData));
				appData.fn.resize(appData);
			},
			initRootUrl: function(appData) {
				var postData = {
					action: 'rooturl'
				};
				appData.inprocess++;
				
				appData.service.$http.post('filemanager', postData).success(function(data, code) {
					if(data.rootUrl) {
						appData.fileManager.rootUrl = data.rootUrl;
					}
				}).error(function(data, code) {
					appData.service.growl.error('Error %s - response error, please check the ajax response.'.replace('%s', code));
				})['finally'](function() {
					appData.inprocess--;
				});
			},
			resize: function(appData) {
				var $win = jQuery(window);
				appData.winWidth = $win.outerWidth();
				appData.winHeight = $win.outerHeight();
				
				appData.service.$root.safeApply();
			},
			mainMenuItemInit: function(appData, id) {
				jQuery('#fstpn-ui-block-menu-item-' + id).on('click', function(e) {
					e.preventDefault();
					appData.fn.mainMenuItemClick(appData, id);
				});
				
				if(appData.mainMenu[id].isActive) {
					appData.fn.workspaceInit(appData, id);
					appData.service.$root.safeApply();
				}
			},
			mainMenuItemClick: function(appData, id) {
				if(!appData.mainMenu[id].isActive) {
					appData.fn.workspaceInit(appData, id);
					appData.fn.mainMenuReset(appData);
					
					appData.mainMenu[id].isActive = true;
					appData.service.$root.safeApply();
				}
			},
			mainMenuReset: function(appData) {
				var obj = appData.mainMenu;
				for (var property in obj) {
					if (obj.hasOwnProperty(property)) {
						obj[property].isActive = false;
					}
				}
			},
			refreshWorkspace: function(appData) {
				var obj = appData.mainMenu;
				for (var property in obj) {
					if (obj.hasOwnProperty(property)) {
						if(obj[property].isActive) {
							obj[property].refresh(appData);
						};
					}
				}
			},
			workspaceInit: function(appData, id) {
				var url = appData.mainMenu[id].templateUrl;
				appData.inprocess++;
				appData.service.$templateRequest(url).then(function(data) {
					// convert the html to an actual DOM node
					var template = angular.element(data);
					// append it to the directive element
					jQuery('#fstpn-ui-workspace').empty().append(template);
					
					// create a new isolated scope
					var scope = appData.service.$root.$new(true);
					scope.appData = appData;
					
					// and let Angular $compile it
					appData.service.$compile(template)(scope);
				})['finally'](function() {
					appData.inprocess--;
				});
			},
			
			// helpers
			parseDate: function(date) {
				var d = (date || '').toString().split(/[- :]/);
				return new Date(d[0], d[1] - 1, d[2], d[3], d[4], d[5]);
			},
			isLightBox: function(url) {
				return (url.match(/\.(jpeg|jpg|gif|png)$/) != null);
			}
		},
		
		// AngularJS services (see controllers.js)
		service : {
			$compile: null,
			$timeout: null,
			$templateRequest: null,
			$http: null,
			$q: null,
			growl: null,
			upload: null,
			$root: null
		}
	};
	window.fastpanoAppData = _fastpanoAppData;
	
	
	//=========================================================
	// Angular Modules
	//=========================================================
	angular.module('ngFastPanoApp', [
		'ngFastPanoApp.services',
		'ngFastPanoApp.controllers',
		'ngFastPanoApp.directives',
		'ngFastPanoApp.filters',
		'angular-growl',
		'ngAnimate',
		'ngFileUpload',
		'as.sortable'
	]).
	config(['growlProvider', function(growlProvider) {
		growlProvider.globalTimeToLive(9000);
		growlProvider.globalDisableCloseButton(false);
		growlProvider.onlyUniqueMessages(false);
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
	//=========================================================
	// Services
	//=========================================================
	angular.module('ngFastPanoApp.services', [])
	.factory('appData', function () {
		return _fastpanoAppData;
	});
	//=========================================================
	// Controllers
	//=========================================================
	angular.module('ngFastPanoApp.controllers', []).
		controller('ngFastPanoAppController', ['$scope', '$compile', '$timeout', '$templateRequest', '$http', '$q', 'growl', 'Upload', 'appData', function ($scope, $compile, $timeout, $templateRequest, $http, $q, growl, Upload, appData) {
			appData.service.$compile = $compile;
			appData.service.$timeout = $timeout;
			appData.service.$templateRequest = $templateRequest;
			appData.service.$http = $http;
			appData.service.$q = $q;
			appData.service.growl = growl;
			appData.service.upload = Upload;
			appData.service.$root = $scope.$root;
			$scope.appData = appData;
	}]);
	//=========================================================
	// Directives
	//=========================================================
	angular.module('ngFastPanoApp.directives', []).
	directive('checkbox', function() {
		return ({
			restrict: 'EA',
			require: 'ngModel',
			replace: true,
			template: '<div class="fstpn-ui-checkbox">&nbsp;</div>',
			scope: {
				ngModel: '='
			},
			link: link
		});
		
		function link(scope, element, attrs, controller) {
			element.on('click', onItemClick);
			
			controller.$render = renderItemAsync;
			
			function renderItemAsync() {
				scope.$evalAsync( renderItem );
			}
			
			function renderItem() {
				if ( controller.$viewValue ) {
					element.addClass('fstpn-ui-checked');
				} else { 
					element.removeClass('fstpn-ui-checked');
				}
			}
			
			function onItemClick(e) {
				scope.$apply(
					function changeModel() {
						controller.$setViewValue( !controller.$viewValue );
						renderItem();
					}
				);
			}
		}
	}).
	directive('radio', ['$parse', '$document', function($parse, $document) {
		return ({
			restrict: 'EA',
			require: 'ngModel',
			replace: true,
			template: '<div class="fstpn-ui-radio">&nbsp;</div>',
			scope: {
				ngModel: '=',
				ngValue: '@'
			},
			link: link
		});
		
		function link(scope, element, attrs, controller) {
			// Cache DOM references.
			// NOTE: We are NOT caching the LI nodes as those are dynamic. We'll need to query for those just-in-time when they are needed.
			var dom = {
				element: element,
				list: element.parent().find( '.fstpn-ui-radio' )
			};
			
			element.on('click', onItemClick);
			
			controller.$render = renderItemAsync;
			
			function renderItemAsync() {
				scope.$evalAsync( renderItem );
			}
			
			function renderItem() {
				// Find the FIRST DOM element that matches the selected value.
				var item = findItemWithValue( controller.$viewValue );
				
				dom.list.removeClass('fstpn-ui-selected');
				if ( item ) {
					item.addClass( 'fstpn-ui-selected' );
				}
			}
			
			function onItemClick(e) {
				scope.$apply(
					function changeModel() {
						var item = angular.element( e.target );
						controller.$setViewValue( getItemValue( item ) );
						
						renderItem();
					}
				);
			}
			
			// I get the value of the given item (as evaluated in the context
			// of the local scope associated with the option element).
			function getItemValue( item ) {
				var accessor = $parse( item.attr( 'value' ) || item.attr( 'x-value' ) || 'null' );
				return( accessor( item.scope() ) );
			}
			
			function findItemWithValue( value ) {
				// Since the options are dynamic, we have to collection just-in-
				// time with the selection event.
				var items = dom.list;
				for ( var i = 0, length = items.length; i < length ; i++ ) {
					var item = angular.element( items[ i ] );
					
					if ( getItemValue( item ) === value ) {
						return( item );
					}
				}
				return( null );
			}
		}
	}]).
	directive('dropdown', ['$compile', function($compile) {
		// Return the directive configuration.
		// NOTE: ngModel compiles at priority 1, so we will compile at priority 2.
		return ({
			compile: compile,
			priority: 2,
			restrict: 'A',
			terminal: true
		});
		
		// Compile the dropdown directive, adding other HTML and CSS class hooks
		// needed to execute the dropdown. This assumes that all directives are 
		// present (ie, you can't render the dropdown using an ngInclude or any other asynchronous loading).
		function compile( element, attrs ) {
			// prepend the root of the menu (where the selected value is shown
			// when the menu options are hidden).
			element.prepend('<div class="fstpn-ui-dropdown-display"><span></span></div>');
			
			// add CSS hooks. Since we're in the compiling phase, these CSS hooks
			// will automatically be picked up by any nested ngRepeat directives;
			// that's what makes the compile phase (and AngularJS) so player!
			element.addClass( 'fstpn-ui-dropdown' );
			element.find( '.fstpn-ui-dropdown-list > div' ).addClass('fstpn-ui-dropdown-item');
			
			// Since we're using TERMINAL compilation, we have to explicitly
			// compile and link everything at a lower priority. This will compile
			// the newly-injected ngModel directive as well as all the nested
			// directives in the menu.
			var linkSubtree = $compile( element, null, 2 );
			return( link );
			
			// When the dropdown is linked, we have to link the explicitly
			// compiled portion of the DOM.
			function link( scope ) {
				linkSubtree( scope );
			}
		}
	}]).
	directive('dropdown', ['$parse', '$document', function($parse, $document) {
		return ({
			restrict: 'EA',
			require: 'ngModel',
			scope: {
				ngModel: '=',
			},
			link: link
		});
		
		function link(scope, element, attrs, controller) {
			element.addClass( 'fstpn-ui-dropdown' );
			element.find( '.fstpn-ui-dropdown-list > div' ).addClass('fstpn-ui-dropdown-item');
			
			// Cache DOM references.
			// NOTE: We are NOT caching the LI nodes as those are dynamic. We'll need to query for those just-in-time when they are needed.
			var dom = {
				root: element,
				display: element.find( '.fstpn-ui-dropdown-display' ),
				list: element.find( '.fstpn-ui-dropdown-list' )
			};
			
			// I am the value that will be put in the menu root if we cannot
			// find an option with the matching ngModel value.
			var placeholder = ( attrs.placeholder || '&nbsp;' );
			
			dom.display.on( 'click', onDisplayClick ); // when the user clicks the root, we're going to toggle the menu.
			
			// When the user clicks on an option, we're going to select it.
			// This must use event delegation (only available in jQuery) since
			// the options are dynamic.
			dom.list.on( 'click', '.fstpn-ui-dropdown-item', onItemClick );
			
			$document.on( 'mousedown', onDocumentMouseDown ); // when the user clicks outside the menu, we have to close it.
			scope.$on( '$destroy', onDestroy ); // when the scope is destroyed, we have to clean up.
			
			// When the ngModel value is changed, we'll have to update the
			// rendering of the dropdown menu to reflect the ngModel state.
			controller.$render = renderSelectedItemAsync;
			
			function onDisplayClick(e) {
				isListOpen() ? closeList() : openList();
			}
			
			function onItemClick(e) {
				// When the user selects an option, we have to tell the
				// ngModelController. And, since we are changing the View-Model
				// from within a directive, we have to use $apply() so that
				// AngularJS knows that something has been updated.
				scope.$apply(
					function changeModel() {
						closeList();
						
						var item = angular.element( e.target );
						controller.$setViewValue( getItemValue( item ) );
						// $setViewValue() does not call render explicitly. As
						// such we have to call it explicitly in order to update
						// the content of the menu-root.
						renderSelectedItem();
					}
				);
			}
			
			function onDocumentMouseDown(e) {
				var target = angular.element( e.target );
				
				// NOTE: .closest() requires jQuery.
				if ( isListOpen() && !target.closest( dom.root ).length ) {
					closeList();
				}
			}
			
			function onDestroy() { // clean up the directive when it is destroyed.
				$document.off( 'mousedown', onDocumentMouseDown );
			}
			
			function isListOpen() {
				return( dom.root.hasClass( 'fstpn-ui-dropdown-list-open' ) );
			}
			
			function closeList() {
				dom.root.removeClass( 'fstpn-ui-dropdown-list-open' );
			}
			
			function openList() {
				dom.root.addClass( 'fstpn-ui-dropdown-list-open' );
			}
			
			// I get the value of the given item (as evaluated in the context
			// of the local scope associated with the option element).
			function getItemValue( item ) {
				var accessor = $parse( item.attr( 'value' ) || item.attr( 'x-value' ) || 'null' );
				return( accessor( item.scope() ) );
			}
			
			// I get called implicitly by the ngModelController when the View-
			// Model has been changed by an external factor (ie, not a dropdown
			// directive interaction). When this happens, we have to update the
			// local state to reflect the ngModel state.
			function renderSelectedItemAsync() {
				// Since the options may be rendered by a dynamically-linking
				// directive like ngRepeat or ngIf, we have to give the content
				// a chance to be rendered before we try to find a matching
				// option value.
				// --
				// Since ngModel $watch() bindings are set up in the
				// ngModelController, it means that they are bound before the DOM
				// tree is linked. This means that the ngModel $watch() bindings
				// are bound before the linking phase which puts the ngRepeat and
				// ngIf $watch() bindings at a lower priority, even when on the
				// same Scope instance, which is why we have to render asynchronously,
				// giving ngRepeat and ngIf a chance to react to $watch() callbacks.
				// The more you know!
				scope.$evalAsync( renderSelectedItem );
			}
			
			// I update the dropdown state to reflect the currently selected
			// ngModel value.
			function renderSelectedItem() {
				// Find the FIRST DOM element that matches the selected value.
				var item = findItemWithValue( controller.$viewValue );
				// Remove any current selection.
				dom.list.find( '.fstpn-ui-dropdown-item' ).removeClass( 'fstpn-ui-selected' );
				
				if ( item ) {
					// If we found a matching option, copy the content to the root.
					dom.display.removeClass('fstpn-ui-dropdown-placeholder').find('span').html( item.html() );
					item.addClass( 'fstpn-ui-selected' );
				} else { 
					// If we have no matching option, copy the placeholder to the root.
					dom.display.addClass('fstpn-ui-dropdown-placeholder').find('span').html( placeholder );
				}
			}
			
			// I find rendered option with the given value. This evaluates the
			// [option] attribute in the context of the local scope and then
			// performs a direct object reference comparison.
			function findItemWithValue( value ) {
				// Since the options are dynamic, we have to collection just-in-
				// time with the selection event.
				var items = dom.list.children( '.fstpn-ui-dropdown-item' );
				for ( var i = 0, length = items.length ; i < length ; i++ ) {
					var item = angular.element( items[ i ] );
					if ( getItemValue( item ) === value ) {
						return( item );
					}
				}
				return( null );
			}
		}
	}]).
	directive('pressEnter', function () {
		return function (scope, element, attrs) {
			element.bind("keydown keypress", function (e) {
				if(e.which === 13) {
					scope.$apply(function () {
						scope.$eval(attrs.pressEnter);
					});
					e.preventDefault();
				}
			});
		};
	}).
	directive('pressEsc', function () {
		return function (scope, element, attrs) {
			element.bind("keydown keypress", function (e) {
				if(e.which === 27) {
					scope.$apply(function () {
						scope.$eval(attrs.pressEsc);
					});
					e.preventDefault();
				}
			});
		};
	}).
	directive('builderWorkspace', ['appData', function(appData) {
		return {
			scope: {
				initFunc: '=init'
			},
			priority: 450,
			compile: function() {
				return {
					pre: function(scope, element, attrs) {
						scope.appData = appData;
						scope.initFunc(scope, element, attrs);
					}
				}
			}
		}
	}]).
	directive('emptyToNull', function () {
		return {
			restrict: 'A',
			require: 'ngModel',
			link: function (scope, elem, attrs, ctrl) {
				ctrl.$parsers.push(function(viewValue) {
					if(viewValue === "") {
						return null;
					}
					return viewValue;
				});
			}
		};
	});
	//=========================================================
	// Filters
	//=========================================================
	angular.module('ngFastPanoApp.filters', []).
	filter('fileSize', function() {
		var byteUnits = ['Byte', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
		
		return function(size) {
			if(size == 0)
				return size + ' Byte';
			var i = Math.floor( Math.log(size) / Math.log(1024) );
			return ( size / Math.pow(1024, i) ).toFixed(0) * 1 + ' ' + byteUnits[i];
		}
	});
	//=========================================================
})(window, angular, jQuery);
/*!
  iPanorama 360 - jQuery Virtual Tour
  @name directives.js
  @author Max Lawrence 
  @site http://www.avirtum.com
  @copyright (c) 2016 Max Lawrence (http://www.avirtum.com)
*/
'use strict';


angular.module('ngiPanoramaApp.directives', []).
directive('workspace', ['appData', function(appData) {
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
directive('mainMenuItem', ['appData', function(appData) {
	return {
		scope: {
			id: '@id',
			initFunc: '=init'
		},
		link : function(scope, element, attrs) {
			scope.appData = appData;
			scope.initFunc(scope, element, attrs);
		}
	}
}]).
directive('tabPanelItem', ['appData', function(appData) {
	return {
		scope: {
			id: '@id',
			initFunc: '=init'
		},
		link : function(scope, element, attrs) {
			scope.appData = appData;
			scope.initFunc(scope, element, attrs);
		}
	}
}]).
directive('selectImage', ['appData', function(appData) {
	return {
		scope: {
			id: '@id',
			initFunc: '=init'
		},
		link : function(scope, element, attrs) {
			scope.appData = appData;
			scope.initFunc(scope, element, attrs);
		}
	}
}]).
directive('selectClass', ['appData', function(appData) {
	return {
		scope: {
			initFunc: '=init'
		},
		link : function(scope, element, attrs) {
			scope.appData = appData;
			scope.initFunc(scope, element, attrs);
		}
	}
}]).
directive('dragStart', ['appData', function(appData) {
	return{
		scope:{
			dragStartFunc:'=dragStart',
			dragElement:'=dragElement'
		},
		link: function(scope, element, attrs) {
			scope.appData = appData;
			element.on('dragstart', function(e) {
				scope.dragStartFunc(e, scope, element, attrs);
			});
		}
	}
}]).
directive('dragDrop', ['appData', function(appData){
	return {
		scope: {
			dropFunc:'=dragDrop',
			dragOverFunc:'=dragOver',
			dragLeaveFunc:'=dragLeave',
			dragOverElement:'=dragOverElement'
		},
		link: function(scope, element, attrs) {
			scope.appData = appData;
			element.on('drop', function(e){
				scope.dropFunc(e, scope, element, attrs);
			}).on('dragover', function(e){
				scope.dragOverFunc(e, scope, element, attrs);
			}).on('dragleave', function(e) {
				scope.dragLeaveFunc(e, scope, element, attrs);
			});
		}
	}
}]).
directive('initStorage', ['appData', function (appData) {
	return {
		scope: {},
		link: function (scope, element, attrs) {
			scope.appData = appData;
			setTimeout(function() {
				appData.fn.storage.init(scope);
			}, 0); 
		}
	}
}]).
directive('initUpload', ['appData', function (appData) {
	return {
		scope: {},
		link: function (scope, element, attrs) {
			scope.appData = appData;
			setTimeout(function() {
				appData.fn.upload.init(scope);
			}, 0); 
		}
	}
}]).
directive('fileUpload', ['appData', function (appData) {
	return {
		scope: {
			data: "=data"
		},
		link: function (scope, element, attrs) {
			scope.appData = appData;
			element.on('change', function(e) {
				scope.data = element[0].files[0];
				scope.$root.safeApply();
			});
		}
	}
}]);
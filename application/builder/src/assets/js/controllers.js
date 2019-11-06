/*!
  iPanorama 360 - jQuery Virtual Tour
  @name controllers.js
  @author Max Lawrence
  @site http://www.avirtum.com
  @copyright (c) 2016 Max Lawrence (http://www.avirtum.com)
*/
'use strict';


angular.module('ngiPanoramaApp.controllers', []).
controller('ngiPanoramaAppController', ['$scope', '$compile', '$timeout', '$templateRequest', '$http', 'growl', 'appData', function ($scope, $compile, $timeout, $templateRequest, $http, growl, appData) {
	appData.srv.$compile = $compile;
	appData.srv.$timeout = $timeout;
	appData.srv.$templateRequest = $templateRequest;
	appData.srv.$http = $http;
	appData.srv.growl = growl;
	$scope.appData = appData;
}]);
/*!
  iPanorama 360 - jQuery Virtual Tour
  @name filters.js
  @author Max Lawrence 
  @site http://www.avirtum.com
  @copyright (c) 2016 Max Lawrence (http://www.avirtum.com)
*/
'use strict';


angular.module('ngiPanoramaApp.filters', []).
filter('with', function() {
	return function(items, field) {
		var filtered = {};
		angular.forEach(items, function(value, key) {
			if (value && value.hasOwnProperty(field)) {
				filtered[key] = value;
			}
		});
		return filtered;
	};
}).
filter('isset', function() {
	return function(items, field) {
		var filtered = {};
		angular.forEach(items, function(value, key) {
			if (value && value.hasOwnProperty(field) && value[field]) {
				filtered[key] = value;
			}
		});
		return filtered;
	}
});
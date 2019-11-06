$(document).ready(function($) {
	"use strict";
	
	$("[data-background]").each(function () {
		var href = $(this).data("background");
			if (href) {
				$(this).css("background-image", "url(" + href + ")");
		}
	});
});
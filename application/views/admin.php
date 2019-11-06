<?php defined('BASEPATH') OR exit('No direct script access allowed'); ?>
<!DOCTYPE html>
<html lang="en">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no">
	<meta name="author" content="Max Lawrence">
	<meta name="copyright" content="Avirtum">
	<meta name="description" content="FastPano 360 is the PHP script that lets you create awesome virtual tours for your visitors without advanced programming knowledge">
	<title>FastPano 360 - Virtual Tour Constructor</title>
	
	<!-- scripts -->
	<script src="assets/js/lib/jquery.min.js"></script>
	<script src="assets/js/lib/angular.min.js"></script>
	<script src="assets/js/lib/angular-animate.min.js"></script>
	<script src="assets/js/lib/angular-growl.js"></script>
	<script src="assets/js/lib/ng-file-upload-shim.js"></script>
	<script src="assets/js/lib/ng-file-upload.js"></script>
	<script src="assets/js/lib/ng-sortable.js"></script>
	<script src="assets/js/lib/featherlight.min.js"></script>
	<script src="assets/js/app.min.js"></script>
	<!-- /end scripts -->
	
	<!-- css -->
	<link rel="stylesheet" type="text/css" href="https://fonts.googleapis.com/css?family=Roboto">
	<link rel="stylesheet" type="text/css" href="assets/css/angular-growl.css">
	<link rel="stylesheet" type="text/css" href="assets/css/ng-sortable.css">
	<link rel="stylesheet" type="text/css" href="assets/css/font-awesome.min.css">
	<link rel="stylesheet" type="text/css" href="assets/css/featherlight.min.css">
	<link rel="stylesheet" type="text/css" href="assets/css/style-admin.css">
	<!-- /end css -->
</head>
<body x-ng-app="ngFastPanoApp" x-ng-controller="ngFastPanoAppController" x-ng-init="appData.fn.init(appData);" class="fstpn-ui-admin-body">

<div class="fstpn-ui-page">
	<div class="fstpn-ui-loading" x-ng-class="{'fstpn-ui-active': appData.inprocess > 0}">
		<div class="fstpn-ui-loading-progress">
			<div class="fstpn-ui-loading-color-01"></div>
			<div class="fstpn-ui-loading-color-02"></div>
			<div class="fstpn-ui-loading-color-03"></div>
			<div class="fstpn-ui-loading-color-04"></div>
		</div>
	</div>

	<div class="fstpn-ui-topbar">
		<div class="fstpn-ui-topbar-inner">
			<div class="fstpn-ui-title">FastPano 360 - Virtual Tour Constructor</div>
			<div class="fstpn-ui-toolbar">Hello, <span class="fstpn-ui-username"><?php echo $username; ?></span> | <a href="admin/logout">Logout</a></div>
		</div>
	</div>

	<div class="fstpn-ui-data">
		<div class="fstpn-ui-data-inner">
			<div class="fstpn-ui-block">
				<div class="fstpn-ui-block-header">
					<div class="fstpn-ui-block-menu">
						<div id="fstpn-ui-block-menu-item-virtualtour" class="fstpn-ui-block-menu-item" x-ng-class="{'fstpn-ui-active': appData.mainMenu.virtualtour.isActive}" x-ng-init="appData.fn.mainMenuItemInit(appData, 'virtualtour');">Virtual Tour Manager</div>
						<div id="fstpn-ui-block-menu-item-filemanager" class="fstpn-ui-block-menu-item" x-ng-class="{'fstpn-ui-active': appData.mainMenu.filemanager.isActive}" x-ng-init="appData.fn.mainMenuItemInit(appData, 'filemanager');">File Manager</div>
						<div id="fstpn-ui-block-menu-item-refresh" class="fstpn-ui-block-menu-item fstpn-ui-right" x-ng-click="appData.fn.refreshWorkspace(appData);"><i class="fa fa-fw fa-refresh"></i></div>
					</div>
				</div>
				<div id="fstpn-ui-workspace"></div>
			</div>
		</div>
	</div>
</div>

<!-- additional controls -->
<div class="fstpn-ui-modals">
</div>
<div x-growl>
</div>
<!-- /end additional controls -->
</body>
</html>
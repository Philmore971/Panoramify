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
	
	<!-- css -->
	<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Open+Sans">
	<link rel="stylesheet" type="text/css" href="assets/css/font-awesome.min.css">
	<link rel="stylesheet" type="text/css" href="assets/css/style-admin.css">
	<!-- /end css -->
</head>
<body class="fstpn-ui-admin-body">

<div class="fstpn-ui-page">
	<div class="fstpn-ui-login-wrap">
		<div class="fstpn-ui-login">
			<div class="fstpn-ui-login-header">
				<div class="fstpn-ui-login-title">Login Form</div>
			</div>
			<div class="fstpn-ui-login-data">
				<?php if(validation_errors() != false) { ?>
				<ul class="fstpn-ui-login-errors">
					<?php	echo validation_errors('<li>', '</li>'); ?>
				</ul>
				<?php } ?>
				<?php 
					$attributes = array('class' => 'fstpn-ui-login-form');
					echo form_open('loginverify', $attributes);
				?>
				<label class="fstpn-ui-login-label">Username:</label>
				<input class="fstpn-ui-login-input" name="username" type="text" />
				<label class="fstpn-ui-login-label">Password:</label>
				<input class="fstpn-ui-login-input" name="password" type="password" />
				<input class="fstpn-ui-login-btn" type="submit" value="Sign In" />
				<?php
					echo form_close();
				?>
			</div>
		</div>
	</div>
</div>

</body>
</html>
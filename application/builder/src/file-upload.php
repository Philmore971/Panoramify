<?php 
/*!
  iPanorama 360 - jQuery Virtual Tour
  @name file-upload.js
  @author Max Lawrence 
  @site http://www.avirtum.com
  @copyright (c) 2016 Max Lawrence (http://www.avirtum.com)
*/

//=================================
// for the demo version 
//sleep(3); // sleep for 3 seconds
//$result = array('success' => false, 'msg' => 'In the demo version you can\'t upload files', 'filename' => '');
//echo json_encode($result);
//return;
//=================================


// uploads file in the folder upload
if (isset($_FILES['file']) && $_FILES['file']['error'] == 0) {

	$valid_file = true;
	$directory = 'upload';
	$filename = $_FILES['file']['name'];
	$ext = pathinfo($filename, PATHINFO_EXTENSION);


	if($_FILES['file']['size'] > (5242880)) { //can't be larger than 5 MB
		$valid_file = false;
		$message = 'Your file\'s size is too large.';
	}


	if ($valid_file) {
		$allowed = array('gif', 'png', 'jpg', 'jpeg');
		if( !in_array($ext, $allowed) ) {
			$valid_file = false;
			$message = 'Your file\'s ext is not allowed.';
		} else if( preg_match('/^[\w,\s-]+\.[A-Za-z]{5}$/', $filename) ) {
			$valid_file = false;
			$message = 'Your filename is not allowed.';
		}
	}


	if ($valid_file) {
		move_uploaded_file($_FILES['file']['tmp_name'], $directory . '/' . $filename);
		$message = 'File uploaded: ' . $filename;
	}
	
	$result = array('success' => $valid_file, 'msg' => '', 'filename' => '');

	// give callback to the angular code with the image src name and the status
	echo json_encode($result);
} else {
	$message = 'Unknown upload error';
	
	if(isset($_FILES['file'])) {
		$code = $_FILES['file']['error'];
		switch ($code) { 
			case UPLOAD_ERR_INI_SIZE: $message = "The uploaded file exceeds the upload_max_filesize directive in php.ini"; break; 
			case UPLOAD_ERR_FORM_SIZE: $message = "The uploaded file exceeds the MAX_FILE_SIZE directive that was specified in the HTML form"; break; 
			case UPLOAD_ERR_PARTIAL: $message = "The uploaded file was only partially uploaded"; break; 
			case UPLOAD_ERR_NO_FILE: $message = "No file was uploaded"; break; 
			case UPLOAD_ERR_NO_TMP_DIR: $message = "Missing a temporary folder"; break; 
			case UPLOAD_ERR_CANT_WRITE: $message = "Failed to write file to disk"; break; 
			case UPLOAD_ERR_EXTENSION: $message = "File upload stopped by extension"; break; 
			default: $message = "Unknown upload error"; break; 
		} 
	}
	
	$result = array('success' => false, 'msg' => $message, 'filename' => '');
	
	// give callback to the angular code with the image src name and the status
	echo json_encode($result);
}

?>
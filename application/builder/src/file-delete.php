<?php 
/*!
  iPanorama 360 - jQuery Virtual Tour
  @name file-delete.js
  @author Max Lawrence 
  @site http://www.avirtum.com
  @copyright (c) 2016 Max Lawrence (http://www.avirtum.com)
*/

//=================================
// for the demo version 
//$result = array('success' => false, 'msg' => 'In the demo version you can\'t delete files', 'filename' => '');
//echo json_encode($result);
//return;
//=================================


if (isset($_POST['filename'])) {
	$status = false;
	$directory = 'upload';	
	$filename = htmlentities($_POST['filename']);
	$fullfilename = $directory . '/' . $filename;

	if ( file_exists($fullfilename) ) {
		if ( unlink($fullfilename) ) {
			$status = true;
		}
	}

	if($status) {
		$message = 'File deleted: ' . $filename;
	} else {
		$message = 'Can\'t delete the file.';
	}
	
	
	$result = array('success' => $status, 'msg' => $message, 'filename' => $filename);
	
	// give callback to the angular code with the status
	echo json_encode($result);
} else {
	$result = array('success' => false, 'msg' => 'Unknown delete error', 'filename' => '');
	
	// give callback to the angular code with the status
	echo json_encode($result);
}

?>
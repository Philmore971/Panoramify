<?php
defined('BASEPATH') OR exit('No direct script access allowed');

abstract class Request {
	public static function getQuery($param = null, $default = null) {
		if ($param) {
			return isset($_GET[$param]) ? $_GET[$param] : $default;
		}
		return $_GET;
	}
	public static function getPost($param = null, $default = null) {
		if ($param) {
			return isset($_POST[$param]) ? $_POST[$param] : $default;
		}
		return $_POST;
	}
	public static function getFile($param = null, $default = null) {
		if ($param) {
			return isset($_FILES[$param]) ? $_FILES[$param] : $default;
		}
		return $_FILES;
	}
	public static function getPostContent() {
		$rawData = file_get_contents('php://input');
		return json_decode($rawData);
	}
	public static function getApiParam($param) {
		$oData = static::getPostContent();
		return isset($oData->$param) ? $oData->$param : null;
	}
	public static function getApiOrQueryParam($param) {
		return Request::getApiParam($param) ? Request::getApiParam($param) : Request::getQuery($param);
	}
}

class VirtualTourManager extends CI_Controller {
	/**
	 * Index Page for this controller.
	 *
	 * Maps to the following URL
	 * 		http://example.com/index.php/welcome
	 *	- or -
	 * 		http://example.com/index.php/welcome/index
	 *	- or -
	 * Since this controller is set as the default controller in
	 * config/routes.php, it's displayed at http://example.com/
	 *
	 * So any other public methods not prefixed with an underscore will
	 * map to /index.php/welcome/<method_name>
	 * @see https://codeigniter.com/user_guide/general/urls.html
	 */
	public function index() {
		if(!$this->session->userdata('logged_in')) {
			redirect('login', 'refresh');
			return;
		}
		
		if (Request::getApiParam('action') === 'list') {
			$page = Request::getApiParam('page');
			$order = Request::getApiParam('order');
			$itemsPerPage = Request::getApiParam('itemsPerPage');
			
			$this->config->load('myconfig');
			$dir = $this->config->item('myconfig_virtualtour_path');
			$link = base_url() . 'panorama';
			
			$files = array();
			if(file_exists( $dir )) {
				foreach(scandir($dir) as $f) {
					if(!$f || $f[0] == '.') {
						continue;
					}
					
					
					if(is_dir($dir . '/' . $f)) {
						continue;
					}
					
					
					$json = file_get_contents($dir . '/' . $f);
					$json_data = json_decode($json, true);
					
					if( $json_data == null || !array_key_exists('type', $json_data) || $json_data['type'] != 'VirtualTour' ) {
						continue;
					}
					
					// output
					$title = null;
					$scenes= 0;
					if( array_key_exists('title', $json_data) ) {
						$title = $json_data['title'];
					}
					
					if( array_key_exists('scenes', $json_data) ) {
						$scenes = $json_data['scenes'];
						$scenes = sizeof($scenes);
					}
					
					$files[] = array(
						'id' => basename($f, '.json'),
						'name' => $f,
						'title' => $title,
						'scenes' => $scenes,
						'type' => 'file',
						'size' => filesize($dir . '/' . $f),
						'created_at' => date('Y-m-d h:i:s',filectime($dir . '/' . $f)),
						'updated_at' => date('Y-m-d h:i:s',filemtime($dir . '/' . $f)),
						'link' => $link
					);
				}
			}
			$items = $files;
			
			//================================================
			// reorder
			function cmpTitleAsc($a, $b) {
				return strcmp($a['title'], $b['title']);
			}
			
			function cmpTitleDesc($a, $b) {
				return !strcmp($a['title'], $b['title']);
			}
			
			function cmpCreatedAsc($a, $b) {
				return $a['created_at'] > $b['created_at'];
			}
			
			function cmpCreatedDesc($a, $b) {
				return $a['created_at'] < $b['created_at'];
			}
			
			function cmpUpdatedAsc($a, $b) {
				return $a['updated_at'] > $b['updated_at'];
			}
			
			function cmpUpdatedDesc($a, $b) {
				return $a['updated_at'] < $b['updated_at'];
			}
			
			if($order === 'title_asc') {
				usort($items, 'cmpTitleAsc');
			} else if($order === 'title_desc') {
				usort($items, 'cmpTitleDesc');
			} else if($order === 'created_asc') {
				usort($items, 'cmpCreatedAsc');
			} else if($order === 'created_desc') {
				usort($items, 'cmpCreatedDesc');
			} else if($order === 'updated_asc') {
				usort($items, 'cmpUpdatedAsc');
			} else if($order === 'updated_desc') {
				usort($items, 'cmpUpdatedDesc');
			}
			//================================================
			
			// generate items for current page
			$itemsTotal = count($items);
			if($itemsTotal > 0) {
				$pages = ceil($itemsTotal / $itemsPerPage) - 1;
				
				if($page > $pages) {
					$page = $pages;
				} else if($page < 0) {
					$page = 0;
				}
				
				$items = array_slice($items, $itemsPerPage * $page, $itemsPerPage);
			}
			
			$data['items'] = $items;
			$data['total'] = $itemsTotal;
			$data['page'] = $page;
			$data['itemsPerPage'] = $itemsPerPage;
			
			echo json_encode($data);
			return;
		}
		
		if (Request::getApiParam('action') === 'rename') {
			$oldTitle = Request::getApiParam('oldtitle');
			$newTitle = Request::getApiParam('newtitle');
			$name = Request::getApiParam('name');
			
			$this->config->load('myconfig');
			$dir = $this->config->item('myconfig_virtualtour_path');
			
			$data['result'] = false;
			$data['title'] = $oldTitle;
			
			$f = $name;
			$json = file_get_contents($dir . '/' . $f);
			$json_data = json_decode($json, true);
			
			if( $json_data != null && array_key_exists('type', $json_data) && $json_data['type'] == 'VirtualTour' ) {
				$json_data['title'] = $newTitle;
				$json = json_encode($json_data);
				
				if(file_put_contents($dir . '/' . $f, $json)) {
					$data['result'] = true;
					$data['title'] = $newTitle;
				} else {
					$data['error'] = 'Error. Can\'t rename, unknown error listing';
				}
			} else {
				$data['error'] = 'Error. Can\'t rename because the format is incorrect';
			}
			
			echo json_encode($data);
			return;
		}
		
		if (Request::getApiParam('action') === 'delete') {
			$items = Request::getApiParam('items');
			
			$this->config->load('myconfig');
			$dir = $this->config->item('myconfig_virtualtour_path');
			
			
			$data['error'] = '';
			
			$processed = array();
			$unprocessed = array();
			foreach ($items as $item) {
				$dir_or_file = $dir . '/' . $item->name;
				
				if (!is_dir($dir_or_file) && file_exists($dir_or_file)) {
					if(is_writable($dir_or_file)) {
						if(unlink($dir_or_file)) {
							$processed[] = $item->id;
						} else {
							$unprocessed[] = $item->id;
							$data['error'] .= 'Error. Can\'t delete the file \'' . $item->name . '\', unknown error listing' . PHP_EOL;
						}
					} else {
						$unprocessed[] = $item->id;
						$data['error'] .= 'Error. Can\'t delete the file \'' . $item->name . '\' because access is denied' . PHP_EOL;
					}
				} else {
					$unprocessed[] = $item->id;
					$data['error'] .= 'Error. Can\'t delete the file \'' . $item->name . '\' because it doesn\'t exist' . PHP_EOL;
				}
			}
			
			$data['processed'] = $processed;
			$data['unprocessed'] = $unprocessed;
			
			
			echo json_encode($data);
			return;
		}
		
		if (Request::getApiParam('action') === 'get') {
			$name = Request::getApiParam('name');
			
			$this->config->load('myconfig');
			$dir = $this->config->item('myconfig_virtualtour_path');
			
			$f = $name;
			
			$data['result'] = false;
			if(file_exists($dir . '/' . $f)) {
				$json = file_get_contents($dir . '/' . $f);
				$json_data = json_decode($json, true);
					
				if( $json_data != null && array_key_exists('type', $json_data) && $json_data['type'] == 'VirtualTour' ) {
					$data['result'] = true;
					$data['config'] = $json_data;
				} else {
					$data['error'] = 'Error. Can\'t get the data because the format is incorrect';
				}
			} else {
				$data['error'] = 'Error. Can\'t get the data because the file doesn\'t exists';
			}
			
			echo json_encode($data);
			return;
		}
		
		if (Request::getApiParam('action') === 'update') {
			$config = Request::getApiParam('config');
			$name = Request::getApiParam('name');
			
			$this->config->load('myconfig');
			$dir = $this->config->item('myconfig_virtualtour_path');
			
			$f = $name;
			if($f == null || !file_exists($dir . '/' . $f) ) {
				$f = $this->getRandomFileName($dir, 'json') . '.json';
				$name = $f;
			}
			
			$data['result'] = false;
			
			$json = json_encode($config);
			if(file_put_contents($dir . '/' . $f, $json)) {
				$data['result'] = true;
				$data['name'] = $name;
			} else {
				$data['error'] = 'Error. Can\'t update, unknown error listing';
			}
			
			echo json_encode($data);
			return;
		}
	}
	
	private static function getRandomFileName($path, $extension = '') {
		$extension = $extension ? '.' . $extension : '';
		$path = $path ? $path . '/' : '';
		
		do {
			$name = substr(md5(microtime() . rand(0, 9999)), 0, 16);
			$file = $path . $name . $extension;
		} While (file_exists($file));
		
		return $name;
	}
}
?>
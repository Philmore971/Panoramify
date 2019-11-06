<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Panorama extends CI_Controller {
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
	public function index($id) {
		if(!preg_match('/^[a-zA-Z0-9]{16}$/', $id)) {
			show_404();
			return;
		}
		
		$data = $this->getConfigData($id);
		if($data) {
			$this->config->load('myconfig');
			$dir = $this->config->item('myconfig_upload_path');
			$data['uploadUrl'] = base_url() . $dir . '/';
			
			$this->load->view('panorama', $data);
		} else {
			show_404();
		}
	}
	
	private function getConfigData($id) {
		$this->config->load('myconfig');
		$dir = $this->config->item('myconfig_virtualtour_path');
		$f = $id . '.json';
		
		if(file_exists($dir . '/' . $f)) {
			$json = file_get_contents($dir . '/' . $f);
			$json_data = json_decode($json, true);
			
			if( $json_data != null && array_key_exists('type', $json_data) && $json_data['type'] == 'VirtualTour' ) {
				return $json_data;
			} else {
				return null;
			}
		} 
		return null;
	}
}
?>
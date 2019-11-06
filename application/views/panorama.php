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
	<link rel="stylesheet" type="text/css" href="<?php echo base_url() . 'assets/css/font-awesome.min.css'; ?>">
	<link rel="stylesheet" type="text/css" href="<?php echo base_url() . 'assets/css/style.css'; ?>">
	<link rel="stylesheet" type="text/css" href="<?php echo base_url() . 'lib/tooltipster/css/tooltipster.bundle.min.css'; ?>">
	<link rel="stylesheet" type="text/css" href="<?php echo base_url() . 'lib/tooltipster/css/plugins/tooltipster/sidetip/themes/tooltipster-sidetip-borderless.min.css'; ?>">
	<link rel="stylesheet" type="text/css" href="<?php echo base_url() . 'lib/lightslider/lightslider.css'; ?>">
	<link rel="stylesheet" type="text/css" href="<?php echo base_url() . 'lib/jssocials/jssocials.css'; ?>">
	<link rel="stylesheet" type="text/css" href="<?php echo base_url() . 'lib/jssocials/jssocials-theme-plain-color.css'; ?>">
	<link rel="stylesheet" type="text/css" href="<?php echo base_url() . 'lib/ipanorama/ipanorama.css'; ?>">
	<link rel="stylesheet" type="text/css" href="<?php echo base_url() . 'lib/ipanorama/ipanorama.theme.fastpano.css'; ?>">
	<!-- /end css -->
</head>
<body>
	<div class="fstpn-ui-page">
		<div class="fstpn-ui-panorama-wrap">
			<div class="fstpn-ui-panorama" id="panorama">
			</div>
			<?php if(sizeOf($scenes) > 1) { ?>
				<div id="panorama-slider-wrap" class="fstpn-ui-panorama-slider-wrap fstpn-ui-hidden">
					<div class="fstpn-ui-panorama-slider-toggle fstpn-ui-hidden"></div>
					<ul id="panorama-slider" class="fstpn-ui-panorama-slider">
						<?php foreach($scenes as $key => $scene) { ?>
							<?php $imageThumb = ($scene['imageThumb']['url'] ? $scene['imageThumb'] : $scene['image']); ?>
							<li>
								<div class="fstpn-ui-panorama-slider-thumb" data-scene="<?php echo 'scene' . $key; ?>" <?php echo 'scene' . $key; ?> <?php echo ($scene['title'] ? 'title="' . $scene['title'] . '"' : '') ?>>
									<img src="<?php echo ($imageThumb['isCustom'] ? $imageThumb['url'] : $uploadUrl . $imageThumb['url']); ?>" alt="">
								</div>
							</li>
						<?php } ?>
					</ul>
				</div>
			<?php } ?>
			<div id="panorama-share-wrap" class="fstpn-ui-panorama-share-wrap">
				<div id="panorama-share" class="fstpn-ui-panorama-share">
				</div>
				<div id="panorama-embed" class="jssocials-share jssocials-share-embed">
					<a href="#" class="jssocials-share-link">
						<i class="fa fa-code jssocials-share-logo"></i>
						<span class="jssocials-share-label">Embed</span>
					</a>
				</div>
				<br/>
				<input id="panorama-embed-code" class="fstpn-ui-panorama-embed-code" value="<iframe width='560' height='315' src='<?php echo current_url() ?>' allowfullscreen frameborder='0' scrolling='no'></iframe>">
			</div>
		</div>
	</div>
	
	<!-- scripts -->
	<script src="<?php echo base_url() . 'assets/js/lib/jquery.min.js'; ?>"></script>
	<script src="<?php echo base_url() . 'assets/js/view.js'; ?>"></script>
	<!-- libraries -->
	<script src="<?php echo base_url() . 'lib/tooltipster/js/tooltipster.bundle.min.js'; ?>"></script>
	<script src="<?php echo base_url() . 'lib/lightslider/lightslider.min.js'; ?>"></script>
	<script src="<?php echo base_url() . 'lib/jssocials/jssocials.min.js'; ?>"></script>
	<script src="<?php echo base_url() . 'lib/ipanorama/three.min.js'; ?>"></script>
	<script src="<?php echo base_url() . 'lib/ipanorama/jquery.ipanorama.min.js'; ?>"></script>
	<!-- /end scripts -->
	
	<!-- panorama script -->
	<script type="text/javascript">
		jQuery( document ).ready(function( jQuery ) {
			jQuery('#panorama').ipanorama({
				theme: 'ipnrm-theme-fastpano',
				autoLoad: true,
				autoRotate: true,
				autoRotateSpeed: 0.001,
				showZoomCtrl: true,
				showShareCtrl: true,
				showAutoRotateCtrl: true,
				pitchLimits: false,
				sceneId: 'scene0',
				scenes: {
					<?php foreach($scenes as $key => $scene) { ?>
						<?php echo 'scene' . $key; ?> : {
							type  : 'sphere',
							image : '<?php echo ($scene['image']['isCustom'] ? $scene['image']['url'] : $uploadUrl . $scene['image']['url']); ?>',
							title : '<?php echo ($scene['title']); ?>',
							yaw   : <?php echo ($scene['yaw'] !== null ? $scene['yaw'] : 0); ?>,
							pitch : <?php echo ($scene['pitch'] !== null ? $scene['pitch'] : 0); ?>,
							zoom  : <?php echo ($scene['zoom'] !== null && $scene['zoom'] >= 0 && $scene['zoom'] <= 75 ? $scene['zoom'] : 75); ?>
						},
					<?php } ?>
				},
				onSceneChange: function(oldSceneId, newSceneId) {
					jQuery('.fstpn-ui-panorama-slider-thumb').removeClass('fstpn-ui-active');
					jQuery('.fstpn-ui-panorama-slider-thumb[data-scene="' + newSceneId + '"]').addClass('fstpn-ui-active');
				},
				onShare: function(e) {
					jQuery("#panorama-share-wrap").toggleClass('fstpn-ui-active');
				}
			});
			
			// attach the slider otherwise the fullscreen mode doesn't have the slider
			var $el = jQuery('#panorama-slider-wrap').detach();
			jQuery('#panorama .ipnrm-controls').append($el);
			
			// slider initialization
			jQuery('#panorama-slider').lightSlider({
				autoWidth:true,
				loop:false,
				pager:false,
				gallery:true,
				onSliderLoad: function() {
					jQuery('.fstpn-ui-panorama-slider-wrap').removeClass('fstpn-ui-hidden');
					jQuery('.fstpn-ui-panorama-slider-toggle').removeClass('fstpn-ui-hidden');
				}
			});
			
			// slider button off/on
			jQuery('.fstpn-ui-panorama-slider-toggle').on('click', function() {
				var $sliderWrap = jQuery('.fstpn-ui-panorama-slider-wrap');
				$sliderWrap.toggleClass('fstpn-ui-hidden');
			});
			
			// slider thumb click event
			jQuery('.fstpn-ui-panorama-slider-thumb').on('click', function() {
				var sceneId = jQuery(this).data("scene");
				if (sceneId) {
					jQuery('#panorama').ipanorama("loadscene", {sceneId: sceneId});
				}
			});
			
			// tooltip initialization
			jQuery('.fstpn-ui-panorama-slider-thumb').tooltipster({
				parent: '#panorama .ipnrm-controls',
				theme: 'tooltipster-borderless',
				animation: 'grow'
			});
			
			// social share initialization
			var $el = jQuery('#panorama-share-wrap').detach();
			jQuery('#panorama .ipnrm-controls').append($el);
			
			$("#panorama-share").jsSocials({
				text: 'FastPano 360 is the PHP script that lets you create awesome virtual tours.',
				showLabel:true,
				showCount:true,
				shareIn:'popup',
				shares: ['email', 'twitter', 'facebook', 'googleplus', 'stumbleupon']
			});
			
			var $el = $("#panorama-embed").detach();
			$el.on("click", function() {
				$("#panorama-embed-code").toggleClass("fstpn-ui-active");
			});
			$("#panorama-share .jssocials-shares").append($el);
		});
	</script>
	<!-- /end custom script -->
</body>
</html>
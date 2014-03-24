/* function call for carousel
 *
 * ARGUMENT LIST
 *
 * pause: /* what effect to pause carousel on */ ['hover', false] - default: 'hover'
 * effect: /* the slide effect */ ['fade', 'slide'] - default: 'fade'
 * orientation /* the slide orientation if the effect is 'slide' */ ['vertical', 'orientation'] - default: orientation
 * animate_timer /* animation duration in milliseconds */ - default: 2000
 * animate_timing_function /* standard css3 timing functions to use for the animation if the browser supports it */ ['ease', 'linear', 'ease-in', 'ease-in-out'] - default: 'ease'
 * slide_view_time /* time that slide stays after the animation is completed (effective viewing time) */ - default: 2000
 * reverse /* direction of slide, if fade just reverse the order if true, if slide[vertical] slides go from down to up if true, if slide[horizontal] slides go from right to left if true */ - default: false
 * ratio /* the aspect ratio of the images - needed for slide[vertical] to keep the carousel the correct dimensions */ - default: 56.25 (16:9)
 */

new nxnw.carousel($('selector'), {
	arguments
});



/*
 * CAROUSEL HTML SKELETON
 */

<div class="carousel" id="carousel_selector">
	<div class="carousel-outer">
		<div class="carousel-inner">
			<div class="item active">
				<!-- slide content here -->
			</div>
			<div class="item">
				<!-- slide content here -->
			</div>
		</div> <!-- \.carousel-inner -->
	</div> <!-- \.carousel-outer -->
	<!-- optional prev/next controls, simply remove them if not needed -->
	<a class="left carousel-control" href="#test" data-slide="_prev">‹</a>
	<a class="right carousel-control" href="#test" data-slide="_next">›</a>
	<!-- slide anchors, simply remove them if not needed -->
	<!-- if using anchors need 1 for each item with the corresponding index as its data-pos -->
	<div class="anchors">
		<a href="#" data-pos="0"></a><a href="#" data-pos="1">1</a>
	</div> <!-- \.anchors -->
</div> <!-- \.carousel -->
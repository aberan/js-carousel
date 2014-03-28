Javascript class to handle carousel functionality.

HTML skeleton is available via this [Gist](https://gist.github.com/aberan/9818717).

### Initialization
```javascript
new nxnw.Carousel( args, options );
```

**args** and **options** are expected to be objects

### Arguments
Argument | Explanation
----------- | -----------
el          | jquery DOM object i.e. $('.foo')
selector    | string used for el i.e. '.foo'
callback    | callback function that gets called when a fold's animation completes
post        | callback function that gets called when the carousel initialization finishes


### Options
Option | Default | Explanation
--------------------- | ------------ | ------------------------------------------------------------------------------- |
auto                  | true         | whether carousel starts automatically or not                                    |
$anchors              | false        | anchors used to toggle slides. jQuery object                                    |
$controls             | false        | prev/next controls. jQuery object                                               |
pause                 | 'hover'      | event to pause carousel. False if not pausable                                  |
effect                | 'fade'       | slide transition. 'fade' or 'slide'                                             |
orientation           | 'horizontal' | slide direction. Only applicable for 'slide' effect. 'horizontal' or 'vertical' |
animateTimer          | 2000         | animation duration in ms                                                        |
animateTimingFunction | 'ease'       | CSS3 timing function 'ease', 'linear', 'ease-in', 'ease-out', 'ease-in-out'     |
slideViewTime         | 2000         | duration slide remains in place in ms                                           |
reverse               | false        | flag to reverse slide direction                                                 |
ratio                 | 56.25        | if necessary set for IE < 10 that need flexible box that maintains aspect ratio |

### Usage
```javascript
//additional variable you want to keep track of
var foo = {
	a: 1,
	b: 2
};

//object containing various callback functions to pass to the carousel
var functions = ( function( foo ) {
	return {
		callback: function() {
			//do stuff here after carousel fold finishes animating
		},

		post: function() {
			//do stuff here after carousel initializes
		}
	};
})( foo ); //functions

//object containing the arguments for the carousel
var args = {
	el: $('#carousel'),
	selector: '.carousel',
	callback: functions.callback,
	post: functions.post
};

//object containing any options that should be set
var options = {
	effect: 'slide',
	orientation: 'vertical',
	animateTimer: 500,
	slideViewTime: 5000,
	animateTimingFunction: 'ease-in',
	reverse: false,
	$anchors: $('.anchors button'),
	$controls: $('.carousel-control')
};

new nxnw.Carousel( args, options );
```



/*
 * DEPENDENCIES - Modernizr, jquery, transition.end, smartresize
 */

var nxnw = nxnw || {};

define(function(require){
  var jQuery = require('jquery');

  // first we set up our constructor function
  function carousel(el, args, options) {
    //set object options
    this.options = $.extend({}, this.defaults, options);
    //set object properties
    this.el = el;
    this.$el = $(el);
    this.sliding = false;
    this._complete = args.hasOwnProperty('complete') ? args.complete : false;

    //remove hidden class from elements now that everything has been loaded
    this.$el.find('.item.hidden').removeClass('hidden');

    //set carousel classes if needed for other slide effects
    this.$el.addClass(this.options.effect);
    /* override orientation if effect is fade because vertical orientation absolutely positions the slides which messes up the fade effect */
    if(this.options.effect == 'fade') {
      this.options.orientation = 'horizontal';
    }
    this.$el.addClass(this.options.orientation);
    //set transition/transforms3d flags
    this.transitions = Modernizr.csstransitions;
    this.transforms3d = Modernizr.csstransforms3d;

    //add inline css for transition
    var css_timer = this.options.animate_timer > 0 ? this.options.animate_timer / 1000 : 0;
    this.animate_effect = this.options.effect == 'fade' ? 'opacity' : 'transform';
    //make sure browser supports transforms3d
    if(!this.transforms3d) {
      this.animate_effect = this.options.orientation == 'vertical' ? 'bottom' : 'left';
    }

    var css = '';
    var non_transition_css = '';

    if(this.animate_effect !== 'transform') {
      css = '-webkit-transition: '+css_timer+'s '+this.options.animate_timing_function+' '+this.animate_effect+';' +
                'transition: '+css_timer+'s '+this.options.animate_timing_function+' '+this.animate_effect+';';
    }
    else {
      css = '-webkit-transition: '+css_timer+'s '+this.options.animate_timing_function+' '+'-webkit-'+this.animate_effect+';' +
      'transition: '+css_timer+'s '+this.options.animate_timing_function+' '+'-webkit-'+this.animate_effect+';' +
      'transition: '+css_timer+'s '+this.options.animate_timing_function+' '+this.animate_effect+';';
    }

    //add css to set carousel height correctly for non-transition browsers if carousel is vertical slide
    if(this.options.effect == 'slide' && this.options.orientation == 'vertical' && !this.transitions) {
      non_transition_css = '.slide.vertical .carousel-inner { height: 0; padding-bottom: '+this.options.ratio+'%;}';
    }

    var inline_css = '<style>' +
    this.el + ' .item {' +
    css +
    '}' +
    non_transition_css +
    '</style>';
    $('head').append(inline_css);

    //set interval
    this.slide_interval = this.options.slide_view_time;

    //set effects property for non transition supporting browsers
    if(!this.transitions){
      this.animate_value = {
        on: this.options.effect == 'slide' ? '0%' : 1,
        left: this.options.effect == 'slide' ? '-100%' : 0,
        right: this.options.effect == 'slide' ? '100%' : 0
      };

      //init slides css
      this._no_transition_css(this.options.effect);
    }
    if(this.options.slide) {
      this._slide(this.options.slide);
    }
    if(this.options.pause == 'hover') {
      this.$el.on('mouseenter',
        $.proxy( function() {
          this._pause();
        }, this))
      .on('mouseleave',
        $.proxy( function() {
          this._cycle();
        }, this));
    }

    //test for controls and anchors
    this.controls = this.$el.find('.carousel-control').length;
    //this.anchors = this.options.$anchors ? this.options.$anchors.length : this.$el.find('.anchors').length;

    //add EH for prev/next controls
    if( this.options.$controls ){
      this.options.$controls.on('click.carousel', $.proxy( function (e) {
        e.preventDefault();
        var $callee = $(e.currentTarget);
        this[$callee.data('slide')]();
      }, this));
    }

    //EH for anchors
    if( this.options.$anchors ){
      //this.$anchors = this.options.$anchors || this.$el.find('.anchors a');
      //set initial anchor state
      this._update_anchors(0);
      this.options.$anchors.on('click.carousel', $.proxy( function (e) {
        e.preventDefault();
        if(this.sliding){
          return;
        }
        var $callee = $(e.currentTarget);
        var pos = $callee.data('pos');
        this._to(pos);
      }, this));
    }

    //fire init function if carousel set to auto slide
    if ( this.options.auto ) {
      this._init();
    }
  } /* \constructor */

  carousel.prototype = {
    // now we define the prototype for slideShow
    defaults: {
      auto: true,
      $anchors: false,
      $controls: false,
      pause: 'hover',
      effect: 'fade', /* fade, slide */
      orientation: 'horizontal', /* horizontal, vertical (only applicable for slide) */
      animate_timer: 2000, /* animation duration in milliseconds */
      animate_timing_function: 'ease', /* standard css3 timing fucnctions (ease, linear, ease-in, ease-in-out) */
      slide_view_time: 2000, /* time that slide lingers */
      reverse: false, /* direction of slide */
      ratio: 56.25 /* for non-transition supporting browsers, slides use absolute position so we need to set height of carousel using slides height/weight ratio  - default 16:9 */
    }, /* \defaults */

    _cycle: function (e) {
      if (!e) {
        this.paused = false;
      }
      if(this.slide_interval && !this.paused) {

        var self = this;
        this.interval = setTimeout(function() {
          requestAnimFrame(
            $.proxy(
              function() {
                this._next();
              },
              self)
            ); // \requestAnimFrame
        }, self.slide_interval);
      }

      return this;
    }, /* \carousel._cycle */

    _to: function (pos) {
      var $active = this.$el.find('.item.active'), children = $active.parent().children(), activePos = children.index($active), that = this;

      if (pos > (children.length - 1) || pos < 0) {
        return;
      }

      if (this.sliding) {
        return this.$el.one('slid', function () {
          that._to(pos);
        });
      }

      if (activePos == pos) {
        return this._pause()._cycle();
      }
      if(this.options.$anchors) {
        this._update_anchors(pos, activePos);
      }

      return this._slide(pos > activePos ? 'next' : 'prev', $(children[pos]));
    }, /* \carousel._to */

    _pause: function (e) {
      if (!e) {
        this.paused = true;
      }
      clearInterval(this.interval);
      this.interval = null;
      return this;
    }, /* \carousel._pause */

    _stop : function($active, $next, type, direction) {
      this.paused = true;
      this.sliding = false;
      clearInterval(this.interval);
      this.interval = null;
      //remove classes to cleanly pause the carousel so it can start again correctly
      $active.removeClass(direction);
      $next.removeClass( [type, direction].join(' ') );
    }, // \_stop

    _next: function () {
      if (this.sliding) {
        return;
      }
      return !this.options.reverse ? this._slide('next') : this._slide('prev');
    }, /* \carousel._next */

    _prev: function () {
      if (this.sliding) {
        return;
      }

      return !this.options.reverse ? this._slide('prev') : this._slide('next');
    }, /* \carousel._prev */

    _slide: function (type, next) {
      var $active = this.$el.find('.item.active'), $next = next || $active[type](), isCycling = this.interval, direction = type == 'next' ? 'left' : 'right', fallback  = type == 'next' ? 'first' : 'last', that = this, e = $.Event('_slide', { relatedTarget: $next[0] });

      this.sliding = true;

      if(isCycling) {
        this._pause();
      }

      $next = $next.length ? $next : this.$el.find('.item')[fallback]();

      if ($next.hasClass('active')) {
        return;
      }

      this.$el.trigger(e);
      if (e.isDefaultPrevented()) {
        return;
      }
      $next.addClass(type);


      if (!this.transitions && this.options.effect == 'slide') {
        var value = direction == 'left' ? '100%' : '-100%';
        $next.css(this.animate_effect, value);
      }

      var ow = $next[0].offsetWidth; // force reflow
      $active.addClass(direction);
      $next.addClass(direction);

      if (this.transitions) {
        // if carousel isnt visible, stop and reset slide classes
        if ( !this.$el.is(':visible') ) {
          this._stop($active, $next, type, direction);
          return;
        }
        else {
          this.$el.one($.support.transition.end, function () {
            that._update_slides($next, $active, direction, type);
          });
        }
      }
      else {
        var handle_animation = '_animate_'+this.options.effect;
        this[handle_animation]($next, $active, direction, type);
      }

      //get active and next indexes
      if(this.options.$anchors) {
        var children = $active.parent().children(), from = children.index($active), to = children.index($next);
        this._update_anchors(to, from);
      }

      //testing moving cycle and return to update slides

      /*if(isCycling) {
        this._cycle();
      }

      return this;*/
    }, /* \carousel._slide */

    _animate_fade: function($next, $active, direction, type) {
      $active.fadeOut(this.options.animate_timer, function() {});
      $next.fadeIn(this.options.animate_timer, $.proxy(function(){
          this._update_slides($next, $active, direction, type);
        }, this)
      );


    }, /* \_animate_fade */

    _animate_slide: function($next, $active, direction, type) {
      var animate_off = {};
      var animate_on = {};
      animate_on[this.animate_effect] = this.animate_value.on;
      animate_off[this.animate_effect] = direction == 'left' ? this.animate_value.left : this.animate_value.right;

      $active.animate(
        animate_off,
      {
        duration: this.options.animate_timer,
        queue: false
      }); // \$active.animate

      $next.animate(
        animate_on,
      {
        duration: this.options.animate_timer,
        queue: false,
        complete: $.proxy(function(){
          this._update_slides($next, $active, direction, type);
        }, this)
      }); // \$next.active
    }, /* \_animate_slide */

    _update_slides: function($next, $active, direction, type) {
      var that = this;
      $next.removeClass([type, direction].join(' ')).addClass('active');
      $active.removeClass(['active', direction].join(' '));
      this.sliding = false;
      //does this do anything??
      setTimeout(function () {
        that.$el.trigger('slid');
      }, 0);

      //call complete function if set
      if ( this._complete ) {
        this._complete();
      }

      //testing cycle here
      if ( this.options.auto ) {
        this._cycle();
      }
    }, /* \_update_slides */

    //define plugin functions below
    _init: function () {
      //start initial slide after view_time, then move to _cycle
      var self = this;
      self.paused = false;
      self.interval = setTimeout(function() {
        requestAnimFrame(
          $.proxy(
            function() {
              if( !this.options.reverse) {
                this._slide('next');
              }
              else {
                this._slide('prev');
              }
            },
            self)
          ); // \requestAnimFrame
      }, self.options.slide_view_time);
    }, /* \carousel._init */

    _no_transition_css: function(slide_effect) {
      var slides = this.$el.find('.item');
      $.each(slides, function() {
        if(slide_effect == 'fade') {
          var $this = $(this);
          if($this.hasClass('active')) {
            $this.css({'opacity': 1, 'display': 'block'});
          }
          else {
            $this.css({'opacity': 1, 'display': 'none'});
          }
        }
      });
    }, /* \_no_transition_css */

    _update_anchors: function(to, from){
      if( from !== false && typeof from !== 'undefined' ) {
        //$(this.$anchors[from]).removeClass('active');
        $(this.options.$anchors[from]).removeClass('active');
      }
      $(this.options.$anchors[to]).addClass('active');
      //$(this.$anchors[to]).addClass('active');
    } /* \carousel._update_anchors(); */

  };  /* \carousel.prototype */

  //add obj to namespace
  nxnw.carousel = carousel;

  return nxnw.carousel;

});
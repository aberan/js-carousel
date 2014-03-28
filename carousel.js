var nxnw = nxnw || {};

define(function(require){
  var jQuery = require('jquery');
  require('transition.end.min');

  // first we set up our constructor function
  function Carousel(args, options) {
    //set object options
    this.options = $.extend( {}, this.defaults, options );
    //set object properties
    this.el = args.el[0];
    this.$el = args.el;
    this.selector = args.selector;
    this.sliding = false;
    //set interval
    this.slideInterval = this.options.slideViewTime;

    //set transition/transforms3d flags
    this.transitions = Modernizr.csstransitions;
    this.transforms3d = Modernizr.csstransforms3d;

    //various callbacks if defined
    this.callback = args.hasOwnProperty( 'callback' ) ? args.callback : false;
    this.post = args.hasOwnProperty( 'post' ) ? args.post : false;

    //add inline css for transition
    var cssTimer = this.options.animateTimer > 0 ? this.options.animateTimer / 1000 : 0,
      css = '',
      nonTransitionCss = '';

    this.animateEffect = this.options.effect === 'fade' ? 'opacity' : 'transform';

    //make sure browser supports transforms3d
    if( !this.transforms3d ) {
      this.animateEffect = this.options.orientation === 'vertical' ? 'bottom' : 'left';
    }

    //remove hidden class from elements now that everything has been loaded
    this.$el.find( '.item.hidden' ).removeClass( 'hidden' );

    //set carousel classes if needed for other slide effects
    this.$el.addClass( this.options.effect );

    /* override orientation if effect is fade because vertical orientation absolutely positions the slides which messes up the fade effect */
    if( this.options.effect === 'fade' ) {
      this.options.orientation = 'horizontal';
    }
    this.$el.addClass( this.options.orientation );


    //generate CSS for carousel depending on options passed in
    if( this.animateEffect !== 'transform' ) {
      css = '-webkit-transition: ' + cssTimer + 's ' + this.options.animateTimingFunction + ' ' + this.animateEffect + ';' +
                'transition: ' + cssTimer + 's ' + this.options.animateTimingFunction + ' ' + this.animateEffect + ';';
    }
    else {
      css = '-webkit-transition: ' + cssTimer + 's ' + this.options.animateTimingFunction + ' ' + '-webkit-' + this.animateEffect + ';' +
      'transition: ' + cssTimer + 's ' + this.options.animateTimingFunction + ' ' + '-webkit-' + this.animateEffect + ';' +
      'transition: ' + cssTimer + 's ' + this.options.animateTimingFunction + ' ' + this.animateEffect + ';';
    }

    //add css to set carousel height correctly for non-transition browsers if carousel is vertical slide
    if( this.options.effect === 'slide' && this.options.orientation === 'vertical' && !this.transitions ) {
      nonTransitionCss = '.slide.vertical .carousel-inner { height: 0; padding-bottom: ' + this.options.ratio + '%;}';
    }

    var inlineCss = '<style>' +
      this.selector + ' .item {' +
      css +
      '}' +
      nonTransitionCss +
      '</style>';
    $('head').append( inlineCss );

    //set effects property for non transition supporting browsers
    if( !this.transitions ) {
      this.animateValue = {
        on: this.options.effect === 'slide' ? '0%' : 1,
        left: this.options.effect === 'slide' ? '-100%' : 0,
        right: this.options.effect === 'slide' ? '100%' : 0
      };

      //init slides css
      this.noTransitionCss( this.options.effect );
    }

    if( this.options.slide ) {
      this.slide( this.options.slide );
    }

    if( this.options.pause === 'hover' ) {
      this.$el.on( 'mouseenter',
        $.proxy( function() {
          this.pause();
        }, this))
      .on( 'mouseleave',
        $.proxy( function() {
          this.cycle();
        }, this));
    }

    //test for controls and anchors
    this.controls = this.$el.find( '.carousel-control' ).length;

    //add EH for prev/next controls
    if( this.options.$controls ) {
      this.options.$controls.on( 'click.carousel', $.proxy( function ( e ) {
        e.preventDefault();
        var $callee = $( e.currentTarget );
        this[$callee.data( 'slide' )]();
      }, this));
    }

    //EH for anchors
    if( this.options.$anchors ) {
      //set initial anchor state
      this.updateAnchors( 0 );
      this.options.$anchors.on( 'click.carousel', $.proxy( function ( e ) {
        e.preventDefault();
        if( this.sliding ) {
          return;
        }
        var $callee = $( e.currentTarget );
        var pos = $callee.data( 'pos' );
        this.to( pos );
      }, this));
    }

    //fire init function if carousel set to auto slide
    if ( this.options.auto ) {
      this.init();
    }
  } /* \constructor */

  Carousel.prototype = {

    // now we define the prototype for slideShow
    defaults: {
      auto: true,
      $anchors: false,
      $controls: false,
      pause: 'hover',
      effect: 'fade', // fade, slide
      orientation: 'horizontal', // horizontal, vertical (only applicable for slide)
      animateTimer: 2000, // animation duration in milliseconds
      animateTimingFunction: 'ease', // standard css3 timing fucnctions (ease, linear, ease-in, ease-in-out)
      slideViewTime: 2000, // time that slide lingers
      reverse: false, // direction of slide
      ratio: 56.25 // for non-transition supporting browsers, slides use absolute position so we need to set height of carousel using slides height/weight ratio  - default 16:9
    }, // defaults

    cycle: function ( e ) {
      if ( !e ) {
        this.paused = false;
      }

      if( this.slideInterval && !this.paused ) {

        var self = this;
        this.interval = setTimeout( function() {
          requestAnimFrame(
            $.proxy(
              function() {
                this.next();
              },
              self)
            ); // \requestAnimFrame
        }, self.slideInterval);
      }

      return this;
    }, // cycle

    to: function ( pos ) {
      var $active = this.$el.find( '.item.active' ),
        children = $active.parent().children(),
        activePos = children.index( $active ),
        that = this;

      if ( pos > (children.length - 1) || pos < 0 ) {
        return;
      }

      if ( this.sliding ) {
        return this.$el.one( 'slid', function () {
          that.to( pos );
        });
      }

      if ( activePos == pos ) {
        return this.pause().cycle();
      }
      if( this.options.$anchors ) {
        this.updateAnchors( pos, activePos );
      }

      return this.slide( pos > activePos ? 'next' : 'prev', $( children[pos] ) );
    }, // to

    pause: function ( e ) {
      if ( !e ) {
        this.paused = true;
      }
      clearInterval( this.interval );
      this.interval = null;
      return this;
    }, // pause

    unpause: function() {
      this.paused = false;
    },

    stop : function( $active, $next, type, direction ) {
      this.paused = true;
      this.sliding = false;
      clearInterval( this.interval );
      this.interval = null;

      //remove classes to cleanly pause the carousel so it can start again correctly
      $active.removeClass( direction );
      $next.removeClass( [type, direction].join( ' ' ) );
    }, // stop

    next: function () {
      if ( this.sliding ) {
        return;
      }
      return !this.options.reverse ? this.slide( 'next' ) : this.slide( 'prev' );
    }, // next

    prev: function () {
      if ( this.sliding ) {
        return;
      }

      return !this.options.reverse ? this.slide( 'prev' ) : this.slide( 'next' );
    }, // prev

    slide: function ( type, next ) {
      var $active = this.$el.find( '.item.active' ),
        $next = next || $active[type](),
        isCycling = this.interval,
        direction = type === 'next' ? 'left' : 'right',
        fallback  = type === 'next' ? 'first' : 'last',
        that = this,
        e = $.Event( 'slide', { relatedTarget: $next[0] } );

      this.sliding = true;

      if ( isCycling ) {
        this.pause();
      }

      $next = $next.length ? $next : this.$el.find( '.item' )[fallback]();

      if ( $next.hasClass('active') ) {
        return;
      }

      this.$el.trigger( e );
      if ( e.isDefaultPrevented() ) {
        return;
      }
      $next.addClass( type );


      if ( !this.transitions && this.options.effect === 'slide' ) {
        var value = direction === 'left' ? '100%' : '-100%';
        $next.css( this.animateEffect, value );
      }

      // force reflow
      var ow = $next[0].offsetWidth;

      $active.addClass( direction );
      $next.addClass( direction );

      if ( this.transitions ) {

        // if carousel isnt visible, stop and reset slide classes
        if ( !this.$el.is( ':visible' ) ) {
          this.stop( $active, $next, type, direction );
          return;
        }
        else {
          this.$el.one( $.support.transition.end, function () {
            that.updateSlides( $next, $active, direction, type );
          });
        }
      }
      else {
        var handleAnimation = 'animate' + this.options.effect.charAt( 0 ).toUpperCase() + this.options.effect.slice( 1 );
        this[handleAnimation]( $next, $active, direction, type );
      }

      //get active and next indexes
      if( this.options.$anchors ) {
        var children = $active.parent().children(),
        from = children.index( $active ),
        to = children.index( $next );

        this.updateAnchors( to, from );
      }
    }, // slide

    animateFade: function( $next, $active, direction, type ) {
      $active.fadeOut( this.options.animateTimer, function() {} );
      $next.fadeIn( this.options.animateTimer, $.proxy(function(){
          this.updateSlides( $next, $active, direction, type );
        }, this)
      );
    }, // animateFade

    animateSlide: function( $next, $active, direction, type ) {
      var animateOff = {},
        animateOn = {};

      animateOn[this.animateEffect] = this.animateValue.on;
      animateOff[this.animateEffect] = direction === 'left' ? this.animateValue.left : this.animateValue.right;

      $active.animate(
        animateOff,
      {
        duration: this.options.animateTimer,
        queue: false
      }); // \$active.animate

      $next.animate(
        animateOn,
      {
        duration: this.options.animateTimer,
        queue: false,
        complete: $.proxy( function() {
          this.updateSlides( $next, $active, direction, type );
        }, this)
      }); // \$next.active
    }, // animateSlide

    updateSlides: function( $next, $active, direction, type ) {
      var that = this;

      $next.removeClass( [type, direction].join(' ') ).addClass( 'active' );
      $active.removeClass( ['active', direction].join(' ') );
      this.sliding = false;

      //does this do anything??
      setTimeout( function () {
        that.$el.trigger('slid');
      }, 0);

      //call complete function if set
      if ( this.callback ) {
        this.callback();
      }

      //testing cycle here
      if ( this.options.auto ) {
        this.cycle();
      }
    }, // updateSlides

    //define plugin functions below
    init: function () {

      //start initial slide after view_time, then move to cycle
      var self = this;

      self.paused = false;
      self.interval = setTimeout( function() {
        requestAnimFrame(
          $.proxy(
            function() {
              if( !this.options.reverse ) {
                this.slide( 'next' );
              }
              else {
                this.slide( 'prev' );
              }
            },
            self)
          ); // \requestAnimFrame
      }, self.options.slideViewTime);

      if ( this.post ) {
        this.post();
      }
    }, // init

    noTransitionCss: function( slide_effect ) {
      var slides = this.$el.find( '.item' );

      $.each( slides, function() {
        if( slide_effect === 'fade' ) {
          var $this = $( this );
          if( $this.hasClass( 'active' ) ) {
            $this.css( {'opacity': 1, 'display': 'block'} );
          }
          else {
            $this.css( {'opacity': 1, 'display': 'none'} );
          }
        }
      });
    }, // noTransitionCss

    updateAnchors: function( to, from ) {
      if( from !== false && typeof from !== 'undefined' ) {
        $( this.options.$anchors[from] ).removeClass( 'active' );
      }
      $( this.options.$anchors[to] ).addClass( 'active' );
    } // updateAnchors

  };  /* \Carousel.prototype */

  //add Carousel to namespace
  nxnw.Carousel = Carousel;

  return nxnw.Carousel;

});
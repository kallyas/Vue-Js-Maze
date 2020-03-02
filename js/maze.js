function Maze( _vue )
{
	var that 		= this;
	this.vue 		= _vue;

	this.create();
}

Maze.prototype = {

	create: function()
	{
		this.map 		= [];
		this.openTiles	= [];
	
		this.vue.maze.tiles 		= [];
		this.vue.maze.position		= [ 0, 0 ];
		this.vue.maze.finish		= null;
		this.vue.maze.rotation		= 0;

		this.vue.$el.focus();

		var that = this;
		var tile;


		tile = this.addTile( [ 0, 0 ] );
		tile.start = true;


		if ( this.interval )
		{
			clearInterval( this.interval );
		}
		this.interval = setInterval(function() {

			if ( that.openTiles.length )
			{
				var o = Math.floor( Math.random() * that.openTiles.length / 2 );

				if ( that.getTile( that.openTiles[ o ][ 0 ], that.openTiles[ o ][ 1 ] ) )
				{
					that.openTiles.splice( o, 1 );
					return false;
				}

				tile = that.addTile( that.openTiles[ o ] );
				that.openTiles.splice( o, 1 );
			}

			if ( !that.openTiles.length ||
				that.vue.maze.tiles.length >= that.vue.options.maxTiles )
			{

				clearInterval( that.interval );

				tile.finish = true;
				that.vue.maze.finish = tile.position;
				that.closeOpenTiles();

				console.log( 'Finished the maze with ' + that.vue.maze.tiles.length + ' tiles.' );
			}

		}, 0);

	},

	closeOpenTiles: function()
	{
		var dirs = [ 'top', 'right', 'bottom', 'left' ],
			opps = dirs.slice( dirs.length / 2 ).concat( dirs.slice( 0, dirs.length / 2 ) );

		for ( var o = 0; o < this.openTiles.length; o++ )
		{
			if ( this.getTile( this.openTiles[ o ][ 0 ], this.openTiles[ o ][ 1 ] ) )
			{
				continue;
			}
			var t = {
				top 	: this.getTile( this.openTiles[ o ][ 0 ], this.openTiles[ o ][ 1 ] - 1 ),
				right 	: this.getTile( this.openTiles[ o ][ 0 ] + 1, this.openTiles[ o ][ 1 ] ),
				bottom 	: this.getTile( this.openTiles[ o ][ 0 ], this.openTiles[ o ][ 1 ] + 1 ),
				left 	: this.getTile( this.openTiles[ o ][ 0 ] - 1, this.openTiles[ o ][ 1 ] )
			};

			for ( var d = 0; d < dirs.length; d++ )
			{
				if ( t[ dirs[ d ] ] && t[ dirs[ d ] ][ opps[ d ] ] )
				{
					t[ dirs[ d ] ][ opps[ d ] ] = false;
				}
			}
		}
	},

	addTile: function( arr )
	{
		var x = arr[ 0 ],
			y = arr[ 1 ];

		var tile = {
			position: [ x, y ],
			top 	: false,
			right 	: false,
			bottom 	: false,
			left 	: false,
			start 	: false,
			finish 	: false
		};

		if ( typeof this.map[ x ] == 'undefined' )
		{
			this.map[ x ] = [];
		}
		this.map[ x ][ y ] = tile;


		var d = {
			t: {
				top 	: this.getTile( x, y - 1 ),
				right 	: this.getTile( x + 1, y ),
				bottom 	: this.getTile( x, y + 1 ),
				left 	: this.getTile( x - 1, y )
			},
			r: {
				top 	: false,
				right 	: false,
				bottom 	: false,
				left 	: false
			}	
		};

		//	random order of directions
		if ( !this.vue.options.bundled )
		{
			var dirs = [ 'top', 'right', 'bottom', 'left' ],
				opps = dirs.slice( dirs.length / 2 ).concat( dirs.slice( 0, dirs.length / 2 ) ),
				rand = Math.round( Math.random() * dirs.length );

			d.d = dirs.slice( rand ).concat( dirs.slice( 0, rand ) );
			d.o = opps.slice( rand ).concat( opps.slice( 0, rand ) );
		}


		//	order the directions to stay close to the center 
		else
		{
			//var sqrt = Math.sqrt( this.vue.options.maxTiles ) / 3;
			var sqrt = Math.sqrt( this.vue.maze.tiles.length ) / 1.5;

			d.d =[];
			if ( Math.abs( x ) < Math.abs( y ) )
			{
				var h = [ 0, 2 ],
					v = [ 1, 3 ];
			}
			else
			{
				var h = [ 1, 3 ],
					v = [ 0, 2 ];	
			}
			if ( x < -sqrt )
			{
				d.d[ h[ 0 ] ] = 'right';
			}
			else if ( x > sqrt )
			{
				d.d[ h[ 0 ] ] = 'left';
			}
			else if ( Math.round( Math.random() ) )
			{
				d.d[ h[ 0 ] ] = 'right';
			}
			else 
			{
				d.d[ h[ 0 ] ] = 'left';
			}

			if ( y < -sqrt )
			{
				d.d[ v[ 0 ] ] = 'bottom';
			}
			else if ( y > sqrt )
			{
				d.d[ v[ 0 ] ] = 'top';	
			}
			else if ( Math.round( Math.random() ) )
			{
				d.d[ v[ 0 ] ] = 'bottom';
			}
			else
			{
				d.d[ v[ 0 ] ] = 'top';	
			}

			d.d[ h[ 1 ] ] = ( d.d[ h[ 0 ] ] == 'right'  ) ? 'left' : 'right';
			d.d[ v[ 1 ] ] = ( d.d[ v[ 0 ] ] == 'bottom' ) ? 'top'  : 'bottom';
			
			d.o = d.d.slice( 2 ).concat( d.d.slice( 0, 2 ) );
		}


		var roads = 0;

		//	Required roads to neighbour tiles
		for ( var a = 0; a < d.d.length; a++ )
		{
			if ( d.t[ d.d[ a ] ] )
			{
				d.r[ d.d[ a ] ] = true;
				if ( d.t[ d.d[ a ] ][ d.o[ a ] ] )
				{
					tile[ d.d[ a ] ] = true;
					roads++;
				}
			}
		}
		
		//	Random roads to empty neighbour
		for ( var a = 0; a < d.d.length; a++ )
		{
			if ( !d.r[ d.d[ a ] ] )
			{
				var add = ( this.openTiles.length < 4 )
					? true
					: Math.round( Math.random() * ( 6 - (roads*2) - a ) / a );
					//	available directions minus already made and attempted roads
					//	basically, with every direction the likelyness of a new road decreases

				if ( add )
				{
					tile[ d.d[ a ] ] = true;
					d.r[ d.d[ a ] ] = true;
					roads++;
				}
			}
		}


		this.vue.maze.tiles.push( tile );


		if ( !d.t.top && d.r.top )
		{
			this.openTiles.push( [ x, y - 1 ] );
		}
		if ( !d.t.right && d.r.right )
		{
			this.openTiles.push( [ x + 1, y ] );
		}
		if ( !d.t.bottom && d.r.bottom )
		{
			this.openTiles.push( [ x, y + 1 ] );
		}
		if ( !d.t.left && d.r.left )
		{
			this.openTiles.push( [ x - 1, y ] );
		}


		return tile;
	},

	move: function( direction )
	{
		switch( direction )
		{
			case 'up':
				this.moveTo( 0, -1 );
				break;

			case 'right':
				this.moveTo( 1, 0 );
				break;

			case 'down':
				this.moveTo( 0, 1 );
				break;

			case 'left':
				this.moveTo( -1, 0 );
				break;
		}
	},
	moveTo: function( xAlt, yAlt )
	{
		var dir;

		switch( true )
		{
			case xAlt === -1:
				dir = 'right';
				break;

			case xAlt === 1:
				dir = 'left';
				break;

			case yAlt === -1:
				dir = 'bottom';
				break;

			case yAlt === 1:
				dir = 'top';
				break;
		}

		var x = this.vue.maze.position[ 0 ] + xAlt,
			y = this.vue.maze.position[ 1 ] + yAlt,
			t = this.getTile( x, y );

		if ( t && t[ dir ] )
		{
			this.vue.maze.position = [ x, y ];
		}
	},

	getTile: function( x, y )
	{
		if ( typeof this.map[ x ] == 'undefined' )
		{
			return false;
		}
		if ( typeof this.map[ x ][ y ] == 'undefined' )
		{
			return false;
		}
		return this.map[ x ][ y ];
	}
};
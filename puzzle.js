const CANVAS_WIDTH  = 600;
const CANVAS_HEIGHT = 600;
var canvas;
var context;
var gameBoard;

/*----------------------------------------------------------------------------*/
/* CLASS IMAGE LOADER                                                         */
/*----------------------------------------------------------------------------*/
const ImageLoader = () => {
	let assetsCounter = 0;
	let assetsLoaded  = 0;
	let idInterval    = 0;
 
	const loadImage = (imageFileName) => {
	  const img = new Image();
	  img.onload = () => {assetsLoaded++;};
	  img.src = imageFileName;
	  assetsCounter++;
	  return img;
	};
 
	const loadImages = (imageFileNames) => {
	  const images = new Map();
	  for (let i in imageFileNames) {
		 images.set(imageFileNames[i], loadImage(imageFileNames[i]));
	  }
	  return images;
	};
 
	const isReady = () => {
	  return assetsLoaded === assetsCounter;
	};
 
	const checkReady = (func) => {
	  if (isReady()) {
		 clearInterval(idInterval);
		 func();
	  }
	};
 
	const onload = (func, sleep = 10) => {
	  idInterval = setInterval(() => { checkReady(func); }, sleep);
	};

   return {
      loadImage, loadImages, onload
   };	
 };
 
/*----------------------------------------------------------------------------*/

/*----------------------------------------------------------------------------*/
/* CLASS BOARD                                                                */
/*----------------------------------------------------------------------------*/
const GameBoard = (context, width, height) => {
	const tileSize   = 200;
	const tileOffset = 10;
	var mouseX       = 0;
	var mouseY       = 0;

	const boardMap = [ // [Y][X]
		[1, 0, 1],
		[0, 0, 0],
		[2, 0, 2]
   ];

	const imageLoader   = ImageLoader();
	const imgBoard      = imageLoader.loadImage('images/board.png');
	const imgWhiteHorse = imageLoader.loadImage('images/white_horse.png');
	const imgBlackHorse = imageLoader.loadImage('images/black_horse.png');
	var   imgDrag       = null;
	var   pickValue     = 0;

	imageLoader.onload(function() {draw()});

	const draw = () => {
		 context.drawImage(imgBoard, 0, 0);
	    for (var j = 0; j < 3; j++) { // a matriz é [Y][X]
	    	for (var k = 0; k < 3; k++) {
	    		switch(boardMap[j][k]) {
		    		case 1:
	    				context.drawImage(imgWhiteHorse, (k * tileSize) + tileOffset, (j * tileSize) + tileOffset);
		    			break;
		    		case 2:
	    				context.drawImage(imgBlackHorse, (k * tileSize) + tileOffset, (j * tileSize) + tileOffset);
	    				break;
	    		}
	    	}
	    }

	    if(null != imgDrag) {
	    	context.drawImage(imgDrag, mouseX - (tileSize / 2), mouseY - (tileSize / 2));
	    }
	}

	const redraw = () => {
		context.clearRect(0, 0, width, height);
    	draw();
	}

	const mousedown = (posX, posY) => {
		var tileX = Math.floor(posX / tileSize);
		var tileY = Math.floor(posY / tileSize);

		switch (boardMap[tileY][tileX]) {
			case 0:
				return;
			case 1: // clicked a white horse tile
				imgDrag = imgWhiteHorse;
				break;
			case 2: // clicked a black horse tile
				imgDrag = imgBlackHorse;
				break;
		}

		pickValue = boardMap[tileY][tileX];
		boardMap[tileY][tileX] = 0;
		pickX = tileX;
		pickY = tileY;
		redraw();
	}

	const mouseup = (posX, posY) => {
		var tileX = Math.floor(posX / tileSize);
		var tileY = Math.floor(posY / tileSize);

		if(imgDrag) {
			var flagValidMove = false;
			if(boardMap[tileY][tileX] == 0) { // target tile is free
				var deltaX = Math.abs(pickX - tileX);
				var deltaY = Math.abs(pickY - tileY);

				if((deltaX == 2 && deltaY == 1) || (deltaX ==1 && deltaY == 2)) {
					flagValidMove = true;
				}
			}

			if (!flagValidMove) {
				boardMap[pickY][pickX] = pickValue;
			}
			else {
				boardMap[tileY][tileX] = pickValue;
			}

			imgDrag  = null;
			redraw();		
		}
	}

	const mousemove = (posX, posY) => {
		mouseX = posX;
		mouseY = posY;

		if(imgDrag) {
			redraw();
		}
	}	

	const mouseleave = () => {
		if(imgDrag) {			
			boardMap[pickY][pickX] = pickValue;
			imgDrag = null;
			redraw();
		}
	}

   return {
      mousedown, mouseup, mousemove, mouseleave
   };	
}
/*----------------------------------------------------------------------------*/

/**
* Creates a canvas element, loads images, adds events, and draws the canvas for the first time.
*/
function prepareCanvas()
{
	// Create the canvas (Neccessary for IE because it doesn't know what a canvas element is)
	var canvasDiv = document.getElementById('canvasDiv');
	canvas = document.createElement('canvas');
	canvas.setAttribute('width', CANVAS_WIDTH);
	canvas.setAttribute('height', CANVAS_HEIGHT);
	canvas.setAttribute('id', 'canvas');
	canvasDiv.appendChild(canvas);
	if(typeof G_vmlCanvasManager != 'undefined') {
		canvas = G_vmlCanvasManager.initElement(canvas);
	}
	context = canvas.getContext("2d"); // Grab the 2d canvas context
	// Note: The above code is a workaround for IE 8 and lower. Otherwise we could have used:
	//     context = document.getElementById('canvas').getContext("2d");
	
	gameBoard = GameBoard(context, CANVAS_WIDTH, CANVAS_HEIGHT);

	// Add mouse events
	// ----------------
	$('#canvas').mousedown(function(e)
	{
		var mouseX = e.pageX - this.offsetLeft;
		var mouseY = e.pageY - this.offsetTop;

		gameBoard.mousedown(mouseX,mouseY);
  	});
	
	$('#canvas').mousemove(function(e){
		var mouseX = e.pageX - this.offsetLeft;
		var mouseY = e.pageY - this.offsetTop;

		gameBoard.mousemove(mouseX,mouseY);
	});

	$('#canvas').mouseup(function(e){
		var mouseX = e.pageX - this.offsetLeft;
		var mouseY = e.pageY - this.offsetTop;

		gameBoard.mouseup(mouseX,mouseY);
	});
	
	$('#canvas').mouseleave(function(e){
		gameBoard.mouseleave();
	});
}
var experiment = {}

;(function(ns){
	ns.userid = md5('unknown')
	ns.settings = {
		width: 600,
		height: 600,
		dotRadius: 50,
		dotMargin: 4,
		standardChanOffset: 20,
		screenDuration: 10000
	}
	
	ns.init = function() {
		document.querySelector('#canvas-container').style.display = 'none'
	  document.onkeydown = function(e){
	  	var keynum
	    if(window.event) { // IE
	      keynum = e.keyCode
	    } else if(e.which){ // Netscape/Firefox/Opera
	      keynum = e.which
	    }
	  	ns.keypressed(keynum)
	  }
	}

	ns.start = function() {
		ns.userid = md5(document.querySelector('#input-email').value)
		var showTuto = document.querySelector('#tuto').checked
		if (showTuto) {
			ns.startTutorial()
		} else {
			ns.startExperiment()
		}
	}

	ns.startTutorial = function() {
		ns.switchToCanvas()
		document.querySelector('#canvas-container').innerHTML = ''

		var base = d3.select("#canvas-container")

		var chart = base.append("canvas")
		  .attr("width", ns.settings.width)
		  .attr("height", ns.settings.height);

		ns.context = chart.node().getContext("2d");

		ns.buildTutoSlides()
		ns.tutoSlides[0].run(ns.context)

	}

	ns.startExperiment = function() {
		ns.switchToCanvas()
		document.querySelector('#canvas-container').innerHTML = ''

		var base = d3.select("#canvas-container")

		var chart = base.append("canvas")
		  .attr("width", ns.settings.width)
		  .attr("height", ns.settings.height);

		ns.context = chart.node().getContext("2d");

		ns.initExperiment()
		ns.newExperimentScreen(ns.context)
	}


	ns.switchToCanvas = function() {
		if (document.querySelector('#canvas-container').style.display == 'none') {
			document.querySelector('#startup-form').style.display = 'none'
			document.querySelector('#canvas-container').style.display = ''
		}
	}

	// Experiment design
	ns.setups = []
	ns.initExperiment = function() {
		// 1) Calibration
		var numberOfScreens = 10 * 60 / 2	// 1 cycle of 10 min questions with a screen every 2 sec.
		var numberOfSampes = numberOfScreens / 3 // Test for l, a and b in one direction each
		var unidirSample = Math.ceil(Math.pow(numberOfSampes, 1/3))

		// 2) We sample the RGB space regularly to improve homogeneity of the sampling
		var setups = []
		var r, g, b
		for (r = Math.random() * 255/unidirSample; r<256; r += 255/unidirSample) {
			for (g = Math.random() * 255/unidirSample; g<256; g += 255/unidirSample) {
				for (b = Math.random() * 255/unidirSample; b<256; b += 255/unidirSample) {
					['l', 'a', 'b'].forEach(function(chan){
						var direction = Math.random() < 0.5 ? 1 : -1
						var setup = {}
						setup.baseColor = d3.rgb(r, g, b).toString()

						var diffColor = d3.lab(setup.baseColor)
						diffColor[chan] += direction * ns.settings.standardChanOffset
						setup.diffColor = diffColor.toString()
						if (setup.diffColor != setup.baseColor) {
							setup.chan = chan
							setup.chanDirection = direction
							setup.chanOffset = ns.settings.standardChanOffset
							setups.push(setup)
						}
					})
				}
			}
		}

		// 3) Finalize
		ns.setups = ns.shuffle(setups)
	}

	ns.newExperimentScreen = function(context) {
		var setup = ns.setups.pop()
		ns.drawFrame(context)
		var shapes = ns.generateShapes()	// shape 0 is always the special one
		shapes.forEach(function(s,i) {
			s.draw(context, setup.baseColor)
		})
		// shapes[0].draw(context, setup.diffColor)
		ns.setColorTimer(shapes[0], setup.baseColor, setup.diffColor, ns.settings.screenDuration)

		// Log settings
		setup.settings = ns.settings

		setup.goal = shapes[0].position

		var action = function(answer) {
			var record = {}

			// Goal
			record.g = setup.goal

			// Answer
			record.a = answer
			
			// Duration
			record.d = Date.now() - ns.timestamp

			// Time
			record.t = Date.now()

			// User
			record.u = ns.userid

			// Base color
			record.cB = setup.baseColor

			// Color
			record.c = ns.currentColor

			// Diff color
			record.cD = setup.diffColor

			// Channel
			record.ch = setup.chan
			
			// Channel direction
			record.chD = setup.chanDirection
			
			// Channel offset
			record.chO = setup.chanOffset
						
			ns.sendRecord(record)
			ns.newExperimentScreen(context)
		}
		ns.onAction(action)
	}

	// Tutorial
	ns.tutoSlides = []
	ns.slideId = 0
	ns.buildTutoSlides = function() {
		ns.tutoSlides = []
		ns.onAction(ns.nextTutoSlide)

		// Slide 1: keys
		ns.tutoSlides.push({
			run: function(context) {
				ns.drawFrame(context)
				var shapes = ns.generateShapes()	// shape 0 is always the special one
				shapes.forEach(function(s,i) {
					if (i == 0) {
						s.draw(context, '#FF0000')
					} else {
						s.draw(context, '#999999')
					}
				})
				ns.drawMessage(context, 'One dot has a\ndifferent color.\nPress the arrow key\ncorresponding to\nits position ('+shapes[0].position+')')
			}
		})

		// Slide 2: alt keys
		ns.tutoSlides.push({
			run: function(context) {
				ns.drawFrame(context)
				var shapes = ns.generateShapes()	// shape 0 is always the special one
				shapes.forEach(function(s,i) {
					if (i == 0) {
						s.draw(context, '#FF0000')
					} else {
						s.draw(context, '#999999')
					}
				})
				var numberKey
				if ( shapes[0].position == 'up' ) { numberKey = '8' } 
				if ( shapes[0].position == 'down' ) { numberKey = '2 (or 5)' } 
				if ( shapes[0].position == 'left' ) { numberKey = '4' } 
				if ( shapes[0].position == 'right' ) { numberKey = '6' } 
				ns.drawMessage(context, 'You can also\nuse the number key\ninstead of the arrow keys:\n press '+numberKey+'')
			}
		})

		// Slide 3: spacebar
		ns.tutoSlides.push({
			run: function(context) {
				ns.drawFrame(context)
				var shapes = ns.generateShapes()
				shapes.forEach(function(s,i) {
					s.draw(context, '#999999')
				})
				ns.drawMessage(context, 'If you don\'t\nknow where the\nthe special dot is,\njust hit the spacebar')
			}
		})

		// Slide 4: time
		ns.tutoSlides.push({
			run: function(context) {
				ns.drawFrame(context)
				var shapes = ns.generateShapes()	// shape 0 is always the special one
				shapes.forEach(function(s,i) {
					s.draw(context, '#999999')
				})
				ns.setColorTimer(shapes[0], '#999999', '#FF0000', 5000)
				ns.drawMessage(context, 'TWIST:\nthe color difference\nappears progressively.\nHit as soon\nas you can!')
			}
		})

		// Slide 5: go!
		ns.tutoSlides.push({
			run: function(context) {
				ns.drawFrame(context)
				ns.drawMessage(context, 'Well done!\nReady to start?\nHit the spacebar')
			}
		})

	}
	ns.nextTutoSlide = function() {
		ns.slideId++
		if (ns.slideId >= ns.tutoSlides.length) {
			ns.startExperiment()
		} else {
			ns.tutoSlides[ns.slideId].run(ns.context)
		}
	}

	// Color timer
	ns.colorInterval
	ns.timestamp
	ns.currentColor
	ns.setColorTimer = function(shape, sourceColor, targetColor, duration) {
		ns.timestamp = Date.now()
		var slab = d3.lab(sourceColor)
		var tlab = d3.lab(targetColor)
		var lscale = d3.scaleLinear()
			.domain([0, duration])
			.range([slab.l, tlab.l])
		var ascale = d3.scaleLinear()
			.domain([0, duration])
			.range([slab.a, tlab.a])
		var bscale = d3.scaleLinear()
			.domain([0, duration])
			.range([slab.b, tlab.b])
	 	ns.colorInterval = setInterval(function(){
	 		var msPassed = Date.now() - ns.timestamp
	 		ns.currentColor = d3.lab(lscale(msPassed), ascale(msPassed), bscale(msPassed)).toString()
			shape.draw(ns.context, ns.currentColor)
			if (msPassed > duration) {
				window.clearInterval(ns.colorInterval)
			}
		}, 40)
	}

	// Drawing functions
	ns.drawFrame = function(context) {
		context.beginPath()
    context.rect(0, 0, ns.settings.width, ns.settings.height)
    context.strokeStyle = '#000000'
		context.lineWidth = '1'
		context.lineCap = "round"
		context.lineJoin = "round"
		context.fillStyle = "#FFFFFF"
    context.stroke()
    context.fill()
	}

	ns.drawMessage = function(context, text) {
		var lines = text.split('\n')
		var lineHeight = 38
		var lineCount = lines.length
		lines.forEach(function(line, i){
			var x = ns.settings.width / 2
			var y = ns.settings.height / 2 + lineHeight * ( i - (lineCount - 1) / 2 )
			context.font="36px Segoe UI,Roboto,Ubuntu,PingFang SC,Hiragino Sans GB,Microsoft YaHei,Hiragino Kaku Gothic Pro,Meiryo,Malgun Gothic,Helvetica Neue,sans-serif"
			context.textAlign = "center"
			context.textBaseline = "middle"
			context.strokeStyle = '#FFFFFF'
			context.lineWidth = '30'
			context.lineCap = "round"
			context.lineJoin = "round"
			context.fillStyle = "#FFFFFF"
			context.strokeText(line, x, y)
			context.fillText(line, x, y)
		})
		lines.forEach(function(line, i){
			var x = ns.settings.width / 2
			var y = ns.settings.height / 2 + lineHeight * ( i - (lineCount - 1) / 2 )
			context.fillStyle = "#666666"
			context.fillText(line, x, y)
		})
	}

	// Shape functions
	ns.generateShapes = function() {
		var shapes = []

		// DOTS
		// Let's create the first dot somewhere clearly on top
		var angle = ns.randRange(0, Math.PI)
		var r = Math.pow(ns.randRange(0, Math.pow(ns.settings.width / 6 - ns.settings.dotRadius, 1/2)), 2)
		var drawDot = function(x, y) {
			return function(context, color) {
				context.beginPath()
				context.fillStyle = color
		    context.arc(x, y, ns.settings.dotRadius, 0, 2*Math.PI)
		    context.fill()
		    context.lineWidth = 2
		    context.strokeStyle = '#FFFFFF'
		    context.stroke()
			}
		}
		var x = ns.settings.width / 2 - r * Math.cos(angle)
		var y = ns.settings.dotRadius + r * Math.sin(angle)
		var p = 'up'
		var flip = Math.random() < 0.5
		var turn = Math.random() < 0.5
		if (flip) {
			y = ns.settings.height - y
			p = 'down'
		}
		if (turn) {
			var temp = x
			x = y
			y = temp
			p = flip ? 'right' : 'left'
		}
		shapes.push({
			x: x,
			y: y,
			draw: drawDot(x, y),
			position: p
		})

		// Other dots are anywhere else as long as they do not overlap.
		var dotsEstimateAmount = ns.settings.width * ns.settings.height * 0.9 / ( Math.PI * Math.pow((ns.settings.dotRadius + ns.settings.dotMargin/2), 2) )
		var i
		var d2max = Math.pow(ns.settings.dotMargin + 2 * ns.settings.dotRadius, 2)

		for (i=0; i < dotsEstimateAmount * 3; i++) {
			var x = ns.randRange(0, ns.settings.width)
			var y = ns.randRange(0, ns.settings.height)
			if (!shapes.some(function(s) {
				var d2 = Math.pow(s.x - x, 2) + Math.pow(s.y - y, 2)
				return d2 < d2max
			})) {
				shapes.push({
					x: x,
					y: y,
					draw: drawDot(x, y)
				})
			}
		}

		return shapes
	}

	// Key press functions
	ns.keypressed = function(keynum) {
		// console.log(keynum)
		var keySignature
		switch (keynum) {
			case 38: // arrow up
				keySignature = 'up'
				break
			case 40: // arrow down
				keySignature = 'down'
				break
			case 37: // arrow left
				keySignature = 'left'
				break
			case 39: // arrow right
				keySignature = 'right'
				break
			case 32: // spacebar
				keySignature = 'escape'
				break
			case 27: // escape key
				keySignature = 'escape'
				break
			case 104: // keypad number 8
				keySignature = 'up'
				break
			case 98: // keypad number 2
				keySignature = 'down'
				break
			case 101: // keypad number 5
				keySignature = 'down'
				break
			case 100: // keypad number 4
				keySignature = 'left'
				break
			case 102: // keypad number 6
				keySignature = 'right'
				break
			default:
				keySignature = 'irrelevant'
				break
		}
		if (keySignature !== 'irrelevant') {
			window.clearInterval(ns.colorInterval)
			ns.keyAction(keySignature)
		}
	}

	ns.onAction = function(callback) {
		ns.keyAction = callback
	}

	// Rest API
	ns.sendRecord = function(record) {
		var data = JSON.stringify( record )
		d3.request('https://api.mlab.com/api/1/databases/colors-experiment/collections/records/?apiKey=zDcenEvluFNwtefM1-jsPTIee-JUk63m')
			.header("Content-Type", "application/json")
			.mimeType('application/json')
	    .response(function(xhr) { return JSON.parse(xhr.responseText); })
			.post(data, function(d){
				// console.log('POST', d)
			});
	}

	// Helpers
	ns.randRange = function(from, to, integerOnly) {
		var r = from + Math.random() * (to-from)
		if (integerOnly) return Math.floor(r)
		else return r
	}
	
	ns.shuffle = function(array) {
	  var currentIndex = array.length, temporaryValue, randomIndex;

	  // While there remain elements to shuffle...
	  while (0 !== currentIndex) {

	    // Pick a remaining element...
	    randomIndex = Math.floor(Math.random() * currentIndex);
	    currentIndex -= 1;

	    // And swap it with the current element.
	    temporaryValue = array[currentIndex];
	    array[currentIndex] = array[randomIndex];
	    array[randomIndex] = temporaryValue;
	  }

	  return array;
	}
})(experiment)
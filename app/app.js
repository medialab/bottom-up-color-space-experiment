var experiment = {}

;(function(ns){
	ns.userid = md5('unknown')
	ns.settings = {
		width: 600,
		height: 600,
		dotRadius: 12,
		dotMargin: 6
	}
	
	ns.init = function() {
		document.querySelector('#canvas-container').style.display = 'none'
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

		var context = chart.node().getContext("2d");

		ns.drawFrame(context)
		var shapes = ns.generateShapes()	// shape 0 is always the special one
		shapes.forEach(function(s,i) {
			if (i == 0) {
				s.draw(context, '#FF0000')
			} else {
				s.draw(context, '#666666')
			}
		})


		// TODO
	}

	ns.startExperiment = function() {
		ns.switchToCanvas()
		document.querySelector('#canvas-container').innerHTML = ''
		// TODO
	}

	ns.switchToCanvas = function() {
		if (document.querySelector('#canvas-container').style.display == 'none') {
			document.querySelector('#startup-form').style.display = 'none'
			document.querySelector('#canvas-container').style.display = ''
		}
	}

	ns.drawFrame = function(context) {
		context.beginPath()
    context.rect(0, 0, ns.settings.width, ns.settings.height)
    context.stroke()
	}

	ns.generateShapes = function() {
		var shapes = []

		// DOTS
		// Let's create the first dot somewhere clearly on top
		var angle = ns.randRange(0, Math.PI)
		var r = Math.pow(ns.randRange(0, Math.pow(ns.settings.width / 4 - ns.settings.dotRadius, 1/2)), 2)
		var drawDot = function(x, y) {
			return function(context, color) {
				context.beginPath()
				context.fillStyle = color
		    context.arc(x, y, ns.settings.dotRadius, 0, 2*Math.PI)
		    context.fill()
			}
		}
		var x = ns.settings.width / 2 - r * Math.cos(angle)
		var y = ns.settings.dotRadius + r * Math.sin(angle)
		var p = 'top'
		var flip = Math.random() < 0.5
		var turn = Math.random() < 0.5
		if (flip) {
			y = ns.settings.height - y
			p = 'bottom'
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

	ns.randRange = function(from, to, integerOnly) {
		var r = from + Math.random() * (to-from)
		if (integerOnly) return Math.floor(r)
		else return r
	}

})(experiment)
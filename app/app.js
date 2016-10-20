var experiment = {}

;(function(ns){
	ns.userid = md5('unknown')
	ns.settings = {
		width: 600,
		height: 600
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

    context.beginPath()
    context.rect(0, 0, ns.settings.width, ns.settings.height)
    context.stroke()

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
})(experiment)
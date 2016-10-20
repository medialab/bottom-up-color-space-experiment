var experiment = {}

;(function(ns){
	ns.userid = md5('unknown')
	
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
		// TODO
	}

	ns.startExperiment = function() {
		// TODO
	}
})(experiment)
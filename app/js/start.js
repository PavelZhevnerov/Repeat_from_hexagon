$(document).ready(function () {

	var AudioContext = window.AudioContext
		|| window.webkitAudioContext
		|| false;

	if (!AudioContext) {

		alert('Sorry, but the Web Audio API is not supported by your browser.'
			+ ' Please, consider downloading the latest version of '
			+ 'Google Chrome or Mozilla Firefox');

	} else {

		playGame();

	}
});

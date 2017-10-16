var audioCtx = new AudioContext();

var frequencies = [329.63, 261.63, 220, 164.81, 360.24, 198.57];

var errOsc = audioCtx.createOscillator();
errOsc.type = 'triangle';
errOsc.frequency.value = 110;
errOsc.start(0.0);

var errNode = audioCtx.createGain();
errOsc.connect(errNode);
errNode.gain.value = 0;
errNode.connect(audioCtx.destination);

var oscillators = frequencies.map(function (frq) {
	var osc = audioCtx.createOscillator();
	osc.type = 'sine';
	osc.frequency.value = frq;
	osc.start(0.0);
	return osc;
});

var gainNodes = oscillators.map(function (osc) {
	var g = audioCtx.createGain();
	osc.connect(g);
	g.connect(audioCtx.destination);
	g.gain.value = 0;
	return g;
});
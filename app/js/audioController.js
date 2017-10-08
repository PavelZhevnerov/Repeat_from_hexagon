var ramp = 0.05;//влияние на длительность воспроизведения
var vol = 0.5;//константа используемая для изменениия звукового сигнала

// Если есть возможность играть !!!!
var audioCtx = new AudioContext(); //создание Аудио элемента с помощью API

var frequencies = [329.63, 261.63, 220, 164.81, 360.24, 198.57]; //частоты

//создание сигнала ошибки (узел OscillatorNode)
var errOsc = audioCtx.createOscillator();//генератор
errOsc.type = 'triangle';//тип сигнала
errOsc.frequency.value = 110;//частота колебаний
errOsc.start(0.0); //временная задержка для Safari

var errNode = audioCtx.createGain();//создание самого html узла
errOsc.connect(errNode);
errNode.gain.value = 0;
errNode.connect(audioCtx.destination);

// создаине сигнала нажатия
var oscillators = frequencies.map(function (frq) {
	var osc = audioCtx.createOscillator();
	osc.type = 'sine';
	osc.frequency.value = frq;
	osc.start(0.0); //временная задержка для Safari
	return osc;
});

var gainNodes = oscillators.map(function (osc) {
	var g = audioCtx.createGain();
	osc.connect(g);
	g.connect(audioCtx.destination);
	g.gain.value = 0;
	return g;
});
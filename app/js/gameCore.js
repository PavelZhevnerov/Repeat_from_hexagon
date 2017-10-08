function playGame() {

	var infoHexagon = $("#info"),
		difficultGame,
		display = $('.count'),
		buttonStart = $('#start'),
		buttonMode = $('#mode'),
		ledMode = $('#mode-led'),
		switchSlot = $('.sw-slot'),
		buttonSwitch = $('#pwr-sw'),
		buttonHex = $('.hex-btn'),
		buttonControl = $('.btn');

	var gameStatus = {}; //игра

	//ф-ция очистки статуса игры
	gameStatus.reset = function () {
		this.init();
		this.strict = false;
	};

	//ф-ция состояния игры/уровня
	gameStatus.init = function () {
		this.lastPush = $('#0');//последний добавленный
		this.sequence = [];//последовательность
		this.tStepInd = 0;
		this.index = 0;
		this.count = 0;
		this.lock = false;
	};

	//проигрывание правильного нажатия
	function playGoodTone(num) {
		gainNodes[num].gain
			.linearRampToValueAtTime(vol, audioCtx.currentTime + ramp);//постепеннное линейное изменение аудиосигнала с vol до audioCtx.currentTime - увеличивающаяся временная метка
		gameStatus.currPush = $('#' + num);
		gameStatus.currPush.addClass('light');
	};

	//завершение проигрывания правильного нажатия
	function stopGoodTones() {
		if (gameStatus.currPush)
			gameStatus.currPush.removeClass('light');
		gainNodes.forEach(function (g) {
			g.gain.linearRampToValueAtTime(0, audioCtx.currentTime + ramp);
		});
		gameStatus.currPush = undefined;
		gameStatus.currOsc = undefined;
	};

	//проигрывание ошибочного нажатия
	function playErrTone() {
		errNode.gain.linearRampToValueAtTime(vol, audioCtx.currentTime + ramp);
	};

	//завершение проигрывания ошибочного нажатия
	function stopErrTone() {
		errNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + ramp);
	};

	//вывод информации
	function displayNotification(hint, time) {
		time = time ? time : 0;
		var setTime = setTimeout(function () {
			infoHexagon.text(hint);
		}, time);
	}

	//определение выбранной сложности игры
	function getDifficult() {
		difficultGame = $('input[name=diff]:checked').val();
		if (!difficultGame) {
			difficultGame = 15;
		}
	}

	//начало игры
	function gameStart() {
		resetTimers();//сбросить таймер
		stopGoodTones();//остановить воспроизведение сигнала
		stopErrTone();//остановить воспроизведение ошибки
		display.text('--').removeClass('led-off');//найти дисплей убрать класс
		flashMessage('--', 1);//вывести инфу на дисплей
		gameStatus.init();//проверить состояние игры
		addStep();//следующий шаг
		getDifficult();
	}

	//ф-ция задания времени на шаг/действие
	function setTimeStep(num) {
		var tSteps = [1250, 1000, 750, 500];
		if (num < 4)
			return tSteps[0];
		if (num < 8)
			return tSteps[1];
		if (num < 12)
			return tSteps[2];
		return tSteps[3];
	}

	//извещение об ошибке
	function notifyError(pushObj) {
		gameStatus.lock = true;
		buttonHex.removeClass('clickable').addClass('unclickable');//сделать кнопки некликабельными
		playErrTone();//воспроизвести сигнал об ошибке
		displayNotification('You are wrong!');
		if (pushObj)
			pushObj.addClass('light');//осветлить нажатую кнопку
		gameStatus.toHndl = setTimeout(function () {
			stopErrTone();
			if (pushObj)
				pushObj.removeClass('light');
			gameStatus.toHndlSt = setTimeout(function () {
				//displayNotification('Listen!');
				if (gameStatus.strict)
					gameStart()
				else
					playSequence();
			}, 1000);
		}, 1000);
		flashMessage('!!', 2);
	};

	//извещение о выйгрыше
	function notifyWin() {
		var cnt = 0;
		var last = gameStatus.lastPush.attr('id');
		gameStatus.seqHndl = setInterval(function () {
			playGoodTone(last);
			gameStatus.toHndl = setTimeout(stopGoodTones, 80);
			cnt++;
			if (cnt === 8) {
				clearInterval(gameStatus.seqHndl);
			}
		}, 160);
		flashMessage('**', 2);
		displayNotification('You win!!!');
	}

	//ф-ция вывода инфы на экран
	function flashMessage(msg, times) {
		display.text(msg);
		var lf = function () {
			display.addClass('led-off');
			gameStatus.toHndlFl = setTimeout(function () {//мерцание дисплея
				display.removeClass('led-off');
			}, 250);
		};
		var cnt = 0;
		lf();
		gameStatus.flHndl = setInterval(function () {
			lf();
			cnt++;
			if (cnt === times)
				clearInterval(gameStatus.flHndl);
		}, 500)
	};

	//вывод номера уровня
	function displayCount() {
		var p = (gameStatus.count < 10) ? '0' : '';
		display.text(p + (gameStatus.count + ''));
	}

	//ф-ция воспроизведения последовательности
	function playSequence() {
		displayNotification('Listen me!');
		var i = 0;
		gameStatus.index = 0;
		gameStatus.seqHndl = setInterval(function () {
			displayCount();
			gameStatus.lock = true;
			playGoodTone(gameStatus.sequence[i]);
			gameStatus.toHndl = setTimeout(stopGoodTones, gameStatus.timeStep / 2 - 10);
			i++;
			if (i === gameStatus.sequence.length) {
				clearInterval(gameStatus.seqHndl);
				buttonHex.removeClass('unclickable').addClass('clickable');
				gameStatus.lock = false;
				displayNotification('Repeat from me!', 1000);
				gameStatus.toHndl = setTimeout(notifyError, 5 * gameStatus.timeStep);
			}
		}, gameStatus.timeStep);
	};

	//ф-ция следующего уровня/шага
	function addStep() {
		gameStatus.timeStep = setTimeStep(gameStatus.count++);//время шага для воспроизведения
		gameStatus.sequence.push(Math.floor(Math.random() * 6));//получить случайное число и добавить в последовательность
		gameStatus.toHndl = setTimeout(playSequence, 500);//воспроизвести последовательность
		//displayNotification('Listen');
	};

	//ф-ция сброса таймера
	function resetTimers() {
		clearInterval(gameStatus.seqHndl);
		clearInterval(gameStatus.flHndl);
		clearTimeout(gameStatus.toHndl);
		clearTimeout(gameStatus.toHndlFl);
		clearTimeout(gameStatus.toHndlSt);
	};

	function pushColor(pushObj) {
		if (!gameStatus.lock) {//если игра не заблокирована
			clearTimeout(gameStatus.toHndl);
			var pushNr = pushObj.attr('id');//получить id нажатого элемента/кнопки
			if (pushNr == gameStatus.sequence[gameStatus.index]
				&& gameStatus.index < gameStatus.sequence.length) {

				playGoodTone(pushNr);
				gameStatus.lastPush = pushObj;
				gameStatus.index++;
				if (gameStatus.index < gameStatus.sequence.length) {
					gameStatus.toHndl = setTimeout(notifyError, 5 * gameStatus.timeStep);
				} else if (gameStatus.index == difficultGame) {
					buttonHex.removeClass('clickable').addClass('unclickable');
					gameStatus.toHndl = setTimeout(notifyWin, gameStatus.timeStep);
				} else {
					buttonHex.removeClass('clickable').addClass('unclickable');
					addStep();
				}
			} else {
				buttonHex.removeClass('clickable').addClass('unclickable');
				notifyError(pushObj);
			}
		}
	}

	buttonHex.mousedown(function () {
		pushColor($(this));
	});

	$('*').mouseup(function (e) {
		e.stopPropagation();
		if (!gameStatus.lock)
			stopGoodTones();
	});

	//изменение индикатора строгого режима
	function toggleStrict() {
		ledMode.toggleClass('led-on');
		gameStatus.strict = !gameStatus.strict;
	}

	//запуск игры
	switchSlot.click(function () {
		buttonSwitch.toggleClass('sw-on');
		if (buttonSwitch.hasClass('sw-on') == false) {
			displayNotification('Click on toggle!');
			gameStatus.reset();
			display.text('--');
			display.addClass('led-off');
			ledMode.removeClass('led-on');
			buttonHex.removeClass('clickable').addClass('unclickable');
			buttonStart.off('click');
			buttonMode.off('click');
			buttonControl.removeClass('unclickable').addClass('clickable');
			resetTimers();
			stopGoodTones();
			stopErrTone();
		} else {
			getDifficult();
			displayNotification("Let's start!");
			buttonControl.removeClass('unclickable').addClass('clickable');
			display.removeClass('led-off');
			buttonStart.click(gameStart);
			buttonMode.click(toggleStrict);
		}
	});

	gameStatus.reset();
}
var scene;
var camera;
var box;
var renderer;
var controls;
var mesh;
var raycaster
var mouse;
var WIDTH;
var HEIGHT;

var movingMobile;

//Player 1 is true
var player = true;
//board[z][row][col]
var board = [[[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]];
var won = false;

window.addEventListener('load', setUp, false);
window.addEventListener('mousemove', mouseMove, false);
window.addEventListener('click', mouseClick, false);
window.addEventListener('touchend', touchEnd, false);

window.addEventListener('touchstart', function(event) { movingMobile = false; }, false);
window.addEventListener('touchmove', function(event) { movingMobile = true; }, false);

window.addEventListener('resize', function() {
	WIDTH = window.innerWidth;
	HEIGHT = window.innerHeight;
	renderer.setSize(WIDTH, HEIGHT);
	camera.aspect = WIDTH / HEIGHT;
	camera.updateProjectionMatrix();
});

function mouseMove(event) {
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
}

function mouseClick() {
	raycaster.setFromCamera(mouse, camera);
	
	let intersects = raycaster.intersectObjects(scene.children);
	if (!won && intersects.length != 0 && intersects[0].object.name === "piece")
		makeMove(intersects[0].object);

	renderer.render(scene, camera);
}

function touchEnd(event) {
	if (movingMobile)
		return;
	
	mouse.x = (event.changedTouches[0].clientX / window.innerWidth) * 2 - 1;
	mouse.y = -(event.changedTouches[0].clientY / window.innerHeight) * 2 + 1;
	
	raycaster.setFromCamera(mouse, camera);
	
	let intersects = raycaster.intersectObjects(scene.children);
	if (!won && intersects.length != 0 && intersects[0].object.name === "piece")
		makeMove(intersects[0].object);

	renderer.render(scene, camera);
}


function setUp() {
	makeScene();
	makeGrid(-3);
	makeGrid(-1);
	makeGrid(1);
	makeGrid(3);

	light();
}

function makeScene() {
	scene = new THREE.Scene();
	raycaster = new THREE.Raycaster();
	mouse = new THREE.Vector2();
	
	WIDTH = window.innerWidth;
	HEIGHT = window.innerHeight;
	
	camera = new THREE.PerspectiveCamera(
		75,
		WIDTH / HEIGHT,
		0.1,
		1000
	);
	camera.position.z = 10;

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setClearColor("#e5e5e5");

	renderer.setSize(WIDTH, HEIGHT);

	document.getElementById('threeContainer').appendChild(renderer.domElement);

	controls = new THREE.OrbitControls(camera, renderer.domElement);
}

function light() {
	var light = new THREE.HemisphereLight(0xFFFFFF, 1);
	light.position.set(5, 20, 2);
	scene.add(light);
	
	renderer.render(scene, camera);
}

function makeGrid(h) {
	let geo = new THREE.BoxGeometry(0.04, 0.04, 4.04);
	let mat = new THREE.MeshPhongMaterial({ color: 0xfafeff, refractionRatio: 0.8, transparent: true, opacity: 0.5, depthWrite: false });
	let m;

	for (let i = -2; i <= 2; i++) {
		m = new THREE.Mesh(geo, mat);
		m.position.y = h;
		m.position.x = i;
		scene.add(m);
		for (let a = -1; a <= 2; a++) {
			if (i == -2)
				continue;
			let cyl = new THREE.CylinderGeometry(0.485, 0.485, 0.02, 40);
			let cylMat = new THREE.MeshPhongMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0, depthWrite: false });
			m = new THREE.Mesh(cyl, cylMat);
			m.position.y = h;
			m.position.x = Math.sign(i) * Math.abs(i)-0.5;
			m.position.z = Math.sign(a) * Math.abs(a)-0.5;
			m.name = "piece";
			scene.add(m);
		}
	}
	for (let i = -2; i <= 2; i++) {
		m = new THREE.Mesh(geo, mat);
		m.rotation.y = Math.PI / 2;
		m.position.y = h;
		m.position.z = i;
		scene.add(m);
	}

	geo = new THREE.BoxGeometry(4.04, 0.01, 4.04);
	m = new THREE.Mesh(geo, mat);
	m.position.y = h - 0.02;
	scene.add(m);

	renderer.render(scene, camera);
}

var render = function () {
	requestAnimationFrame(render);

	renderer.render(scene, camera);
}

function makeMove(object) {
	let z = (object.position.y + 3)/2;
	let row = object.position.z + 1.5;
	let col = object.position.x + 1.5;
	
	if (board[z][row][col] == 0) {
		if (player) {
			board[z][row][col] = 1;
			object.material.color.setHex("0x8B0000");
			
			let stat = document.getElementById('status');
			stat.innerHTML = "<b>Yellow's move.</b>";
			stat.classList.add("alert-warning");
			stat.classList.remove("alert-danger");
			
			checkWin(1);
		} else {
			board[z][row][col] = 2;
			object.material.color.setHex("0xFFCC00");
			
			let stat = document.getElementById('status');
			stat.innerHTML = "<b>Red's move.</b>";
			stat.classList.add("alert-danger");
			stat.classList.remove("alert-warning");
			
			checkWin(2);
		}
		player = !player;
		object.material.opacity = 1;
	}
}

function win(player) {
	let stat = document.getElementById('status');
	if (player == 1) {
		stat.innerHTML = "<b>Red Won!</b>";
		stat.classList.add("alert-danger");
		stat.classList.remove("alert-warning");
	}else {
		stat.innerHTML = "<b>Yellow Won!</b>";
		stat.classList.add("alert-warning");
		stat.classList.remove("alert-danger")
	}
	won = true;
	
	confetti.start(3000);
}

function checkWin(player) {
	for (let z = 0; z < board.length; z++) {
		if (checkCol(board[z], player) || checkRow(board[z], player) || checkDiag1(board[z], player) || checkDiag2(board[z], player)) {
			win(player);
		}
	}
	
	for (let col = 0; col < board.length; col++) {
		let board2D = [board[0][col], board[1][col], board[2][col], board[3][col]];
		if (checkCol(board2D, player) || checkRow(board2D, player) || checkDiag1(board2D, player) || checkDiag2(board2D, player)) {
			win(player);
		}
	}
	
	for (let row = 0; row < board.length; row++) {
		let board2D = [];
		for (let z = 0; z < board.length; z++) {
			board2D.push([board[z][0][row], board[z][1][row], board[z][2][row], board[z][3][row]]);
		}
		if (checkCol(board2D, player) || checkRow(board2D, player) || checkDiag1(board2D, player) || checkDiag2(board2D, player)) {
			win(player);
		}
	}
	
	if (check3Ddiag1(player) || check3Ddiag2(player) || check3Ddiag3(player) || check3Ddiag4(player)) {
		win(player);
	}
}	

function checkCol(board2D, player) {
	for (let row = 0; row < board2D.length; row++) {
		let col;
		for (col = 0; col < board2D.length; col++) {
			if (board2D[row][col] != player)
				break;
		}
		if (col == board2D.length)
			return true;
	}
	
	return false;
}

function checkRow(board2D, player) {
	for (let col = 0; col < board2D.length; col++) {
		let row;
		for (row = 0; row < board2D.length; row++) {
			if (board2D[row][col] != player)
				break;
		}
		if (row == board2D.length)
			return true;
	}
	
	return false;
}

function checkDiag1(board2D, player) {
	for (let i = 0; i < board2D.length; i++) {
		if (board2D[i][i] != player)
			return false;
	}
	return true;
}

function checkDiag2(board2D, player) {
	for (let i = 0; i < board2D.length; i++) {
		if (board2D[board.length-1-i][i] != player)
			return false;
	}
	return true;
}

function check3Ddiag1(player) {
	for (let i = 0; i < board.length; i++) {
		if (board[i][i][i] != player)
			return false;
	}
	return true;
}

function check3Ddiag2(player) {
	for (let i = 0; i < board.length; i++) {
		if (board[board.length-1-i][i][i] != player)
			return false;
	}
	return true;
}

function check3Ddiag3(player) {
	for (let i = 0; i < board.length; i++) {
		if (board[i][board.length-1-i][i] != player)
			return false;
	}
	return true;
}

function check3Ddiag4(player) {
	for (let i = 0; i < board.length; i++) {
		if (board[board.length-1-i][board.length-1-i][i] != player)
			return false;
	}
	return true;
}

render();

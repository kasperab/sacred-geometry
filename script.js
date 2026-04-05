const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const clearButton = document.getElementById("clearButton");
const pngButton = document.getElementById("pngButton");

const center = { x: canvas.width / 2, y: canvas.height / 2 };
const radius = canvas.width / 2;
const drawWidth = 8;
const borderWidth = 4;
const black = "black";
const white = "white";
let canDraw = true;
let drawing = false;
let paths;
let mirrorPaths;
const pathCount = 5;
const frameCount = 100;
const frameTime = 20;
let frame;
let intervalID;

context.strokeStyle = white;
context.fillStyle = black;
clearButton.disabled = canDraw;
pngButton.disabled = canDraw;

canvas.addEventListener("mousedown", event => {
	if (event.button === 0) {
		startDrawing(getPosition(event));
	}
});
canvas.addEventListener("touchstart", event => {
	startDrawing(getPosition(event.touches[0]));
});

document.addEventListener("mouseup", () => {
	if (drawing) {
		stopDrawing();
	}
});
document.addEventListener("touchend", () => {
	if (drawing) {
		stopDrawing();
	}
});

canvas.addEventListener("mousemove", event => {
	if (drawing) {
		draw(getPosition(event));
	}
});
canvas.addEventListener("touchmove", event => {
	if (drawing) {
		event.preventDefault();
		event.stopPropagation();
		draw(getPosition(event.touches[0]));
	}
});

drawBorder();

function startDrawing(position) {
	if (!canDraw || !inCircle(position)) {
		return;
	}
	drawing = true;
	context.lineWidth = drawWidth;
	paths = [];
	mirrorPaths = [];
	for (let index = 0; index < pathCount * frameCount; index++) {
		const rotatedPosition = getRotatedPosition(position, index);
		paths.push(new Path2D());
		paths[index].moveTo(rotatedPosition.x, rotatedPosition.y);
		mirrorPaths.push(new Path2D());
		mirrorPaths[index].moveTo(getFlippedX(rotatedPosition.x), rotatedPosition.y);
	}
}

function stopDrawing() {
	canDraw = false;
	drawing = false;
	clearButton.disabled = false;
	pngButton.disabled = false;
	frame = 0;
	intervalID = setInterval(nextFrame, frameTime);
	reDraw();
}

function drawBorder() {
	context.clearRect(0, 0, canvas.width, canvas.height);
	context.lineWidth = borderWidth;
	context.beginPath();
	context.arc(center.x, center.y, radius - borderWidth / 2, 0, Math.PI * 2);
	context.moveTo(center.x, center.y);
	context.arc(center.x, center.y, borderWidth / 2, 0, Math.PI * 2);
	context.stroke();
}

function draw(position) {
	if (!inCircle(position)) {
		return;
	}
	for (let index = 0; index < paths.length; index++) {
		const rotatedPosition = getRotatedPosition(position, index);
		paths[index].lineTo(rotatedPosition.x, rotatedPosition.y);
		mirrorPaths[index].lineTo(getFlippedX(rotatedPosition.x), rotatedPosition.y);
	}
	for (let index = 0; index < paths.length; index += frameCount) {
		context.stroke(paths[index]);
		context.stroke(mirrorPaths[index]);
	}
}

function nextFrame() {
	frame++;
	if (frame >= frameCount) {
		frame = 0;
	}
	reDraw();
}

function reDraw() {
	context.clearRect(0, 0, canvas.width, canvas.height);
	context.lineWidth = drawWidth;
	for (let index = frame; index < paths.length; index += frameCount) {
		context.stroke(paths[index]);
		context.stroke(mirrorPaths[index]);
	}
}

function getPosition(event) {
	const scale = canvas.width / canvas.clientWidth;
	const x = (event.clientX - canvas.offsetLeft + window.scrollX) * scale;
	const y = (event.clientY - canvas.offsetTop + window.scrollY) * scale;
	return { x, y };
}

function getRotatedPosition(position, index) {
	const rotation = Math.PI * 2 / (pathCount * frameCount) * index;
	const cos = Math.cos(rotation);
	const sin = Math.sin(rotation);
	const ox = position.x - center.x;
	const oy = position.y - center.y;
	const x = ox * cos - oy * sin + center.x;
	const y = oy * cos + ox * sin + center.y;
	return { x, y };
}

function getFlippedX(x) {
	return canvas.width - x;
}

function inCircle(position) {
	return Math.sqrt(Math.pow(center.x - position.x, 2) + Math.pow(center.y - position.y, 2)) < radius;
}

function toggleColors() {
	if (document.body.className === "dark") {
		document.body.className = "light";
		context.strokeStyle = black;
		context.fillStyle = white;
	} else {
		document.body.className = "dark";
		context.strokeStyle = white;
		context.fillStyle = black;
	}
	if (canDraw) {
		drawBorder();
	} else {
		reDraw();
	}
}

function clearDrawing() {
	canDraw = true;
	clearButton.disabled = true;
	pngButton.disabled = true;
	clearInterval(intervalID);
	drawBorder();
}

function savePNG() {
	context.fillRect(0, 0, canvas.width, canvas.height);
	for (let index = 0; index < paths.length; index += frameCount) {
		context.stroke(paths[index]);
		context.stroke(mirrorPaths[index]);
	}
	const link = document.createElement("a");
	link.href = canvas.toDataURL();
	link.download = "image.png";
	link.click();
}

const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const clearButton = document.getElementById("clearButton");

const center = { x: canvas.width / 2, y: canvas.height / 2 };
const radius = canvas.width / 2;
const drawWidth = 8;
let color = "white";
const borderWidth = 4;
let canDraw = true;
let drawing = false;
let paths;
let mirrorPaths;
const pathCount = 5;

canvas.addEventListener("mousedown", event => {
	startDrawing(getPosition(event));
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
	for (let index = 0; index < pathCount; index++) {
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
	reDraw();
}

function drawBorder() {
	context.clearRect(0, 0, canvas.width, canvas.height);
	context.strokeStyle = color;
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
	for (let index = 0; index < pathCount; index++) {
		const rotatedPosition = getRotatedPosition(position, index);
		paths[index].lineTo(rotatedPosition.x, rotatedPosition.y);
		context.stroke(paths[index]);
		mirrorPaths[index].lineTo(getFlippedX(rotatedPosition.x), rotatedPosition.y);
		context.stroke(mirrorPaths[index]);
	}
}

function reDraw() {
	context.clearRect(0, 0, canvas.width, canvas.height);
	context.strokeStyle = color;
	context.lineWidth = drawWidth;
	for (let index = 0; index < paths.length; index++) {
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
	const rotation = Math.PI * 2 / pathCount * index;
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
		color = "black";
	} else {
		document.body.className = "dark";
		color = "white";
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
	drawBorder();
}

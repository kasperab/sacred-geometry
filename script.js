const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const clearButton = document.getElementById("clearButton");
const pngButton = document.getElementById("pngButton");
const gifButton = document.getElementById("gifButton");
const printButton = document.getElementById("printButton");
const printImage = document.getElementById("printImage");

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
const frameCount = 50;
const frameTime = 40;
let frame;
let intervalID;

context.strokeStyle = white;
context.fillStyle = black;
clearButton.disabled = canDraw;
pngButton.disabled = canDraw;
gifButton.disabled = canDraw;
printButton.disabled = canDraw;

printImage.setAttribute("width", canvas.width);
printImage.setAttribute("height", canvas.height);
const printPaths = [];
for (let index = 0; index < pathCount * 2; index++) {
	printPaths.push(document.createElementNS("http://www.w3.org/2000/svg", "path"));
	printPaths[index].setAttribute("stroke", black);
	printPaths[index].setAttribute("stroke-width", drawWidth);
	printPaths[index].setAttribute("fill", "none");
	printImage.appendChild(printPaths[index]);
}

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
		const flippedX = getFlippedX(rotatedPosition.x);
		mirrorPaths[index].moveTo(flippedX, rotatedPosition.y);
		if (index % frameCount === 0) {
			const printIndex = Math.floor(index / frameCount);
			printPaths[printIndex].setAttribute("d", "M " + rotatedPosition.x + " " + rotatedPosition.y);
			printPaths[printIndex + pathCount].setAttribute("d", "M " + flippedX + " " + rotatedPosition.y);
		}
	}
}

function stopDrawing() {
	canDraw = false;
	drawing = false;
	clearButton.disabled = false;
	pngButton.disabled = false;
	gifButton.disabled = false;
	printButton.disabled = false;
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
		const flippedX = getFlippedX(rotatedPosition.x);
		mirrorPaths[index].lineTo(flippedX, rotatedPosition.y);
		if (index % frameCount === 0) {
			const printIndex = Math.floor(index / frameCount);
			let d = printPaths[printIndex].attributes.d.value;
			printPaths[printIndex].setAttribute("d", d + "L " + rotatedPosition.x + " " + rotatedPosition.y);
			d = printPaths[printIndex + pathCount].attributes.d.value;
			printPaths[printIndex + pathCount].setAttribute("d", d + "L " + flippedX + " " + rotatedPosition.y);
		}
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
	gifButton.disabled = true;
	printButton.disabled = true;
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
	link.download = "mandala.png";
	link.click();
}

function saveGIF() {
	gifButton.disabled = true;
	const gif = new GIF({
		width: canvas.width,
		height: canvas.height
	});
	for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
		context.fillRect(0, 0, canvas.width, canvas.height);
		for (let pathIndex = frameIndex; pathIndex < paths.length; pathIndex += frameCount) {
			context.stroke(paths[pathIndex]);
			context.stroke(mirrorPaths[pathIndex]);
		}
		gif.addFrame(context, {copy:true, delay: frameTime});
	}
	gif.on("finished", blob => {
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = "mandala.gif";
		link.click();
		URL.revokeObjectURL(url);
		gifButton.disabled = false;
	});
	gif.render();
}

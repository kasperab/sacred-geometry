const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

const center = { x: canvas.width / 2, y: canvas.height / 2 };
const radius = canvas.width / 2;
const drawWidth = 8;
const borderWidth = 4;
let drawing = false;

canvas.addEventListener("mousedown", event => {
	startDrawing(getPosition(event));
});
canvas.addEventListener("touchstart", event => {
	startDrawing(getPosition(event.touches[0]));
});

document.addEventListener("mouseup", () => drawing = false);
document.addEventListener("touchend", () => drawing = false);

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
	if (!inCircle(position)) {
		return;
	}
	drawing = true;
	context.clearRect(0, 0, canvas.width, canvas.height);
	drawBorder();
	context.lineWidth = drawWidth;
	context.beginPath();
	context.moveTo(position.x, position.y);
}

function drawBorder() {
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
	context.lineTo(position.x, position.y);
	context.stroke();
}

function getPosition(event) {
	const scale = canvas.width / canvas.clientWidth;
	const x = (event.clientX - canvas.offsetLeft) * scale;
	const y = (event.clientY - canvas.offsetTop) * scale;
	return { x, y };
}

function inCircle(position) {
	return Math.sqrt(Math.pow(center.x - position.x, 2) + Math.pow(center.y - position.y, 2)) < radius;
}
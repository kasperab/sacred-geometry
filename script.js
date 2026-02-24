const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
let drawing = false;
context.lineWidth = 8;

canvas.addEventListener("mousedown", event => {
	startDrawing(getPosition(event));
});
canvas.addEventListener("touchstart", event => {
	startDrawing(getPosition(event.touches[0]));
});

canvas.addEventListener("mouseup", () => drawing = false);
canvas.addEventListener("touchend", () => drawing = false);

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

function startDrawing(position) {
	drawing = true;
	context.beginPath();
	context.moveTo(position.x, position.y);
	context.clearRect(0, 0, canvas.width, canvas.height);
}

function draw(position) {
	context.lineTo(position.x, position.y);
	context.stroke();
}

function getPosition(event) {
	const scale = canvas.width / canvas.clientWidth;
	const x = (event.clientX - canvas.offsetLeft) * scale;
	const y = (event.clientY - canvas.offsetTop) * scale;
	return {x, y};
}
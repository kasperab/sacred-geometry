const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
let drawing = false;

canvas.addEventListener("mousedown", event => {
	drawing = true;
	context.beginPath();
	const position = getPosition(event.clientX, event.clientY);
	context.moveTo(position.x, position.y);
	context.clearRect(0, 0, canvas.width, canvas.height);
});

canvas.addEventListener("mouseup", () => drawing = false);

canvas.addEventListener("mousemove", event => {
	if (drawing) {
		const position = getPosition(event.clientX, event.clientY);
		context.lineTo(position.x, position.y);
		context.stroke();
	}
});

function getPosition(inX, inY) {
	const scale = canvas.width / canvas.clientWidth;
	const x = (inX - canvas.offsetLeft) * scale;
	const y = (inY - canvas.offsetTop) * scale;
	return {x, y};
}
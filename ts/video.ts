document.addEventListener("DOMContentLoaded", () => {
	var inputFile: HTMLElement = document.getElementById("fileInput") as HTMLElement;
	inputFile.addEventListener("change", () => {
		console.log("Salut");
	});
});

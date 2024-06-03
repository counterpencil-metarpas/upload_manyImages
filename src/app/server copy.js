const http = require("http");
const fs = require("fs");
const path = require("path");

const uploadDirectory = "/Users/harampark/imagetest";

const setCorsHeaders = (res) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
	res.setHeader("Access-Control-Allow-Headers", "Content-Type");
};

const server = http.createServer((req, res) => {
	setCorsHeaders(res);

	if (req.method === "POST" && req.url === "/uploads") {
		const chunks = [];

		req.on("data", (chunk) => {
			chunks.push(chunk);
		});

		req.on("end", () => {
			const data = Buffer.concat(chunks);
			const boundary = `--${req.headers["content-type"].split("boundary=")[1]}`;
			const parts = data.toString("binary").split(boundary);

			parts.forEach((part) => {
				if (part.indexOf("Content-Disposition: form-data") !== -1) {
					const contentDisposition = part.substring(0, part.indexOf("\r\n\r\n"));
					let filenameMatch = contentDisposition.match(/filename\*?="?(.+)"?/);
					let filename = "";

					if (filenameMatch && filenameMatch[1]) {
						filename = filenameMatch[1].trim().split(";")[0];
						filename = Buffer.from(filename, "latin1").toString("utf8").slice(0, -1);
					}

					if (filename) {
						const start = part.indexOf("\r\n\r\n") + 4;
						const end = part.lastIndexOf("\r\n");
						const fileData = part.substring(start, end);

						if (!fs.existsSync(uploadDirectory)) {
							fs.mkdirSync(uploadDirectory, { recursive: true });
						}
						const filePath = path.join(uploadDirectory, filename);
						fs.writeFileSync(filePath, Buffer.from(fileData, "binary"));
					}
				}
			});

			res.writeHead(200, { "Content-Type": "application/json" });
			res.end(JSON.stringify({ message: "Files uploaded successfully" }));
		});
	} else {
		res.writeHead(404, { "Content-Type": "application/json" });
		res.end(JSON.stringify({ message: "Route not found" }));
	}
});

const PORT = 8888;
server.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}/uploads`);
});

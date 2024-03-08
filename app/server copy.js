const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

// 업로드 디렉터리 설정
const uploadDirectory = "/Users/harampark/imagetest";
fs.promises.mkdir(uploadDirectory, { recursive: true }).catch(console.error);

// multer 설정
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, uploadDirectory);
	},
	filename: (req, file, cb) => {
		cb(null, path.extname(file.originalname));
	},
});

const upload = multer({ storage: storage });

const app = express();

// CORS 설정
app.use(cors());

// 파일 업로드 라우트
app.post("/upload", upload.array("files", 10), (req, res) => {
	try {
		// req.files는 업로드된 파일 정보의 배열
		console.log(req.files);
		res.send({ message: "파일이 성공적으로 업로드 되었습니다.", files: req.files });
	} catch (error) {
		console.error(error);
		res.status(500).send({ message: "파일 업로드 중 에러가 발생했습니다." });
	}
});

const PORT = process.env.PORT || 8888;
app.listen(PORT, () => {
	console.log(`서버가 http://localhost:${PORT} 에서 실행중입니다.`);
});

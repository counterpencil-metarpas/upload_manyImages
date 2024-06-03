const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
// Set The Storage Engine
const storage = multer.diskStorage({
	destination: "/Users/harampark/imagetest",
	filename: function (req, file, cb) {
		cb(null, Buffer.from(file.originalname, "latin1").toString("utf8"));
	},
});
let errorFiles = [];

// Init Upload
const upload = multer({
	storage: storage,
	limits: { fileSize: 1000000 },
	fileFilter: function (req, file, cb) {
		checkFileType(file, cb);
	},
	filename: function (req, file, cb) {
		cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
	},
}).array("userfile", 100000);

// Check File Type
function checkFileType(file, cb) {
	// Allowed ext
	console.log("File:", file);
	const filetypes = /jpeg|jpg|png|gif/;
	// Check ext
	const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
	// Check mime
	const mimetype = filetypes.test(file.mimetype);
	if (mimetype && extname) {
		return cb(null, true);
	} else {
		errorFiles.push(Buffer.from(file.originalname, "latin1").toString("utf8")); // 오류 파일 이름 추가
		cb(null, false); // 파일 업로드 거부
		//cb("Error: Images Only!");
	}
}
// Init app
const app = express();

// Public Folder
app.use(cors());

app.post("/uploads", (req, res) => {
	upload(req, res, function (err) {
		if (err instanceof multer.MulterError) {
			// Multer에서 발생한 에러 처리

			return res.status(500).send({ message: "업로드 중 에러 발생", error: err.message + "/" + err.code + "/" + err.field + "/" + err.name, files: errorFiles });
		} else if (err) {
			// 그 외 에러 처리
			return res.status(500).send({ message: "알 수 없는 에러 발생", error: err.message + "/" + err.code + "/" + err.field + "/" + err.name, files: errorFiles });
		}

		if (errorFiles.length > 0) {
			// 실패한 파일이 있다면
			return res.status(500).send({ message: "일부 파일 업로드 실패 에러", files: errorFiles });
		}

		// 모든 파일이 성공적으로 업로드됐다고 가정
		res.send({ message: "모든 파일이 성공적으로 업로드됐습니다.", filename: Buffer.from(req.files[0].originalname, "latin1").toString("utf8") });
	});
});

const port = 8888;

app.listen(port, () => console.log(`Server started on port ${port}`));

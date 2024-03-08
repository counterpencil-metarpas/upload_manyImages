"use client";
import React, { useState, ChangeEvent } from "react";

/**
 * 다량의 이미지 업로드 처리
 * chunk: 업로드 묶음 단위
 * CHUNK_SIZE: 한 번에 업로드할 chunk의 크기 -> 1개이면 비동기 단일 post, 여러개이면 개수만큼 묶어서 post
 * MAX_UPLOAD_CHUNK_NUMBER: 동시에 업로드할 최대 chunk 수
 * @returns
 */
const FileUploader: React.FC = () => {
	const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

	const CHUNK_SIZE = 5;
	const MAX_UPLOAD_CHUNK_NUMBER = 10;
	let concurrentUploads = 0;
	let startIndex = 0;
	const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
		if (event.target.files) {
			setSelectedFiles(Array.from(event.target.files));
		}
	};

	const uploadChunk = async (chunk: File[] | File) => {
		const formData = new FormData();
		//chunk가 배열이면 여러 파일 업로드, 아니면 단일 파일 업로드
		console.log("chunk", chunk);
		if (Array.isArray(chunk)) {
			chunk.forEach((file) => formData.append("files", file));
		} else formData.append("files", chunk);

		try {
			const response = await fetch("http://localhost:8888/upload", {
				method: "POST",
				body: formData,
				headers: {
					"Content-Type": "multipart/form-data; charset=utf-8",
				},
			});

			if (!response.ok) {
				throw new Error("서버에서 오류가 발생했습니다.");
			}
			// 업로드 성공 시 처리, 예를 들어 상태 업데이트 또는 사용자에게 알림
			console.log("업로드 성공:", chunk);
		} catch (error) {
			console.error("업로드 실패:", error);
		}
	};

	const uploadInChunks = async (files: File[]) => {
		const nextIndex = startIndex + CHUNK_SIZE;
		const chunk = files.slice(startIndex, nextIndex);
		if (startIndex > files.length) return;

		concurrentUploads++;
		console.log("uploadInChunks", chunk, startIndex, nextIndex, concurrentUploads);
		startIndex += CHUNK_SIZE;
		uploadChunk(chunk)
			.then(() => {
				concurrentUploads--;
				if (concurrentUploads < MAX_UPLOAD_CHUNK_NUMBER) {
					uploadInChunks(files);
				}
			})
			.catch((error) => {
				console.error("Chunk upload error:", error);
			});
	};

	const handleUpload = () => {
		if (selectedFiles.length === 0) {
			alert("파일을 선택해주세요.");
			return;
		}
		uploadInChunks(selectedFiles);
	};

	return (
		<div>
			<input type="file" multiple onChange={handleFileChange} />
			<button onClick={handleUpload}>업로드</button>
		</div>
	);
};

export default FileUploader;

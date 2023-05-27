import { Injectable, OnModuleInit } from '@nestjs/common';
import {	writeFile as fsWriteFile,
			existsSync as fsExistsSync,
			mkdirSync as fsMkdirSync } from 'fs';

@Injectable()
export class UploadImgService implements OnModuleInit {
	private path = './img/user_img';

	// constructor () {}

	onModuleInit() {
		console.log("UploadImgService starting ...");
		this.mkdirPath();
	}
	
	private mkdirPath() {
		if (!fsExistsSync(this.path)) {
			fsMkdirSync(this.path, { recursive: true });
		}
	}
	
	private getExtension(extension: string) {
		return (extension.substring(extension.indexOf('/') + 1));
	}

	uploadImg(intra: string, image: any) {
		this.mkdirPath();
		const file_name = `${intra}.${this.getExtension(image['ext'])}`;

		let success = false;
		fsWriteFile(`${this.path}/${file_name}`, image['file'], (err) => {
			if (err) {
				console.error('Error saving file: ', err);
			}
			else {
				console.log('File saved successfully.');
				success = true;
			}
		});

		return (success ? file_name : undefined);
	}

}

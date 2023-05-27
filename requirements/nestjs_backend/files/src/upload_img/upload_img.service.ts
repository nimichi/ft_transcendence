import { Injectable, OnModuleInit } from '@nestjs/common';
import {	writeFile as fsWriteFile,
			existsSync as fsExistsSync,
			mkdirSync as fsMkdirSync } from 'fs';
import { HttpService } from '@nestjs/axios';
import { Buffer } from 'buffer'
import { throwError, map, catchError, lastValueFrom } from 'rxjs'

@Injectable()
export class UploadImgService implements OnModuleInit {
	private path = './img/user_img';

	constructor(private httpService: HttpService) {}

	onModuleInit() {
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

	async downloadPicture(intra: string, url: string) {
		const image_data = await this.fetchPictureFromURL(url);
		const file_name = this.uploadImg(intra, image_data);
		console.log("File name:", file_name);
	}
	
	private async fetchPictureFromURL(url: string) {
		try {
			const response = await lastValueFrom(
				this.httpService.get(url, { responseType: 'arraybuffer' }).pipe(
					catchError(() => throwError(() => new Error('Error downloading image.')))
				)
			);
			const headers = response.headers;
			var obj = {
				'file': response.data,
				'ext': response.headers['content-type']
			};
		} catch (error) {
			console.error('Error:', error.message);
			throw error;
		}
		return obj;
	}
}

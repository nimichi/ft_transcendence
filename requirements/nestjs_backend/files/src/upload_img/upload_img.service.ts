import { Injectable, OnModuleInit } from '@nestjs/common';
import { writeFile as fsWriteFile,
		 readFile as fsReadFile,
		 readFileSync as fsReadFileSync,
		 existsSync as fsExistsSync,
		 mkdirSync as fsMkdirSync,
		 promises as fsPromises } from 'fs';
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

	async uploadImg(intra: string, image: any) {
		this.mkdirPath();
		const file_name = `${intra}.${this.getExtension(image['ext'])}`;
		const full_path = `${this.path}/${file_name}`;
		try {
		  await fsPromises.writeFile(full_path, image['file']);
		  console.log('File saved successfully.');
		  return (full_path);
		} catch (err) {
		  console.error('Error saving file:', err);
		  return (undefined);
		}
	}

	fetchImgAsDataURL(file_name: string) {
		const img = fsReadFileSync(file_name);
		const ext = file_name.substring(file_name.lastIndexOf('.') + 1);
		const base64Data = img.toString('base64');
		const dataURL = `data:${ext};base64,${base64Data}`;

		return (dataURL);
	}

	async downloadPicture(intra: string, url: string) {
		const image_data = await this.fetchPictureFromURL(url);
		const file_name = this.uploadImg(intra, image_data);
		console.log("File name:", file_name);
		return (file_name);
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
			throw (error);
		}
		return (obj);
	}
}

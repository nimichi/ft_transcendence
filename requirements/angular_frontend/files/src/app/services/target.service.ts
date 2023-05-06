import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TargetService {
	private target = "";
	constructor() { }

	setTarget(target: string){
		this.target = target;
	}

	getTarget(): string{
		return this.target;
	}
}

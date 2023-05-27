export class DirectFrindsDTO {
	constructor (
		friendName1: string,
		friendName2: string, 
	) {
		this.friendName1 = friendName1;
		this.friendName2 = friendName2;
	}

	friendName1: string;
	friendName2: string;
}

import ProcessKeyboardProcess from "./ProcessKeyboardProcess";

class InsertParagraph extends ProcessKeyboardProcess {
	public 	process(range:Range, repeat:boolean, repeatCount:number): void {
		this.formatAfterNewParagraph(range);
	}
}

export default InsertParagraph
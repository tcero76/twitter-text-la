
import ProcessKeyboardProcess from "./ProcessKeyboardProcess";

class InsertParagraph extends ProcessKeyboardProcess {
	public 	process(range:Range): void {
		this.formatAfterNewParagraph(range);
	}
}

export default InsertParagraph
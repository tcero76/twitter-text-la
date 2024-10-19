
import ProcessKeyboard from "../interfaces/ProcessKeyboard";

class InsertParagraph extends ProcessKeyboard {
	public 	process(range:Range): void {
		this.formatAfterNewParagraph(range);
	}
}

export default InsertParagraph
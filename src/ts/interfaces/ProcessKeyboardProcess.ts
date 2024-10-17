import ProcessKeyboard from './ProcessKeyboard'

abstract class ProcessKeyboardProcess extends ProcessKeyboard {

    constructor(pattern:RegExp, highlightClassName:string) {
		super(pattern, highlightClassName)
	}

	abstract process(range:Range): void;
}

export default ProcessKeyboardProcess
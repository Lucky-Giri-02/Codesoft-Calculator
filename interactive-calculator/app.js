class Calculator {
    constructor() {
        this.currentInput = '0';
        this.previousInput = '';
        this.operator = null;
        this.waitingForOperand = false;
        this.justCalculated = false;
        
        this.primaryDisplay = document.getElementById('primary-display');
        this.secondaryDisplay = document.getElementById('secondary-display');
        
        this.handleButtonClick = this.handleButtonClick.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        
        this.initializeEventListeners();
        this.updateDisplay();
    }
    
    initializeEventListeners() {
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(button => {
            button.addEventListener('click', this.handleButtonClick);
        });
        document.addEventListener('keydown', this.handleKeyPress);
    }
    
    handleButtonClick(event) {
        const button = event.target;
        const value = button.dataset.value;
        const type = button.dataset.type;
        
        console.log('Button clicked:', value, type); 

        this.addClickAnimation(button);
        
        switch (type) {
            case 'number':
                this.inputNumber(value);
                break;
            case 'operator':
                this.inputOperator(value);
                break;
            case 'decimal':
                this.inputDecimal();
                break;
            case 'equals':
                this.calculate();
                break;
            case 'clear':
                if (value === 'AC') {
                    this.allClear();
                } else {
                    this.clear();
                }
                break;
            case 'backspace':
                this.backspace();
                break;
            case 'function':
                if (value === '±') {
                    this.toggleSign();
                }
                break;
        }
    }
    
    handleKeyPress(event) {
        const key = event.key;
        
        if (key >= '0' && key <= '9') {
            this.inputNumber(key);
        } else if (key === '.') {
            this.inputDecimal();
        } else if (['+', '-'].includes(key)) {
            this.inputOperator(key);
        } else if (key === '*') {
            this.inputOperator('×');
        } else if (key === '/') {
            event.preventDefault();
            this.inputOperator('÷');
        } else if (key === 'Enter' || key === '=') {
            this.calculate();
        } else if (key === 'Escape') {
            this.allClear();
        } else if (key === 'Backspace') {
            this.backspace();
        }
    }
    
    addClickAnimation(button) {
        button.classList.add('clicked');
        setTimeout(() => {
            button.classList.remove('clicked');
        }, 200);
    }
    
    inputNumber(num) {
        console.log('Input number:', num);
        
        if (this.waitingForOperand) {
            this.currentInput = num;
            this.waitingForOperand = false;
        } else if (this.justCalculated) {
            this.currentInput = num;
            this.justCalculated = false;
            this.clearSecondaryDisplay();
        } else {
            this.currentInput = this.currentInput === '0' ? num : this.currentInput + num;
        }
        
        this.updateDisplay();
    }
    
    inputOperator(nextOperator) {
        console.log('Input operator:', nextOperator); 
        
        const inputValue = parseFloat(this.currentInput);
        
        if (this.previousInput === '') {
            this.previousInput = inputValue;
        } else if (this.operator) {
            const currentValue = this.previousInput || 0;
            const newValue = this.performCalculation(currentValue, inputValue, this.operator);
            
            if (newValue === null) return; // Error occurred
            
            this.currentInput = String(newValue);
            this.previousInput = newValue;
        }
        
        this.waitingForOperand = true;
        this.operator = nextOperator;
        this.justCalculated = false;
        
        this.updateSecondaryDisplay();
        this.updateDisplay();
        this.highlightOperator(nextOperator);
    }
    
    inputDecimal() {
        console.log('Input decimal'); 
        
        if (this.waitingForOperand) {
            this.currentInput = '0.';
            this.waitingForOperand = false;
        } else if (this.justCalculated) {
            this.currentInput = '0.';
            this.justCalculated = false;
            this.clearSecondaryDisplay();
        } else if (this.currentInput.indexOf('.') === -1) {
            this.currentInput += '.';
        }
        
        this.updateDisplay();
    }
    
    calculate() {
        console.log('Calculate'); 
        
        if (this.operator && this.previousInput !== '' && !this.waitingForOperand) {
            const prev = parseFloat(this.previousInput);
            const current = parseFloat(this.currentInput);
            const result = this.performCalculation(prev, current, this.operator);
            
            if (result === null) return; 
            
            this.currentInput = String(result);
            this.updateSecondaryDisplay(`${this.previousInput} ${this.operator} ${current} =`);
            
            this.previousInput = '';
            this.operator = null;
            this.waitingForOperand = true;
            this.justCalculated = true;
            
            this.updateDisplay();
            this.clearOperatorHighlight();
        }
    }
    
    performCalculation(firstOperand, secondOperand, operator) {
        let result;
        
        switch (operator) {
            case '+':
                result = firstOperand + secondOperand;
                break;
            case '-':
                result = firstOperand - secondOperand;
                break;
            case '×':
                result = firstOperand * secondOperand;
                break;
            case '÷':
                if (secondOperand === 0) {
                    this.showError('Cannot divide by zero');
                    return null;
                }
                result = firstOperand / secondOperand;
                break;
            default:
                return null;
        }
        
        if (result !== Math.floor(result)) {
            result = Math.round((result + Number.EPSILON) * 1000000000000) / 1000000000000;
        }
        
        if (!isFinite(result)) {
            this.showError('Result too large');
            return null;
        }
        
        return result;
    }
    
    clear() {
        console.log('Clear'); 
        this.currentInput = '0';
        this.updateDisplay();
    }
    
    allClear() {
        console.log('All Clear'); 
        this.currentInput = '0';
        this.previousInput = '';
        this.operator = null;
        this.waitingForOperand = false;
        this.justCalculated = false;
        this.clearSecondaryDisplay();
        this.clearOperatorHighlight();
        this.clearError();
        this.updateDisplay();
    }
    
    backspace() {
        console.log('Backspace'); 
        
        if (this.justCalculated) {
            return; 
        }
        
        if (this.currentInput.length > 1) {
            this.currentInput = this.currentInput.slice(0, -1);
        } else {
            this.currentInput = '0';
        }
        
        this.updateDisplay();
    }
    
    toggleSign() {
        console.log('Toggle sign'); // Debug log
        
        if (this.currentInput !== '0') {
            if (this.currentInput.startsWith('-')) {
                this.currentInput = this.currentInput.substring(1);
            } else {
                this.currentInput = '-' + this.currentInput;
            }
            this.updateDisplay();
        }
    }
    
    updateDisplay() {
        let displayValue = this.currentInput;
        
        if (displayValue.length > 12) {
            const num = parseFloat(displayValue);
            if (Math.abs(num) >= 1e12) {
                displayValue = num.toExponential(6);
            } else if (Math.abs(num) < 1e-6 && num !== 0) {
                displayValue = num.toExponential(6);
            } else {
                displayValue = displayValue.substring(0, 12);
            }
        }

        if (!displayValue.includes('.') && !displayValue.includes('e') && displayValue !== '0') {
            const num = parseFloat(displayValue);
            if (Math.abs(num) >= 1000) {
                displayValue = num.toLocaleString();
            }
        }
        
        this.primaryDisplay.textContent = displayValue;
        console.log('Display updated:', displayValue); 
    }
    
    updateSecondaryDisplay(text) {
        if (text) {
            this.secondaryDisplay.textContent = text;
        } else if (this.operator && this.previousInput !== '') {
            this.secondaryDisplay.textContent = `${this.previousInput} ${this.operator}`;
        }
    }
    
    clearSecondaryDisplay() {
        this.secondaryDisplay.textContent = '';
    }
    
    highlightOperator(operator) {

        this.clearOperatorHighlight();
        const operatorButtons = document.querySelectorAll('.btn-operator');
        operatorButtons.forEach(btn => {
            if (btn.dataset.value === operator) {
                btn.classList.add('active');
            }
        });
    }
    
    clearOperatorHighlight() {
        const operatorButtons = document.querySelectorAll('.btn-operator');
        operatorButtons.forEach(btn => {
            btn.classList.remove('active');
        });
    }
    
    showError(message) {
        this.primaryDisplay.textContent = 'Error';
        this.primaryDisplay.classList.add('display-error');
        this.secondaryDisplay.textContent = message;

        setTimeout(() => {
            this.clearError();
            this.allClear();
        }, 2000);
    }
    
    clearError() {
        this.primaryDisplay.classList.remove('display-error');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing calculator'); // Debug log
    const calculator = new Calculator();
    window.calculator = calculator; 
});

document.addEventListener('contextmenu', (e) => {
    if (e.target.classList.contains('btn')) {
        e.preventDefault();
    }
});

window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        window.scrollTo(0, 0);
    }, 100);
});
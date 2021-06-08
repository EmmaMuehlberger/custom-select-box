export default class Select {
    constructor(element) {
        // default select
        this.element = element;
        this.options = getFormattedOptions(element.querySelectorAll("option"));

        // custom select
        this.customElement = document.createElement("div");
        this.labelElement = document.createElement("span");
        this.customOptionsElement = document.createElement("ul");
        setupCustomSelect(this);

        // append custom select to default select element and hide default
        element.after(this.customElement);
        element.style.display = "none";
    }

    get selectedOption() {
        return this.options.find(option => option.selected);
    }

    get selectedOptionIndex() {
        return this.options.indexOf(this.selectedOption);
    }

    selectValue(value) {
        const newSelectedOption = this.options.find(option => {
            return option.value === value;
        });
        const prevSelectedOption = this.selectedOption;
        prevSelectedOption.selected = false;
        prevSelectedOption.element.selected = false;

        newSelectedOption.selected = true;
        newSelectedOption.element.selected = false;

        this.labelElement.innerText = newSelectedOption.label;

        // removing selected class on prev selec option and adding it to the new selec option and scrolling to new option
        this.customOptionsElement.querySelector(`[data-value="${prevSelectedOption.value}"]`).classList.remove("selected");
        const newFocusedElement = this.customOptionsElement.querySelector(`[data-value="${newSelectedOption.value}"]`)
        newFocusedElement.classList.add("selected");
        newFocusedElement.scrollIntoView({ block: "nearest" });
    }
}

function setupCustomSelect(select) {
    //make custom select focusable 
    select.customElement.tabIndex = 0;

    // add classes to custom elements
    select.customElement.classList.add("custom-select-container");
    select.labelElement.classList.add("custom-select-value");
    select.customOptionsElement.classList.add("custom-select-options");

    // create custom options
    select.options.forEach(option => {
        const optionElement = document.createElement("li");
        optionElement.classList.add("custom-select-option");
        optionElement.classList.toggle("selected", option.selected);
        optionElement.innerText = option.label;
        optionElement.dataset.value = option.value;
        optionElement.addEventListener("click", () => {
            // select new option
            select.selectValue(option.value);

            // close optionlist after element was chosen
            select.customOptionsElement.classList.remove("show");
        })

        select.customOptionsElement.append(optionElement);
    })

    // show selected option
    select.labelElement.innerText = select.selectedOption.label;

    // add label element and options element to custom select element
    select.customElement.append(select.labelElement);
    select.customElement.append(select.customOptionsElement);

    // show options when clicking on custom select
    select.labelElement.addEventListener("click", () => {
        select.customOptionsElement.classList.toggle("show");
    })

    // hide options when users clicks outside of select dropdown
    select.customElement.addEventListener("blur", () => {
        select.customOptionsElement.classList.remove("show");
    })

    // search functionality: on key press -> scroll to corresponing items in list
    // we will keep track of time between key presses to clear out search history on long pauses
    // this means: if "c" and "o" are pressed with a long pause in between, it will first search for items starting with "c" and later items starting with "o" rather than "co"
    // if "c" and "o" are pressed in a row, it will search for items starting with "co"
    let debounceTimeout;
    let searchTerm = "";

    // make custom select controllable with keyboard
    select.customElement.addEventListener("keydown", e => {
        switch(e.code) {
            case "Space": 
                select.customOptionsElement.classList.toggle("show");
                break;
            case "ArrowUp":
                const prevOption = select.options[select.selectedOptionIndex - 1];
                if(prevOption) {
                    select.selectValue(prevOption.value);
                }
                break;
            case "ArrowDown":
                const nextOption = select.options[select.selectedOptionIndex + 1];
                if(nextOption) {
                    select.selectValue(nextOption.value);
                }
                break;
            case "Enter":
            case "Escape":
                select.customOptionsElement.classList.remove("show");
                break;
            
            // search listitems on keypress    
            default:
                clearTimeout(debounceTimeout);
                searchTerm += e.key;
                debounceTimeout = setTimeout(() => {
                    searchTerm = "";
                }, 1000) 
                
                const searchedOption = select.options.find(option => {
                    return option.label.toLowerCase().startsWith(searchTerm);
                }); 
                if(searchedOption) {
                    select.selectValue(searchedOption.value);
                }
        }
    })
}

function getFormattedOptions(optionElements) {
    return [...optionElements].map(optionElement => {
        return {
            value: optionElement.value,
            label: optionElement.label,
            selected: optionElement.selected,
            element: optionElement
        };
    });
}
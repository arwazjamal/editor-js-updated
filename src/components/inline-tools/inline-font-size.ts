import $ from '../dom';
import { InlineTool, SanitizerConfig } from '../../../types';

export default class FontSizeInlineTool implements InlineTool {
  public static isInline = true;
  public static title = 'Font Size';
  private isDropDownOpen = false;
  private togglingCallback = null;
  public emptyString = '&nbsp;&nbsp';
  public fontSizeDropDown = 'font-size-dropdown';

  public static get sanitize(): SanitizerConfig {
    return {
      font: {
        size: true,
        face: true
      },
    } as SanitizerConfig;
  }

  public commandName: string = 'fontSize';

  private readonly CSS = {
    button: 'ce-inline-tool',
    buttonActive: 'ce-font-size-tool--active',
    buttonModifier: 'ce-inline-tool--font',

  }

  private selectedFontSize = null;

  private nodes: { button: HTMLButtonElement } = {
    button: undefined
  }

  public selectionList = undefined;

  private buttonWrapperText = undefined;

  make(tagName, classNames = null) {
    const el = document.createElement(tagName);

    if (Array.isArray(classNames)) {
      el.classList.add(...classNames);
    } else if (classNames) {
      el.classList.add(classNames);
    }
    return el;
  }

  createButton() {
    this.nodes.button = this.make('button', [this.CSS.button, this.CSS.buttonModifier]) as HTMLButtonElement;
    this.nodes.button.type = 'button';
    this.nodes.button.setAttribute('id', 'fontSizeBtn');
    this.getFontSizeForButton();
    this.nodes.button.appendChild($.svg('toggler-down', 13, 13));
  }

  getFontSizeForButton() {
    this.buttonWrapperText = this.make('div', 'button-wrapper-text');
    const displaySelectedFontSize = this.make('div');
    displaySelectedFontSize.setAttribute('id', this.fontSizeDropDown)
    displaySelectedFontSize.innerHTML = this.emptyString;
    $.append(this.buttonWrapperText, displaySelectedFontSize);
    $.append(this.nodes.button, this.buttonWrapperText);
  }

  public addFontSizeOptions() {
    const fontSizeList = [
      { label: '10', value: '1' },
      { label: '13', value: '2' },
      { label: '16', value: '3' },
      { label: '18', value: '4' },
      { label: '24', value: '5' },
      { label: '32', value: '6' },
      { label: '48', value: '7' }
    ];
    this.selectionList = this.make('div', 'selectionList');
    const selectionListWrapper = this.make('div', 'selection-list-wrapper');

    for (const fontSize of fontSizeList) {
      const option = this.make('div');
      option.setAttribute('value', fontSize.value);
      option.setAttribute('id', fontSize.value);
      option.classList.add('selection-list-option');
      if ((document.getElementById(this.fontSizeDropDown).innerHTML === fontSize.label) || (this.selectedFontSize === fontSize.value)) {
        option.classList.add('selection-list-option-active');
      }
      option.innerHTML = fontSize.label;
      $.append(selectionListWrapper, option);
    }
    $.append(this.selectionList, selectionListWrapper);
    $.append(this.nodes.button, this.selectionList);
    this.selectionList.addEventListener('click', this.toggleFontSizeSelector);

    setTimeout(() => {
      if (typeof this.togglingCallback === 'function') {
        this.togglingCallback(true);
      }
    }, 50);
  };

  toggleFontSizeSelector = (event) => {
    this.selectedFontSize = event.target.id;
    this.toggle();
  }

  public removeFontSizeOptions() {
    if (this.selectionList) {
      this.isDropDownOpen = false;
      this.selectionList = this.selectionList.remove();
    }
    if (typeof this.togglingCallback === 'function') {
      this.togglingCallback(false);
    }
  }

  public render(): HTMLElement {
    this.createButton();
    this.nodes.button.addEventListener('click', this.toggleDropDown);
    return this.nodes.button;
  }

  public toggleDropDown = ($event) => {
    if (((<HTMLElement>$event.target).id === this.fontSizeDropDown || (<HTMLElement>(<HTMLElement>(<HTMLElement>$event.target).parentNode)).id === 'fontSizeBtn')) {
      this.toggle((toolbarOpened) => {
        if (toolbarOpened) {
          this.isDropDownOpen = true;
        }
      })
    }
  }

  public toggle(togglingCallback?: (openedState: boolean) => void): void {
    if (!this.isDropDownOpen && togglingCallback) {
      this.addFontSizeOptions();
    } else {
      this.removeFontSizeOptions();
    }
    if (typeof togglingCallback === 'function') {
      this.togglingCallback = togglingCallback;
    }
  }

  public surround(range: Range): void {
    if (this.selectedFontSize) {
      document.execCommand('fontSize', false, this.selectedFontSize);
    }
  }

  public getComputedFontStyle(node) {
    return window.getComputedStyle(node.parentElement, null).getPropertyValue('font-size');
  };
  
  public checkState(selection: Selection) {
    const isActive = document.queryCommandState('fontSize');
    let anchoredElementFontSize = this.getComputedFontStyle(selection.anchorNode);
    const focusedElementFontSize = this.getComputedFontStyle(selection.focusNode);
    if (anchoredElementFontSize === focusedElementFontSize) {
      anchoredElementFontSize = anchoredElementFontSize.slice(0, anchoredElementFontSize.indexOf('p'));
      const elementContainsDecimalValue = anchoredElementFontSize.indexOf('.');
      if (elementContainsDecimalValue !== -1) {
        anchoredElementFontSize = anchoredElementFontSize.slice(0, anchoredElementFontSize.indexOf('.'));
      }
      this.replaceFontSizeInWrapper(anchoredElementFontSize);
    }
    else {
      const emptyWrapper = this.emptyString;
      this.replaceFontSizeInWrapper(emptyWrapper);
    }
    return isActive;
  }

  public replaceFontSizeInWrapper(size) {
    const displaySelectedFontSize = document.getElementById(this.fontSizeDropDown);
    displaySelectedFontSize.innerHTML = size;
  }

  public clear() {
    this.toggle();
    this.selectedFontSize = null;
  }

}
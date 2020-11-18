import $ from '../dom';
import { InlineTool, SanitizerConfig } from '../../../types';


const fontFamiliesType = ['Arial', 'Arial Black', 'Arial Narrow', 'Arial Rounded MT Bold',
  'Avant Garde', 'Baskerville', 'Bodoni MT', 'Book Antiqua', 'Big Caslon', 'Calibri', 'Calisto MT', 'Cambria', 'Candara', 'Century Gothic',
  'Charcoal', 'Copperplate',
  'Comic Sans MS', 'Courier New',
  'Didot',
  'Franklin Gothic Medium',
  'Futura', 'Geneva', 'Gill Sans', 'Garamond', 'Georgia', 'Goudy Old Style',
  'Hoefler Text',
  'Helvetica',
  'Helvetica Neue', 'Impact', 'Lucida Sans Unicode', 'Lato', 'Lucida Grande', 'Lucida Bright', 'Monaco', 'Optima', 'Papyrus',
  'PT Mono', 'Palatino', 'Perpetua', 'Rockwell', 'Roboto', 'Rockwell Extra Bold', 'Segoe UI', 'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana',
];
export default class FontFamilyTool implements InlineTool {

  public static isInline = true;
  public static title = 'Font Family';
  private isDropDownOpen = false;
  public emptyString = '&nbsp;&nbsp';

  public static get sanitize(): SanitizerConfig {
    return {
      font: {
        size: true,
        face: true
      },
    } as SanitizerConfig;
  }
  private readonly commandName: string = 'fontName';

  private readonly CSS = {
    button: 'ce-inline-tool',
    buttonActive: 'ce-font-family-tool--active',
    buttonModifier: 'ce-inline-tool--font',
    fontFamilyDropdown: 'fontFamilyDropDown',
    fontFamilyBtn: 'fontFamilyBtn'
  }
  private selectedFontFamily = null;

  private nodes: { button: HTMLButtonElement } = {
    button: undefined
  }
  private selectionList = undefined;

  private buttonWrapperText = undefined;

  private togglingCallback = null;

  createButton() {
    this.nodes.button = document.createElement('button') as HTMLButtonElement;
    this.nodes.button.type = 'button';
    this.nodes.button.classList.add(this.CSS.button, this.CSS.buttonModifier);
    this.nodes.button.setAttribute('id', this.CSS.fontFamilyBtn);
    this.getFontFamilyForButton();
    this.nodes.button.appendChild($.svg('toggler-down', 13, 13));
  }

  getFontFamilyForButton() {
    this.buttonWrapperText = document.createElement('div');
    this.buttonWrapperText.classList.add('button-wrapper-text-font-family');
    const displaySelectedFontFamily = document.createElement('div');
    displaySelectedFontFamily.classList.add('selected-font-family')
    displaySelectedFontFamily.setAttribute('id', this.CSS.fontFamilyDropdown);
    displaySelectedFontFamily.innerHTML = this.emptyString;
    $.append(this.buttonWrapperText, displaySelectedFontFamily);
    $.append(this.nodes.button, this.buttonWrapperText);
  }

  public addFontFamilyOptions() {
    this.selectionList = document.createElement('div');
    this.selectionList.setAttribute('class', 'selectionList-font-family');
    const selectionListWrapper = document.createElement('div');
    selectionListWrapper.setAttribute('class', 'selection-list-wrapper-font');

    for (const value of fontFamiliesType) {
      const option = document.createElement('div');
      option.setAttribute('value', value);
      option.setAttribute('style', `font-family:${value}`);
      option.classList.add('selection-list-option');
      if (document.getElementById(this.CSS.fontFamilyDropdown).innerHTML === value || this.selectedFontFamily === value) {
        option.classList.add('selection-list-option-active');
      }
      option.innerHTML = value;
      $.append(selectionListWrapper, option);
    }

    $.append(this.selectionList, selectionListWrapper);
    $.append(this.nodes.button, this.selectionList);
    this.selectionList.addEventListener('click', this.toggleFontFamilySelector);
    setTimeout(() => {
      if (typeof this.togglingCallback === 'function') {
        this.togglingCallback(true);
      }
    }, 50);
  };

  toggleFontFamilySelector = (event) => {
    this.selectedFontFamily = event.target.innerHTML;
    this.toggle();
  }

  public removeFontOptions() {
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
    if (((<HTMLElement>$event.target).id === this.CSS.fontFamilyDropdown || (<HTMLElement>(<HTMLElement>(<HTMLElement>$event.target).parentNode)).id === this.CSS.fontFamilyBtn)) {
      this.toggle((toolbarOpened) => {
        if (toolbarOpened) {
          this.isDropDownOpen = true;
        }
      });
    }
  }

  public toggle(togglingCallback?: (openedState: boolean) => void): void {
    if (!this.isDropDownOpen && togglingCallback) {
      this.addFontFamilyOptions();
    } else {
      this.removeFontOptions();
    }
    if (typeof togglingCallback === 'function') {
      this.togglingCallback = togglingCallback;
    }
  }

  public surround(range: Range): void {
    if (this.selectedFontFamily) {
      document.execCommand(this.commandName, false, this.selectedFontFamily);
    }
  }

  public getComputedFontFamilyStyle(node) {
    return window.getComputedStyle(node.parentElement, null).getPropertyValue('font-family');
  }

  public checkState(selection: Selection) {
    const isActive = document.queryCommandState(this.commandName);
    let anchoredElementSelectedFont = this.getComputedFontFamilyStyle(selection.anchorNode);
    const focusElementSelectedFont = this.getComputedFontFamilyStyle(selection.focusNode);
    if (anchoredElementSelectedFont === focusElementSelectedFont) {
      if (anchoredElementSelectedFont.slice(0, 1) === '"') {
        anchoredElementSelectedFont = anchoredElementSelectedFont.slice(1, -1);
      }
      else if (anchoredElementSelectedFont.slice(0, 1) === '-') {
        const updatedFont = anchoredElementSelectedFont.slice(anchoredElementSelectedFont.indexOf('"') + 1, anchoredElementSelectedFont.indexOf('"', anchoredElementSelectedFont.indexOf('"') + 1));
        anchoredElementSelectedFont = updatedFont;
      }
      else if (anchoredElementSelectedFont.indexOf(',')) {
        anchoredElementSelectedFont = anchoredElementSelectedFont.slice(0, anchoredElementSelectedFont.indexOf(','));
      }
      this.replaceFontSizeInWrapper(anchoredElementSelectedFont);
    }
    else {
      const emptyWrapper = this.emptyString;
      this.replaceFontSizeInWrapper(emptyWrapper);
    }
    return isActive;
  }

  public replaceFontSizeInWrapper(fontFamily) {
    const displaySelectedFontFamily = document.getElementById(this.CSS.fontFamilyDropdown)
    displaySelectedFontFamily.innerHTML = fontFamily;
  }

  public clear() {
    this.toggle();
    this.selectedFontFamily = null;
  }
}
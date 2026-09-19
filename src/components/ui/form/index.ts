/*
 * Kit de formulaire EVENTHEME.
 *
 * Convention : les contrôles natifs (Input, Textarea) transmettent l'événement
 * `onChange` d'origine ; les contrôles personnalisés (Select, DatePicker,
 * TimePicker, YearPicker, SearchInput, NumberInput, PhoneInput, ColorInput,
 * Checkbox) renvoient directement la nouvelle valeur, et FileInput les fichiers
 * choisis (`onFiles`).
 *
 * Pas d'<Input type="number">, "time", "tel", "file", "color" ni de case native :
 * NumberInput, TimePicker, PhoneInput, FileInput, ColorInput et Checkbox les
 * remplacent.
 */
export { default as Field, FormValue, useFieldIds, type FieldProps } from './Field';
export { default as Input, type InputProps } from './Input';
export { default as Textarea, type TextareaProps } from './Textarea';
export { default as SearchInput, type SearchInputProps } from './SearchInput';
export { default as NumberInput, type NumberInputProps } from './NumberInput';
export { default as PhoneInput, type PhoneInputProps } from './PhoneInput';
export { default as ColorInput, type ColorInputProps, type ColorValue } from './ColorInput';
export { default as FileInput, type FileInputProps } from './FileInput';
export { default as Checkbox, type CheckboxProps } from './Checkbox';
export { default as Select, type SelectOption, type SelectProps } from './Select';
export { default as DatePicker, type DatePickerProps } from './DatePicker';
export { default as TimePicker, type TimePickerProps } from './TimePicker';
export { default as YearPicker, type YearPickerProps } from './YearPicker';

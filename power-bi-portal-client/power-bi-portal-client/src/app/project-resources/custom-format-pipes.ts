import { Pipe, PipeTransform } from '@angular/core';
import { DecimalPipe, formatNumber, formatCurrency } from '@angular/common';

@Pipe({name: 'displayNumber'})
export class DisplayNumber implements PipeTransform {
  transform(value: number, decimalDigits: number = 0): string {
    if (!value ) { return '-'; }
    if (value === 0 ) { return '-'; }

    const numberValue =  formatNumber(value, 'en-US', '1.0-0');
    return numberValue.charAt(0) === '-'
    ? '(' + numberValue.substring(1, numberValue.length) + ')'
    : numberValue;
  }
}

@Pipe({name: 'displayCurrency'})
export class DisplayCurrency implements PipeTransform {
  transform(value: number, decimalDigits: number = 0): string {
    if (!value ) { return '-'; }
    if (value === 0 ) { return '-'; }
    const valueAsInt: number = +value.toFixed();
    const formattedValue =  formatNumber(valueAsInt, 'en-US', '1.0-0');
    const currencyValue =  formatCurrency(valueAsInt, 'en-US', '$', null, '1.0-0');
    return currencyValue.charAt(0) === '-'
      ? '(' + currencyValue.substring(1, currencyValue.length) + ')'
      : currencyValue;
  }
}

@Pipe({name: 'displayText'})
export class DisplayText implements PipeTransform {
  transform(value: string, isHeader: boolean = false): string {
    if (!value ) { return '-'; }
    return value.toLocaleUpperCase();
  }
}


@Pipe({name: 'displayBlank'})
export class DisplayBlank implements PipeTransform {
  transform(value: string, isHeader: boolean = false): string {
    if (!value ) { return '[none]'; }
    return value.toLocaleUpperCase();
  }
}

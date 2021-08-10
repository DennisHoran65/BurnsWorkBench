import { NgbDateStruct, NgbDate } from '@ng-bootstrap/ng-bootstrap';

export class DateFunctions {

  public static formatDateForSave(dt: NgbDateStruct): string {
    return `${dt.year}-${dt.month.toString().length === 1 ? '0' : ''}${dt.month}-${dt.day.toString().length === 1 ? '0' : ''}${dt.day}T00:00:00`;
  }

  public static formatDateForDisplay(dt: NgbDateStruct): string {
    return `${dt.month}/${dt.day}/${dt.year}`;
  }


  public static getSundayOfWeekFromNgb(dt: NgbDateStruct): Date {
    const dtString = `${dt.year}-` +
                     `${dt.month.toString().length === 1 ? '0' : ''}${dt.month}-` +
                     `${dt.day.toString().length === 1 ? '0' : ''}${dt.day}` +
                     `T00:00:00`;
    return this.getSundayOfWeek(dtString);
  }
  public static getSundayOfWeek(dt: string): Date {
    if (dt) {
        // get the Sunday before it
        const dtStartDate = new Date(dt);
        const dayOfWeek = dtStartDate.getDay();
        if (dayOfWeek === 0) {
            return dtStartDate;
        } else {
            dtStartDate.setDate(dtStartDate.getDate() - dayOfWeek);
            return dtStartDate;
        }
    }
    return null;
  }

  public static getMondayOfWeekFromNgb(dt: NgbDateStruct): Date {
    const dtString = `${dt.year}-` +
                     `${dt.month.toString().length === 1 ? '0' : ''}${dt.month}-` +
                     `${dt.day.toString().length === 1 ? '0' : ''}${dt.day}` +
                     `T00:00:00`;
    return this.getMondayOfWeek(dtString);
  }

  public static getMondayOfWeek(dt: string): Date {
    if (dt) {
        // get the Monday before it
        const dtStartDate = new Date(dt);
        const dayOfWeek = dtStartDate.getDay();
        
        //If it's a sunday, go back six days
        if (dayOfWeek === 0) {
          dtStartDate.setDate(dtStartDate.getDate() - 6);
          return dtStartDate;
        }
        //it it's a Monday, return the date that was passed in 
        if (dayOfWeek === 1) {
          return dtStartDate;
      }
        else {
            dtStartDate.setDate(dtStartDate.getDate() - dayOfWeek + 1);
            return dtStartDate;
        }
    }
    return null;
  }

  public static dateStringToNgbDate(d: any): NgbDate {
    const dt = new Date(d);
    return  new NgbDate(dt.getFullYear(), dt.getMonth() + 1, dt.getDate());
  }

  public static ngbDateToDate(nDt: NgbDateStruct): Date {
    return new Date(nDt.year, nDt.month-1, nDt.day);
  }

  public static getNumberOfWeeksApart(dt1: Date, dt2: Date): number {

    if (!dt1 || !dt2) {
        return 0;
    }
    const differenceInTime = dt1 <= dt2
                        ? dt1.getTime() - dt2.getTime()
                        : dt2.getTime() - dt1.getTime();

    // To calculate the no. of days between two dates
    const differenceInDays = differenceInTime / (1000 * 3600 * 24);
    return Math.abs(Math.ceil(differenceInDays / 7));

}
  public static addDays(dt: Date, numberOfDays: number) {
    var result=new Date(dt);
    result.setDate(result.getDate() + numberOfDays);
    return result;
  }


}

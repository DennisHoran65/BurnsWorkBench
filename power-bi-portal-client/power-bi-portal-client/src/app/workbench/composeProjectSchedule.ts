import { UICalendarModel, WeeklySchedule, EmployeeSchedule } from './models/ui-models/ui-calendar';
import { UIProjectModel } from './models/ui-models/ui-project';
import { UIProjectEmployeeModel } from './models/ui-models/ui-project-employee';
import { DateFunctions } from './dateFunctions';
import { NgbDate, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { service } from 'powerbi-client';

export class ComposeProjectSchedule {

    public employeeSchedules: EmployeeSchedule[] = [];

    public totalHours: number[] = [];
    public totalAmt: number[] = [];

    public startDate: Date;  // Will always be a Monday
    public maxEndDate: Date; // Calculated max end date

    public projectSchedule: WeeklySchedule[] = [];

    constructor(
        private project: UIProjectModel,
        private employees: UIProjectEmployeeModel[],
        private maxProjectEndDate: Date
        ) {
            this.maxEndDate = maxProjectEndDate;
            this.compose();
    }

    private compose(): void {
        // get start date
        const today = new Date();
        this.startDate = this.getMondayOfWeek(today.toDateString()); // this.project.startDate

        // get calculated end date
        // this.maxEndDate = this.getMaxEndDate();

        // save off weekly Schedule
        this.composeProjectSchedule();

        // compose each employee schedule
        this.employeeSchedules = [];
        this.employees.forEach((employee) => {
            this.employeeSchedules.push(
                new EmployeeSchedule(
                    employee.ProjectEmployeeId,
                    this.composeEmployeeSchedule(employee)
                )
            );
        });

        // compose the totals
        this.projectSchedule.forEach((week) => {
            let hours = 0;
            let amt = 0;
            this.employeeSchedules.forEach((employee) => {
                const employeeWeek = employee.Schedule.find((s) => s.WeekNumber === week.WeekNumber);
                if (employeeWeek) {
                    hours += employeeWeek.ResourceHours;
                    amt += employeeWeek.ResourceDolAmount;
                }
            });
            this.totalHours.push(hours);
            this.totalAmt.push(amt);
        });
    }

    private composeProjectSchedule(): void {
        if (this.project && this.employees.length) {
            this.projectSchedule = [];
            const weeksInSchedule = this.getWeeksInSchedule();
            const startWeekDt = new Date(this.startDate.toDateString());
            const endWeekDt =  new Date(this.startDate.toDateString());
            endWeekDt.setDate(endWeekDt.getDate() + 6); // set to the Sat of the first week

            for (let week = 0; week <= weeksInSchedule; week++) {
                this.projectSchedule.push(new WeeklySchedule(week,
                                            new Date(startWeekDt.toDateString()),
                                            new Date(endWeekDt.toDateString()))
                                        );
                endWeekDt.setDate(endWeekDt.getDate() + 7);
                startWeekDt.setDate(startWeekDt.getDate() + 7);
            }
        }
    }

    private composeEmployeeSchedule(employee: UIProjectEmployeeModel): UICalendarModel[] {

        const employeeStartMonday = this.getMondayOfWeekFromNgb(employee.StartDate);

        // which week is this in schedule
        const startingWeek = DateFunctions.getNumberOfWeeksApart(employeeStartMonday, this.startDate);
        const weeksInSchedule = this.getWeeksInSchedule();
        const employeeWeeks = employee.EmployeeSchedule.length
                                ? employee.EmployeeSchedule.length
                                : employee.NumberOfWeeks;

        const schedule: UICalendarModel[] = [];
        let totalHoursForProject = 0;
        let totalSpendOnProject = 0;

        for (let week = 0; week < weeksInSchedule; week++) {
            let hoursForWeek = 0;
            if (employee.EmployeeSchedule.length) {
                const employeeCustomWeek = employee.EmployeeSchedule.find(cw => cw.weekNumber === week + 1);

                hoursForWeek = employeeCustomWeek
                                        ? employeeCustomWeek.hours
                                        : 0;
            } else {
                hoursForWeek = employee.NumberOfWeeks > week ? employee.HoursPerWeek : 0;
            }

            const amtForWeek = hoursForWeek * employee.LoadedRate;
            totalHoursForProject += hoursForWeek;
            totalSpendOnProject += amtForWeek;
            schedule.push(new UICalendarModel(
                employee.ProjectEmployeeId,
                startingWeek + week,
                hoursForWeek,
                amtForWeek,
                hoursForWeek / 40,
                totalHoursForProject,
                totalSpendOnProject,
                null
            ));
        }

        return schedule;
    }

    private getWeeksInSchedule(): number {
        return DateFunctions.getNumberOfWeeksApart(this.maxEndDate, this.startDate);
    }

    public getMondayOfWeekFromNgb(dt: NgbDateStruct): Date {
        const dtString = `${dt.year}-` +
                         `${dt.month.toString().length === 1 ? '0' : ''}${dt.month}-` +
                         `${dt.day.toString().length === 1 ? '0' : ''}${dt.day}` +
                         `T00:00:00`;
        return this.getMondayOfWeek(dtString);
      }
    
      public getMondayOfWeek(dt: string): Date {
        if (dt) {
            // get the Monday before it
            const dtStartDate = new Date(dt);
            const dayOfWeek = dtStartDate.getDay();
            if (dayOfWeek === 0) {
              dtStartDate.setDate(dtStartDate.getDate() - 6);
              return dtStartDate;
            } 
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
}

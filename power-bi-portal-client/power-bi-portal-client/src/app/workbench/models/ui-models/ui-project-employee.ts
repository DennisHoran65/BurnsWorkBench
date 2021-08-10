import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { UICustomWeekModel } from './ui-custom-week';
import { DateFunctions } from '../../dateFunctions';

export class UIProjectEmployeeModel {
    constructor(
                public ProjectEmployeeId: number,
                public EmployeeId: string,
                public Name: string,
                public ProfitCenter: string,
                public DisciplineId: number,
                public Discipline: string,
                public AssignedPM: string,
                public LocationGeography: string,
                public LoadedRate: number,
                public JobCostRate: number,
                public StartDate: NgbDateStruct,
                public StartWeekEndDate: NgbDateStruct,
                public HoursPerWeek: number,
                public NumberOfWeeks: number,
                public IsGenericResource: boolean,
                public EmployeeSchedule: UICustomWeekModel[],
                
                ) {
    }

    public getDisplayStartDate(): NgbDateStruct {
        return this.hasOverride()
            ? DateFunctions.dateStringToNgbDate(this.EmployeeSchedule[0].weekEndDate.toString())
            : this.StartWeekEndDate;
    }

    //returns true if any schedules have a week end date > today
    public get isCurrent(): boolean{
        const today=new Date();
 
        today.setHours(0,0,0,0);
        const currSchedules=this.EmployeeSchedule.filter((s)=>{return (new Date(s.weekEndDate)>=today);});

        if (currSchedules && currSchedules.length>0)
        {
            return true;
        }
        else
        {
            return false;
        }
    }

    public hasOverride(): boolean {
        return this && this.EmployeeSchedule
            && this.EmployeeSchedule.filter(cw => cw.isCustom).length > 0;
    }
    public getTotalHours(): number {
        if (this.EmployeeSchedule && this.EmployeeSchedule.length) {
            let totalHours = 0;
            this.EmployeeSchedule.forEach((week) => {
                totalHours += week.hours;
            });
            return totalHours;
        } else {
            return this.NumberOfWeeks * this.HoursPerWeek;
        }
    }
    public getResourceCost(): number {
        return this.getTotalHours() * this.LoadedRate;
    }

    public getUtilization(): number {
        return 100 * this.getTotalHours() / (this.NumberOfWeeks * 40);
    }

    public getWeekByWeekHours(startDate: Date, numberOfWeeks): number[] {
        return [];
    }
    public resetProjectSchedule(): void {
        if (!this.EmployeeSchedule.filter(cw => cw.isCustom).length) {
            this.EmployeeSchedule = [];

            const weekStarting = DateFunctions.getMondayOfWeekFromNgb(this.StartDate);
            const weekEnding = DateFunctions.getMondayOfWeekFromNgb(this.StartDate);
            weekEnding.setDate(weekEnding.getDate() + 6); // set to the Sat of the first week

            weekEnding.setHours(0,0,0,0);
            weekStarting.setHours(0,0,0,0);

            for (let i = 0; i < this.NumberOfWeeks; i++) {
                this.EmployeeSchedule.push(new UICustomWeekModel
                    (
                        (-1) * i,
                        this.ProjectEmployeeId,
                        i,
                        this.HoursPerWeek,
                        new Date(weekEnding.toDateString()),
                        new Date(weekStarting.toDateString()), // TODO fix this
                        false
                    ));
                weekEnding.setDate(weekEnding.getDate() + 7);
                weekStarting.setDate(weekStarting.getDate() + 7);
            }
        }
    }
}


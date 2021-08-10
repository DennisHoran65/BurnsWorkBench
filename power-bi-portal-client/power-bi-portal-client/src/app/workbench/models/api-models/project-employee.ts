import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { UICustomWeekModel } from '../ui-models/ui-custom-week';

export class ProjectEmployeeApiModel {
    constructor(
        public ProjectEmployeeId: number,
        public employeeId: string,
        public employeeName: string,
        public profitCenter: string,
        public disciplineId: number,
        public discipline: string,
        public assignedPM: string,
        public locationGeography: string,
        public loadedRate: number,
        public startDate: string,
        public startWeekEndDate: string,
        public hoursPerWeek: number,
        public numberOfWeeks: number,
        public employeeSchedule: UICustomWeekModel[]
    ) {

    }
}

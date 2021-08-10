import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

export class UICustomWeekModel {
    constructor(
        public projectEmployeeScheduleId: number,
        public ProjectEmployeeId: number,
        public weekNumber: number,
        public hours: number,
        public weekEndDate: Date,
        public WeekStartDate: Date,
        public isCustom: boolean = false) {
    }
}

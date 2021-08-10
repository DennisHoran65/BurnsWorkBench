export class ProjectEmployeeWeekApiModel {
    constructor(
                public projectResourceScheduleID: number,
                public projectResouceId: number,
                public weekNumber: number,
                public weekEnding: string,
                public hours: number,
                public isCustom: boolean
    ) {

    }
}

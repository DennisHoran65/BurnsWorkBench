export class UIResourceWeek {
    constructor(
                public projectResourceScheduleId: number,
                public projectResouceId: number,
                public weekEnding: string,
                public hours: number,
                public isCustom: boolean,
                public resourceDolAmt: number,
                public utilPct: number) {

    }
}

export class UICalendarModel {
    constructor(
                public ProjectEmployeeId: number,
                public WeekNumber: number,
                public ResourceHours: number,
                public ResourceDolAmount: number,
                public ResourceUtilization: number,
                public TotalProjectBudgetHours: number,
                public TotalProjectBudgetedAmount: number,
                public WeekEndDate: Date
                ) {
    }
}

export class WeeklySchedule {
    constructor(
                public WeekNumber: number,
                public WeekStartDate: Date,
                public WeekEndDate: Date
                ) {
    }
}

export class EmployeeSchedule {
    constructor(
                public ProjectEmployeeId: number,
                public Schedule: UICalendarModel[]
                ) {
    }
}

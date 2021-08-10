export class ProjectIncrement {
}

export class ProjectInfo {
    constructor(
        public projectId: string,
        public projectManager: string,
        public projectMgrId: string,
        public projectNumber: string,
        public projectName: string,
        public projectPhase: string,
        public projectTask: string,
        public startDate: string,
        public endDate: string,
        public length: string,
        public profitCenter: string,
        public locationGeo: string,
        public billingBudgeted: number,
        public budgetConsumed: number,
        public budgetRemaining: number,
        public lastSavedStartDate: string,
        public multiplier: number,
        public budgetOverheadRate: number,
        public displayAllDisciplines: boolean)
        {

        }
}


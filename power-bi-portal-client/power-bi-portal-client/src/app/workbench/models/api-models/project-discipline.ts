export class ProjectDiscipline {
    constructor(

    public projectDisciplineId: number,
    public projectId: string,
    public disciplineId: number,
    public disciplineName: string,
    public amtPercent: number,
    public amtDollar: number,
    public historicalAllocatedBudget: number = 0,
    public historicalAllocatedHours: number = 0,
    public historicalAllocatedResources: number = 0
    ) {

    }
}

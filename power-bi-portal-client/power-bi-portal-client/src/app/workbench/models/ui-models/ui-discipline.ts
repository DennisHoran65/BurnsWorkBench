import { DisciplineInfo } from '../api-models/discipline-info';
import { ProjectDiscipline } from '../api-models/project-discipline';

export class UIDisciplineModel {
    constructor(disciplineInfo: DisciplineInfo, projectDiscipline: ProjectDiscipline = null) {
        this.disciplineName = disciplineInfo.disciplineName;
        this.disciplineId = disciplineInfo.disciplineId;

        if (projectDiscipline) {
            this.projectDisciplineId = projectDiscipline.projectDisciplineId;
            this.projectId = projectDiscipline.projectId;
            this.pctAmount = projectDiscipline.amtPercent;
            this.dolAmount = projectDiscipline.amtDollar;
            this.historicalAllocatedBudget = projectDiscipline.historicalAllocatedBudget;
            this.historicalAllocatedHours = projectDiscipline.historicalAllocatedHours;
            this.historicalAllocatedResources = projectDiscipline.historicalAllocatedResources;
        }
    }

    public disciplineName: string;
    public pctAmount = 0;
    public dolAmount = 0;
    public resourceDolAllocated: number;
    public numResources: number;
    public get dolNotAllocated(): number {
        return this.dolAmount - this.resourceDolAllocated;
    }
    public allocatedHours: number;
    public projectDisciplineId = 0;
    public projectId: string;
    public disciplineId: number;
    public historicalAllocatedBudget = 0;
    public historicalAllocatedHours = 0;
    public historicalAllocatedResources = 0;
}

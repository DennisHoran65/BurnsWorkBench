import { ProjectInfo } from '../api-models/project-increment';
import { UIDisciplineModel } from './ui-discipline';
import { DisciplineInfo } from '../api-models/discipline-info';
import { ProjectDiscipline } from '../api-models/project-discipline';
import { UIProjectEmployeeModel } from './ui-project-employee';

export class UIProjectModel {
    constructor(projectInfo: ProjectInfo) {
        if (projectInfo) {
            this.projectId = projectInfo.projectId;
            this.projectManager = projectInfo.projectManager;
            this.projectNumber = projectInfo.projectNumber;
            this.projectTask = projectInfo.projectTask;
            this.startDate = projectInfo.startDate;
            this.endDate = projectInfo.endDate;
            this.length = projectInfo.length;
            this.profitCenter = projectInfo.profitCenter;
            this.locationGeo = projectInfo.locationGeo;

        }
    }

    public projectId: string;
    public projectManager: string;
    public projectNumber: string;
    public projectTask: string;
    public startDate: string;
    public endDate: string;
    public length: string;
    public profitCenter: string;
    public locationGeo: string;
    public projectBudget = 125000;

    public disciplineViewMethod = 'percent';

    public disciplines: UIDisciplineModel[] = [];
    public employees: UIProjectEmployeeModel[] = [];

    public createDisciplines(disciplineInfos: DisciplineInfo[], projectDisciplines: ProjectDiscipline[]): void {
        this.disciplines = [];
        if (disciplineInfos) {
            disciplineInfos.forEach((disciplineInfo) => {
                const projectDiscipline = projectDisciplines.find((d) => d.disciplineName === disciplineInfo.disciplineName);
                this.disciplines.push(new UIDisciplineModel(disciplineInfo, projectDiscipline));
            });
        }
    }

}

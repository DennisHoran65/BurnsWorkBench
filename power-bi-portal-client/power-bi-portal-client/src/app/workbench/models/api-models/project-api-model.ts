import { ProjectInfo } from './project-increment';
import { ProjectDiscipline } from './project-discipline';
import { ProjectEmployeeApiModel } from './project-employee';

export class ProjectApiModel {
    constructor(
        public projectDetail: ProjectInfo,
        public projectDisciplines: ProjectDiscipline[],
        public projectEmployees: ProjectEmployeeApiModel[],
        public userName: string = '',
        public projectType: string=''
        ) {

            }
        }

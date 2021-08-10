import { ProjectInfo } from './api-models/project-increment';

export class ProjectSelectionInfo {
    constructor(
        public projectManager: string,
        public projectNumber: string,
        public projectPhase: string,
        public projectTask: string
    ) {
    }

    public static getFilteredList(projectInfoList: ProjectInfo[],
                                  projectManager: string = null,
                                  projectNumber: string = null,
                                  projectPhase: string = null,
                                  projectTask: string = null
    ): ProjectInfo[] {
        return projectInfoList.filter((x) =>
                (projectManager ? x.projectManager === projectManager : true)
                && (projectNumber ? x.projectNumber === projectNumber : true)
                && (projectPhase ? x.projectPhase === projectPhase : true)
                &&  (projectTask ? x.projectTask === projectTask : true)
        );
    }
    public static getUniqueProjectManagers(projectInfoList: ProjectInfo[]): string[] {
        return [... new Set(projectInfoList.map(x => x.projectManager))];
    }
    public static getUniqueProjectNames(projectInfoList: ProjectInfo[]): string[] {
        return [... new Set(projectInfoList.map(x => x.projectNumber))];
    }
    public static getUniqueProjectPhases(projectInfoList: ProjectInfo[]): string[] {
        return [... new Set(projectInfoList.map(x => x.projectPhase))];
    }
    public static getUniqueProjectTasks(projectInfoList: ProjectInfo[]): string[] {
        return [... new Set(projectInfoList.map(x => x.projectTask))];
    }

}

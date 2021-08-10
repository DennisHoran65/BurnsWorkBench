import { ProjectSelectionInfo } from './project-selection-info';
import { ProjectInfo } from './api-models/project-increment';

describe('ProjectSelectionInfo', () => {

  // it('should only return distinct project managers', () => {

  //   const projectInfoList: ProjectInfo[] = [];
  //   projectInfoList.push(new ProjectInfo('pm1', null, null, null, null, null, null, null, null, null));
  //   projectInfoList.push(new ProjectInfo('pm1', null, null, null, null, null, null, null, null, null));
  //   projectInfoList.push(new ProjectInfo('pm2', null, null, null, null, null, null, null, null, null));
  //   projectInfoList.push(new ProjectInfo('pm1', null, null, null, null, null, null, null, null, null));
  //   projectInfoList.push(new ProjectInfo('pm1', null, null, null, null, null, null, null, null, null));

  //   const pms = ProjectSelectionInfo.getUniqueProjectManagers(projectInfoList);
  //   expect(pms.length).toBe(2);
  // });

  // it('should filter results correctly', () => {

  //   const projectInfoList: ProjectInfo[] = [];
  //   projectInfoList.push(new ProjectInfo('pm1', null, null, null, null, null, null, null, null, null));
  //   projectInfoList.push(new ProjectInfo('pm1', null, null, null, null, null, null, null, null, null));
  //   projectInfoList.push(new ProjectInfo('pm2', null, null, null, null, null, null, null, null, null));
  //   projectInfoList.push(new ProjectInfo('pm1', null, null, null, null, null, null, null, null, null));
  //   projectInfoList.push(new ProjectInfo('pm1', null, null, null, null, null, null, null, null, null));

  //   const pms = ProjectSelectionInfo.getFilteredList(projectInfoList, 'pm1');
  //   expect(pms.length).toBe(4);
  // });
});

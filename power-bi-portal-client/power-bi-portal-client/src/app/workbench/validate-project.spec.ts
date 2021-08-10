import { ValidateProject } from './validate-project';
import { ProjectApiModel } from './models/api-models/project-api-model';
import { ProjectInfo } from './models/api-models/project-increment';
import { ProjectEmployeeApiModel } from './models/api-models/project-employee';
import { UICustomWeekModel } from './models/ui-models/ui-custom-week';


function getProject(): ProjectApiModel {
  const project = new ProjectApiModel(
    new ProjectInfo('1', 'pm', '123', '1', '2', '5/1/2020', null, null, null, null, 100000),
    [],
    []
  );
  return project;
}

fdescribe('ValidateProject', () => {

  it(`given validateResourcesDoNotOverlap, when two resources do not have the same employee and discipline,
      then the schedules will not be compared`, () => {

    const project = getProject();
    project.projectEmployees.push(
      new ProjectEmployeeApiModel(1, 'emp1', null, null, 100, 'disc 100',
        'pm', null, 100, '5/20/2020', 40, 5, []));

    project.projectEmployees.push(
      new ProjectEmployeeApiModel(1, 'emp2', null, null, 100, 'disc 100',
        'pm', null, 100, '5/20/2020', 40, 5, []));
    const result = ValidateProject.validateResourcesDoNotOverlap(project);

    expect(result.length === 0).toBeTrue();

  });

  it(`given validateResourcesDoNotOverlap, when two resources have the same employee and discipline,
  then the schedules will be compared`, () => {

    const project = getProject();
    project.projectEmployees = [];
    project.projectEmployees.push(
      new ProjectEmployeeApiModel(1, 'emp1', null, null, 100, 'disc 100',
        'pm', null, 100, '5/20/2020', 40, 5, [
        new UICustomWeekModel(100, 1, 1, 10, new Date('8/8/2020'), new Date('8/2/2020')),
        new UICustomWeekModel(100, 1, 1, 10, new Date('8/15/2020'), new Date('8/9/2020')),
        new UICustomWeekModel(100, 1, 1, 10, new Date('8/22/2020'), new Date('8/16/2020')),
        new UICustomWeekModel(100, 1, 1, 10, new Date('8/29/2020'), new Date('8/23/2020')),
        new UICustomWeekModel(100, 1, 1, 10, new Date('9/5/2020'), new Date('8/30/2020'))
      ]));

    project.projectEmployees.push(
      new ProjectEmployeeApiModel(2, 'emp1', null, null, 100, 'disc 100',
        'pm', null, 100, '5/20/2020', 40, 5, [
        new UICustomWeekModel(100, 1, 1, 10, new Date('8/8/2020'), new Date('8/2/2020')),
        new UICustomWeekModel(100, 1, 1, 10, new Date('8/15/2020'), new Date('8/9/2020')),
        new UICustomWeekModel(100, 1, 1, 10, new Date('8/22/2020'), new Date('8/16/2020')),
        new UICustomWeekModel(100, 1, 1, 10, new Date('8/29/2020'), new Date('8/23/2020')),
        new UICustomWeekModel(100, 1, 1, 10, new Date('9/5/2020'), new Date('8/30/2020'))
      ]));

    const result = ValidateProject.validateResourcesDoNotOverlap(project);
    expect(result.length === 2).toBeTrue();
  });

  it(`1- given validateResourcesDoNotOverlap, when two resources have the same employee and discipline,
  then if the second resource's time is fully before the first there will be no error`, () => {

    const project = getProject();
    project.projectEmployees = [];
    project.projectEmployees.push(
      new ProjectEmployeeApiModel(1, 'emp1', null, null, 100, 'disc 100',
        'pm', null, 100, '5/20/2020', 40, 5, [
        new UICustomWeekModel(100, 1, 1, 10, new Date('8/8/2020'), new Date('8/2/2020')),
        new UICustomWeekModel(100, 1, 1, 10, new Date('8/15/2020'), new Date('8/9/2020')),
        new UICustomWeekModel(100, 1, 1, 10, new Date('8/22/2020'), new Date('8/16/2020')),
        new UICustomWeekModel(100, 1, 1, 10, new Date('8/29/2020'), new Date('8/23/2020')),
        new UICustomWeekModel(100, 1, 1, 10, new Date('9/5/2020'), new Date('8/30/2020'))
      ]));

    project.projectEmployees.push(
      new ProjectEmployeeApiModel(2, 'emp1', null, null, 100, 'disc 100',
        'pm', null, 100, '5/20/2020', 40, 5, [
        new UICustomWeekModel(100, 1, 1, 10, new Date('8/8/2019'), new Date('8/2/2019')),
        new UICustomWeekModel(100, 1, 1, 10, new Date('8/15/2019'), new Date('8/9/2019')),
      ]));

    const result = ValidateProject.validateResourcesDoNotOverlap(project);
    expect(result.length === 0).toBeTrue();
  });

  it(`2 - given validateResourcesDoNotOverlap, when two resources have the same employee and discipline,
  then if the second resource's time is fully after the first there will be no error`, () => {

    const project = getProject();
    project.projectEmployees = [];
    project.projectEmployees.push(
      new ProjectEmployeeApiModel(1, 'emp1', null, null, 100, 'disc 100',
        'pm', null, 100, '5/20/2020', 40, 5, [
        new UICustomWeekModel(100, 1, 1, 10, new Date('8/8/2020'), new Date('8/2/2020')),
        new UICustomWeekModel(100, 1, 1, 10, new Date('8/15/2020'), new Date('8/9/2020')),
        new UICustomWeekModel(100, 1, 1, 10, new Date('8/22/2020'), new Date('8/16/2020')),
        new UICustomWeekModel(100, 1, 1, 10, new Date('8/29/2020'), new Date('8/23/2020')),
        new UICustomWeekModel(100, 1, 1, 10, new Date('9/5/2020'), new Date('8/30/2020'))
      ]));

    project.projectEmployees.push(
      new ProjectEmployeeApiModel(2, 'emp1', null, null, 100, 'disc 100',
        'pm', null, 100, '5/20/2020', 40, 5, [
        new UICustomWeekModel(100, 1, 1, 10, new Date('8/22/2021'), new Date('8/16/2021')),
        new UICustomWeekModel(100, 1, 1, 10, new Date('8/29/2021'), new Date('8/23/2021')),
      ]));

    const result = ValidateProject.validateResourcesDoNotOverlap(project);
    expect(result.length === 0).toBeTrue();
  });

  it(`3 - given validateResourcesDoNotOverlap, when two resources have the same employee and discipline,
  then if the second resource's time starts before and ends during there will be an error`, () => {

    const project = getProject();
    project.projectEmployees = [];
    project.projectEmployees.push(
      new ProjectEmployeeApiModel(1, 'emp1', null, null, 100, 'disc 100',
        'pm', null, 100, '5/20/2020', 40, 5, [
        new UICustomWeekModel(100, 1, 1, 10, new Date('8/8/2020'), new Date('8/2/2020')),
        new UICustomWeekModel(100, 1, 1, 10, new Date('8/15/2020'), new Date('8/9/2020')),
        new UICustomWeekModel(100, 1, 1, 10, new Date('8/22/2020'), new Date('8/16/2020')),
        new UICustomWeekModel(100, 1, 1, 10, new Date('8/29/2020'), new Date('8/23/2020')),
        new UICustomWeekModel(100, 1, 1, 10, new Date('9/5/2020'), new Date('8/30/2020'))
      ]));

    project.projectEmployees.push(
      new ProjectEmployeeApiModel(2, 'emp1', null, null, 100, 'disc 100',
        'pm', null, 100, '5/20/2020', 40, 5, [
        new UICustomWeekModel(100, 1, 1, 10, new Date('7/26/2020'), new Date('8/1/2020')),
        new UICustomWeekModel(100, 1, 1, 10, new Date('8/8/2020'), new Date('8/2/2020')),
        new UICustomWeekModel(100, 1, 1, 10, new Date('8/9/2020'), new Date('8/15/2020'))
      ]));

    const result = ValidateProject.validateResourcesDoNotOverlap(project);
    expect(result.length === 2).toBeTrue();
  });

  it(`4 - given validateResourcesDoNotOverlap, when two resources have the same employee and discipline,
  then if the second resource's time starts after and ends before there will be an error`, () => {

    const project = getProject();
    project.projectEmployees = [];
    project.projectEmployees.push(
      new ProjectEmployeeApiModel(1, 'emp1', null, null, 100, 'disc 100',
        'pm', null, 100, '5/20/2020', 40, 5, [
        new UICustomWeekModel(100, 1, 1, 10, new Date('8/8/2020'), new Date('8/2/2020')),
        new UICustomWeekModel(100, 1, 1, 10, new Date('8/15/2020'), new Date('8/9/2020')),
        new UICustomWeekModel(100, 1, 1, 10, new Date('8/22/2020'), new Date('8/16/2020')),
        new UICustomWeekModel(100, 1, 1, 10, new Date('8/29/2020'), new Date('8/23/2020')),
        new UICustomWeekModel(100, 1, 1, 10, new Date('9/5/2020'), new Date('8/30/2020'))
      ]));

    project.projectEmployees.push(
      new ProjectEmployeeApiModel(2, 'emp1', null, null, 100, 'disc 100',
        'pm', null, 100, '5/20/2020', 40, 5, [
        new UICustomWeekModel(100, 1, 1, 10, new Date('8/15/2020'), new Date('8/9/2020')),
        new UICustomWeekModel(100, 1, 1, 10, new Date('8/22/2020'), new Date('8/16/2020')),
        new UICustomWeekModel(100, 1, 1, 10, new Date('8/23/2020'), new Date('8/29/2020'))
      ]));

    const result = ValidateProject.validateResourcesDoNotOverlap(project);
    expect(result.length === 2).toBeTrue();
  });

  it(`5 - given validateResourcesDoNotOverlap, when two resources have the same employee and discipline,
  then if the second resource's time starts during and ends after there will be an error`, () => {

    const project = getProject();
    project.projectEmployees = [];
    project.projectEmployees.push(
      new ProjectEmployeeApiModel(1, 'emp1', null, null, 100, 'disc 100',
        'pm', null, 100, '5/20/2020', 40, 5, [
        new UICustomWeekModel(100, 1, 1, 10, new Date('8/8/2020'), new Date('8/2/2020')),
        new UICustomWeekModel(100, 1, 1, 10, new Date('8/15/2020'), new Date('8/9/2020')),
        new UICustomWeekModel(100, 1, 1, 10, new Date('8/22/2020'), new Date('8/16/2020'))
      ]));

    project.projectEmployees.push(
      new ProjectEmployeeApiModel(2, 'emp1', null, null, 100, 'disc 100',
        'pm', null, 100, '5/20/2020', 40, 5, [
        new UICustomWeekModel(100, 1, 1, 10, new Date('8/15/2020'), new Date('8/9/2020')),
        new UICustomWeekModel(100, 1, 1, 10, new Date('8/22/2020'), new Date('8/16/2020')),
        new UICustomWeekModel(100, 1, 1, 10, new Date('8/29/2020'), new Date('8/23/2020')),
        new UICustomWeekModel(100, 1, 1, 10, new Date('9/5/2020'), new Date('8/30/2020'))
      ]));

    const result = ValidateProject.validateResourcesDoNotOverlap(project);
    expect(result.length === 2).toBeTrue();
  });

  it(`6 - given validateResourcesDoNotOverlap, when two resources have the same employee and discipline,
  then if the second resource's time starts before and ends after there will be an error`, () => {

    const project = getProject();
    project.projectEmployees = [];
    project.projectEmployees.push(
      new ProjectEmployeeApiModel(1, 'emp1', null, null, 100, 'disc 100',
        'pm', null, 100, '5/20/2020', 40, 5, [
        new UICustomWeekModel(100, 1, 1, 10, new Date('8/15/2020'), new Date('8/9/2020')),
        new UICustomWeekModel(100, 1, 1, 10, new Date('8/22/2020'), new Date('8/16/2020')),
        new UICustomWeekModel(100, 1, 1, 10, new Date('8/23/2020'), new Date('8/29/2020'))
      ]));

    project.projectEmployees.push(
      new ProjectEmployeeApiModel(2, 'emp1', null, null, 100, 'disc 100',
        'pm', null, 100, '5/20/2020', 40, 5, [
        new UICustomWeekModel(100, 1, 1, 10, new Date('8/8/2020'), new Date('8/2/2020')),
        new UICustomWeekModel(100, 1, 1, 10, new Date('8/15/2020'), new Date('8/9/2020')),
        new UICustomWeekModel(100, 1, 1, 10, new Date('8/22/2020'), new Date('8/16/2020')),
        new UICustomWeekModel(100, 1, 1, 10, new Date('8/29/2020'), new Date('8/23/2020')),
        new UICustomWeekModel(100, 1, 1, 10, new Date('9/5/2020'), new Date('8/30/2020'))
      ]));

    const result = ValidateProject.validateResourcesDoNotOverlap(project);
    expect(result.length === 2).toBeTrue();
  });

  it(`given getStartDateForResource,
        it works`, () => {

    const employee =
      new ProjectEmployeeApiModel(2, 'emp1', null, null, 100, 'disc 100',
        'pm', null, 100, '5/20/2020', 40, 5, [
        new UICustomWeekModel(100, 1, 1, 10, new Date('8/8/2020'), new Date('8/2/2020')),
        new UICustomWeekModel(100, 1, 1, 10, new Date('8/15/2020'), new Date('8/9/2020')),
        new UICustomWeekModel(100, 1, 1, 10, new Date('8/22/2020'), new Date('8/16/2020')),
        new UICustomWeekModel(100, 1, 1, 10, new Date('8/29/2020'), new Date('8/23/2020')),
        new UICustomWeekModel(100, 1, 1, 10, new Date('9/5/2020'), new Date('8/30/2020'))
      ]);

    const result = ValidateProject.getStartDateForResource(employee);
    expect(result).toEqual(new Date('8/2/2020'));
  });

  it(`given getEndDateForResource,
  it works`, () => {

    const employee =
      new ProjectEmployeeApiModel(2, 'emp1', null, null, 100, 'disc 100',
        'pm', null, 100, '5/20/2020', 40, 5, [
        new UICustomWeekModel(100, 1, 1, 10, new Date('8/8/2020'), new Date('8/2/2020')),
        new UICustomWeekModel(100, 1, 1, 10, new Date('8/15/2020'), new Date('8/9/2020')),
        new UICustomWeekModel(100, 1, 1, 10, new Date('8/22/2020'), new Date('8/16/2020')),
        new UICustomWeekModel(100, 1, 1, 10, new Date('8/29/2020'), new Date('8/23/2020')),
        new UICustomWeekModel(100, 1, 1, 10, new Date('9/5/2020'), new Date('8/30/2020'))
      ]);

    const result = ValidateProject.getEndDateForResource(employee);
    expect(result).toEqual(new Date('9/5/2020'));
  });

  it(`given getStartDateForResource,
      it works even when out of order`, () => {

    const employee =
      new ProjectEmployeeApiModel(2, 'emp1', null, null, 100, 'disc 100',
        'pm', null, 100, '5/20/2020', 40, 5, [
        new UICustomWeekModel(100, 1, 1, 10, new Date('8/15/2020'), new Date('8/9/2020')),
        new UICustomWeekModel(100, 1, 1, 10, new Date('8/22/2020'), new Date('8/16/2020')),
        new UICustomWeekModel(100, 1, 1, 10, new Date('8/8/2020'), new Date('8/2/2020')),
        new UICustomWeekModel(100, 1, 1, 10, new Date('8/8/2020'), new Date('8/2/2020')),
        new UICustomWeekModel(100, 1, 1, 10, new Date('8/29/2020'), new Date('8/23/2020'))
      ]);

    const result = ValidateProject.getStartDateForResource(employee);
    expect(result).toEqual(new Date('8/2/2020'));
  });

  it(`given getEndDateForResource,
      it works even when out of order`, () => {

    const employee =
      new ProjectEmployeeApiModel(2, 'emp1', null, null, 100, 'disc 100',
        'pm', null, 100, '5/20/2020', 40, 5, [

        new UICustomWeekModel(100, 1, 1, 10, new Date('8/15/2020'), new Date('8/9/2020')),
        new UICustomWeekModel(100, 1, 1, 10, new Date('8/8/2020'), new Date('8/2/2020')),
        new UICustomWeekModel(100, 1, 1, 10, new Date('9/5/2020'), new Date('8/30/2020')),
        new UICustomWeekModel(100, 1, 1, 10, new Date('8/22/2020'), new Date('8/16/2020')),
        new UICustomWeekModel(100, 1, 1, 10, new Date('8/29/2020'), new Date('8/23/2020'))

      ]);

    const result = ValidateProject.getEndDateForResource(employee);
    expect(result).toEqual(new Date('9/5/2020'));
  });

});

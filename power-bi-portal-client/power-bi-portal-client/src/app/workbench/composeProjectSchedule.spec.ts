// import { async, ComponentFixture, TestBed } from '@angular/core/testing';
// import { ComposeProjectSchedule } from './composeProjectSchedule';
// import { UIProjectModel } from './models/ui-models/ui-project';
// import { ProjectInfo } from './models/api-models/project-increment';
// import { UIProjectEmployeeModel } from './models/ui-models/ui-project-employee';
// import { NgbDateStructAdapter } from '@ng-bootstrap/ng-bootstrap/datepicker/adapters/ngb-date-adapter';
// import { NgbDateStruct, NgbDate } from '@ng-bootstrap/ng-bootstrap';


// fdescribe('ComposeProjectSchedule', () => {

//     let project: UIProjectModel;
//     let employees: UIProjectEmployeeModel[];
//     const sundayBefore = new Date('2020-06-07T00:00:00');

//     beforeEach(() => {
//         project = new UIProjectModel(new ProjectInfo('1', '', '', '', '',
//             '2020-06-07T00:00:00', null, '10', '', '', 100000));

//         employees = [];

//     });

//     it('given a project with a sunday start date, the calculated start date should be that day ', () => {
//         const compose: ComposeProjectSchedule = new ComposeProjectSchedule(project, employees);
//         expect(compose.startDate.getDay()).toBe(0);
//         expect(compose.startDate).toEqual(sundayBefore);
//     });

//     it('given a project with a wednesday start date, the calculated start date should be sunday before ', () => {
//         project.startDate = '2020-06-10T00:00:00';
//         const compose: ComposeProjectSchedule = new ComposeProjectSchedule(project, employees);
//         expect(compose.startDate.getDay()).toBe(0);
//         expect(compose.startDate).toEqual(sundayBefore);
//     });

//     it('given a project with a sat start date, the calculated start date should be the sunday before ', () => {
//         project.startDate = '2020-06-13T00:00:00';
//         const compose: ComposeProjectSchedule = new ComposeProjectSchedule(project, employees);
//         expect(compose.startDate.getDay()).toBe(0);
//         expect(compose.startDate).toEqual(sundayBefore);
//     });

//     it(`given a project with a sun start date and an employee with 5 weeks starting at the start date,
//         the calculated end date should be 5 saturdays after `, () => {

//         const fiveSatsFromStart = new Date('2020-07-11T00:00:00');
//         project.startDate = '2020-06-07T00:00:00';
//         employees.push(new UIProjectEmployeeModel(1, '1', '', '', 0, '', '', '', 100, new NgbDate(2020, 6, 7), 40, 5, []));
//         const compose: ComposeProjectSchedule = new ComposeProjectSchedule(project, employees);
//         expect(compose.startDate.getDay()).toBe(0);
//         expect(compose.startDate).toEqual(sundayBefore);
//         expect(compose.maxEndDate).toEqual(fiveSatsFromStart);

//     });


//     it(`given a project with a sat start date and an employee with 5 weeks starting at the start date,
//         the calculated end date should be 5 saturdays after `, () => {

//         const fiveSatsFromStart = new Date('2020-07-11T00:00:00');
//         project.startDate = '2020-06-13T00:00:00';
//         employees.push(new UIProjectEmployeeModel(1, '1', '', '', 0, '', '', '', 100, new NgbDate(2020, 6, 13), 40, 5, []));
//         const compose: ComposeProjectSchedule = new ComposeProjectSchedule(project, employees);
//         expect(compose.startDate.getDay()).toBe(0);
//         expect(compose.startDate).toEqual(sundayBefore);
//         expect(compose.maxEndDate).toEqual(fiveSatsFromStart);
//     });

//     it(`given a project with a sat start date and an employee with 5 weeks starting a week after the start date,
//         the calculated end date should be 6 saturdays after `, () => {

//         const sixSatsFromStart = new Date('2020-07-18T00:00:00');
//         project.startDate = '2020-06-13T00:00:00';
//         employees.push(new UIProjectEmployeeModel(1, '1', '', '', 0, '', '', '', 100, new NgbDate(2020, 6, 15), 40, 5, []));
//         const compose: ComposeProjectSchedule = new ComposeProjectSchedule(project, employees);
//         expect(compose.startDate.getDay()).toBe(0);
//         expect(compose.startDate).toEqual(sundayBefore);
//         expect(compose.maxEndDate).toEqual(sixSatsFromStart);

//     });

//     it(`verify weeks apart logic`, () => {

//         const sixSatsFromStart = new Date('2020-07-18T00:00:00');
//         project.startDate = '2020-06-13T00:00:00';
//         employees.push(new UIProjectEmployeeModel(1, '1', '', '', 0, '', '', '', 100, new NgbDate(2020, 6, 15), 40, 5, []));
//         const compose: ComposeProjectSchedule = new ComposeProjectSchedule(project, employees);

//         // same day should be 0
//         let dt1 = new Date('2020-06-07T00:00:00');
//         let dt2 = new Date('2020-06-07T00:00:00');
//         expect(compose.getNumberOfWeeksApart(dt1, dt2)).toBe(0);

//         // in same week should be 0
//         dt1 = new Date('2020-06-07T00:00:00');
//         dt2 = new Date('2020-06-10T00:00:00');
//         expect(compose.getNumberOfWeeksApart(dt1, dt2)).toBe(0);

//         // a week later should be 1
//         dt1 = new Date('2020-06-07T00:00:00');
//         dt2 = new Date('2020-06-14T00:00:00');
//         expect(compose.getNumberOfWeeksApart(dt1, dt2)).toBe(1);

//         // two and a half weeks later should be 2
//         dt1 = new Date('2020-06-07T00:00:00');
//         dt2 = new Date('2020-06-24T00:00:00');
//         expect(compose.getNumberOfWeeksApart(dt1, dt2)).toBe(2);

//         // two and a half weeks later should be 2
//         // it doesnt matter which order they are in
//         dt1 = new Date('2020-06-07T00:00:00');
//         dt2 = new Date('2020-06-24T00:00:00');
//         expect(compose.getNumberOfWeeksApart(dt2, dt1)).toBe(2);

//     });

//     it(`given a project with a sat start date and an employee with 5 weeks starting a the same week,
//         it generates a schedule `, () => {

//         project.startDate = '2020-06-07T00:00:00';
//         employees.push(new UIProjectEmployeeModel(1, '1', '', '', 0, '', '', '', 100, new NgbDate(2020, 6, 7), 40, 5, []));
//         const compose: ComposeProjectSchedule = new ComposeProjectSchedule(project, employees);

//         expect(compose.projectSchedule.length).toBe(5);
//         expect(compose.employeeSchedules[0].Schedule.length).toBe(5);

//     });

//     it(`given a project with a sat start date and an employee with 5 weeks starting a the second week,
//         it generates a schedule `, () => {

//         project.startDate = '2020-06-07T00:00:00';
//         employees.push(new UIProjectEmployeeModel(1, '1', '', '', 0, '', '', '', 100, new NgbDate(2020, 6, 15), 40, 5, []));
//         const compose: ComposeProjectSchedule = new ComposeProjectSchedule(project, employees);

//         // project has 6 weeks
//         expect(compose.projectSchedule.length).toBe(6);
//         // employee has 5 weeks of schedule
//         expect(compose.employeeSchedules[0].Schedule.length).toBe(5);
//         expect(compose.employeeSchedules[0].Schedule[0].WeekNumber).toBe(1);

//     });

//     it(`given a project with a sat start date and two employees with 5 weeks 
//     one starting on the first week and a second starting the the second week,
//     it generates a schedule `, () => {

//         project.startDate = '2020-06-07T00:00:00';

//         employees.push(new UIProjectEmployeeModel(1, '1', '', '', 0, '', '', '', 100, new NgbDate(2020, 6, 7), 40, 5, []));
//         employees.push(new UIProjectEmployeeModel(1, '1', '', '', 0, '', '', '', 100, new NgbDate(2020, 6, 15), 40, 5, []));

//         const compose: ComposeProjectSchedule = new ComposeProjectSchedule(project, employees);

//         // project has 6 weeks
//         expect(compose.projectSchedule.length).toBe(6);

//         // employee 1 has 5 weeks
//         expect(compose.employeeSchedules[0].Schedule.length).toBe(5);
//         expect(compose.employeeSchedules[0].Schedule[0].WeekNumber).toBe(0);

//         // employee 2 has 5 weeks of schedule
//         expect(compose.employeeSchedules[1].Schedule.length).toBe(5);
//         expect(compose.employeeSchedules[1].Schedule[0].WeekNumber).toBe(1);

//     });

//     // custom schedules
//     it(`given a project with a sat start date and two employees with 5 weeks 
//     one starting on the first week and a second starting the the second week,
//     when the second person has a custom schedule
//     it generates a schedule `, () => {

//         project.startDate = '2020-06-07T00:00:00';

//         employees.push(new UIProjectEmployeeModel(1, '1', '', '', 0, '', '', '', 100, new NgbDate(2020, 6, 7), 40, 5, []));
//         employees.push(new UIProjectEmployeeModel(1, '1', '', '', 0, '', '', '', 100, new NgbDate(2020, 6, 15), 0, 5,
//                                                     [40, 20, 40, 40, 40]));

//         const compose: ComposeProjectSchedule = new ComposeProjectSchedule(project, employees);

//         // project has 6 weeks
//         expect(compose.projectSchedule.length).toBe(6);

//         // employee 1 has 5 weeks
//         expect(compose.employeeSchedules[0].Schedule.length).toBe(5);
//         expect(compose.employeeSchedules[0].Schedule[0].WeekNumber).toBe(0);

//         // employee 2 has 5 weeks of schedule
//         expect(compose.employeeSchedules[1].Schedule.length).toBe(5);
//         expect(compose.employeeSchedules[1].Schedule[0].WeekNumber).toBe(1);
//         expect(compose.employeeSchedules[1].Schedule[0].ResourceHours).toBe(40);
//         expect(compose.employeeSchedules[1].Schedule[1].ResourceHours).toBe(20);
//     });


//     // sum up all schedules
//     it(`given a project with a sat start date and two employees with 5 weeks 
//     one starting on the first week and a second starting the the second week,
//     when the second person has a custom schedule
//     it generates a schedule `, () => {

//         project.startDate = '2020-06-07T00:00:00';

//         employees.push(new UIProjectEmployeeModel(1, '1', '', '', 0, '', '', '', 10, new NgbDate(2020, 6, 7), 40, 5, []));
//         employees.push(new UIProjectEmployeeModel(1, '1', '', '', 0, '', '', '', 20, new NgbDate(2020, 6, 15), 0, 5,
//                                                     [10, 20, 10, 10, 10]));

//         const compose: ComposeProjectSchedule = new ComposeProjectSchedule(project, employees);

//         // project has 6 weeks
//         expect(compose.projectSchedule.length).toBe(6);

//         expect(compose.totalHours.length).toBe(6);
//         expect(compose.totalAmt.length).toBe(6);

//         expect(compose.totalHours[0]).toBe(40);
//         expect(compose.totalHours[1]).toBe(50);
//         expect(compose.totalHours[2]).toBe(60);
//         expect(compose.totalHours[3]).toBe(50);
//         expect(compose.totalHours[4]).toBe(50);
//         expect(compose.totalHours[5]).toBe(10);

//         expect(compose.totalAmt[0]).toBe(400);
//         expect(compose.totalAmt[1]).toBe(400 + 400);
//         expect(compose.totalAmt[2]).toBe(400 + 200);
//         expect(compose.totalAmt[3]).toBe(400 + 200);
//         expect(compose.totalAmt[4]).toBe(400 + 200);
//         expect(compose.totalAmt[5]).toBe(200);

//         // debug this and print out the schedules
//     });



// });

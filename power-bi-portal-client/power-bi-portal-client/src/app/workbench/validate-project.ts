import { DateFunctions } from './dateFunctions';
import { ProjectApiModel } from './models/api-models/project-api-model';
import { ProjectEmployeeApiModel } from './models/api-models/project-employee';
import { UICustomWeekModel } from './models/ui-models/ui-custom-week';

export class ValidateProject {
    private static addIfNotNull(value: string, errors: string[]): void {
        if (value) {
            errors.push(value);
        }
    }
    private static addIfNotNullBulk(values: string[], errors: string[]): void {
        if (values.length > 0) {
            values.forEach(value => errors.push(value));
        }
    }

    public static validate(project: ProjectApiModel): string[] {
        const validationErrors: string[] = [];

        //this.addIfNotNull(ValidateProject.validateDisciplines(project), validationErrors);
        this.addIfNotNullBulk(ValidateProject.validateAllocations(project), validationErrors);
        this.addIfNotNullBulk(ValidateProject.validateResourcesHaveDisciplines(project), validationErrors);
        this.addIfNotNullBulk(ValidateProject.validateResourcesDoNotStartBeforeProject(project), validationErrors);
        this.addIfNotNullBulk(ValidateProject.validateResourcesDoNotOverlap(project), validationErrors);
        return validationErrors;
    }

    //check has been removed
    public static validateDisciplines(project: ProjectApiModel): string {
        const total = project.projectDisciplines.reduce((sum, current) => sum + current.amtPercent, 0);
        return total > 104 ? 'Project over budget' : null;
    }

    public static validateAllocations(project: ProjectApiModel): string[] {
        const allocationErrors: string[] = [];

        project.projectDisciplines.forEach(d => {
            const employeesForDisc = project.projectEmployees.filter(pe => pe.disciplineId === d.disciplineId);
            if (d.amtPercent > 0 || employeesForDisc.length > 0) {
                // sum up amounts
                let total = 0;
                employeesForDisc.forEach(emp => {
                    total += emp.employeeSchedule.reduce((sum, current) => sum + (current.hours * emp.loadedRate), 0);
                });
                if (total > d.amtDollar) {
                    allocationErrors.push(d.disciplineName + ' is over allocated.');
                }
            }
        });
        return allocationErrors;
    }

    public static validateResourcesHaveDisciplines(project: ProjectApiModel): string[] {
        const errors: string[] = [];
        project.projectEmployees.forEach((employee) => {
            if (employee.disciplineId === 0) {
                errors.push('Employee ' + employee.employeeName + ' does not have a discipline.');
            }
        });
        return errors;
    }

    public static validateResourcesDoNotStartBeforeProject(project: ProjectApiModel): string[] {
        const projectStartDate=new Date(project.projectDetail.startDate);
        const projectStartBeginningOfWeek=DateFunctions.getMondayOfWeek(projectStartDate.toString());
     

        const errors: string[] = [];
        project.projectEmployees.forEach((employee) => {
            const employeeStartDate=new Date(employee.startDate);
            if (employeeStartDate<projectStartBeginningOfWeek) {
                errors.push('Employee ' + employee.employeeName + ' start date is earlier than the project start date.');
            }
            else
            {
                if (employee.employeeSchedule && employee.employeeSchedule.length>0)
                {
                    const sortedSchedule=employee.employeeSchedule.sort((a,b)=> { if (a.WeekStartDate < b.WeekStartDate){return -1}else {return 1}});
                    if (sortedSchedule[0].WeekStartDate<projectStartBeginningOfWeek)
                     {
                        errors.push('Employee ' + employee.employeeName + ' has scheduled hours before the project start date.');
                     }
                }
            }
        });
        return errors;
    }

    public static validateResourcesDoNotOverlap(project: ProjectApiModel): string[] {
        const errors: string[] = [];

        project.projectEmployees.forEach((employee) => {
            const itemsWithSameEmployeeAndDiscipline = project.projectEmployees
                        .filter((emp) => emp.employeeId === employee.employeeId
                                        && emp.ProjectEmployeeId !== employee.ProjectEmployeeId
                                        && emp.disciplineId === employee.disciplineId);

            if (itemsWithSameEmployeeAndDiscipline && itemsWithSameEmployeeAndDiscipline.length > 0) {
                // check project schedules
                const employ1Start = ValidateProject.getStartDateForResource(employee);
                const employ1End = ValidateProject.getEndDateForResource(employee);
                itemsWithSameEmployeeAndDiscipline.forEach((other) => {
                    const employ2Start = ValidateProject.getStartDateForResource(other);
                    const employ2End = ValidateProject.getEndDateForResource(other);
                    let hasError = '';
                    if (employ2Start < employ1Start && employ2End > employ1Start) {
                        hasError += 'a';
                    }
                    if (employ2Start >= employ1Start && employ2End <= employ1End) {
                        hasError += 'b';
                    }
                    if (employ2Start > employ1Start && employ2Start < employ1End && employ2End >= employ1End) {
                        hasError += 'c';
                    }
                    if (hasError !== '') {

                        // only display the error once
                        const errorMessage = 'Resource ' + employee.employeeName +
                            ' has an overlapped schedule for discipline ' + other.discipline;
                        const findResult = errors.find(e => e === errorMessage);
                        if (!findResult) {
                            errors.push(errorMessage);
                        }
                        console.log({errorType: hasError, res1: employee, res2: other});
                    }

                });
            }
        });
        return errors;
    }

    public static getStartDateForResource(resource: ProjectEmployeeApiModel): Date {
        const sortedVal = resource.employeeSchedule.sort((a: UICustomWeekModel, b: UICustomWeekModel) => {
            return this.getTime(a.WeekStartDate) - this.getTime(b.WeekStartDate);
        });
        return sortedVal[0].WeekStartDate;
    }

    public static getEndDateForResource(resource: ProjectEmployeeApiModel): Date {
        const sortedVal = resource.employeeSchedule.sort((a: UICustomWeekModel, b: UICustomWeekModel) => {
            return this.getTime(a.weekEndDate) - this.getTime(b.weekEndDate);
        });
        return sortedVal[sortedVal.length - 1].weekEndDate;
    }

    public static getTime(date?: Date) {
        try {
            const dt = new Date(date);
            return dt != null ? dt.getTime() : 0;
        } catch(err) {
            console.log(date);
            console.log(err);
            return 0;
        }
    }
}


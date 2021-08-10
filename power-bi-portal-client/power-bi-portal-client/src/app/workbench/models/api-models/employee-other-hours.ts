export class EmployeeOtherHours {
    constructor(
        public employeeId: string,
        public weekEnding: Date,
        public hours: number
) {
        }
    }

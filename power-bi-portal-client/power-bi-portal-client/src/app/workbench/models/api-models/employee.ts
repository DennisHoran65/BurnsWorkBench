export class Employee {
    constructor(
        public id: string,
        public name: string,
        public firstName: string,
        public lastName: string,
        public profitCenter: string,
        public supervisorName: string,
        public isGenericResource: boolean,
        public disciplineId: number,
        public location: string,
        public jobCostRate: number,
        public loadedRate: number) {
        }
    }

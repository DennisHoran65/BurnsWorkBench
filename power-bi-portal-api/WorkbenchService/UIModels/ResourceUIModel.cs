using System;
using System.Collections.Generic;
using System.Text;

namespace WorkbenchService.Models
{
    public class EmployeeInfo
    {
        public string Id { get; set; }
        public string Name { get; set; }

        public string FirstName { get; set; }
        public string LastName { get; set; }

        public string ProfitCenter { get; set; }
        public string SupervisorId { get; set; }
        public string SupervisorName { get; set; }
        public string Location { get; set; }

        public decimal JobCostRate { get; set; }
        public decimal OverheadRate { get; set; }

        public int DisciplineId { get; set; }
        public bool IsGenericResource { get; set; }

        public decimal Rate { get {
                return JobCostRate * OverheadRate;
            } }

    }
}

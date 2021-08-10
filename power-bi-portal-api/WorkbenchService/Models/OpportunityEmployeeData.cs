using System;
using System.Collections.Generic;

namespace WorkbenchService.Models
{
    public partial class OpportunityEmployeeData
    {
        public long OpportunityEmployeeId { get; set; }
        public string OpportunityId { get; set; }
        public string EmployeeId { get; set; }
        public int DisciplineId { get; set; }
        public DateTime StartWeekDate { get; set; }
        public int? HoursPerWeek { get; set; }
        public int? NumberOfWeeks { get; set; }
        public DateTime? CreatedDate { get; set; }
        public string CreatedBy { get; set; }
        public DateTime? ModifiedDate { get; set; }
        public string ModifiedBy { get; set; }
        public DateTime StartWeekEndDate { get; set; }
    }
}

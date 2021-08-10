using System;
using System.Collections.Generic;

namespace WorkbenchService.Models
{
    public partial class ProjectEmployeeDataFlat
    {
        public long ProjectEmployeeIdFlat { get; set; }
        public string ProjectId { get; set; }
        public string EmployeeId { get; set; }
        public int DisciplineId { get; set; }
        public DateTime WeekDate { get; set; }
        public int? HoursPerWeek { get; set; }
    }
}

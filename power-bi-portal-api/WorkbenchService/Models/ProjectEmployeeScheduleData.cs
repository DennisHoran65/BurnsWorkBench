using System;
using System.Collections.Generic;

namespace WorkbenchService.Models
{
    public partial class ProjectEmployeeScheduleData
    {
        public long ProjectEmployeeScheduleId { get; set; }
        public long ProjectEmployeeId { get; set; }
        public int Hours { get; set; }
        public DateTime WeekEndDate { get; set; }
        public bool IsCustom { get; set; }
        public DateTime WeekStartDate { get; set; }
        public DateTime? CreatedDate { get; set; }
        public string CreatedBy { get; set; }
        public DateTime? ModifiedDate { get; set; }
        public string ModifiedBy { get; set; }
    }
}

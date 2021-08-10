using System;

namespace WorkbenchService.UIModels
{
    public class ProjectEmployeeSchedule
    {
        public long ProjectEmployeeScheduleId { get; set; }
        public long ProjectEmployeeId { get; set; }
        public int Hours { get; set; }
        public DateTime WeekEndDate { get; set; }
        public bool IsCustom { get; set; }
        public DateTime WeekStartDate { get; set; }
    }
}

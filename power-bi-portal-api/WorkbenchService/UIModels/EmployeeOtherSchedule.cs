using System;

namespace WorkbenchService.UIModels
{
    public class EmployeeOtherSchedule
    {
        public string employeeId { get; set; }
        public string projectId { get; set; }
        public DateTime weekEnding { get; set; }
        public int hours { get; set; }
    }
}

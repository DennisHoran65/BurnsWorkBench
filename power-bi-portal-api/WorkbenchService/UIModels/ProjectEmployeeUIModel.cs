using System;
using System.Collections.Generic;

namespace WorkbenchService.UIModels
{
    public class ProjecEmployeeUIModel
    {
        public long ProjectEmployeeId { get; set; }
        public string EmployeeId { get; set; }
        public string EmployeeName { get; set; }
        public int DisciplineId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime StartWeekEndDate { get; set; }
        public int? HoursPerWeek { get; set; }

        public string ProfitCenter { get; set; }
        public string Discipline { get; set; }
        public string AssignedPM { get; set; }
        public string LocationGeography { get; set; }
        public decimal JobCostRate { get; set; }
        //public decimal OverheadRate { get; set; }
        public decimal LoadedRate { get; set; }
        
        public int NumberOfWeeks { get; set; }
        public List<ProjectEmployeeSchedule> EmployeeSchedule { get; set; }

    }
}

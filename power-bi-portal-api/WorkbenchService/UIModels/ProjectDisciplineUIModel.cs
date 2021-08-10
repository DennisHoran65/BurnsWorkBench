using System;
using System.Collections.Generic;
using System.Text;

namespace WorkbenchService.UIModels
{
    public class ProjectDisciplineUIModel
    {
        public long ProjectDisciplineId { get; set; }
        public string ProjectId { get; set; }
        public int DisciplineId { get; set; }
        public string DisciplineName { get; set; }
        public decimal? AmtPercent { get; set; }
        public decimal? AmtDollar { get; set; }
        // This value holds any allocated budget that was already "spent" prior to this week
        public decimal HistoricalAllocatedBudget { get; set; } = 0;
        public decimal HistoricalAllocatedHours { get; set; } = 0;
        public int HistoricalAllocatedResources { get; set; } = 0;

    }
}

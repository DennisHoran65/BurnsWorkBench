using System;
using System.Collections.Generic;

namespace WorkbenchService.Models
{
    public partial class ProjectDisciplineData
    {
        public long ProjectDisciplineId { get; set; }
        public string ProjectId { get; set; }
        public int DisciplineId { get; set; }
        public decimal? AmtPercent { get; set; }
        public decimal? AmtDollar { get; set; }
        public DateTime? CreatedDate { get; set; }
        public string CreatedBy { get; set; }
        public DateTime? ModifiedDate { get; set; }
        public string ModifiedBy { get; set; }
    }
}

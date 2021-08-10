using System;
using System.Collections.Generic;

namespace WorkbenchService.Models
{
    public partial class OpportunityDisciplineData
    {
        public long OpportunityDisciplineId { get; set; }
        public string OpportunityId { get; set; }
        public int DisciplineId { get; set; }
        public decimal? AmtPercent { get; set; }
        public decimal? AmtDollar { get; set; }
        public DateTime? CreatedDate { get; set; }
        public string CreatedBy { get; set; }
        public DateTime? ModifiedDate { get; set; }
        public string ModifiedBy { get; set; }
    }
}

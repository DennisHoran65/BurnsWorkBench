using System;
using System.Collections.Generic;

namespace WorkbenchService.Models
{
    public partial class ProjectRef
    {
        public string ProjectId { get; set; }
        public string ProjectNumber { get; set; }
        public string ProjectTask { get; set; }
        public string ProjectName { get; set; }
        public string ProjectLongName { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string ClientId { get; set; }
        public string BillingClientId { get; set; }
        public string OpportunityId { get; set; }
        public string ProjectTypeId { get; set; }
        public string Orgid { get; set; }
        public string ProfitCenterId { get; set; }
        public string LocationId { get; set; }
        public string ProjMgrId { get; set; }
        public decimal? Fee { get; set; }
        public decimal? ReimbAllow { get; set; }
        public decimal? BillingBudgeted { get; set; }
        public decimal? Multiplier { get; set; }
        public DateTime ModDate { get; set; }
        public DateTime? LastSavedStartDate { get; set; }
        public string Status { get; set; }
        public decimal? BudOhrate { get; set; }
        public decimal? BudgetConsumed { get; set; }
        public bool StartDateUpdatedInApp { get; set; }
    }
}

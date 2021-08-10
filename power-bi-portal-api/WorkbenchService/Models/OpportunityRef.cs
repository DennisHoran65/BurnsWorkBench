using System;
using System.Collections.Generic;

namespace WorkbenchService.Models
{
    public partial class OpportunityRef
    {
        public string OpportunityId { get; set; }
        public string OpportunityNumber { get; set; }
        public string OpportunityName { get; set; }
        public string Address1 { get; set; }
        public string Address2 { get; set; }
        public string Address3 { get; set; }
        public string City { get; set; }
        public string State { get; set; }
        public string Zip { get; set; }
        public string Country { get; set; }
        public string OpportunityType { get; set; }
        public string Stage { get; set; }
        public string Description { get; set; }
        public DateTime? EstStartDate { get; set; }
        public DateTime? EstCompletionDate { get; set; }
        public decimal? EstFees { get; set; }
        public decimal? EstConstructionCost { get; set; }
        public decimal? Revenue { get; set; }
        public short? Probability { get; set; }
        public decimal? WeightedRevenue { get; set; }
        public DateTime? CloseDate { get; set; }
        public string ClientId { get; set; }
        public string ContactId { get; set; }
        public string ProjectNumber { get; set; }
        public DateTime? OpenDate { get; set; }
        public string OrgId { get; set; }
        public string PrproposalWbs1 { get; set; }
        public string ProjMgrId { get; set; }
        public string PrincipalId { get; set; }
        public string SupervisorId { get; set; }
        public string County { get; set; }
        public string AllocMethod { get; set; }
        public string OurRole { get; set; }
        public DateTime? ModDate { get; set; }
        public decimal? PctGo { get; set; }
        public decimal? PctGet { get; set; }
        public string Status { get; set; }
        public string ProfitCenterId { get; set; }
        public string LocationId { get; set; }
        public bool StartDateUpdatedInApp { get; set; }
    }
}
